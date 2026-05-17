// FrameExtractor
// ---------------------------------------------------------------------------
// Pre-extracts every decoded frame of a video as an ImageBitmap.
//
// Strategy: download the video as a Blob, then PLAY it (muted, hidden, off-
// screen) and use requestVideoFrameCallback to grab each frame as the decoder
// hands it to us. We never write `currentTime`. This is more reliable than
// seek-based extraction across browsers because it follows the natural
// decode path the video element is already optimized for.
//
// Once extraction finishes, the cached frames are drawn to a 2D canvas tied
// to the user's scroll position. Caller MUST never touch video.currentTime.
// ---------------------------------------------------------------------------

// 1920 keeps memory in check while not downscaling typical AI-video sources
// (this one is 1296 × 708 native, so this cap is a no-op for it).
const DEFAULT_MAX_WIDTH = 1920;
const PLAYBACK_RATE = 4; // 4× — fast enough, slow enough not to drop frames
const PLAY_TIMEOUT_MS = 60000;

const log = (...args) => console.log('[aero/extract]', ...args);

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function fetchAsBlobUrl(url, onProgress) {
  log('fetch', url);
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) throw new Error(`Video fetch failed: ${res.status} ${res.statusText}`);

  const total = Number(res.headers.get('Content-Length')) || 0;
  log('  Content-Length', total);

  if (!res.body || !res.body.getReader) {
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    if (onProgress) onProgress(total ? Math.min(0.99, received / total) : 0);
  }
  log('  fetched bytes=', received);
  const blob = new Blob(chunks, { type: 'video/mp4' });
  return URL.createObjectURL(blob);
}

function createHiddenVideo(srcUrl) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.autoplay = false;
    video.crossOrigin = 'anonymous'; // ignored for same-origin, harmless

    video.style.cssText =
      'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.001;pointer-events:none;z-index:-1;';
    document.body.appendChild(video);

    let settled = false;
    const settle = (fn) => {
      if (settled) return;
      settled = true;
      fn();
    };

    const onMeta = () => {
      log('  loadedmetadata duration=', video.duration, 'dim=', video.videoWidth, 'x', video.videoHeight);
    };
    const onCanPlay = () => {
      log('  canplay');
      settle(() => {
        video.removeEventListener('loadedmetadata', onMeta);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
        resolve(video);
      });
    };
    const onError = () => {
      const code = video.error ? video.error.code : '?';
      const msg = video.error ? video.error.message : 'unknown';
      log('  error', code, msg);
      settle(() => {
        video.removeEventListener('loadedmetadata', onMeta);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
        if (video.parentNode) video.parentNode.removeChild(video);
        reject(new Error(`Video error (code ${code}): ${msg}`));
      });
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);
    video.src = srcUrl;
    video.load();
  });
}

// Capture every decoded frame using requestVideoFrameCallback when available,
// or a rAF poll loop as a fallback. Returns a Promise<{frames, width, height}>.
function captureWhilePlaying(video, { maxWidth, onProgress, onFrameCount }) {
  return new Promise((resolve, reject) => {
    const naturalW = video.videoWidth;
    const naturalH = video.videoHeight;
    if (!naturalW || !naturalH) {
      reject(new Error(`Video has zero dimensions (${naturalW}x${naturalH})`));
      return;
    }
    const scale = Math.min(1, maxWidth / naturalW);
    const width = Math.round(naturalW * scale);
    const height = Math.round(naturalH * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });

    const frames = [];
    const seenTimes = new Set(); // dedupe
    let pendingBitmaps = 0;
    let playbackEnded = false;
    const duration = video.duration;
    const useRvfc = typeof video.requestVideoFrameCallback === 'function';

    const finish = () => {
      log('  capture done frames=', frames.length, 'rvfc=', useRvfc);
      resolve({ frames, width, height, duration });
    };

    const tryFinish = () => {
      if (playbackEnded && pendingBitmaps === 0) finish();
    };

    const captureFrame = () => {
      // Dedupe by currentTime to avoid double-capturing on the rAF fallback.
      const t = video.currentTime;
      const key = Math.round(t * 1000);
      if (seenTimes.has(key)) return;
      seenTimes.add(key);

      ctx.drawImage(video, 0, 0, width, height);
      pendingBitmaps++;
      const slot = frames.length;
      frames.push(null); // reserve slot to preserve order
      createImageBitmap(canvas)
        .then((bm) => {
          frames[slot] = bm;
        })
        .catch((e) => {
          log('  createImageBitmap failed at slot', slot, e);
          frames[slot] = ctx.getImageData(0, 0, width, height);
        })
        .finally(() => {
          pendingBitmaps--;
          if (onFrameCount) onFrameCount(frames.length);
          if (onProgress && duration) onProgress(Math.min(0.99, t / duration));
          tryFinish();
        });
    };

    const onEnded = () => {
      log('  video ended');
      playbackEnded = true;
      // Capture one last frame at the end.
      captureFrame();
      tryFinish();
    };
    video.addEventListener('ended', onEnded, { once: true });

    // Path A: requestVideoFrameCallback — fires for every decoded frame.
    if (useRvfc) {
      const onVideoFrame = () => {
        captureFrame();
        if (!playbackEnded) {
          video.requestVideoFrameCallback(onVideoFrame);
        }
      };
      video.requestVideoFrameCallback(onVideoFrame);
    } else {
      // Path B: rAF poll fallback. Less precise but works everywhere.
      const tick = () => {
        if (playbackEnded) return;
        captureFrame();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    // Watchdog: if playback stalls, time out.
    const watchdog = setTimeout(() => {
      reject(new Error(`Playback didn't end within ${PLAY_TIMEOUT_MS}ms (got ${frames.length} frames)`));
    }, PLAY_TIMEOUT_MS);
    video.addEventListener('ended', () => clearTimeout(watchdog), { once: true });

    // Kick off playback.
    video.playbackRate = PLAYBACK_RATE;
    video.play().catch((e) => {
      clearTimeout(watchdog);
      reject(new Error(`video.play() rejected: ${e.message || e}`));
    });
  });
}

export async function extractFrames(
  videoUrl,
  { maxWidth = DEFAULT_MAX_WIDTH, onProgress, onStage } = {}
) {
  log('extractFrames start', videoUrl);

  onStage?.('downloading video…');
  const blobUrl = await fetchAsBlobUrl(videoUrl, (p) => onProgress?.(p * 0.2));

  onStage?.('decoding metadata…');
  let video;
  try {
    video = await withTimeout(createHiddenVideo(blobUrl), 30000, 'video metadata');
  } catch (e) {
    URL.revokeObjectURL(blobUrl);
    throw e;
  }

  onStage?.('capturing frames…');
  let bundle;
  try {
    bundle = await captureWhilePlaying(video, {
      maxWidth,
      onProgress: (p) => onProgress?.(0.2 + 0.8 * p),
      onFrameCount: () => {},
    });
  } catch (e) {
    if (video.parentNode) video.parentNode.removeChild(video);
    URL.revokeObjectURL(blobUrl);
    throw e;
  }

  // Strip out any null slots (shouldn't happen, but safety).
  bundle.frames = bundle.frames.filter(Boolean);
  log('  final frame count', bundle.frames.length);

  if (bundle.frames.length === 0) {
    URL.revokeObjectURL(blobUrl);
    throw new Error('Capture finished but produced 0 frames');
  }

  // Tear down.
  video.pause();
  video.removeAttribute('src');
  video.load();
  if (video.parentNode) video.parentNode.removeChild(video);
  URL.revokeObjectURL(blobUrl);

  return bundle;
}

// Draw a cached frame, fit-to-canvas (cover, preserves aspect).
export function drawFrameCover(ctx, frame, dstW, dstH) {
  if (!frame) return;
  const fw = frame.width;
  const fh = frame.height;
  const fa = fw / fh;
  const da = dstW / dstH;
  let dw, dh, dx, dy;
  if (fa > da) {
    dh = dstH;
    dw = dh * fa;
    dx = (dstW - dw) / 2;
    dy = 0;
  } else {
    dw = dstW;
    dh = dw / fa;
    dx = 0;
    dy = (dstH - dh) / 2;
  }
  ctx.clearRect(0, 0, dstW, dstH);

  if (frame instanceof ImageData) {
    const tmp = document.createElement('canvas');
    tmp.width = frame.width;
    tmp.height = frame.height;
    tmp.getContext('2d').putImageData(frame, 0, 0);
    ctx.drawImage(tmp, dx, dy, dw, dh);
  } else {
    ctx.drawImage(frame, dx, dy, dw, dh);
  }
}
