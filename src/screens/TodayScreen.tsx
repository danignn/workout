import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { ProgressRing } from '../components/Charts';
import { CheckIcon, ChevronRight, DropIcon, FlameIcon, MinusIcon, MoonIcon, PlusIcon, WalkIcon } from '../components/Icons';
import { addDays, formatLong, fromKey, greeting, todayKey } from '../utils/date';
import { currentPhase } from '../utils/cycle';
import { nextSessionAfter, restDayFor, sessionFor, weekNumber } from '../utils/schedule';
import { setsCompleted, weekStreak, workoutsThisWeek } from '../utils/stats';
import { EMPTY_HABIT } from '../store/types';

const DAYS_BACK = 21;
const DAYS_FORWARD = 28;

export function TodayScreen() {
  const { state, updateHabit } = useApp();
  const navigate = useNavigate();
  const today = todayKey();
  const [selected, setSelected] = useState(today);
  const stripRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  const start = state.schedule.startDate;
  const session = sessionFor(start, selected);
  const restDay = restDayFor(start, selected);
  const log = state.workouts.find((w) => w.date === selected && w.sessionId === session?.id);
  const phase = currentPhase(state.cycle, selected);
  const habit = state.habits[selected] ?? EMPTY_HABIT;
  const isToday = selected === today;

  const dates = useMemo(
    () => Array.from({ length: DAYS_BACK + DAYS_FORWARD + 1 }, (_, i) => addDays(today, i - DAYS_BACK)),
    [today],
  );

  // Centre the strip on today the first time it renders.
  useEffect(() => {
    const el = todayRef.current;
    const strip = stripRef.current;
    if (el && strip) {
      strip.scrollLeft = el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2;
    }
  }, []);

  const doneThisWeek = workoutsThisWeek(state.workouts, today);
  const streak = weekStreak(state.workouts, today);
  const totalSets = session ? session.exercises.reduce((n, ex) => n + (log?.entries[ex.id]?.length ?? ex.sets), 0) : 0;
  const doneSets = log ? setsCompleted(log) : 0;
  const upcoming = nextSessionAfter(start, selected);
  const proteinLogged = (state.meals[selected] ?? []).reduce((n, m) => n + m.protein, 0);
  const beforeStart = selected < start;

  return (
    <>
      <div className="page-header">
        <div className="eyebrow">{greeting()}{state.profile.name ? `, ${state.profile.name}` : ''}</div>
        <h1>{beforeStart ? 'Before you started' : session ? session.title : restDay?.label ?? 'Rest'}</h1>
        <p className="sub">
          {isToday ? 'Today' : formatLong(selected)}
          {!beforeStart && ` · week ${weekNumber(start, selected)}`}
        </p>
      </div>

      <div className="page stack">
        {/* Scrollable date strip — swipe left and right through the calendar */}
        <div className="date-strip" ref={stripRef}>
          {dates.map((key) => {
            const d = fromKey(key);
            const s = sessionFor(start, key);
            const done = state.workouts.some((w) => w.date === key && w.completed);
            const sel = key === selected;
            return (
              <button
                key={key}
                ref={key === today ? todayRef : undefined}
                className={`date-chip${sel ? ' selected' : ''}${key === today && !sel ? ' today' : ''}`}
                onClick={() => setSelected(key)}
                aria-pressed={sel}
                aria-label={formatLong(key)}
              >
                <div className="dow">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <div className="dnum">{d.getDate()}</div>
                <div className="tag" style={{ opacity: s ? 0.9 : 0.45 }}>{s ? s.title.split(' ')[0] : 'Rest'}</div>
                <div className={`dot${done ? ' done' : ''}`} />
              </button>
            );
          })}
        </div>

        {!isToday && (
          <button className="btn btn-soft btn-sm" onClick={() => setSelected(today)} style={{ alignSelf: 'flex-start' }}>
            Back to today
          </button>
        )}

        {beforeStart ? (
          <div className="rest-card">
            <h2>Your programme starts {formatLong(start)}</h2>
            <p className="small muted" style={{ marginTop: 6 }}>
              This day falls before it. Change your start date in Me if you began earlier than this.
            </p>
          </div>
        ) : session ? (
          <div className="hero-card">
            <div className="row" style={{ gap: 16 }}>
              <ProgressRing value={doneSets} max={totalSets} label={`${doneSets}`} sublabel={`of ${totalSets}`} />
              <div className="grow">
                <span className="pill pill-white">{isToday ? 'Today' : fromKey(selected).toLocaleDateString(undefined, { weekday: 'long' })}</span>
                <h2 style={{ marginTop: 8 }}>{session.title}</h2>
                <p className="muted small" style={{ marginTop: 2 }}>
                  {session.exercises.length} exercises · warm-up and cool-down included
                </p>
              </div>
            </div>
            <button
              className="btn btn-white btn-block"
              style={{ marginTop: 16, position: 'relative' }}
              onClick={() => navigate(`/workout/${session.id}?date=${selected}`)}
            >
              {log?.completed ? 'Review this workout' : doneSets > 0 ? 'Continue workout' : 'Start workout'}
            </button>
          </div>
        ) : (
          <div className="rest-card">
            <span className="pill pill-lilac">{restDay?.label ?? 'Rest day'}</span>
            <h2 style={{ marginTop: 10 }}>Recovery is part of the plan</h2>
            <p className="small muted" style={{ marginTop: 6 }}>{restDay?.note}</p>
            {upcoming && (
              <p className="small" style={{ marginTop: 12, fontWeight: 600, color: 'var(--pink-700)' }}>
                Next up: {upcoming.session.title} in {upcoming.daysAway} {upcoming.daysAway === 1 ? 'day' : 'days'}
              </p>
            )}
          </div>
        )}

        {phase && (
          <div className="card">
            <span className="pill pill-lilac">{phase.emoji} {phase.label} · day {phase.dayOfCycle}</span>
            <h3 style={{ marginTop: 10 }}>{phase.headline}</h3>
            <p className="small muted" style={{ marginTop: 5 }}>{phase.advice}</p>
          </div>
        )}

        <div className="stat-grid">
          <div className="stat">
            <div className="v num">{doneThisWeek.length}<span className="faint" style={{ fontSize: 14 }}>/4</span></div>
            <div className="k">This week</div>
          </div>
          <div className="stat">
            <div className="v num" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ color: 'var(--pink-500)' }}><FlameIcon size={16} /></span>{streak}
            </div>
            <div className="k">Week streak</div>
          </div>
          <div className="stat">
            <div className="v num">{state.workouts.filter((w) => w.completed).length}</div>
            <div className="k">Total done</div>
          </div>
        </div>

        <div className="section-title">Daily habits{!isToday && ' — ' + fromKey(selected).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
        <div className="card stack-sm">
          <div className="row-between">
            <span className="row small bold" style={{ gap: 8 }}>
              <span style={{ color: '#7fbdf0' }}><DropIcon size={17} /></span> Water
            </span>
            <span className="row" style={{ gap: 8 }}>
              <button className="icon-btn" onClick={() => updateHabit(selected, { water: Math.max(0, habit.water - 1) })} aria-label="Less water">
                <MinusIcon size={15} />
              </button>
              <span className="num bold" style={{ minWidth: 46, textAlign: 'center' }}>{habit.water}/{state.profile.waterTarget}</span>
              <button className="icon-btn" onClick={() => updateHabit(selected, { water: habit.water + 1 })} aria-label="More water">
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
              className="set-input" style={{ maxWidth: 110 }} type="number" inputMode="numeric"
              placeholder={String(state.profile.stepTarget)} value={habit.steps || ''}
              onChange={(e) => updateHabit(selected, { steps: Number(e.target.value) || 0 })} aria-label="Steps"
            />
          </div>

          <div className="row-between">
            <span className="row small bold" style={{ gap: 8 }}>
              <span style={{ color: 'var(--lilac)' }}><MoonIcon size={17} /></span> Sleep (hrs)
            </span>
            <input
              className="set-input" style={{ maxWidth: 110 }} type="number" inputMode="decimal" step="0.5"
              placeholder="8" value={habit.sleepHours || ''}
              onChange={(e) => updateHabit(selected, { sleepHours: Number(e.target.value) || 0 })} aria-label="Hours slept"
            />
          </div>

          <div className="row-between">
            <span className="row small bold" style={{ gap: 8 }}>
              <span style={{ color: 'var(--pink-500)' }}><CheckIcon size={17} /></span> Protein target hit
            </span>
            <button
              className={`tick${habit.proteinHit ? ' on' : ''}`}
              onClick={() => updateHabit(selected, { proteinHit: !habit.proteinHit })}
              aria-pressed={habit.proteinHit} aria-label="Protein target hit"
            >
              <CheckIcon size={19} />
            </button>
          </div>
          {proteinLogged > 0 && <p className="tiny faint">{proteinLogged}g of protein logged in Meals.</p>}
        </div>

        <Link to="/plan" className="card link-row" style={{ textDecoration: 'none', color: 'inherit', marginTop: 4 }}>
          <span>
            <span className="bold small" style={{ display: 'block' }}>See the full programme</span>
            <span className="tiny faint">Your cycle, rest rules and progression</span>
          </span>
          <ChevronRight />
        </Link>
      </div>
    </>
  );
}
