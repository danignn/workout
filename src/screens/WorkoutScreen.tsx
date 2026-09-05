import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getSession, PROGRAM_META } from '../data/program';
import type { VideoRef } from '../data/videos';
import { useApp } from '../store/AppContext';
import { ExerciseCard } from '../components/ExerciseCard';
import { VideoSheet } from '../components/VideoSheet';
import { CheckIcon, ChevronLeft, InfoIcon } from '../components/Icons';
import { formatLong, todayKey } from '../utils/date';
import { setsCompleted, volumeOf } from '../utils/stats';

export function WorkoutScreen() {
  const { sessionId = '' } = useParams();
  const [params] = useSearchParams();
  const date = params.get('date') ?? todayKey();
  const navigate = useNavigate();
  const { ensureLog, getLog, setLogNotes, toggleWorkoutComplete } = useApp();
  const [video, setVideo] = useState<VideoRef | null>(null);

  const session = getSession(sessionId);

  useEffect(() => {
    if (session) ensureLog(sessionId, date);
    // ensureLog is stable per state.workouts change; running on id/date is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, date, session]);

  const log = getLog(sessionId, date);

  const totals = useMemo(() => {
    if (!log || !session) return { done: 0, total: 0, volume: 0 };
    const total = session.exercises.reduce((n, ex) => n + (log.entries[ex.id]?.length ?? ex.sets), 0);
    return { done: setsCompleted(log), total, volume: Math.round(volumeOf(log)) };
  }, [log, session]);

  if (!session) {
    return (
      <div className="page">
        <p className="muted">That session could not be found.</p>
      </div>
    );
  }
  if (!log) return <div className="page" />;

  const pct = totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;

  return (
    <>
      <div className="page-header">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Go back" style={{ marginBottom: 10 }}>
          <ChevronLeft />
        </button>
        <div className="eyebrow">{session.dayName} · {session.subtitle}</div>
        <h1>{session.title}</h1>
        <p className="sub">{formatLong(date)}</p>
      </div>

      <div className="page stack">
        <div className="card card-tight">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="small bold">{totals.done} of {totals.total} sets logged</span>
            <span className="small muted num">{totals.volume > 0 ? `${totals.volume.toLocaleString()} kg lifted` : ''}</span>
          </div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
        </div>

        {session.intro && (
          <div className="card card-flat card-tight row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--pink-500)', flexShrink: 0, marginTop: 1 }}><InfoIcon size={16} /></span>
            <span className="small muted">{session.intro}</span>
          </div>
        )}

        {session.warmup && (
          <div className="card">
            <div className="section-title" style={{ margin: '0 0 8px' }}>Warm-up</div>
            <ul className="cue-list">
              {session.warmup.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
        )}

        <div className="section-title">Exercises</div>
        <div className="stack">
          {session.exercises.map((ex, i) => {
            const sets = log.entries[ex.id] ?? [];
            const exDone = sets.length > 0 && sets.every((s) => s.done);
            const firstIncomplete = session.exercises.findIndex((e) => {
              const s = log.entries[e.id] ?? [];
              return s.length === 0 || !s.every((x) => x.done);
            });
            return (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                index={i}
                log={log}
                onPlayVideo={setVideo}
                defaultOpen={!exDone && i === (firstIncomplete === -1 ? 0 : firstIncomplete)}
              />
            );
          })}
        </div>

        {session.finisher && (
          <div className="card card-flat">
            <p className="small muted">{session.finisher}</p>
          </div>
        )}

        <div className="section-title">How did it go?</div>
        <div className="card stack-sm">
          <div className="field">
            <label htmlFor="workout-notes">Session notes</label>
            <textarea
              id="workout-notes"
              className="input"
              placeholder="How the weights felt, anything that was tight, what to change next time…"
              value={log.notes ?? ''}
              onChange={(e) => setLogNotes(log.id, e.target.value)}
            />
          </div>
          <p className="tiny faint">{PROGRAM_META.selfCheck}</p>
        </div>

        <button
          className={`btn btn-block${log.completed ? ' btn-ghost' : ''}`}
          onClick={() => toggleWorkoutComplete(log.id)}
          style={{ marginTop: 4 }}
        >
          <CheckIcon size={18} />
          {log.completed ? 'Workout completed — tap to undo' : 'Mark this workout complete'}
        </button>

        {log.completed && (
          <p className="tiny faint center">
            Logged for {formatLong(date)}. It now counts toward your week and your progress charts.
          </p>
        )}
      </div>

      <VideoSheet video={video} onClose={() => setVideo(null)} />
    </>
  );
}
