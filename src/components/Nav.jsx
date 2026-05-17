import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const links = ['Spec', 'Sensor', 'Switches', 'Anatomy', 'Buy'];

  return (
    <nav
      className={`fixed top-4 inset-x-4 z-40 transition-all duration-500 ${
        scrolled ? '' : ''
      }`}
    >
      <div
        className={`mx-auto max-w-6xl flex items-center justify-between rounded-full px-5 py-2.5 backdrop-blur-md border transition ${
          scrolled
            ? 'bg-void/70 border-white/[0.08]'
            : 'bg-white/[0.03] border-white/[0.05]'
        }`}
      >
        <a
          href="#top"
          data-cursor="hover"
          className="flex items-center gap-2 font-display font-bold tracking-tight text-[15px]"
        >
          <span className="relative inline-block w-3 h-3">
            <span className="absolute inset-0 rounded-full bg-flare animate-pulseDot" />
            <span className="absolute inset-[2px] rounded-full bg-cream/90" />
          </span>
          <span>VEX</span>
          <span className="hidden md:inline text-ash/40 font-mono text-[11px] ml-1">
            /v3
          </span>
        </a>
        <ul className="hidden md:flex items-center gap-1 text-[13px]">
          {links.map((l) => (
            <li key={l}>
              <a
                href={`#${l.toLowerCase()}`}
                data-cursor="hover"
                className="px-3 py-1.5 rounded-full text-ash hover:text-cream hover:bg-white/[0.04] transition"
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#buy"
          data-cursor="hover"
          className="px-4 py-1.5 text-[13px] rounded-full bg-flare text-void font-medium hover:bg-flare/90 transition shadow-[0_10px_30px_-10px_rgba(255,46,136,0.6)]"
        >
          Pre-order
        </a>
      </div>
    </nav>
  );
}
