import { useRef, useState } from 'react';
import type { Exercise } from '../data/program';
import { REST_RULES } from '../data/program';
import type { LoggedSet, WorkoutLog } from '../store/types';
import { useApp } from '../store/AppContext';
import { useRestTimer } from './RestTimer';
import { progressionAdvice } from '../utils/progression';
import { CheckIcon, ChevronDown, MinusIcon, PlusIcon, TimerIcon, TrophyIcon } from './Icons';
import { InlineVideo, OwnClip } from './InlineVideo';
import { parseVideoUrl, tiktokSource, tiktokSearchUrl, youtubeSearchUrl, type VideoSource } from '../utils/media';
import { putPhoto } from '../store/idb';

interface Props {
  exercise: Exercise;
  index: number;
  log: WorkoutLog;
  defaultOpen: boolean;
}

function restSeconds(exercise: Exercise, preference: 'min' | 'max'): number {
  const range = exercise.restBetweenSets ?? REST_RULES[exercise.tier].betweenSets;
  return preference === 'min' ? range[0] : range[1];
}

function restLabel(range: [number, number]): string {
  const fmt = (s: number) => (s >= 60 && s % 60 === 0 ? `${s / 60} min` : s >= 60 ? `${(s / 60).toFixed(1)} min` : `${s} sec`);
  return range[0] === range[1] ? fmt(range[0]) : `${fmt(range[0])} to ${fmt(range[1])}`;
}

export function ExerciseCard({ exercise, index, log, defaultOpen }: Props) {
  const { state, updateSet, addSet, removeSet, setMedia, clearMedia } = useApp();
  const { start } = useRestTimer();
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState(0);
  const [linkDraft, setLinkDraft] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);
  const clipRef = useRef<HTMLInputElement>(null);

  const media = state.media[exercise.id] ?? {};

  // Reference videos: the ones from the plan, then anything she added herself.
  const clips: { key: string; label: string; render: () => JSX.Element }[] = [
    ...(exercise.videos ?? []).map((v) => ({
      key: v.id,
      label: v.title,
      render: () => <InlineVideo source={tiktokSource(v.id, v.url)} />,
    })),
    ...(media.clipId ? [{ key: 'mine', label: 'My clip', render: () => <OwnClip clipId={media.clipId as string} /> }] : []),
    ...(() => {
      const parsed = media.link ? parseVideoUrl(media.link) : null;
      return parsed ? [{ key: 'link', label: 'My link', render: () => <InlineVideo source={parsed as VideoSource} /> }] : [];
    })(),
  ];
  const activeClip = clips[Math.min(tab, clips.length - 1)];

  const saveClip = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const id = `clip-${exercise.id}-${Date.now()}`;
      await putPhoto(id, file);
      setMedia(exercise.id, { clipId: id });
      setShowAdd(false);
    } catch {
      alert('That clip could not be saved.');
    } finally {
      setBusy(false);
      if (clipRef.current) clipRef.current.value = '';
    }
  };

  const saveLink = () => {
    if (!parseVideoUrl(linkDraft)) {
      alert('Paste a full YouTube or TikTok link.');
      return;
    }
    setMedia(exercise.id, { link: linkDraft.trim() });
    setLinkDraft('');
    setShowAdd(false);
  };

  const sets: LoggedSet[] = log.entries[exercise.id] ?? [];
  const doneCount = sets.filter((s) => s.done).length;
  const complete = doneCount > 0 && doneCount === sets.length;
  const advice = progressionAdvice(exercise, state.workouts.filter((w) => w.id !== log.id));
  const betweenSets = exercise.restBetweenSets ?? REST_RULES[exercise.tier].betweenSets;

  const toggleDone = (i: number) => {
    const wasDone = sets[i]?.done;
    const patch: Partial<LoggedSet> = { done: !wasDone };
    // Ticking a set with no reps typed in assumes you hit the target.
    if (!wasDone && sets[i]?.reps == null) patch.reps = exercise.repTarget;
    updateSet(log.id, exercise.id, i, patch);

    const isLastSet = i === sets.length - 1;
    if (!wasDone && state.settings.autoStartRest && !exercise.timeBased) {
      const seconds = isLastSet
        ? 120 // moving on to the next exercise: the plan says 2 to 3 minutes regardless
        : restSeconds(exercise, state.settings.restPreference);
      start(seconds, isLastSet ? `Before your next exercise` : `Rest — ${exercise.name}`);
    }
  };

  const unit = exercise.timeBased ? 'sec' : 'reps';

  return (
    <div className={`card exercise-card${complete ? ' complete' : ''}`}>
      <button className="exercise-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="exercise-num">{complete ? <CheckIcon size={17} /> : index + 1}</span>
        <span className="grow">
          <span className="bold" style={{ display: 'block' }}>{exercise.name}</span>
          <span className="tiny muted">
            {exercise.sets} × {exercise.repsLabel}
            {exercise.suggestedKg > 0 ? ` · ${exercise.suggestedKg}kg` : exercise.loadNote ? ` · ${exercise.loadNote}` : ''}
          </span>
        </span>
        <span className="tiny faint num" style={{ marginRight: 4 }}>{doneCount}/{sets.length}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--ink-faint)', display: 'flex' }}>
          <ChevronDown />
        </span>
      </button>

      {open && (
        <div className="exercise-body stack">
          {advice.level !== 'none' && (
            <div className="card card-flat card-tight row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: advice.level === 'add-weight' ? 'var(--peach)' : 'var(--pink-500)', flexShrink: 0, marginTop: 1 }}>
                <TrophyIcon size={16} />
              </span>
              <span className="small muted">{advice.message}</span>
            </div>
          )}

          <div>
            <div className="set-grid set-head">
              <span>Set</span>
              <span style={{ textAlign: 'center' }}>{unit}{exercise.perSide ? ' / side' : ''}</span>
              <span style={{ textAlign: 'center' }}>kg</span>
              <span style={{ textAlign: 'center' }}>Done</span>
            </div>
            {sets.map((set, i) => (
              <div key={i} className={`set-grid set-row${set.done ? ' done' : ''}`}>
                <span className="set-index">{i + 1}</span>
                <input
                  className="set-input"
                  type="number"
                  inputMode="numeric"
                  placeholder={String(exercise.repTarget)}
                  value={set.reps ?? ''}
                  onChange={(e) => updateSet(log.id, exercise.id, i, { reps: e.target.value === '' ? null : Number(e.target.value) })}
                  aria-label={`Set ${i + 1} ${unit}`}
                />
                <input
                  className="set-input"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder={exercise.suggestedKg > 0 ? String(exercise.suggestedKg) : 'BW'}
                  value={set.weight ?? ''}
                  onChange={(e) => updateSet(log.id, exercise.id, i, { weight: e.target.value === '' ? null : Number(e.target.value) })}
                  aria-label={`Set ${i + 1} weight in kg`}
                />
                <button
                  className={`tick${set.done ? ' on' : ''}`}
                  onClick={() => toggleDone(i)}
                  aria-label={`Mark set ${i + 1} ${set.done ? 'not done' : 'done'}`}
                  aria-pressed={set.done}
                >
                  <CheckIcon size={19} />
                </button>
              </div>
            ))}
          </div>

          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-soft btn-sm grow" onClick={() => addSet(log.id, exercise.id)}>
              <PlusIcon size={15} /> Add set
            </button>
            {sets.length > 1 && (
              <button className="btn btn-soft btn-sm" onClick={() => removeSet(log.id, exercise.id)} aria-label="Remove last set">
                <MinusIcon size={15} />
              </button>
            )}
            {!exercise.timeBased && (
              <button
                className="btn btn-soft btn-sm"
                onClick={() => start(restSeconds(exercise, state.settings.restPreference), `Rest — ${exercise.name}`)}
                aria-label="Start rest timer"
              >
                <TimerIcon size={15} />
              </button>
            )}
          </div>

          <div className="row wrap" style={{ gap: 6 }}>
            <span className="pill">{REST_RULES[exercise.tier].label}</span>
            <span className="pill pill-outline">
              <TimerIcon size={12} /> {restLabel(betweenSets)} between sets
            </span>
            {exercise.restBeforeNext && (
              <span className="pill pill-outline">{restLabel(exercise.restBeforeNext)} before next</span>
            )}
          </div>

          {exercise.cues.length > 0 && (
            <div>
              <div className="tiny bold faint" style={{ textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                Form cues{exercise.cueSource ? ` — ${exercise.cueSource}` : ''}
              </div>
              <ul className="cue-list">
                {exercise.cues.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          )}

          {exercise.notes && <p className="small muted">{exercise.notes}</p>}

          <div className="stack-sm">
            <div className="tiny bold faint" style={{ textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Watch the form
            </div>

            {clips.length > 1 && (
              <div className="video-tabs">
                {clips.map((c, i) => (
                  <button
                    key={c.key}
                    className={`chip${activeClip?.key === c.key ? ' active' : ''}`}
                    style={{ fontSize: 11, padding: '6px 11px' }}
                    onClick={() => setTab(i)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {activeClip ? (
              activeClip.render()
            ) : (
              <p className="small muted">
                No clip saved for this one yet. Search a tutorial below, then paste the link to keep it here.
              </p>
            )}

            <div className="row wrap" style={{ gap: 6 }}>
              <a className="btn btn-soft btn-sm" href={youtubeSearchUrl(exercise.name)} target="_blank" rel="noreferrer noopener">
                Search YouTube
              </a>
              <a className="btn btn-soft btn-sm" href={tiktokSearchUrl(exercise.name)} target="_blank" rel="noreferrer noopener">
                Search TikTok
              </a>
              <button className="btn btn-soft btn-sm" onClick={() => setShowAdd((v) => !v)}>
                {showAdd ? 'Close' : 'Add my own'}
              </button>
            </div>

            {showAdd && (
              <div className="card card-flat stack-sm" style={{ marginTop: 4 }}>
                <div className="field">
                  <label htmlFor={`link-${exercise.id}`}>Paste a YouTube or TikTok link</label>
                  <input
                    id={`link-${exercise.id}`}
                    className="input"
                    placeholder="https://…"
                    value={linkDraft}
                    onChange={(e) => setLinkDraft(e.target.value)}
                  />
                </div>
                <button className="btn btn-sm btn-block" onClick={saveLink} disabled={!linkDraft.trim()}>
                  Save link to this exercise
                </button>

                <div className="divider" style={{ margin: '4px 0' }} />

                <input
                  ref={clipRef}
                  type="file"
                  accept="video/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => saveClip(e.target.files?.[0])}
                />
                <button className="btn btn-ghost btn-sm btn-block" disabled={busy} onClick={() => clipRef.current?.click()}>
                  {busy ? 'Saving…' : 'Record or upload my own clip'}
                </button>
                <p className="tiny faint">
                  Your own clip is stored on this phone and cannot be deleted by anyone else. Keep it short, a few
                  seconds is plenty.
                </p>

                {(media.link || media.clipId) && (
                  <div className="row wrap" style={{ gap: 6 }}>
                    {media.link && (
                      <button className="btn btn-danger btn-sm" onClick={() => clearMedia(exercise.id, 'link')}>
                        Remove my link
                      </button>
                    )}
                    {media.clipId && (
                      <button className="btn btn-danger btn-sm" onClick={() => clearMedia(exercise.id, 'clipId')}>
                        Remove my clip
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
