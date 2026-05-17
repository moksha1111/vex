import { useCallback, useRef } from 'react';

// 3D tilt hook — drop ref on any element. The element will rotate in 3D
// based on cursor position relative to its bounding box. `max` is the
// maximum rotation in degrees; falls to 0 on mouse leave.
export default function useTilt(max = 12) {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const targetRef = useRef({ rx: 0, ry: 0 });
  const currentRef = useRef({ rx: 0, ry: 0 });

  const tick = useCallback(() => {
    rafRef.current = 0;
    const el = ref.current;
    if (!el) return;
    const t = targetRef.current;
    const c = currentRef.current;
    c.rx += (t.rx - c.rx) * 0.18;
    c.ry += (t.ry - c.ry) * 0.18;
    el.style.setProperty('--rx', `${c.rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${c.ry.toFixed(2)}deg`);
    if (Math.abs(t.rx - c.rx) + Math.abs(t.ry - c.ry) > 0.05) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetRef.current.rx = px * max;
      targetRef.current.ry = -py * max;
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    },
    [max, tick]
  );

  const onMouseLeave = useCallback(() => {
    targetRef.current.rx = 0;
    targetRef.current.ry = 0;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  return { ref, onMouseMove, onMouseLeave };
}
