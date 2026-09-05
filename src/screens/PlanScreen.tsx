import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HONEST_NOTES, PROGRAM_META, REST_DAYS, REST_RULES, REST_BETWEEN_EXERCISES, SESSIONS } from '../data/program';
import { ALL_VIDEOS, type VideoRef } from '../data/videos';
import { useApp } from '../store/AppContext';
import { VideoButton, VideoSheet } from '../components/VideoSheet';
import { CheckIcon, ChevronRight, InfoIcon } from '../components/Icons';
import { addDays, fromKey, todayKey, weekOf } from '../utils/date';

type Tab = 'week' | 'rules' | 'videos' | 'notes';

export function PlanScreen() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('week');
  const [video, setVideo] = useState<VideoRef | null>(null);
  const today = todayKey();
  const week = weekOf(today);

  const dateForDay = (dayOfWeek: number) => week[(dayOfWeek + 6) % 7];

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
            {[1, 2, 3, 4, 5, 6, 0].map((dow) => {
              const session = SESSIONS.find((s) => s.dayOfWeek === dow);
              const rest = REST_DAYS.find((r) => r.dayOfWeek === dow);
              const date = dateForDay(dow);
              const isToday = date === today;
              const done = state.workouts.some((w) => w.date === date && w.completed);

              if (session) {
                return (
                  <button
                    key={dow}
                    className="card row"
                    style={{ gap: 12, textAlign: 'left', borderColor: isToday ? 'var(--pink-300)' : undefined }}
                    onClick={() => navigate(`/workout/${session.id}?date=${date}`)}
                  >
                    <span
                      style={{
                        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                        background: done ? 'var(--pink-500)' : `${session.accent}22`,
                        color: done ? '#fff' : session.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 13,
                      }}
                    >
                      {done ? <CheckIcon size={20} /> : session.dayName.slice(0, 3)}
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
                <div key={dow} className="card card-flat row" style={{ gap: 12, borderColor: isToday ? 'var(--pink-300)' : undefined }}>
                  <span
                    style={{
                      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                      background: '#f2eafb', color: '#7b52ad',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 13,
                    }}
                  >
                    {rest?.dayName.slice(0, 3)}
                  </span>
                  <span className="grow">
                    <span className="bold small" style={{ display: 'block' }}>
                      {rest?.label} {isToday && <span className="pill" style={{ marginLeft: 6 }}>Today</span>}
                    </span>
                    <span className="tiny muted">{rest?.note}</span>
                  </span>
                </div>
              );
            })}

            <div className="card card-flat card-tight row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--pink-500)', flexShrink: 0, marginTop: 1 }}><InfoIcon size={16} /></span>
              <span className="small muted">{PROGRAM_META.spacingNote}</span>
            </div>

            <div className="card">
              <div className="section-title" style={{ margin: '0 0 6px' }}>Starting loads</div>
              <p className="small muted">{PROGRAM_META.startingLoads}</p>
            </div>

            <p className="tiny faint center">
              Tap any past or future day to log it. Today is {fromKey(today).toLocaleDateString(undefined, { weekday: 'long' })}
              {' · '}next week starts {fromKey(addDays(week[6], 1)).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </p>
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
              Every form video referenced in your plan, all from @vera.armishaw.
            </p>
            {ALL_VIDEOS.map((v) => <VideoButton key={v.id} video={v} onPlay={setVideo} />)}
          </div>
        )}

        {tab === 'notes' && (
          <div className="stack">
            {HONEST_NOTES.map((note) => (
              <div key={note.title} className="card stack-sm">
                <h3>{note.title}</h3>
                <p className="small muted">{note.body}</p>
                {note.video && <VideoButton video={note.video} onPlay={setVideo} />}
              </div>
            ))}
            <div className="card card-flat">
              <div className="section-title" style={{ margin: '0 0 6px' }}>For comparison</div>
              <p className="small muted">{PROGRAM_META.veraLegDay}</p>
            </div>
          </div>
        )}
      </div>

      <VideoSheet video={video} onClose={() => setVideo(null)} />
    </>
  );
}
