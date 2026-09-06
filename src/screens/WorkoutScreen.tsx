import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { EXERCISE_LIBRARY, getSession, libraryExercise, PROGRAM_META, type Exercise, type MobilityMove } from '../data/program';
import { Sheet } from '../components/Sheet';
import { PlusIcon, TrashIcon } from '../components/Icons';
import { useApp } from '../store/AppContext';
import { ExerciseCard } from '../components/ExerciseCard';
import { CheckIcon, ChevronDown, ChevronLeft, InfoIcon } from '../components/Icons';
import { VideoSheet, VideoButton, type PlayRequest } from '../components/VideoSheet';
import { parseVideoUrl } from '../utils/media';
import { putPhoto } from '../store/idb';
import { formatLong, todayKey } from '../utils/date';
import { setsCompleted, volumeOf } from '../utils/stats';

function MobilityBlock({
  title,
  blurb,
  moves,
  video,
  mediaLabel,
  localClipId,
  onSaveFile,
  onPlay,
  defaultOpen,
}: {
  title: string;
  blurb: string;
  moves: MobilityMove[];
  video?: string;
  mediaLabel: string;
  localClipId?: string;
  onSaveFile: () => void;
  onPlay: (r: PlayRequest) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card exercise-card">
      <button className="exercise-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="grow">
          <span className="bold" style={{ display: 'block' }}>{title}</span>
          <span className="tiny muted">{moves.length} moves · about 5 min</span>
        </span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--ink-faint)', display: 'flex' }}>
          <ChevronDown />
        </span>
      </button>
      {open && (
        <div className="exercise-body">
          <p className="small muted" style={{ marginBottom: 6 }}>{blurb}</p>
          {(video || localClipId) && (
            <div style={{ marginBottom: 10 }}>
              <VideoButton
                title={`Follow along: ${title.toLowerCase()}`}
                subtitle={localClipId ? 'Saved on this phone, plays offline' : 'Tap to play the video'}
                onPlay={() => {
                  if (localClipId) {
                    onPlay({ title: mediaLabel, subtitle: 'Saved on this phone, plays offline', clipId: localClipId });
                    return;
                  }
                  const source = parseVideoUrl(video as string);
                  if (source) onPlay({ title, subtitle: 'Follow-along video', source, onSaveFile });
                }}
              />
            </div>
          )}
          {moves.map((m) => (
            <div className="mobility-item" key={m.name + m.prescription}>
              <span className="mobility-dot" />
              <span className="grow">
                <span className="small bold" style={{ display: 'block' }}>
                  {m.name} <span className="muted" style={{ fontWeight: 500 }}>· {m.prescription}</span>
                </span>
                {m.note && <span className="tiny muted">{m.note}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkoutScreen() {
  const { sessionId = '' } = useParams();
  const [params] = useSearchParams();
  const date = params.get('date') ?? todayKey();
  const navigate = useNavigate();
  const { state, ensureLog, getLog, setLogNotes, toggleWorkoutComplete, addExtraExercise, removeExtraExercise, setMedia } = useApp();
  const [playing, setPlaying] = useState<PlayRequest | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const mobilityFileRef = useRef<HTMLInputElement>(null);
  const mobilityKeyRef = useRef<string | null>(null);

  const session = getSession(sessionId);

  useEffect(() => {
    if (session) ensureLog(sessionId, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, date, session]);

  const log = getLog(sessionId, date);

  const totals = useMemo(() => {
    if (!log || !session) return { done: 0, total: 0, volume: 0 };
    const extras = (log.extras ?? []).map(libraryExercise).filter((e): e is Exercise => !!e);
    const total = [...session.exercises, ...extras].reduce((n, ex) => n + (log.entries[ex.id]?.length ?? ex.sets), 0);
    return { done: setsCompleted(log), total, volume: Math.round(volumeOf(log)) };
  }, [log, session]);

  if (!session) {
    return <div className="page"><p className="muted">That session could not be found.</p></div>;
  }
  if (!log) return <div className="page" />;

  const pct = totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;
  const allSetsDone = totals.total > 0 && totals.done === totals.total;

  return (
    <>
      <div className="page-header">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Go back" style={{ marginBottom: 10 }}>
          <ChevronLeft />
        </button>
        <div className="eyebrow">{session.subtitle}</div>
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

        {session.optional && (
          <div className="card card-flat card-tight row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--mint)', flexShrink: 0, marginTop: 1 }}><InfoIcon size={16} /></span>
            <span className="small muted">
              Optional session. Skipping it and taking the rest day instead still counts as following the plan.
            </span>
          </div>
        )}

        <div className="section-title">Warm-up first</div>
        <MobilityBlock
          title="Warm-up"
          blurb="Do this before your first working set. It is what makes set one feel like set three instead of a warm-up in disguise."
          moves={session.warmup}
          video={session.warmupVideo}
          mediaLabel={`${session.title} — warm-up`}
          localClipId={state.media[`warmup:${session.id}`]?.clipId}
          onSaveFile={() => { mobilityKeyRef.current = `warmup:${session.id}`; mobilityFileRef.current?.click(); }}
          onPlay={setPlaying}
          defaultOpen={totals.done === 0}
        />

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
                defaultOpen={!exDone && i === (firstIncomplete === -1 ? 0 : firstIncomplete)}
              />
            );
          })}
        </div>

        {(log.extras ?? []).length > 0 && (
          <>
            <div className="section-title">Added by you</div>
            <div className="stack">
              {(log.extras ?? []).map((id, i) => {
                const ex = libraryExercise(id);
                if (!ex) return null;
                return (
                  <div key={id} className="stack-sm">
                    <ExerciseCard
                      exercise={ex}
                      index={session.exercises.length + i}
                      log={log}
                      defaultOpen={false}
                    />
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ alignSelf: 'flex-start' }}
                      onClick={() => removeExtraExercise(log.id, id)}
                    >
                      <TrashIcon size={14} /> Remove {ex.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <button className="btn btn-ghost btn-block" onClick={() => setAddOpen(true)}>
          <PlusIcon size={16} /> Add an exercise
        </button>

        {session.finisher && (
          <div className="card card-flat"><p className="small muted">{session.finisher}</p></div>
        )}

        <div className="section-title">Cool-down</div>
        <MobilityBlock
          title="Cool-down stretches"
          blurb="Five minutes here is what stops you walking down stairs sideways tomorrow. Breathe out into each stretch, never bounce."
          moves={session.cooldown}
          video={session.cooldownVideo}
          mediaLabel={`${session.title} — cool-down`}
          localClipId={state.media[`cooldown:${session.id}`]?.clipId}
          onSaveFile={() => { mobilityKeyRef.current = `cooldown:${session.id}`; mobilityFileRef.current?.click(); }}
          onPlay={setPlaying}
          defaultOpen={allSetsDone}
        />

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

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add an exercise">
        <div className="stack-sm">
          <p className="small muted">
            Everything from your own routine that did not fit in the main session. Adding one puts it at the bottom of
            today's workout only.
          </p>
          {(['shoulders', 'arms', 'legs', 'glutes', 'core'] as const).map((group) => {
            const items = EXERCISE_LIBRARY.filter((e) => e.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <div className="section-title">{group}</div>
                <div className="stack-sm">
                  {items.map((ex) => {
                    const already = (log.extras ?? []).includes(ex.id);
                    return (
                      <button
                        key={ex.id}
                        className="card row"
                        style={{ gap: 10, textAlign: 'left', opacity: already ? 0.5 : 1 }}
                        disabled={already}
                        onClick={() => {
                          addExtraExercise(log.id, ex.id, ex.sets, ex.suggestedKg > 0 ? ex.suggestedKg : null);
                          setAddOpen(false);
                        }}
                      >
                        <span className="grow">
                          <span className="bold small" style={{ display: 'block' }}>{ex.name}</span>
                          <span className="tiny muted">{ex.sets} × {ex.repsLabel}{already ? ' · already added' : ''}</span>
                        </span>
                        {!already && <PlusIcon size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Sheet>

      <input
        ref={mobilityFileRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          const key = mobilityKeyRef.current;
          if (file && key) {
            const id = `vid-${key}-${Date.now()}`;
            try {
              await putPhoto(id, file);
              setMedia(key, { clipId: id });
              setPlaying(null);
            } catch {
              alert('That file could not be saved.');
            }
          }
          mobilityKeyRef.current = null;
          if (mobilityFileRef.current) mobilityFileRef.current.value = '';
        }}
      />

      <VideoSheet request={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
