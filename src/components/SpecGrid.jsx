import useTilt from '../hooks/useTilt';

const SPECS = [
  {
    label: 'Mass',
    value: '58 g',
    sub: 'without cable',
    accent: 'flare',
  },
  {
    label: 'Sensor',
    value: '30K DPI',
    sub: 'Onyx-3 CMOS · 750 IPS',
    accent: 'plasma',
  },
  {
    label: 'Polling',
    value: '8 kHz',
    sub: 'Lightspeed-Plus 2.4 GHz',
    accent: 'lime',
  },
  {
    label: 'Switches',
    value: '0.2 ms',
    sub: '100M-click optical mains',
    accent: 'gold',
  },
  {
    label: 'Battery',
    value: '90 hr',
    sub: '500 mAh · USB-C PD',
    accent: 'plasma',
  },
  {
    label: 'Latency',
    value: '< 1 ms',
    sub: 'end-to-end wireless',
    accent: 'flare',
  },
  {
    label: 'Buttons',
    value: '6',
    sub: '2 main · 2 side · scroll · DPI',
    accent: 'lime',
  },
  {
    label: 'Skates',
    value: 'PTFE',
    sub: '0.8 mm pure PTFE · 100% glide',
    accent: 'gold',
  },
];

const ACCENTS = {
  flare: { text: 'text-flare', border: 'hover:border-flare/50' },
  plasma: { text: 'text-plasma', border: 'hover:border-plasma/50' },
  lime: { text: 'text-lime', border: 'hover:border-lime/50' },
  gold: { text: 'text-gold', border: 'hover:border-gold/50' },
};

export default function SpecGrid() {
  return (
    <section id="sensor" className="relative px-6 py-32 md:py-40 perspective-1400 overflow-hidden">
      <div className="max-w-6xl mx-auto mb-20">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-1.5 h-1.5 rounded-full bg-lime" />
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-ash">
            Spec sheet
          </span>
        </div>
        <h2 className="font-display font-bold tracking-tightest text-balance text-[clamp(2.6rem,8vw,7rem)] leading-[0.92]">
          Every gram,
          <br />
          <span className="iridescent inline-block">every hertz.</span>
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {SPECS.map((s, i) => (
          <SpecCard key={s.label} spec={s} index={i} />
        ))}
      </div>
    </section>
  );
}

function SpecCard({ spec, index }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(14);
  const a = ACCENTS[spec.accent];
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      data-cursor="hover"
      className={`tilt group relative rounded-2xl border border-white/[0.07] bg-deep/60 backdrop-blur-md p-6 md:p-7 min-h-[170px] flex flex-col justify-between transition-colors duration-300 ${a.border}`}
    >
      <div className="lift-30 flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-ash">
          {spec.label}
        </span>
        <span className="font-mono text-[10px] text-ash/40">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="lift-50">
        <div
          className={`font-display text-3xl md:text-4xl font-semibold tracking-tightest leading-none ${a.text}`}
        >
          {spec.value}
        </div>
        <div className="mt-2 text-[12px] text-cream/55 leading-snug">{spec.sub}</div>
      </div>
    </div>
  );
}
