import { useMemo, useRef, useState } from 'react';
import { SESSIONS } from '../data/program';
import { useApp, uid } from '../store/AppContext';
import { BarChart, LineChart, type Point } from '../components/Charts';
import { PhotoTile, compressImage } from '../components/PhotoTile';
import { Sheet } from '../components/Sheet';
import { CameraIcon, DownloadIcon, TrashIcon, TrophyIcon } from '../components/Icons';
import { deletePhoto, getPhoto, putPhoto } from '../store/idb';
import { addDays, formatShort, todayKey, weekOf } from '../utils/date';
import { historyFor, personalBest } from '../utils/progression';
import { formatVolume, totalVolume, volumeOf } from '../utils/stats';
import type { PhotoMeta } from '../store/types';

type Tab = 'lifts' | 'body' | 'photos';

const ALL_EXERCISES = SESSIONS.flatMap((s) => s.exercises.map((e) => ({ ...e, sessionTitle: s.title })));
const UNIQUE_EXERCISES = ALL_EXERCISES.filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i);

const MEASURE_FIELDS = [
  { key: 'weightKg', label: 'Weight', unit: 'kg' },
  { key: 'waistCm', label: 'Waist', unit: 'cm' },
  { key: 'hipsCm', label: 'Hips', unit: 'cm' },
  { key: 'gluteCm', label: 'Glutes', unit: 'cm' },
  { key: 'thighCm', label: 'Thigh', unit: 'cm' },
  { key: 'armCm', label: 'Arm', unit: 'cm' },
] as const;

type MeasureKey = (typeof MEASURE_FIELDS)[number]['key'];

export function ProgressScreen() {
  const { state, addMeasurement, deleteMeasurement, addPhotoMeta, removePhotoMeta } = useApp();
  const [tab, setTab] = useState<Tab>('lifts');
  const [exerciseId, setExerciseId] = useState(UNIQUE_EXERCISES[0]?.id ?? '');
  const [measureKey, setMeasureKey] = useState<MeasureKey>('weightKg');
  const [measureOpen, setMeasureOpen] = useState(false);
  const [viewing, setViewing] = useState<PhotoMeta | null>(null);
  const [angle, setAngle] = useState<'front' | 'side' | 'back'>('front');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const completed = state.workouts.filter((w) => w.completed);

  const liftPoints: Point[] = useMemo(
    () => historyFor(state.workouts, exerciseId).map((h) => ({ date: h.date, value: h.topWeight || h.totalReps })),
    [state.workouts, exerciseId],
  );
  const liftHistory = useMemo(() => historyFor(state.workouts, exerciseId).slice().reverse(), [state.workouts, exerciseId]);
  const pb = useMemo(() => personalBest(state.workouts, exerciseId), [state.workouts, exerciseId]);
  const selectedExercise = UNIQUE_EXERCISES.find((e) => e.id === exerciseId);

  const weeklyVolume = useMemo(() => {
    const today = todayKey();
    return Array.from({ length: 6 }, (_, i) => {
      const anchor = addDays(today, -7 * (5 - i));
      const days = new Set(weekOf(anchor));
      const vol = completed.filter((w) => days.has(w.date)).reduce((n, w) => n + volumeOf(w), 0);
      return { label: formatShort(weekOf(anchor)[0]), value: Math.round(vol) };
    });
  }, [completed]);

  const measurePoints: Point[] = state.measurements
    .filter((m) => m[measureKey] != null)
    .map((m) => ({ date: m.date, value: m[measureKey] as number }));

  const onPickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const { blob, width, height } = await compressImage(file);
      const id = uid();
      await putPhoto(id, blob);
      addPhotoMeta({ id, date: todayKey(), angle, width, height });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not add that photo.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // Photos are the one thing a JSON backup cannot carry, so give her a way to
  // get them off the device and into her camera roll.
  const onSavePhoto = async (photo: PhotoMeta) => {
    const blob = await getPhoto(photo.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloom-${photo.angle}-${photo.date}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDeletePhoto = async (id: string) => {
    if (!confirm('Delete this photo? It cannot be undone.')) return;
    await deletePhoto(id);
    removePhotoMeta(id);
    setViewing(null);
  };

  return (
    <>
      <div className="page-header">
        <div className="eyebrow">Progressive overload</div>
        <h1>Progress</h1>
        <p className="sub">The record is the mechanism. Without it you stay at the same load for months.</p>
      </div>

      <div className="page stack">
        <div className="chip-row">
          {([['lifts', 'Lifts'], ['body', 'Body'], ['photos', 'Photos']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} className={`chip${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {tab === 'lifts' && (
          <div className="stack">
            <div className="stat-grid">
              <div className="stat">
                <div className="v num">{completed.length}</div>
                <div className="k">Workouts</div>
              </div>
              <div className="stat">
                <div className="v num">{formatVolume(totalVolume(state.workouts))}</div>
                <div className="k">Kg lifted</div>
              </div>
              <div className="stat">
                <div className="v num">{completed.reduce((n, w) => n + Object.values(w.entries).flat().filter((s) => s.done).length, 0)}</div>
                <div className="k">Sets done</div>
              </div>
            </div>

            <div className="card">
              <div className="section-title" style={{ margin: '0 0 10px' }}>Weekly volume</div>
              <BarChart bars={weeklyVolume} />
            </div>

            <div className="section-title">By exercise</div>
            <select className="input" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} aria-label="Choose an exercise">
              {SESSIONS.map((s) => (
                <optgroup key={s.id} label={s.title}>
                  {s.exercises.map((e) => <option key={s.id + e.id} value={e.id}>{e.name}</option>)}
                </optgroup>
              ))}
            </select>

            <div className="card">
              <div className="row-between" style={{ marginBottom: 10 }}>
                <span className="bold small">{selectedExercise?.name}</span>
                {pb && (
                  <span className="pill pill-peach">
                    <TrophyIcon size={13} /> PB {pb.weight > 0 ? `${pb.weight}kg × ${pb.reps}` : `${pb.reps} reps`}
                  </span>
                )}
              </div>
              <LineChart points={liftPoints} unit={selectedExercise?.timeBased ? 's' : 'kg'} />
              {liftPoints.length > 1 && (
                <p className="tiny faint center" style={{ marginTop: 6 }}>
                  {selectedExercise?.suggestedKg === 0 ? 'Total reps per session' : 'Heaviest set each session, in kg'}
                </p>
              )}
            </div>

            {liftHistory.length > 0 && (
              <div className="card stack-sm">
                <div className="section-title" style={{ margin: 0 }}>Session history</div>
                {liftHistory.slice(0, 12).map((h) => (
                  <div key={h.date} className="row-between" style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                    <span className="small bold">{formatShort(h.date)}</span>
                    <span className="small muted num">
                      {h.sets.map((s) => `${s.reps}${s.weight ? `×${s.weight}` : ''}`).join(' · ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'body' && (
          <div className="stack">
            <button className="btn btn-block" onClick={() => setMeasureOpen(true)}>Log today’s measurements</button>

            <div className="chip-row">
              {MEASURE_FIELDS.map((f) => (
                <button key={f.key} className={`chip${measureKey === f.key ? ' active' : ''}`} onClick={() => setMeasureKey(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="card">
              <LineChart
                points={measurePoints}
                unit={MEASURE_FIELDS.find((f) => f.key === measureKey)?.unit}
                color="#c9a7e8"
              />
            </div>

            {state.measurements.length > 0 && (
              <div className="card stack-sm">
                <div className="section-title" style={{ margin: 0 }}>Entries</div>
                {[...state.measurements].reverse().map((m) => (
                  <div key={m.id} className="row-between" style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                    <span className="grow">
                      <span className="small bold" style={{ display: 'block' }}>{formatShort(m.date)}</span>
                      <span className="tiny muted num">
                        {MEASURE_FIELDS.filter((f) => m[f.key] != null).map((f) => `${f.label} ${m[f.key]}${f.unit}`).join(' · ') || 'No values'}
                      </span>
                    </span>
                    <button className="icon-btn" onClick={() => deleteMeasurement(m.id)} aria-label="Delete entry">
                      <TrashIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="tiny faint center">
              Measure at the same time of day, ideally the morning. Glute and hip numbers move before scale weight does.
            </p>
          </div>
        )}

        {tab === 'photos' && (
          <div className="stack">
            <div className="card stack-sm">
              <div className="section-title" style={{ margin: 0 }}>Add a photo</div>
              <div className="chip-row">
                {(['front', 'side', 'back'] as const).map((a) => (
                  <button key={a} className={`chip${angle === a ? ' active' : ''}`} onClick={() => setAngle(a)}>{a}</button>
                ))}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => onPickPhoto(e.target.files?.[0])}
              />
              <button className="btn btn-block" disabled={busy} onClick={() => fileRef.current?.click()}>
                <CameraIcon size={18} /> {busy ? 'Saving…' : `Take or choose a ${angle} photo`}
              </button>
              <p className="tiny faint">
                Photos stay on this device only. They are never uploaded anywhere.
              </p>
            </div>

            {state.photos.length === 0 ? (
              <div className="empty-state">
                <span className="emoji">📸</span>
                No photos yet. A front, side and back shot today gives you something honest to compare against in eight weeks.
              </div>
            ) : (
              <>
                {(['front', 'side', 'back'] as const).map((a) => {
                  const shots = state.photos.filter((p) => p.angle === a);
                  if (shots.length === 0) return null;
                  return (
                    <div key={a}>
                      <div className="section-title">{a} view</div>
                      <div className="photo-grid">
                        {shots.map((p) => <PhotoTile key={p.id} photo={p} onClick={() => setViewing(p)} />)}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      <MeasureSheet
        open={measureOpen}
        onClose={() => setMeasureOpen(false)}
        onSave={(m) => {
          addMeasurement(m);
          setMeasureOpen(false);
        }}
      />

      <Sheet open={viewing !== null} onClose={() => setViewing(null)} title={viewing ? formatShort(viewing.date) : ''}>
        {viewing && (
          <div className="stack">
            <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
              <PhotoTile photo={viewing} />
            </div>
            <button className="btn btn-ghost btn-block" onClick={() => onSavePhoto(viewing)}>
              <DownloadIcon size={16} /> Save to my device
            </button>
            <p className="tiny faint center">
              Saves a copy to your camera roll or downloads. Backups do not include photos, so save any you want to keep for good.
            </p>
            <button className="btn btn-danger btn-block" onClick={() => onDeletePhoto(viewing.id)}>
              <TrashIcon size={16} /> Delete photo
            </button>
          </div>
        )}
      </Sheet>
    </>
  );
}

function MeasureSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (m: { date: string; [k: string]: unknown }) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [date, setDate] = useState(todayKey());

  const save = () => {
    const entry: Record<string, unknown> = { date };
    for (const f of MEASURE_FIELDS) {
      const raw = values[f.key];
      if (raw !== undefined && raw !== '') entry[f.key] = Number(raw);
    }
    onSave(entry as { date: string });
    setValues({});
  };

  return (
    <Sheet open={open} onClose={onClose} title="Measurements">
      <div className="stack">
        <div className="field">
          <label htmlFor="m-date">Date</label>
          <input id="m-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {MEASURE_FIELDS.map((f) => (
          <div className="field" key={f.key}>
            <label htmlFor={`m-${f.key}`}>{f.label} ({f.unit})</label>
            <input
              id={`m-${f.key}`}
              className="input"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={values[f.key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <button className="btn btn-block" onClick={save}>Save measurements</button>
        <p className="tiny faint center">Leave anything blank that you did not measure.</p>
      </div>
    </Sheet>
  );
}
