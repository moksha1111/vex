import { useEffect, useRef } from 'react';

// Custom cursor: a tiny dot that snaps to the pointer and a larger ring
// that lags behind with damped motion. The ring grows on interactive
// elements (anything with `data-cursor="hover"` or a button/a) for a
// satisfying magnetic feel.
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const target = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);

  useEffect(() => {
    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      // Also publish to CSS vars so spotlight + parallax can read them.
      document.documentElement.style.setProperty(
        '--mx',
        ((e.clientX / window.innerWidth) * 100).toFixed(2) + '%'
      );
      document.documentElement.style.setProperty(
        '--my',
        ((e.clientY / window.innerHeight) * 100).toFixed(2) + '%'
      );
      if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
    };

    const loop = () => {
      rafRef.current = 0;
      // Dot snaps; ring damps.
      dot.style.transform = `translate(${target.current.x}px, ${target.current.y}px) translate(-50%, -50%)`;
      ring.current.x += (target.current.x - ring.current.x) * 0.18;
      ring.current.y += (target.current.y - ring.current.y) * 0.18;
      ringEl.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;
      const dx = target.current.x - ring.current.x;
      const dy = target.current.y - ring.current.y;
      if (Math.hypot(dx, dy) > 0.5) rafRef.current = requestAnimationFrame(loop);
    };

    const hoverMatches = (el) =>
      el &&
      (el.dataset?.cursor === 'hover' ||
        el.closest('button, a, [data-cursor="hover"]'));

    const onOver = (e) => {
      if (hoverMatches(e.target)) ringEl.classList.add('is-hover');
    };
    const onOut = (e) => {
      if (hoverMatches(e.target)) ringEl.classList.remove('is-hover');
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseout', onOut);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  );
}
