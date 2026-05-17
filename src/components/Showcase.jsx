import useTilt from '../hooks/useTilt';
import useCountUp from '../hooks/useCountUp';

const FEATURES = [
  {
    idx: '01',
    eyebrow: 'Sensor',
    title: 'Track at thirty thousand DPI without a single false count.',
    body: 'A custom Onyx-3 CMOS reads 1 mm of glass with sub-pixel precision. Liftoff distance is tunable down to 0.4 mm — every motion below that is rejected before it hits the firmware.',
    metric: 30000,
    metricSuffix: ' DPI',
    accent: 'plasma',
    side: 'left',
  },
  {
    idx: '02',
    eyebrow: 'Switches',
    title: 'Optical clicks that fire faster than the screen can refresh.',
    body: 'Light-actuated main switches debounce in 0.2 ms — three frames faster than mechanical contacts at 240 Hz. Rated for 100 million clicks; tuned to a low, dry, deliberate sound.',
    metric: 100,
    metricSuffix: 'M clicks',
    accent: 'flare',
    side: 'right',
  },
  {
    idx: '03',
    eyebrow: 'Radio',
    title: 'Eight kilohertz of wireless that hands input back to the screen.',
    body: 'A 2.4 GHz Lightspeed-Plus radio sustains 8000 Hz polling at full power without dropping a single report. End-to-end latency is under one millisecond — measured, not modelled.',
    metric: 8000,
    metricSuffix: ' Hz',
    accent: 'lime',
    side: 'left',
  },
];

const ACCENTS = {
  plasma: {
    text: 'text-plasma',
    border: 'border-plasma/30',
    glow: 'shadow-[0_40px_120px_-40px_rgba(30,233,255,0.45)]',
    grad: 'from-plasma/10 via-transparent to-transparent',
  },
  flare: {
    text: 'text-flare',
    border: 'border-flare/30',
    glow: 'shadow-[0_40px_120px_-40px_rgba(255,46,136,0.45)]',
    grad: 'from-flare/10 via-transparent to-transparent',
  },
  lime: {
    text: 'text-lime',
    border: 'border-lime/30',
    glow: 'shadow-[0_40px_120px_-40px_rgba(196,255,61,0.35)]',
    grad: 'from-lime/10 via-transparent to-transparent',
  },
};

export default function Showcase() {
  return (
    <section
      id="spec"
      className="relative py-32 md:py-44 px-6 perspective-1400 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto mb-20">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-1.5 h-1.5 rounded-full bg-plasma" />
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-ash">
            What's inside · in three numbers
          </span>
        </div>
        <h2 className="font-display font-bold tracking-tightest text-balance text-[clamp(2.6rem,8vw,7rem)] leading-[0.92]">
          The numbers
          <br />
          <span className="iridescent inline-block">that earned the price.</span>
        </h2>
      </div>

      <div className="max-w-6xl mx-auto space-y-12 md:space-y-20">
        {FEATURES.map((f, i) => (
          <FeatureRow key={f.idx} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
}

function FeatureRow({ feature, index }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(10);
  const [countRef, count] = useCountUp(feature.metric);
  const a = ACCENTS[feature.accent];
  const isLeft = feature.side === 'left';

  return (
    <article
      className={`grid grid-cols-1 md:grid-cols-2 items-center gap-10 ${
        isLeft ? '' : 'md:[direction:rtl]'
      }`}
    >
      {/* Tilt card */}
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={`tilt relative rounded-3xl border ${a.border} bg-gradient-to-br ${a.grad} bg-deep/60 backdrop-blur-md p-10 md:p-12 min-h-[280px] ${a.glow} [direction:ltr]`}
        data-cursor="hover"
      >
        <div className="lift-30 absolute top-6 right-6 font-mono text-[11px] tracking-[0.4em] text-ash/60">
          {feature.idx} / 03
        </div>
        <div className="lift-50">
          <div ref={countRef} className={`font-display text-7xl md:text-8xl font-bold ${a.text} tracking-tightest leading-none`}>
            {count}
            <span className="text-3xl md:text-4xl text-cream/40 ml-1 align-top">
              {feature.metricSuffix}
            </span>
          </div>
        </div>
        <div className="lift-30 mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em] text-cream/40">
          <span className={`w-6 h-px bg-current ${a.text}`} />
          live measurement
        </div>

        {/* Decorative grid */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-3xl opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            color: '#f7f3e8',
          }}
        />
      </div>

      {/* Copy */}
      <div className="[direction:ltr]">
        <div className="flex items-center gap-3 mb-5">
          <span className={`block w-1.5 h-1.5 rounded-full bg-current ${a.text}`} />
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-ash">
            {feature.eyebrow}
          </span>
        </div>
        <h3 className="font-display font-semibold tracking-tightest text-balance text-[clamp(1.8rem,3.5vw,3rem)] leading-[1.05] mb-6">
          {feature.title}
        </h3>
        <p className="text-base text-ash leading-relaxed max-w-md">{feature.body}</p>
      </div>
    </article>
  );
}
