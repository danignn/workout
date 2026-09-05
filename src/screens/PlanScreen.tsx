import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DO_NOT_ADD_BACK, HONEST_NOTES, PROGRAM_META, QUAD_VS_GLUTE, REST_DAY_BY_OFFSET, REST_RULES, REST_BETWEEN_EXERCISES, SESSION_BY_OFFSET } from '../data/program';
import { ALL_VIDEOS } from '../data/videos';
import { useApp } from '../store/AppContext';
import { CheckIcon, ChevronLeft, ChevronRight, InfoIcon } from '../components/Icons';
import { addDays, formatShort, fromKey, todayKey } from '../utils/date';
import { cycleWeekOf, cycleOffset, legDaySpacingHours, weekNumber } from '../utils/schedule';

type Tab = 'week' | 'rules' | 'videos' | 'notes';

export function PlanScreen() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('week');
  const today = todayKey();
  const start = state.schedule.startDate;
  // Which programme week the user is looking at; 0 is the current one.
  const [weekShift, setWeekShift] = useState(0);
  const anchor = addDays(today, weekShift * 7);
  const week = cycleWeekOf(start, anchor);

  return (
    <>
      <div className="page-header">
        <div className="eyebrow">Your programme</div>
        <h1>{PROGRAM_META.name}</h1>
        <p className="sub">{PROGRAM_META.goal}</p>
      </div>

      <div className="page stack">
        <div className="chip-row">
          {([
            ['week', 'This week'],
            ['rules', 'Rest rules'],
            ['videos', 'Videos'],
            ['notes', 'Notes'],
          ] as [Tab, string][]).map(([id, label]) => (
            <button key={id} className={`chip${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'week' && (
          <div className="stack">
            <div className="row-between">
              <button className="icon-btn" onClick={() => setWeekShift((w) => w - 1)} aria-label="Previous week">
                <ChevronLeft size={18} />
              </button>
              <span className="small bold">
                Week {weekNumber(start, anchor)}
                <span className="faint" style={{ fontWeight: 500 }}> · {formatShort(week[0])} – {formatShort(week[6])}</span>
              </span>
              <button className="icon-btn" onClick={() => setWeekShift((w) => w + 1)} aria-label="Next week">
                <ChevronRight size={18} />
              </button>
            </div>

            {week.map((date) => {
              const offset = cycleOffset(start, date);
              const session = offset === null ? undefined : SESSION_BY_OFFSET[offset];
              const rest = offset === null ? undefined : REST_DAY_BY_OFFSET[offset];
              const isToday = date === today;
              const done = state.workouts.some((w) => w.date === date && w.completed);
              const dayLabel = fromKey(date).toLocaleDateString(undefined, { weekday: 'short' });

              if (session) {
                return (
                  <button
                    key={date}
                    className="card row"
                    style={{ gap: 12, textAlign: 'left', borderColor: isToday ? 'var(--pink-300)' : undefined }}
                    onClick={() => navigate(`/workout/${session.id}?date=${date}`)}
                  >
                    <span
                      style={{
                        width: 46, height: 46, borderRadius: 15, flexShrink: 0,
                        background: done ? 'var(--pink-500)' : `${session.accent}2e`,
                        color: done ? '#fff' : session.accent,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 11, lineHeight: 1.15,
                      }}
                    >
                      {done ? <CheckIcon size={20} /> : (<><span>{dayLabel}</span><span style={{ fontSize: 13 }}>{fromKey(date).getDate()}</span></>)}
                    </span>
                    <span className="grow">
                      <span className="bold" style={{ display: 'block' }}>
                        {session.title} {isToday && <span className="pill" style={{ marginLeft: 6 }}>Today</span>}
                      </span>
                      <span className="tiny muted">{session.subtitle} · {session.exercises.length} exercises</span>
                    </span>
                    <ChevronRight />
                  </button>
                );
              }

              return (
                <div key={date} className="card card-flat row" style={{ gap: 12, borderColor: isToday ? 'var(--pink-300)' : undefined }}>
                  <span
                    style={{
                      width: 46, height: 46, borderRadius: 15, flexShrink: 0,
                      background: 'var(--pink-50)', color: 'var(--pink-600)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 11, lineHeight: 1.15,
                    }}
                  >
                    <span>{dayLabel}</span><span style={{ fontSize: 13 }}>{fromKey(date).getDate()}</span>
                  </span>
                  <span className="grow">
                    <span className="bold small" style={{ display: 'block' }}>
                      {rest?.label ?? 'Before start'} {isToday && <span className="pill" style={{ marginLeft: 6 }}>Today</span>}
                    </span>
                    <span className="tiny muted">{rest?.note ?? 'Your programme had not started yet on this day.'}</span>
                  </span>
                </div>
              );
            })}

            <div className="card card-flat card-tight row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--pink-500)', flexShrink: 0, marginTop: 1 }}><InfoIcon size={16} /></span>
              <span className="small muted">
                Your cycle starts on a {fromKey(start).toLocaleDateString(undefined, { weekday: 'long' })} and repeats every
                7 days, so your two leg days always land {legDaySpacingHours()} hours apart. Change the start day in Me.
              </span>
            </div>

            <div className="card">
              <div className="section-title" style={{ margin: '0 0 6px' }}>Starting loads</div>
              <p className="small muted">{PROGRAM_META.startingLoads}</p>
            </div>
          </div>
        )}

        {tab === 'rules' && (
          <div className="stack">
            <div className="card stack-sm">
              <div className="section-title" style={{ margin: 0 }}>Rest between sets</div>
              {Object.values(REST_RULES).map((rule) => (
                <div key={rule.tier} className="row-between" style={{ alignItems: 'flex-start', paddingTop: 8 }}>
                  <span className="grow">
                    <span className="bold small" style={{ display: 'block' }}>{rule.label}</span>
                    <span className="tiny faint">{rule.description}</span>
                  </span>
                  <span className="pill">{rule.betweenSets[0] / 60 >= 1 ? `${rule.betweenSets[0] / 60}–${rule.betweenSets[1] / 60} min` : `${rule.betweenSets[0]}–${rule.betweenSets[1]} sec`}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-title" style={{ margin: '0 0 6px' }}>Between exercises</div>
              <p className="small muted">
                {REST_BETWEEN_EXERCISES[0] / 60} to {REST_BETWEEN_EXERCISES[1] / 60} minutes regardless of what you just did.
                You are switching movement patterns and setting up new equipment, so use that time.
              </p>
            </div>

            <div className="card">
              <div className="section-title" style={{ margin: '0 0 6px' }}>Self-check</div>
              <p className="small muted">{PROGRAM_META.selfCheck}</p>
              <p className="small muted" style={{ marginTop: 8 }}>{PROGRAM_META.sessionLength}</p>
            </div>

            <div className="card">
              <div className="section-title" style={{ margin: '0 0 6px' }}>Progression</div>
              <p className="small muted">{PROGRAM_META.progression}</p>
              <p className="small muted" style={{ marginTop: 8 }}>{PROGRAM_META.progressionWhy}</p>
            </div>
          </div>
        )}

        {tab === 'videos' && (
          <div className="stack-sm">
            <p className="small muted" style={{ marginBottom: 6 }}>
              Every form video referenced in your plan, all from @vera.armishaw. These also play inline inside each
              exercise, and you can attach your own clips there.
            </p>
            {ALL_VIDEOS.map((v) => (
              <a key={v.id} className="video-card" href={v.url} target="_blank" rel="noreferrer noopener">
                <span className="video-thumb">▶</span>
                <span className="grow">
                  <span className="bold small" style={{ display: 'block' }}>{v.title}</span>
                  <span className="tiny faint">@{v.author}</span>
                </span>
              </a>
            ))}
          </div>
        )}

        {tab === 'notes' && (
          <div className="stack">
            {HONEST_NOTES.map((note) => (
              <div key={note.title} className="card stack-sm">
                <h3>{note.title}</h3>
                <p className="small muted">{note.body}</p>
                {note.video && (
                  <a className="video-card" href={note.video.url} target="_blank" rel="noreferrer noopener">
                    <span className="video-thumb">▶</span>
                    <span className="grow">
                      <span className="bold small" style={{ display: 'block' }}>{note.video.title}</span>
                      <span className="tiny faint">@{note.video.author}</span>
                    </span>
                  </a>
                )}
              </div>
            ))}
            <div className="card">
              <div className="section-title" style={{ margin: '0 0 6px' }}>Quad-dominant vs glute-dominant</div>
              <p className="small bold" style={{ marginTop: 8 }}>Grows quads</p>
              <p className="small muted">{QUAD_VS_GLUTE.quad}</p>
              <p className="small bold" style={{ marginTop: 10 }}>Grows glutes and hamstrings</p>
              <p className="small muted">{QUAD_VS_GLUTE.glute}</p>
            </div>

            <div className="card">
              <div className="section-title" style={{ margin: '0 0 4px' }}>Do not add back</div>
              <p className="tiny faint" style={{ marginBottom: 6 }}>
                Removed on purpose. Each one works against a goal you named.
              </p>
              {DO_NOT_ADD_BACK.map((x) => (
                <div className="mobility-item" key={x.name}>
                  <span className="mobility-dot" style={{ background: '#e88' }} />
                  <span className="grow">
                    <span className="small bold" style={{ display: 'block' }}>{x.name}</span>
                    <span className="tiny muted">{x.reason}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </>
  );
}
