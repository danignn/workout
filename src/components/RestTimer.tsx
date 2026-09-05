import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CloseIcon, PlusIcon, TimerIcon } from './Icons';
import { formatTime } from '../utils/date';
import { useApp } from '../store/AppContext';

interface TimerState {
  total: number;
  endsAt: number;
  label: string;
}

interface RestTimerValue {
  start: (seconds: number, label: string) => void;
  stop: () => void;
  active: boolean;
}

const RestTimerContext = createContext<RestTimerValue | null>(null);

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const play = (freq: number, at: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + at);
      osc.stop(ctx.currentTime + at + 0.32);
    };
    play(880, 0);
    play(1170, 0.18);
    setTimeout(() => ctx.close(), 900);
  } catch {
    /* Audio is a nicety, never a failure. */
  }
}

export function RestTimerProvider({ children }: { children: ReactNode }) {
  const { state } = useApp();
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [remaining, setRemaining] = useState(0);
  const firedRef = useRef(false);
  const settingsRef = useRef(state.settings);
  settingsRef.current = state.settings;

  const start = useCallback((seconds: number, label: string) => {
    firedRef.current = false;
    setTimer({ total: seconds, endsAt: Date.now() + seconds * 1000, label });
    setRemaining(seconds);
  }, []);

  const stop = useCallback(() => setTimer(null), []);

  const extend = useCallback((seconds: number) => {
    firedRef.current = false;
    setTimer((t) => (t ? { ...t, total: t.total + seconds, endsAt: t.endsAt + seconds * 1000 } : t));
  }, []);

  useEffect(() => {
    if (!timer) return;
    const tick = () => {
      const left = Math.max(0, (timer.endsAt - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        if (settingsRef.current.sound) beep();
        if (settingsRef.current.vibrate && navigator.vibrate) navigator.vibrate([200, 90, 200]);
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [timer]);

  // The bar is fixed over the page, so lift the content that sits under it.
  useEffect(() => {
    document.body.classList.toggle('rest-active', timer !== null);
    return () => document.body.classList.remove('rest-active');
  }, [timer]);

  // Clear the finished timer a little after it lands, so the bar does not linger.
  useEffect(() => {
    if (!timer || remaining > 0) return;
    const id = window.setTimeout(() => setTimer(null), 12000);
    return () => window.clearTimeout(id);
  }, [timer, remaining]);

  const value = useMemo(() => ({ start, stop, active: timer !== null }), [start, stop, timer]);
  const done = timer !== null && remaining <= 0;
  const pct = timer ? Math.max(0, Math.min(100, (remaining / timer.total) * 100)) : 0;

  return (
    <RestTimerContext.Provider value={value}>
      {children}
      {timer && (
        <div className={`rest-bar${done ? ' ready' : ''}`}>
          <div className="row-between">
            <div className="grow">
              <div className="tiny" style={{ opacity: 0.85, fontWeight: 600 }}>
                {done ? 'Rest complete — go again' : timer.label}
              </div>
              <div className="time">{done ? "You're up" : formatTime(remaining)}</div>
            </div>
            {!done && (
              <button className="icon-btn" style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }} onClick={() => extend(30)} aria-label="Add 30 seconds">
                <PlusIcon size={16} />
              </button>
            )}
            <button className="icon-btn" style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }} onClick={stop} aria-label="Dismiss timer">
              <CloseIcon size={16} />
            </button>
          </div>
          {!done && (
            <div className="rest-progress">
              <span style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      )}
    </RestTimerContext.Provider>
  );
}

export function useRestTimer(): RestTimerValue {
  const ctx = useContext(RestTimerContext);
  if (!ctx) throw new Error('useRestTimer must be used inside RestTimerProvider');
  return ctx;
}

export function RestBadge({ seconds }: { seconds: [number, number] }) {
  const [min, max] = seconds;
  return (
    <span className="pill pill-outline">
      <TimerIcon size={13} /> {min === max ? `${min / 60 >= 1 ? `${min / 60} min` : `${min}s`}` : `${min}–${max}s`}
    </span>
  );
}
