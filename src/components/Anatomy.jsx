import { useEffect, useRef, useState } from 'react';
import { drawFrameCover } from '../lib/frameExtractor';

// Cards are positioned in 3D space around the canvas. Each carries its
// own [start, end] scroll-range so they fade in/out as the explode video
// progresses. The "anchor" coords are normalised viewport positions
// (0–100 %) — used to draw the SVG line from the card to a point that
// roughly tracks the relevant component in the video.
const CARDS = [
  {
    id: 'shell',
    eyebrow: '01 · Shell',
    title: 'Magnesium-alloy monocoque',
    body: 'A single-piece CNC-textured shell. Hollowed where you never touch and reinforced where you do — 58 g, no honeycomb cut-outs.',
    metric: '58 g',
    range: [0.12, 0.42],
    pos: { top: '14%', left: '6%' },
    anchor: { x: 50, y: 22 },
    accent: 'flare',
  },
  {
    id: 'switches',
    eyebrow: '02 · Switches',
    title: 'Optical switches & encoder',
    body: 'Light-actuated mains debounce in 0.2 ms — no contact bounce, no surprise double-clicks. 100M-click rated, dry-tuned acoustics.',
    metric: '0.2 ms',
    range: [0.3, 0.58],
    pos: { top: '14%', right: '6%' },
    anchor: { x: 55, y: 35 },
    accent: 'plasma',
  },
  {
    id: 'sensor',
    eyebrow: '03 · Sensor',
    title: 'Custom 30K-DPI optical',
    body: 'Onyx-3 CMOS tracks 750 IPS with sub-pixel precision. 8 kHz wireless polling — measured latency below 1 ms end-to-end.',
    metric: '30,000',
    range: [0.48, 0.76],
    pos: { bottom: '16%', left: '6%' },
    anchor: { x: 45, y: 58 },
    accent: 'lime',
  },
  {
    id: 'power',
    eyebrow: '04 · Power',
    title: 'PCB, NPU, 90-hour battery',
    body: '4-layer impedance-matched mainboard. 500 mAh LiPo lasts 90 hours; full charge in 60 minutes over USB-C PD.',
    metric: '90 hr',
    range: [0.66, 0.94],
    pos: { bottom: '16%', right: '6%' },
    anchor: { x: 55, y: 70 },
    accent: 'gold',
  },
];

const ACCENTS = {
  flare: { text: 'text-flare', border: 'border-flare/40', stroke: '#ff2e88' },
  plasma: { text: 'text-plasma', border: 'border-plasma/40', stroke: '#1ee9ff' },
  lime: { text: 'text-lime', border: 'border-lime/40', stroke: '#c4ff3d' },
  gold: { text: 'text-gold', border: 'border-gold/40', stroke: '#ffd166' },
};

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function cardOpacity(p, [a, b]) {
  const span = b - a;
  const inEnd = a + span * 0.28;
  const outStart = b - span * 0.28;
  if (p < a || p > b) return 0;
  if (p < inEnd) return smoothstep(a, inEnd, p);
  if (p > outStart) return 1 - smoothstep(outStart, b, p);
  return 1;
}

export default function Anatomy({ frames }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef(frames);
  const lastDrawnRef = useRef(-1);
  const rafRef = useRef(0);
  const [progress, setProgress] = useState(0);
  framesRef.current = frames;

  const sizeCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    // DPR cap at 2 — the source video is 1406×768, so a denser backing store
    // adds cost without adding real detail and worsens scroll stutter.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    const ctx = c.getContext('2d', { alpha: false });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    lastDrawnRef.current = -1;
  };

  const schedule = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(paint);
  };

  const paint = () => {
    rafRef.current = 0;
    const c = canvasRef.current;
    const s = sectionRef.current;
    if (!c || !s) return;
    const r = s.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollable = r.height - vh;
    const scrolled = Math.max(0, Math.min(scrollable, -r.top));
    const p = scrollable > 0 ? scrolled / scrollable : 0;
    setProgress(p);

    const fs = framesRef.current;
    const ctx = c.getContext('2d', { alpha: false });
    const W = c.clientWidth;
    const H = c.clientHeight;

    // No frames yet → fill the dark backdrop so the section reads as
    // intentional rather than transparent. Don't touch lastDrawn.
    if (!fs || !fs.length) {
      ctx.fillStyle = '#0d0b1a';
      ctx.fillRect(0, 0, W, H);
      lastDrawnRef.current = -1;
      return;
    }
    const idx = Math.min(fs.length - 1, Math.floor(p * fs.length));
    // Skip if the same frame is already on-screen — DO NOT clear first,
    // otherwise spurious paints (parent transform change, scroll without
    // frame bump) would blank the canvas with nothing painted back.
    if (idx === lastDrawnRef.current) return;
    ctx.fillStyle = '#0d0b1a';
    ctx.fillRect(0, 0, W, H);
    drawFrameCover(ctx, fs[idx], W, H);
    lastDrawnRef.current = idx;
  };

  useEffect(() => {
    sizeCanvas();
    const ro = new ResizeObserver(() => {
      sizeCanvas();
      schedule();
    });
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const on = () => schedule();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    schedule();
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    lastDrawnRef.current = -1;
    schedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames]);

  return (
    <section
      ref={sectionRef}
      id="anatomy"
      className="relative w-full"
      style={{ height: '460vh' }}
      aria-label="Mouse disassembly scroll sequence"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-deep perspective-1400">
        {/* Static atmospheric backdrop. The previous version had a rotating
            700px conic-gradient with blur-3xl whose transform updated on
            every scroll tick — that was a 0.6-megapixel filter pass per
            paint, the biggest contributor to scroll lag in this section. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,46,136,0.10), transparent 60%),' +
              'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(30,233,255,0.08), transparent 65%)',
          }}
        />

        {/* Tilted canvas frame — the centre stage */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="relative rounded-3xl overflow-hidden border border-white/[0.08]"
            style={{
              width: 'min(78vw, 1100px)',
              height: 'min(64vh, 620px)',
              boxShadow:
                '0 60px 120px -40px rgba(255,46,136,0.25), 0 60px 180px -40px rgba(30,233,255,0.18)',
            }}
          >
            <canvas ref={canvasRef} className="block w-full h-full" />
            {/* corner ticks for a "scope" feel */}
            {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map(
              (pos) => (
                <span
                  key={pos}
                  aria-hidden
                  className={`absolute ${pos} w-3 h-3 border-cream/30`}
                  style={{
                    borderTopWidth: pos.includes('top') ? 1 : 0,
                    borderBottomWidth: pos.includes('bottom') ? 1 : 0,
                    borderLeftWidth: pos.includes('left') ? 1 : 0,
                    borderRightWidth: pos.includes('right') ? 1 : 0,
                  }}
                />
              )
            )}
            {/* live readouts overlaid on the frame */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-cream/45 pointer-events-none">
              <span>Anatomy · Live</span>
              <span>{(progress * 100).toFixed(1)}%</span>
            </div>
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-cream/45 pointer-events-none">
              <span>VEX · series 03</span>
              <span>FRAME {frames?.length ? Math.min(frames.length - 1, Math.floor(progress * frames.length)) : 0}/{frames?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Section eyebrow */}
        <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none z-10">
          <div className="flex items-center gap-3">
            <span className="block w-1.5 h-1.5 rounded-full bg-flare animate-pulseDot" />
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-cream/60">
              Scroll · Take it apart
            </p>
          </div>
        </div>

        {/* Progress rail */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-px bg-white/10 overflow-hidden z-10">
          <div
            className="h-full bg-flare"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        {/* Connector-line overlay */}
        <ConnectorLines progress={progress} />

        {/* Floating cards in 3D space */}
        {CARDS.map((card) => {
          const o = cardOpacity(progress, card.range);
          if (o <= 0.001) return null;
          return (
            <Card key={card.id} card={card} opacity={o} progress={progress} />
          );
        })}
      </div>
    </section>
  );
}

function Card({ card, opacity, progress }) {
  const a = ACCENTS[card.accent];
  // Map 0..1 progress within the card's range → 0..1 for translateZ ramp.
  const local = Math.max(
    0,
    Math.min(1, (progress - card.range[0]) / (card.range[1] - card.range[0]))
  );
  // Card sits in 3D, gently floats forward as it appears.
  const tz = 30 + local * 30;
  return (
    <article
      data-cursor="hover"
      className={`absolute max-w-[280px] rounded-2xl border ${a.border} bg-void/70 backdrop-blur-md p-5 z-10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]`}
      style={{
        ...card.pos,
        opacity,
        transform: `translateZ(${tz}px)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 200ms ease-out',
      }}
    >
      <p
        className={`text-[10px] font-mono uppercase tracking-[0.4em] mb-2.5 ${a.text}`}
      >
        {card.eyebrow}
      </p>
      <h3 className="font-display text-[19px] leading-tight tracking-tight text-cream mb-2.5">
        {card.title}
      </h3>
      <p className="text-[12.5px] leading-relaxed text-ash mb-4">{card.body}</p>
      <div className="flex items-baseline justify-between pt-3 border-t border-white/[0.06]">
        <span className={`font-display text-2xl font-semibold ${a.text}`}>
          {card.metric}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-ash">
          measured
        </span>
      </div>
    </article>
  );
}

// Draws thin lines from each visible card to its anchor point on the
// canvas frame. Anchor positions are viewport-percentage so they stay
// roughly aligned with the floating components in the explode video.
function ConnectorLines({ progress }) {
  const svgRef = useRef(null);
  // Force re-render on every paint tick so lines track scroll smoothly.
  // (We already re-render on progress change above — this SVG just re-reads
  // window dims on each render, which is enough.)
  void svgRef;
  return (
    <svg
      className="absolute inset-0 pointer-events-none z-[5]"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      {CARDS.map((card) => {
        const o = cardOpacity(progress, card.range);
        if (o <= 0.001) return null;
        const a = ACCENTS[card.accent];
        // Approximate card-corner anchor in pixels.
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
        const cardX =
          card.pos.left
            ? (parseFloat(card.pos.left) / 100) * vw + 140
            : vw - (parseFloat(card.pos.right) / 100) * vw - 140;
        const cardY =
          card.pos.top
            ? (parseFloat(card.pos.top) / 100) * vh + 70
            : vh - (parseFloat(card.pos.bottom) / 100) * vh - 70;
        const ax = (card.anchor.x / 100) * vw;
        const ay = (card.anchor.y / 100) * vh;
        return (
          <g key={card.id} opacity={o}>
            <line
              x1={cardX}
              y1={cardY}
              x2={ax}
              y2={ay}
              stroke={a.stroke}
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.7"
            />
            <circle cx={ax} cy={ay} r="4" fill={a.stroke} opacity="0.9" />
            <circle cx={ax} cy={ay} r="10" fill="none" stroke={a.stroke} opacity="0.4" />
          </g>
        );
      })}
    </svg>
  );
}
