import { useEffect, useRef, useState } from 'react';

// Counts a number up from 0 → target once the element enters the viewport.
// Returns [ref, value]. `duration` in ms, `decimals` for fractional display.
export default function useCountUp(target, { duration = 1400, decimals = 0 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const step = (now) => {
              const t = Math.min(1, (now - start) / duration);
              // easeOutCubic
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(target * eased);
              if (t < 1) requestAnimationFrame(step);
              else setValue(target);
            };
            requestAnimationFrame(step);
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return [ref, decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()];
}
