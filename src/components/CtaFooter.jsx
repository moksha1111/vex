export default function CtaFooter() {
  return (
    <section id="buy" className="relative pt-28 pb-12 px-6 overflow-hidden">
      {/* Reverse marquee strip */}
      <div className="absolute top-0 inset-x-0 border-y border-white/[0.06] bg-void/60 overflow-hidden">
        <div className="flex whitespace-nowrap py-3 animate-marqueeRev">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              {[
                'AVAILABLE Q3 2026',
                'CARBON · TITANIUM · POLYMER',
                'FROM $189',
                '2-YEAR LIMITED WARRANTY',
                'FREE WORLDWIDE SHIPPING',
                'PRE-ORDER NOW',
              ].map((s, j) => (
                <span
                  key={j}
                  className="font-display text-xl md:text-2xl font-medium tracking-[0.05em] px-8 text-cream/65"
                >
                  {s}
                  <span className="inline-block mx-8 w-1.5 h-1.5 rounded-full bg-plasma align-middle" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-display font-bold tracking-tightest text-balance text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.92]">
            Hand-built.
            <br />
            <span className="iridescent inline-block">Hand-tuned.</span>
          </h2>
          <p className="mt-6 text-ash max-w-md text-balance">
            Every Vex is assembled in our Lisbon studio, sensor-calibrated
            against a glass-class reference, and shipped with the
            measurement card.
          </p>
        </div>
        <div className="md:justify-self-end w-full md:max-w-md">
          <div className="rounded-3xl border border-white/[0.08] bg-deep/60 backdrop-blur-md p-7">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-ash">
                Reserve a Vex · 03
              </span>
              <span className="font-mono text-[11px] text-ash/60">$189</span>
            </div>
            <div className="mt-5 font-display text-4xl tracking-tightest">
              Deposit <span className="text-flare">$25</span>
            </div>
            <p className="mt-2 text-[12px] text-ash leading-relaxed">
              Fully refundable. Charged in full at shipping (Q3 2026). Pick
              your finish: <span className="text-cream">carbon</span>,{' '}
              <span className="text-cream">titanium</span>, or{' '}
              <span className="text-cream">soft polymer</span>.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                data-cursor="hover"
                className="flex-1 rounded-full bg-flare text-void font-medium py-3 text-sm hover:bg-flare/90 transition shadow-[0_20px_50px_-20px_rgba(255,46,136,0.6)]"
              >
                Reserve
              </button>
              <button
                data-cursor="hover"
                className="px-5 rounded-full border border-white/15 text-cream text-sm hover:bg-white/[0.04] transition"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="max-w-6xl mx-auto mt-28 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-ash/60">
        <div className="flex items-center gap-2">
          <span className="block w-2 h-2 rounded-full bg-flare animate-pulseDot" />
          <span>© 2026 Vex Industries — Lisbon · Taipei</span>
        </div>
        <div className="flex flex-wrap gap-6">
          {['Privacy', 'Support', 'Warranty', 'Press kit'].map((l) => (
            <a key={l} href="#" data-cursor="hover" className="hover:text-cream transition">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </section>
  );
}
