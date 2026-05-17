import { useEffect, useRef, useState } from 'react';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Showcase from './components/Showcase';
import Anatomy from './components/Anatomy';
import SpecGrid from './components/SpecGrid';
import CtaFooter from './components/CtaFooter';
import Loader from './components/Loader';
import { extractFrames } from './lib/frameExtractor';

const VIDEO_URL = '/hero.mp4';

export default function App() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('preparing…');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [bundle, setBundle] = useState(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    extractFrames(VIDEO_URL, {
      // Source video is 1406×768 — 1408 keeps native, no downscale.
      maxWidth: 1408,
      onProgress: setProgress,
      onStage: setStage,
    })
      .then((result) => {
        console.log('[vex] frames=', result.frames.length, result.width + 'x' + result.height);
        setBundle(result);
        setReady(true);
      })
      .catch((err) => {
        console.error('[vex] extraction failed:', err);
        setError(err);
      });
  }, []);

  return (
    <>
      <Cursor />
      {!ready && (
        <Loader
          progress={progress}
          stage={stage}
          error={error}
          onContinue={() => setReady(true)}
        />
      )}
      <Nav />
      <main>
        <Hero />
        <Showcase />
        <Anatomy frames={bundle?.frames || []} />
        <SpecGrid />
        <CtaFooter />
      </main>
    </>
  );
}
