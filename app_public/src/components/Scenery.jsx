// Планински илустрации и анимации (SVG + CSS) – без надворешни слики.
import { useEffect, useRef, useState } from 'react';

/* ---------- помошни ---------- */

/** Детерминистички „случаен“ генератор, за ѕвездите да не се менуваат при секое рендерирање. */
function rng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const STARS = (() => {
  const r = rng(42);
  return Array.from({ length: 70 }, (_, i) => ({ x: r() * 1440, y: r() * 330, r: r() * 1.4 + 0.4, d: (r() * 4).toFixed(2), k: i }));
})();

/** Следи скрол за паралакс ефект (со requestAnimationFrame). */
function useScrollY(max = 900) {
  const [y, setY] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setY(Math.min(window.scrollY, max))); };
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, [max]);
  return y;
}

/* ---------- голема анимирана сцена за почетната страница ---------- */

export function MountainHero({ children }) {
  const y = useScrollY();
  const layer = (speed) => ({ transform: `translate3d(0, ${y * speed}px, 0)` });

  return (
    <section className="mx-hero">
      <svg className="mx-sky" viewBox="0 0 1440 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1626" />
            <stop offset=".45" stopColor="#23365a" />
            <stop offset=".78" stopColor="#c8697a" />
            <stop offset="1" stopColor="#ffb36b" />
          </linearGradient>
          <radialGradient id="sun" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#fff4d6" />
            <stop offset=".5" stopColor="#ffd38a" />
            <stop offset="1" stopColor="#ffb36b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="l1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f6c9a" /><stop offset="1" stopColor="#4c4f7c" /></linearGradient>
          <linearGradient id="l2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f4f72" /><stop offset="1" stopColor="#2c3b5a" /></linearGradient>
          <linearGradient id="l3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24384a" /><stop offset="1" stopColor="#1a2a38" /></linearGradient>
          <linearGradient id="l4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#163027" /><stop offset="1" stopColor="#0e1f19" /></linearGradient>
          <filter id="blur" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="14" /></filter>
        </defs>
        <rect width="1440" height="760" fill="url(#sky)" />
        <g className="mx-stars" style={layer(0.05)}>
          {STARS.map((s) => <circle key={s.k} cx={s.x} cy={s.y} r={s.r} fill="#fff" style={{ animationDelay: `${s.d}s` }} />)}
        </g>
        <g className="mx-sun" style={layer(0.35)}>
          <circle cx="1240" cy="420" r="190" fill="url(#sun)" opacity=".55" />
          <circle cx="1240" cy="420" r="62" fill="#fff1cc" />
        </g>
        {/* облаци */}
        <g className="mx-cloud c1" opacity=".55"><path d="M0 0c20-22 58-22 74-4 14-14 46-12 54 8 22-2 34 14 30 26H-26C-36 14-18-2 0 0z" fill="#f6d9d6" /></g>
        <g className="mx-cloud c2" opacity=".35"><path d="M0 0c16-18 48-18 60-3 12-12 38-10 44 6 18-2 28 12 24 21H-20C-28 12-14-2 0 0z" fill="#fde3cf" /></g>
        <g className="mx-cloud c3" opacity=".45"><path d="M0 0c20-22 58-22 74-4 14-14 46-12 54 8 22-2 34 14 30 26H-26C-36 14-18-2 0 0z" fill="#e7c6d4" /></g>
        {/* птици */}
        <g className="mx-birds" fill="none" stroke="#1b2438" strokeWidth="2.2" strokeLinecap="round">
          <path className="bird" d="M0 0q8-8 16 0q8-8 16 0" />
          <path className="bird b2" d="M40 18q6-6 12 0q6-6 12 0" />
          <path className="bird b3" d="M-30 26q5-5 10 0q5-5 10 0" />
        </g>
        {/* планински слоеви (паралакс) */}
        <g style={layer(0.28)}>
          <path d="M0 520 L120 430 L210 470 L330 360 L430 440 L540 380 L650 450 L760 340 L880 430 L1000 370 L1120 450 L1240 380 L1350 440 L1440 400 V760 H0Z" fill="url(#l1)" />
        </g>
        <g style={layer(0.2)}>
          <path d="M0 590 L90 520 L190 560 L300 450 L380 500 L470 420 L560 500 L690 400 L800 500 L900 460 L1010 520 L1130 430 L1260 520 L1360 470 L1440 510 V760 H0Z" fill="url(#l2)" />
          {/* снежни капи */}
          <path d="M300 450 L276 474 L292 470 L304 482 L318 468 L326 472Z M470 420 L448 444 L462 440 L474 452 L486 438 L494 442Z M690 400 L662 428 L680 424 L694 438 L708 422 L720 428Z M1130 430 L1106 454 L1122 450 L1134 462 L1146 448 L1156 452Z" fill="#e9eef7" opacity=".9" />
        </g>
        {/* магла */}
        <ellipse className="mx-mist" cx="720" cy="600" rx="820" ry="22" fill="#ffffff" opacity=".12" filter="url(#blur)" />
        <g style={layer(0.12)}>
          <path d="M0 650 L110 590 L230 630 L350 560 L470 620 L590 570 L720 640 L850 580 L980 640 L1100 590 L1230 650 L1340 600 L1440 630 V760 H0Z" fill="url(#l3)" />
          {/* патека со планинар */}
          <path id="trail" className="mx-trail" d="M120 760 C 260 700, 300 690, 360 640 S 470 600, 520 610 S 640 640, 700 600" fill="none" stroke="#ffcf8a" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" opacity=".8" />
          <g className="mx-hiker">
            <circle r="7" fill="#ffcf8a" />
            <circle r="16" fill="#ffcf8a" opacity=".2" />
            <animateMotion dur="16s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.85;1" calcMode="linear">
              <mpath href="#trail" />
            </animateMotion>
          </g>
          <path d="M700 600 v-46" stroke="#f1eadf" strokeWidth="2.5" />
          <path className="mx-flag" d="M700 554 l26 8 -26 9z" fill="#ff7b54" />
        </g>
        <g style={layer(0.05)}>
          <path d="M0 720 L80 680 L160 700 L240 660 L330 700 L420 670 L520 710 L640 676 L760 712 L880 680 L990 710 L1110 672 L1240 708 L1350 682 L1440 700 V760 H0Z" fill="url(#l4)" />
          {/* борови дрвја */}
          {[40, 70, 190, 215, 470, 495, 800, 830, 1180, 1210, 1390].map((x, i) => (
            <path key={x} className="mx-pine" style={{ animationDelay: `${(i % 4) * 0.6}s` }}
              d={`M${x} ${716 - (i % 3) * 8} l12 -34 l12 34z M${x + 4} ${700 - (i % 3) * 8} l8 -24 l8 24z`} fill="#0b1913" />
          ))}
        </g>
        {/* премин кон содржината */}
        <path d="M0 760 V744 C 240 728, 480 752, 720 740 S 1200 726, 1440 744 V760Z" fill="#f5f2ec" />
      </svg>
      <div className="mx-snow" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.73) % 9}s`, animationDuration: `${8 + (i % 5) * 2}s` }} />)}
      </div>
      <div className="mx-hero-content container">{children}</div>
    </section>
  );
}

/* ---------- мала сцена за заглавие на страница ---------- */

export function RidgeBand() {
  return (
    <svg className="ridge-band" viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true">
      <path className="rb-1" d="M0 80 L140 40 L260 70 L400 20 L520 66 L650 30 L780 74 L920 26 L1060 70 L1200 34 L1320 64 L1440 40 V140 H0Z" />
      <path className="rb-2" d="M0 110 L120 76 L250 100 L380 64 L500 98 L640 70 L760 104 L900 72 L1030 102 L1170 74 L1300 104 L1440 80 V140 H0Z" />
      <path className="rb-3" d="M0 140 V124 L160 104 L300 122 L460 100 L620 124 L780 104 L940 126 L1100 106 L1260 124 L1440 108 V140Z" />
    </svg>
  );
}

/* ---------- илустрации за насловна слика / галерија (g1–g6) ---------- */

const SCENES = {
  g1: { name: 'езеро', sky: ['#7fb7d6', '#d9eef3'], back: '#5b7f95', front: '#2f5b4a', extra: 'lake' },
  g2: { name: 'шума', sky: ['#9cc9a8', '#eaf3dc'], back: '#4f7f5f', front: '#1f4d3a', extra: 'forest' },
  g3: { name: 'карпи', sky: ['#e3a46b', '#f8dfb8'], back: '#8a5a3c', front: '#4e3426', extra: 'rocks' },
  g4: { name: 'снег', sky: ['#6b7fb8', '#d7def3'], back: '#9aa6c9', front: '#e9eef7', extra: 'snow' },
  g5: { name: 'река', sky: ['#5fa7b5', '#cdeef0'], back: '#3d7280', front: '#24505a', extra: 'river' },
  g6: { name: 'сонце', sky: ['#f2b84b', '#fff0c2'], back: '#c98a3a', front: '#6b5a2f', extra: 'sun' },
};

/**
 * Илустрирана планинска сцена. variant = g1…g6 (полето cover / gallery од турата).
 * animated – облаците и сонцето полека се движат.
 */
export function PeakScene({ variant = 'g1', animated = true, className = '', label }) {
  const s = SCENES[variant] || SCENES.g1;
  const id = `ps-${variant}`;
  return (
    <svg className={`peak-scene ${animated ? 'is-animated' : ''} ${className}`} viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label || `Илустрација: ${s.name}`}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={s.sky[0]} /><stop offset="1" stopColor={s.sky[1]} /></linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}-sky)`} />
      <circle className="ps-sun" cx="300" cy="62" r={s.extra === 'sun' ? 30 : 18} fill="#fff6d8" opacity=".95" />
      <g className="ps-cloud" fill="#fff" opacity=".8">
        <ellipse cx="80" cy="50" rx="34" ry="10" /><ellipse cx="96" cy="42" rx="20" ry="10" />
      </g>
      <path d="M-10 170 L70 92 L120 130 L190 58 L250 120 L310 80 L410 160 V240 H-10Z" fill={s.back} />
      <path d="M190 58 L170 80 L182 78 L192 88 L204 76 L212 80Z M310 80 L294 98 L306 96 L314 104 L324 94Z" fill="#fff" opacity={s.extra === 'snow' ? 1 : 0.85} />
      <path d="M-10 200 L60 150 L130 186 L210 130 L290 180 L360 146 L410 176 V240 H-10Z" fill={s.front} />
      {s.extra === 'lake' && <ellipse className="ps-water" cx="200" cy="222" rx="150" ry="16" fill="#9fd3e6" opacity=".85" />}
      {s.extra === 'river' && <path className="ps-water" d="M150 240 C 190 214, 170 200, 220 186 S 260 170, 250 160" stroke="#bfe9f1" strokeWidth="10" fill="none" strokeLinecap="round" />}
      {s.extra === 'forest' && [30, 60, 90, 300, 330, 360].map((x, i) => <path key={x} d={`M${x} ${226 - (i % 2) * 6} l14 -40 l14 40z`} fill="#123a2a" />)}
      {s.extra === 'rocks' && <path d="M40 240 l30 -40 l20 16 l24 -28 l30 52z M260 240 l24 -30 l18 12 l20 -22 l26 40z" fill="#3a271c" />}
      {s.extra === 'snow' && <g className="ps-flakes" fill="#fff">{[40, 110, 170, 230, 290, 350].map((x, i) => <circle key={x} cx={x} cy={30 + (i % 3) * 30} r="2.4" />)}</g>}
    </svg>
  );
}

/* ---------- анимации при скрол ---------- */

/** Елементот се појавува (fade + up) кога ќе влезе во екранот. */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setShown(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/** Бројка што „се качува“ од 0 до вредноста. */
export function CountUp({ value, duration = 1200 }) {
  const [shown, setShown] = useState(0);
  const num = Number(value);
  useEffect(() => {
    if (!Number.isFinite(num)) return undefined;
    let raf = 0;
    const start = performance.now();
    const isInt = Number.isInteger(num);
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      setShown(isInt ? Math.round(num * eased) : Math.round(num * eased * 10) / 10);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [num, duration]);
  if (value == null || value === '–') return '–';
  if (!Number.isFinite(num)) return value;
  return shown;
}

/** Логото: врв со знаме што се вее. */
export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo-mark">
      <path d="M2 28 L12 10 L17 18 L21 12 L30 28Z" fill="#ffcf8a" />
      <path d="M12 10 L9.5 14.5 L12 13.5 L14 15.5Z M21 12 L19.4 14.8 L21 14.2 L22.4 15.4Z" fill="#fff" />
      <path d="M21 12 V3" stroke="#fff" strokeWidth="1.6" />
      <path className="logo-flag" d="M21 3 L27 5 L21 7Z" fill="#ff7b54" />
    </svg>
  );
}
