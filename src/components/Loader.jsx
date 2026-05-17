export default function Loader({ progress, stage, error, onContinue }) {
  const pct = Math.round((progress || 0) * 100);
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(255,46,136,0.12), transparent 50%),' +
            'radial-gradient(circle at 70% 80%, rgba(30,233,255,0.10), transparent 50%)',
        }}
      />
      <div className="flex items-center gap-2 mb-12">
        <span className="relative inline-block w-3 h-3">
          <span className="absolute inset-0 rounded-full bg-flare animate-pulseDot" />
          <span className="absolute inset-[2px] rounded-full bg-cream/90" />
        </span>
        <span className="font-display font-bold text-xl tracking-tight">VEX</span>
      </div>

      <div className="w-[28rem] max-w-[88vw]">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-ash mb-3 font-mono">
          <span>{error ? 'Source unavailable' : stage || 'preparing…'}</span>
          <span className="text-cream">{error ? '—' : `${pct.toString().padStart(2, '0')}%`}</span>
        </div>
        <div className="h-px w-full bg-white/[0.08] overflow-hidden relative">
          <div
            className={`absolute left-0 top-0 h-full ${
              error
                ? 'bg-red-500/70'
                : 'bg-gradient-to-r from-flare via-plasma to-lime'
            }`}
            style={{ width: error ? '100%' : `${pct}%`, transition: 'width 150ms linear' }}
          />
        </div>
        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 font-mono text-[12px] leading-relaxed text-red-200/90 break-words whitespace-pre-wrap">
            {error.message || String(error)}
          </div>
        ) : (
          <p className="mt-5 text-xs text-ash/70 leading-relaxed font-mono">
            Pre-baking every frame of the explode sequence into memory so the
            scroll-tied playback is perfectly smooth.
          </p>
        )}
        {error && onContinue && (
          <button
            type="button"
            onClick={onContinue}
            data-cursor="hover"
            className="mt-5 px-4 py-2 rounded-full border border-white/15 text-cream text-sm hover:bg-white/[0.04] transition"
          >
            Continue without video
          </button>
        )}
      </div>
    </div>
  );
}
