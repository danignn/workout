import { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';
import type { PeriodLog } from '../store/types';
import { CheckIcon, InfoIcon, TrashIcon } from '../components/Icons';
import { Sheet } from '../components/Sheet';
import { formatLong, formatShort, todayKey } from '../utils/date';
import {
  currentPhase,
  cyclePrediction,
  openPeriod,
  periodDay,
  sortedLogs,
  trainingAdjustment,
} from '../utils/cycle';

export function CycleScreen() {
  const { state, updateCycle, startPeriod, endPeriod, deletePeriod, updatePeriod } = useApp();
  const today = todayKey();
  const [startDate, setStartDate] = useState(today);
  const [editing, setEditing] = useState<string | null>(null);

  const cycle = state.cycle;
  const logs = sortedLogs(cycle);
  const open = openPeriod(cycle);
  const onPeriodToday = periodDay(cycle, today);
  const phase = currentPhase(cycle, today);
  const adjustment = trainingAdjustment(cycle, today);
  const prediction = cyclePrediction(cycle, today);

  return (
    <>
      <div className="page-header">
        <div className="eyebrow">Your cycle</div>
        <h1>Cycle</h1>
        <p className="sub">
          {onPeriodToday ? `Day ${onPeriodToday} of your period` : phase ? phase.label : 'Log a period to start tracking'}
        </p>
      </div>

      <div className="page stack">
        {/* Primary action */}
        {open ? (
          <div className="hero-card">
            <span className="pill pill-white">Day {onPeriodToday ?? '–'}</span>
            <h2 style={{ marginTop: 8 }}>Period started {formatShort(open.start)}</h2>
            <p className="muted small" style={{ marginTop: 4 }}>
              Tap below on the day it finishes so the next estimate stays accurate.
            </p>
            <button className="btn btn-white btn-block" style={{ marginTop: 14, position: 'relative' }} onClick={() => endPeriod(today)}>
              <CheckIcon size={17} /> My period ended today
            </button>
            <button
              className="btn btn-block"
              style={{ marginTop: 8, position: 'relative', background: 'rgba(255,255,255,0.22)', color: '#fff', boxShadow: 'none' }}
              onClick={() => setEditing(open.id)}
            >
              It ended on a different day
            </button>
          </div>
        ) : (
          <div className="card stack-sm">
            <span className="bold">Log a period</span>
            <div className="field">
              <label htmlFor="period-start">First day</label>
              <input
                id="period-start"
                className="input"
                type="date"
                value={startDate}
                max={today}
                onChange={(e) => e.target.value && setStartDate(e.target.value)}
              />
            </div>
            <button className="btn btn-block" onClick={() => startPeriod(startDate)}>
              My period started
            </button>
            <p className="tiny faint">
              Logging it turns on the lighter training suggestions for the first three days, and sharpens the estimate
              for next month.
            </p>
          </div>
        )}

        {/* What it means for training */}
        {adjustment && (
          <div className="card" style={{ borderColor: 'var(--pink-300)' }}>
            <span className="pill">Training this week</span>
            <h3 style={{ marginTop: 10 }}>{adjustment.headline}</h3>
            <p className="small muted" style={{ marginTop: 6 }}>{adjustment.advice}</p>
            {adjustment.loadFactor < 1 && (
              <p className="tiny" style={{ marginTop: 8, color: 'var(--pink-700)', fontWeight: 600 }}>
                Your workouts are showing suggested lighter loads on the heavy lifts while this lasts.
              </p>
            )}
          </div>
        )}

        {/* Phase */}
        {phase && !onPeriodToday && (
          <div className="card">
            <span className="pill pill-lilac">{phase.emoji} {phase.label} · day {phase.dayOfCycle}</span>
            <h3 style={{ marginTop: 10 }}>{phase.headline}</h3>
            <p className="small muted" style={{ marginTop: 5 }}>{phase.advice}</p>
          </div>
        )}

        {/* Stats */}
        {prediction && (
          <div className="card">
            <div className="row-between">
              <span className="grow">
                <span className="small bold" style={{ display: 'block' }}>Next period expected</span>
                <span className="tiny faint">
                  {prediction.daysAway >= 0
                    ? `${formatLong(prediction.nextStart)} · in ${prediction.daysAway} ${prediction.daysAway === 1 ? 'day' : 'days'}`
                    : `${formatLong(prediction.nextStart)} · ${Math.abs(prediction.daysAway)} days ago`}
                </span>
              </span>
              <span className={`pill${prediction.source === 'records' ? '' : ' pill-outline'}`}>
                {prediction.source === 'records' ? 'From your records' : 'Default'}
              </span>
            </div>
            {prediction.spread > 0 && (
              <p className="tiny muted" style={{ marginTop: 8 }}>
                Realistically anywhere in a {prediction.spread} day window around that date.
              </p>
            )}
            <p className="tiny faint" style={{ marginTop: 8 }}>{prediction.message}</p>
          </div>
        )}

        <div className="stat-grid">
          <div className="stat">
            <div className="v num">{prediction ? Math.max(0, prediction.daysAway) : '–'}</div>
            <div className="k">Days to next</div>
          </div>
          <div className="stat">
            <div className="v num">{prediction?.length ?? cycle.cycleLength}</div>
            <div className="k">Cycle length</div>
          </div>
          <div className="stat">
            <div className="v num">{logs.length}</div>
            <div className="k">Logged</div>
          </div>
        </div>

        {/* Settings */}
        <div className="section-title">Settings</div>
        <div className="card stack-sm">
          <button className="link-row" onClick={() => updateCycle({ adjustTraining: !cycle.adjustTraining })} aria-pressed={cycle.adjustTraining}>
            <span className="grow">
              <span className="small bold" style={{ display: 'block' }}>Adjust training on my period</span>
              <span className="tiny faint">Suggests about 15% lighter on heavy lifts for days 1 to 3</span>
            </span>
            <span className={`switch${cycle.adjustTraining ? ' on' : ''}`} />
          </button>
          <button className="link-row" onClick={() => updateCycle({ enabled: !cycle.enabled })} aria-pressed={cycle.enabled}>
            <span className="grow">
              <span className="small bold" style={{ display: 'block' }}>Show phase notes on Today</span>
              <span className="tiny faint">The follicular, ovulation and luteal guidance</span>
            </span>
            <span className={`switch${cycle.enabled ? ' on' : ''}`} />
          </button>
          <div className="row" style={{ gap: 10 }}>
            <div className="field grow">
              <label htmlFor="c-length">Cycle length</label>
              <input
                id="c-length" className="input" type="number" inputMode="numeric"
                value={cycle.cycleLength}
                onChange={(e) => updateCycle({ cycleLength: Number(e.target.value) || 28 })}
              />
            </div>
            <div className="field grow">
              <label htmlFor="c-period">Period length</label>
              <input
                id="c-period" className="input" type="number" inputMode="numeric"
                value={cycle.periodLength}
                onChange={(e) => updateCycle({ periodLength: Number(e.target.value) || 5 })}
              />
            </div>
          </div>
        </div>

        {/* History */}
        {logs.length > 0 && (
          <>
            <div className="section-title">History</div>
            <div className="card">
              {logs.map((log) => (
                <div className="row-between" key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <span className="grow">
                    <span className="small bold" style={{ display: 'block' }}>{formatLong(log.start)}</span>
                    <span className="tiny faint">
                      {log.end
                        ? `Ended ${formatShort(log.end)}`
                        : 'Still open — tap "My period ended today" when it finishes'}
                    </span>
                  </span>
                  <button className="btn btn-soft btn-sm" onClick={() => setEditing(log.id)}>Edit</button>
                  <button className="icon-btn" onClick={() => deletePeriod(log.id)} aria-label="Delete this entry">
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="card card-flat card-tight row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--pink-500)', flexShrink: 0, marginTop: 1 }}><InfoIcon size={16} /></span>
          <span className="tiny muted">
            This is a calendar estimate and general training guidance, not a medical tool or contraception. Training
            through a period is safe for most people and often eases cramps, but if yours are severe, or your cycle
            changes suddenly, that is worth raising with a doctor.
          </span>
        </div>
      </div>

      <PeriodEditor
        log={logs.find((l) => l.id === editing) ?? null}
        today={today}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          if (editing) updatePeriod(editing, patch);
          setEditing(null);
        }}
      />
    </>
  );
}

/** Lets a logged period be corrected, including one left open by mistake. */
function PeriodEditor({
  log,
  today,
  onClose,
  onSave,
}: {
  log: PeriodLog | null;
  today: string;
  onClose: () => void;
  onSave: (patch: { start?: string; end?: string | null }) => void;
}) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    setStart(log?.start ?? '');
    setEnd(log?.end ?? '');
  }, [log]);

  if (!log) return <Sheet open={false} onClose={onClose}><span /></Sheet>;

  const invalid = !!end && !!start && end < start;

  return (
    <Sheet open onClose={onClose} title="Edit this period">
      <div className="stack">
        <div className="field">
          <label htmlFor="edit-start">First day</label>
          <input id="edit-start" className="input" type="date" max={today} value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="edit-end">Last day</label>
          <input id="edit-end" className="input" type="date" max={today} value={end} onChange={(e) => setEnd(e.target.value)} />
          <p className="tiny faint">
            Leave this blank if it is still going. Setting it here is the fix for forgetting to tap the button on the
            day it finished.
          </p>
        </div>
        {invalid && (
          <p className="tiny" style={{ color: '#c0392b', fontWeight: 600 }}>
            The last day cannot be before the first day.
          </p>
        )}
        <button
          className="btn btn-block"
          disabled={!start || invalid}
          onClick={() => onSave({ start, end: end ? end : null })}
        >
          Save changes
        </button>
        {log.end && (
          <button className="btn btn-ghost btn-block" onClick={() => onSave({ end: null })}>
            Still going, reopen it
          </button>
        )}
      </div>
    </Sheet>
  );
}
