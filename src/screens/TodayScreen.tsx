import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { REST_DAY_BY_DAY, SESSIONS, SESSION_BY_DAY } from '../data/program';
import { useApp } from '../store/AppContext';
import { ProgressRing } from '../components/Charts';
import { CheckIcon, ChevronRight, DropIcon, FlameIcon, MoonIcon, MinusIcon, PlusIcon, WalkIcon } from '../components/Icons';
import { fromKey, greeting, todayKey, weekOf } from '../utils/date';
import { currentPhase } from '../utils/cycle';
import { setsCompleted, weekStreak, workoutsThisWeek } from '../utils/stats';
import { EMPTY_HABIT } from '../store/types';

export function TodayScreen() {
  const { state, updateHabit } = useApp();
  const navigate = useNavigate();
  const today = todayKey();
  const dow = fromKey(today).getDay();

  const session = SESSION_BY_DAY[dow];
  const restDay = REST_DAY_BY_DAY[dow];
  const log = state.workouts.find((w) => w.date === today && w.sessionId === session?.id);
  const phase = currentPhase(state.cycle, today);
  const habit = state.habits[today] ?? EMPTY_HABIT;

  const week = weekOf(today);
  const doneThisWeek = workoutsThisWeek(state.workouts, today);
  const streak = weekStreak(state.workouts, today);

  const totalSets = session ? session.exercises.reduce((n, ex) => n + (log?.entries[ex.id]?.length ?? ex.sets), 0) : 0;
  const doneSets = log ? setsCompleted(log) : 0;

  const nextSession = useMemo(() => {
    for (let i = 1; i <= 7; i += 1) {
      const d = (dow + i) % 7;
      const s = SESSION_BY_DAY[d];
      if (s) return s;
    }
    return undefined;
  }, [dow]);

  const proteinLogged = (state.meals[today] ?? []).reduce((n, m) => n + m.protein, 0);

  return (
    <>
      <div className="page-header">
        <div className="eyebrow">{greeting()}{state.profile.name ? `, ${state.profile.name}` : ''}</div>
        <h1>{session ? session.title : restDay?.label ?? 'Rest'}</h1>
        <p className="sub">
          {session ? session.subtitle : restDay?.note}
        </p>
      </div>

      <div className="page stack">
        {/* Week strip */}
        <div className="day-strip">
          {week.map((key) => {
            const d = fromKey(key);
            const s = SESSION_BY_DAY[d.getDay()];
            const done = state.workouts.some((w) => w.date === key && w.completed);
            return (
              <div key={key} className={`day-cell${key === today ? ' today' : ''}`}>
                <div className="dow">{d.toLocaleDateString(undefined, { weekday: 'narrow' })}</div>
                <div className="dnum">{d.getDate()}</div>
                <div className={`dot${done ? ' done' : s ? ' planned' : ''}`} />
              </div>
            );
          })}
        </div>

        {/* Today's session */}
        {session ? (
          <div className="hero-card">
            <div className="row" style={{ gap: 16 }}>
              <ProgressRing value={doneSets} max={totalSets} label={`${doneSets}`} sublabel={`of ${totalSets}`} />
              <div className="grow">
                <span className="pill pill-white">{session.dayName}</span>
                <h2 style={{ marginTop: 8 }}>{session.title}</h2>
                <p className="muted small" style={{ marginTop: 2 }}>
                  {session.exercises.length} exercises · about 50 to 60 min
                </p>
              </div>
            </div>
            <button
              className="btn btn-white btn-block"
              style={{ marginTop: 16, position: 'relative' }}
              onClick={() => navigate(`/workout/${session.id}`)}
            >
              {log?.completed ? 'Review today’s workout' : doneSets > 0 ? 'Continue workout' : 'Start workout'}
            </button>
          </div>
        ) : (
          <div className="rest-card">
            <span className="pill pill-lilac">{restDay?.label ?? 'Rest day'}</span>
            <h2 style={{ marginTop: 10 }}>Recovery is part of the plan</h2>
            <p className="small muted" style={{ marginTop: 6 }}>{restDay?.note}</p>
            {nextSession && (
              <p className="small" style={{ marginTop: 12, fontWeight: 600, color: 'var(--pink-700)' }}>
                Next up: {nextSession.title} on {nextSession.dayName}
              </p>
            )}
          </div>
        )}

        {/* Cycle phase */}
        {phase && (
          <div className="card">
            <div className="row-between">
              <span className="pill pill-lilac">{phase.emoji} {phase.label} · day {phase.dayOfCycle}</span>
            </div>
            <h3 style={{ marginTop: 10 }}>{phase.headline}</h3>
            <p className="small muted" style={{ marginTop: 5 }}>{phase.advice}</p>
          </div>
        )}

        {/* Weekly summary */}
        <div className="stat-grid">
          <div className="stat">
            <div className="v num">{doneThisWeek.length}<span className="faint" style={{ fontSize: 14 }}>/4</span></div>
            <div className="k">This week</div>
          </div>
          <div className="stat">
            <div className="v num" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ color: 'var(--peach)' }}><FlameIcon size={16} /></span>{streak}
            </div>
            <div className="k">Week streak</div>
          </div>
          <div className="stat">
            <div className="v num">{state.workouts.filter((w) => w.completed).length}</div>
            <div className="k">Total done</div>
          </div>
        </div>

        {/* Habits */}
        <div className="section-title">Daily habits</div>
        <div className="card stack-sm">
          <div className="row-between">
            <span className="row small bold" style={{ gap: 8 }}>
              <span style={{ color: '#7fbdf0' }}><DropIcon size={17} /></span> Water
            </span>
            <span className="row" style={{ gap: 8 }}>
              <button className="icon-btn" onClick={() => updateHabit(today, { water: Math.max(0, habit.water - 1) })} aria-label="Less water">
                <MinusIcon size={15} />
              </button>
              <span className="num bold" style={{ minWidth: 46, textAlign: 'center' }}>{habit.water}/{state.profile.waterTarget}</span>
              <button className="icon-btn" onClick={() => updateHabit(today, { water: habit.water + 1 })} aria-label="More water">
                <PlusIcon size={15} />
              </button>
            </span>
          </div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.min(100, (habit.water / state.profile.waterTarget) * 100)}%` }} /></div>

          <div className="divider" />

          <div className="row-between">
            <span className="row small bold" style={{ gap: 8 }}>
              <span style={{ color: 'var(--mint)' }}><WalkIcon size={17} /></span> Steps
            </span>
            <input
              className="set-input"
              style={{ maxWidth: 110 }}
              type="number"
              inputMode="numeric"
              placeholder={String(state.profile.stepTarget)}
              value={habit.steps || ''}
              onChange={(e) => updateHabit(today, { steps: Number(e.target.value) || 0 })}
              aria-label="Steps today"
            />
          </div>

          <div className="row-between">
            <span className="row small bold" style={{ gap: 8 }}>
              <span style={{ color: 'var(--lilac)' }}><MoonIcon size={17} /></span> Sleep (hrs)
            </span>
            <input
              className="set-input"
              style={{ maxWidth: 110 }}
              type="number"
              inputMode="decimal"
              step="0.5"
              placeholder="8"
              value={habit.sleepHours || ''}
              onChange={(e) => updateHabit(today, { sleepHours: Number(e.target.value) || 0 })}
              aria-label="Hours slept"
            />
          </div>

          <div className="row-between">
            <span className="row small bold" style={{ gap: 8 }}>
              <span style={{ color: 'var(--pink-500)' }}><CheckIcon size={17} /></span> Protein target hit
            </span>
            <button
              className={`tick${habit.proteinHit ? ' on' : ''}`}
              onClick={() => updateHabit(today, { proteinHit: !habit.proteinHit })}
              aria-pressed={habit.proteinHit}
              aria-label="Protein target hit"
            >
              <CheckIcon size={19} />
            </button>
          </div>
          {proteinLogged > 0 && (
            <p className="tiny faint">{proteinLogged}g of protein logged in Meals today.</p>
          )}
        </div>

        <Link to="/plan" className="card link-row" style={{ textDecoration: 'none', color: 'inherit', marginTop: 4 }}>
          <span>
            <span className="bold small" style={{ display: 'block' }}>See the full week</span>
            <span className="tiny faint">{SESSIONS.length} training days · 3 rest days</span>
          </span>
          <ChevronRight />
        </Link>
      </div>
    </>
  );
}
