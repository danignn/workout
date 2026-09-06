import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/AppContext';
import { getPhoto } from '../store/idb';
import type { MascotId } from '../store/types';

/* ------------------------------------------------------------------ *
 * Original mascot artwork. Everything here is drawn from primitives so
 * the app ships no third-party images.
 * ------------------------------------------------------------------ */

function Butterfly({ flap }: { flap: number }) {
  // flap swings between roughly -1 and 1 and squashes the wings horizontally.
  const spread = 0.45 + 0.55 * Math.abs(flap);
  return (
    <svg width="46" height="42" viewBox="0 0 46 42" aria-hidden="true">
      <defs>
        <linearGradient id="wingA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd6e6" />
          <stop offset="60%" stopColor="#ff9dbb" />
          <stop offset="100%" stopColor="#f97fa5" />
        </linearGradient>
        <radialGradient id="glitter">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`translate(23 21) scale(${spread} 1)`}>
        <path d="M-1 -1C-6 -13 -14 -17 -18 -13 -22 -9 -19 -1 -1 1Z" fill="url(#wingA)" />
        <path d="M-1 1C-7 9 -14 13 -17 10 -20 7 -15 2 -1 -0.5Z" fill="url(#wingA)" opacity="0.88" />
        <path d="M1 -1C6 -13 14 -17 18 -13 22 -9 19 -1 1 1Z" fill="url(#wingA)" />
        <path d="M1 1C7 9 14 13 17 10 20 7 15 2 1 -0.5Z" fill="url(#wingA)" opacity="0.88" />
        <circle cx="-11" cy="-8" r="2.1" fill="#fff" opacity="0.75" />
        <circle cx="11" cy="-8" r="2.1" fill="#fff" opacity="0.75" />
        <circle cx="-9" cy="5" r="1.3" fill="#fff" opacity="0.6" />
        <circle cx="9" cy="5" r="1.3" fill="#fff" opacity="0.6" />
      </g>
      <g stroke="#c9456f" strokeWidth="1.4" strokeLinecap="round" fill="none">
        <path d="M23 13c-1.5-3-3-4.5-5-5" />
        <path d="M23 13c1.5-3 3-4.5 5-5" />
      </g>
      <ellipse cx="23" cy="21" rx="1.9" ry="8" fill="#c9456f" />
      <circle cx="23" cy="13.5" r="2.4" fill="#c9456f" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M17 2c1.6 8.6 5.8 12.8 14.4 15C22.8 19.2 18.6 23.4 17 32c-1.6-8.6-5.8-12.8-14.4-15C11.2 14.8 15.4 10.6 17 2Z" fill="#ff9dbb" />
      <path d="M17 8.5c.9 4.8 3.2 7.1 8 8.5-4.8 1.4-7.1 3.7-8 8.5-.9-4.8-3.2-7.1-8-8.5 4.8-1.4 7.1-3.7 8-8.5Z" fill="#fff" opacity="0.85" />
    </svg>
  );
}

function Heart() {
  return (
    <svg width="34" height="32" viewBox="0 0 34 32" aria-hidden="true">
      <path d="M17 29S3 20.6 3 11.8A7.8 7.8 0 0 1 17 7a7.8 7.8 0 0 1 14 4.8C31 20.6 17 29 17 29Z" fill="#ff9dbb" />
      <ellipse cx="11" cy="12" rx="3.2" ry="2.2" fill="#fff" opacity="0.55" transform="rotate(-25 11 12)" />
    </svg>
  );
}

function Fairy({ flap }: { flap: number }) {
  const spread = 0.5 + 0.5 * Math.abs(flap);
  return (
    <svg width="42" height="44" viewBox="0 0 42 44" aria-hidden="true">
      <g transform={`translate(21 20) scale(${spread} 1)`} opacity="0.75">
        <ellipse cx="-9" cy="-3" rx="8" ry="11" fill="#ffd6e6" transform="rotate(-20 -9 -3)" />
        <ellipse cx="9" cy="-3" rx="8" ry="11" fill="#ffd6e6" transform="rotate(20 9 -3)" />
      </g>
      <circle cx="21" cy="12" r="6" fill="#ffe0c4" />
      <path d="M15 11c0-5 3-8 6-8s6 3 6 8c-2-2-4-3-6-3s-4 1-6 3Z" fill="#c9456f" />
      <path d="M21 18c4 0 7 4 8 11H13c1-7 4-11 8-11Z" fill="#ff9dbb" />
      <circle cx="19" cy="12.5" r="0.9" fill="#5b3d47" />
      <circle cx="23" cy="12.5" r="0.9" fill="#5b3d47" />
      <path d="M31 22l1.4 3.2L36 26.6l-3.6 1.4L31 31.4l-1.4-3.4L26 26.6l3.6-1.4Z" fill="#ffd166" />
    </svg>
  );
}

function Bunny({ flap }: { flap: number }) {
  const hop = Math.abs(flap) * 2;
  return (
    <svg width="38" height="46" viewBox="0 0 38 46" aria-hidden="true">
      <g transform={`translate(0 ${-hop})`}>
        <ellipse cx="12" cy="14" rx="4.2" ry="12" fill="#ffd2de" transform="rotate(-12 12 14)" />
        <ellipse cx="26" cy="14" rx="4.2" ry="12" fill="#ffd2de" transform="rotate(12 26 14)" />
        <ellipse cx="12" cy="15" rx="2" ry="8" fill="#ff9dbb" transform="rotate(-12 12 15)" />
        <ellipse cx="26" cy="15" rx="2" ry="8" fill="#ff9dbb" transform="rotate(12 26 15)" />
        <circle cx="19" cy="31" r="11" fill="#fff0f4" stroke="#ffd2de" strokeWidth="1.5" />
        <circle cx="15" cy="30" r="1.3" fill="#5b3d47" />
        <circle cx="23" cy="30" r="1.3" fill="#5b3d47" />
        <path d="M19 33.5l-1.6 1.6h3.2Z" fill="#f97fa5" />
        <circle cx="11.5" cy="33" r="2.2" fill="#ffc0d2" opacity="0.8" />
        <circle cx="26.5" cy="33" r="2.2" fill="#ffc0d2" opacity="0.8" />
      </g>
    </svg>
  );
}

function Kitty({ flap }: { flap: number }) {
  const tilt = flap * 6;
  return (
    <svg width="40" height="38" viewBox="0 0 40 38" aria-hidden="true">
      <g transform={`rotate(${tilt} 20 20)`}>
        <path d="M7 14 8 4l9 5Z" fill="#ffd2de" />
        <path d="M33 14 32 4l-9 5Z" fill="#ffd2de" />
        <circle cx="20" cy="21" r="12" fill="#fff0f4" stroke="#ffd2de" strokeWidth="1.5" />
        <circle cx="15.5" cy="20" r="1.5" fill="#5b3d47" />
        <circle cx="24.5" cy="20" r="1.5" fill="#5b3d47" />
        <path d="M20 23.5l-1.8 1.8h3.6Z" fill="#f97fa5" />
        <g stroke="#ffb8cc" strokeWidth="1.2" strokeLinecap="round">
          <path d="M8 21h5M8 25h5M32 21h-5M32 25h-5" />
        </g>
        <circle cx="12" cy="24.5" r="2.2" fill="#ffc0d2" opacity="0.75" />
        <circle cx="28" cy="24.5" r="2.2" fill="#ffc0d2" opacity="0.75" />
      </g>
    </svg>
  );
}

function Flower({ flap }: { flap: number }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" style={{ transform: `rotate(${flap * 22}deg)` }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (-90 + i * 72) * (Math.PI / 180);
        return <circle key={i} cx={18 + Math.cos(a) * 8.5} cy={18 + Math.sin(a) * 8.5} r="6.2" fill="#ffc0d2" />;
      })}
      <circle cx="18" cy="18" r="5" fill="#fff1a8" />
    </svg>
  );
}

function CustomMascot({ id }: { id: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let revoke: string | null = null;
    getPhoto(id).then((blob) => {
      if (!blob) return;
      revoke = URL.createObjectURL(blob);
      setUrl(revoke);
    });
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [id]);
  if (!url) return null;
  // No fixed box and no rounding: the image keeps whatever shape it was drawn
  // in, and a transparent PNG floats with no background at all.
  return (
    <img
      src={url}
      alt=""
      className="mascot-custom"
      style={{ maxWidth: 52, maxHeight: 52, width: 'auto', height: 'auto', display: 'block' }}
    />
  );
}

function renderMascot(id: MascotId, flap: number, customId?: string) {
  switch (id) {
    case 'butterfly': return <Butterfly flap={flap} />;
    case 'sparkle': return <Sparkle />;
    case 'heart': return <Heart />;
    case 'fairy': return <Fairy flap={flap} />;
    case 'bunny': return <Bunny flap={flap} />;
    case 'kitty': return <Kitty flap={flap} />;
    case 'flower': return <Flower flap={flap} />;
    case 'custom': return customId ? <CustomMascot id={customId} /> : null;
    default: return null;
  }
}

export function MascotPreview({ id, customId }: { id: MascotId; customId?: string }) {
  return <span style={{ display: 'inline-flex' }}>{renderMascot(id, 0.7, customId)}</span>;
}

interface Trail {
  x: number;
  y: number;
  born: number;
}

const SPEEDS = { calm: 0.34, normal: 0.6, lively: 1.05 };

/**
 * A single mascot that wanders the screen on a smooth, never-repeating path,
 * leaving a short glitter trail. Purely decorative: it sits behind the tab bar,
 * ignores pointer events, and stops entirely for reduced-motion users.
 */
export function Mascot() {
  const { state } = useApp();
  const { mascot, customMascotId, mascotSpeed } = state.theme;
  const ref = useRef<HTMLDivElement>(null);
  const [trail, setTrail] = useState<Trail[]>([]);
  const [flap, setFlap] = useState(0);

  const enabled =
    mascot !== 'none' &&
    (mascot !== 'custom' || !!customMascotId) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!enabled) return;
    const speed = SPEEDS[mascotSpeed] ?? SPEEDS.normal;

    const pick = () => ({
      x: 40 + Math.random() * Math.max(80, window.innerWidth - 120),
      y: 90 + Math.random() * Math.max(120, window.innerHeight - 260),
    });

    let pos = pick();
    let target = pick();
    let raf = 0;
    let last = performance.now();
    let sinceSparkle = 0;

    const step = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 24) target = pick();

      // Ease toward the waypoint, with a slow sine wobble so the path never
      // looks like a straight line between two points.
      const move = (speed * dt) / 16;
      pos = {
        x: pos.x + (dx / (dist || 1)) * move + Math.sin(now / 700) * 0.35,
        y: pos.y + (dy / (dist || 1)) * move + Math.cos(now / 520) * 0.35,
      };

      const facing = dx < 0 ? -1 : 1;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scaleX(${facing})`;
      }
      setFlap(Math.sin(now / 110));

      sinceSparkle += dt;
      if (sinceSparkle > 190) {
        sinceSparkle = 0;
        const point = { x: pos.x + 18, y: pos.y + 18, born: now };
        setTrail((t) => [...t.slice(-9), point]);
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [enabled, mascotSpeed]);

  // Age out trail points so the array cannot grow without bound.
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      const cutoff = performance.now() - 1400;
      setTrail((t) => t.filter((p) => p.born > cutoff));
    }, 700);
    return () => window.clearInterval(id);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="mascot-layer" aria-hidden="true">
      {trail.map((p) => (
        <span key={p.born} className="mascot-glitter" style={{ left: p.x, top: p.y }} />
      ))}
      <div ref={ref} className="mascot">
        {renderMascot(mascot, flap, customMascotId)}
      </div>
    </div>
  );
}
