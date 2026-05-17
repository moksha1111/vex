import { useEffect, useRef } from 'react';

export default function Hero() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);

  // Cursor parallax for the title — rAF-throttled. Previously this wrote
  // to .style.transform on every mousemove event which was 60-120 layout
  // mutations per second + caused composite invalidations on a huge
  // text-shadow stack.
  useEffect(() => {
    const t = titleRef.current;
    if (!t) return;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };
    let raf = 0;

    const tick = () => {
      raf = 0;
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      t.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`;
      if (Math.hypot(target.x - current.x, target.y - current.y) > 0.1) {
        raf = requestAnimationFrame(tick);
      }
    };
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 18;
      target.y = (e.clientY / window.innerHeight - 0.5) * 10;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative min-h-[100svh] overflow-hidden grain"
    >
      {/* Static cosmic backdrop — no animations, just a layered radial
          gradient. Was previously fighting with rotating conic+blur sigils
          which forced full-screen GPU work every frame. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 18% 12%, rgba(255,46,136,0.22), transparent 60%),' +
            'radial-gradient(ellipse 55% 60% at 82% 88%, rgba(30,233,255,0.18), transparent 65%),' +
            'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(196,255,61,0.05), transparent 70%),' +
            '#08070f',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-32">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-10">
          <span className="block w-1.5 h-1.5 rounded-full bg-flare animate-pulseDot" />
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-ash">
            Vex · Series 03 · Now in carbon
          </span>
        </div>

        {/* Title — 3D extruded type with cursor parallax */}
        <h1
          ref={titleRef}
          className="font-display font-bold tracking-tightest leading-[0.82] text-[clamp(4rem,17vw,15rem)] extrude select-none"
          style={{ willChange: 'transform' }}
        >
          BUILT FOR THE
          <br />
          <span className="iridescent inline-block">MILLISECOND.</span>
        </h1>

        {/* Sub + CTAs row */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-end">
          <p className="font-display text-balance text-xl md:text-2xl text-ash max-w-xl leading-snug">
            A&nbsp;58-gram wireless mouse with a 30K-DPI sensor, optical
            switches, and an 8&nbsp;kHz polling radio that hands the
            input lag back to the screen.
          </p>
          <div className="flex flex-col items-start lg:items-end gap-4">
            <div className="flex gap-3">
              <a
                href="#anatomy"
                data-cursor="hover"
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-cream text-void font-medium text-[15px] hover:bg-white transition shadow-[0_25px_60px_-20px_rgba(247,243,232,0.4)]"
              >
                Take it apart
                <span className="block w-1.5 h-1.5 rounded-full bg-flare group-hover:scale-150 transition" />
              </a>
              <a
                href="#spec"
                data-cursor="hover"
                className="px-6 py-3.5 rounded-full border border-white/15 text-cream text-[15px] hover:bg-white/[0.04] transition"
              >
                Specs →
              </a>
            </div>
            <p className="text-[12px] text-ash/70 font-mono">
              Ships <span className="text-cream">Q3 2026</span> · from $189
            </p>
          </div>
        </div>

        {/* Floating stat badges — 3D-feeling pills offset around the page */}
        <div className="hidden md:block absolute right-8 top-44 rotate-[8deg] float">
          <Badge value="30,000" label="DPI · sub-pixel" tone="cyan" />
        </div>
        <div className="hidden md:block absolute left-8 top-[55%] -rotate-[6deg]">
          <Badge value="0.2 ms" label="click latency" tone="magenta" />
        </div>
        <div className="hidden md:block absolute right-16 bottom-[12%] rotate-[5deg]">
          <Badge value="58 g" label="without cable" tone="lime" />
        </div>
      </div>

      {/* Bottom marquee — promo strip */}
      <div className="absolute bottom-0 inset-x-0 border-y border-white/[0.06] bg-void/60 backdrop-blur-sm overflow-hidden">
        <div className="flex whitespace-nowrap py-3 animate-marquee">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              {[
                'BUILT FOR THE MILLISECOND',
                '8000 HZ POLLING',
                '30K DPI · 750 IPS',
                '100M CLICK SWITCHES',
                '90-HOUR BATTERY',
                '58 G CHASSIS',
                'CARBON · TITANIUM · POLYMER',
              ].map((s, j) => (
                <span
                  key={j}
                  className="font-display text-xl md:text-2xl font-medium tracking-[0.05em] px-8 text-cream/70"
                >
                  {s}
                  <span className="inline-block mx-8 w-1.5 h-1.5 rounded-full bg-flare align-middle" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Badge({ value, label, tone }) {
  const toneMap = {
    magenta: 'border-flare/40 text-flare shadow-[0_20px_50px_-20px_rgba(255,46,136,0.6)]',
    cyan: 'border-plasma/40 text-plasma shadow-[0_20px_50px_-20px_rgba(30,233,255,0.5)]',
    lime: 'border-lime/40 text-lime shadow-[0_20px_50px_-20px_rgba(196,255,61,0.4)]',
  };
  return (
    <div
      className={`animate-floatY backdrop-blur-md bg-void/40 border ${toneMap[tone]} rounded-2xl px-5 py-3.5`}
    >
      <div className="font-display text-3xl font-semibold leading-none">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/60 mt-1.5">
        {label}
      </div>
    </div>
  );
}
