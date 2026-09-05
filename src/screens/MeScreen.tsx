import { useRef, useState } from 'react';
import { useApp } from '../store/AppContext';
import { Sheet } from '../components/Sheet';
import { DownloadIcon, InfoIcon, UploadIcon } from '../components/Icons';
import { exportState, parseImport } from '../store/storage';
import { clearPhotos } from '../store/idb';
import { proteinTargetFor } from '../data/meals';
import { currentPhase, nextPeriodIn } from '../utils/cycle';
import { todayKey } from '../utils/date';
import { initialState } from '../store/types';

export function MeScreen() {
  const { state, updateProfile, updateSettings, updateCycle, replaceState } = useApp();
  const [installOpen, setInstallOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const today = todayKey();
  const phase = currentPhase(state.cycle, today);
  const nextIn = nextPeriodIn(state.cycle, today);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const doExport = () => {
    const blob = new Blob([exportState(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloom-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('Backup downloaded');
  };

  const doImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const next = parseImport(await file.text());
      if (!confirm('This replaces everything currently in the app with the backup. Continue?')) return;
      // Photos are not part of a backup file, so keep the ones already on this device.
      replaceState({ ...next, photos: state.photos });
      flash('Backup restored');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'That file could not be read.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const doReset = async () => {
    if (!confirm('Erase all workouts, meals, measurements, photos and settings? This cannot be undone.')) return;
    await clearPhotos().catch(() => undefined);
    replaceState(initialState());
    flash('Everything cleared');
  };

  const Toggle = ({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) => (
    <button className="link-row" onClick={() => onChange(!on)} aria-pressed={on}>
      <span className="grow">
        <span className="small bold" style={{ display: 'block' }}>{label}</span>
        {hint && <span className="tiny faint">{hint}</span>}
      </span>
      <span className={`switch${on ? ' on' : ''}`} />
    </button>
  );

  return (
    <>
      <div className="page-header">
        <div className="eyebrow">Your settings</div>
        <h1>Me</h1>
      </div>

      <div className="page stack">
        <div className="card stack">
          <div className="field">
            <label htmlFor="p-name">Name</label>
            <input id="p-name" className="input" value={state.profile.name} placeholder="What should the app call you?" onChange={(e) => updateProfile({ name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="p-weight">Bodyweight (kg)</label>
            <input id="p-weight" className="input" type="number" inputMode="decimal" step="0.1" value={state.profile.bodyweightKg} onChange={(e) => updateProfile({ bodyweightKg: Number(e.target.value) || 0 })} />
            <p className="tiny faint">Sets your protein target: {proteinTargetFor(state.profile.bodyweightKg)}g a day.</p>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="field grow">
              <label htmlFor="p-water">Water goal (glasses)</label>
              <input id="p-water" className="input" type="number" inputMode="numeric" value={state.profile.waterTarget} onChange={(e) => updateProfile({ waterTarget: Number(e.target.value) || 1 })} />
            </div>
            <div className="field grow">
              <label htmlFor="p-steps">Step goal</label>
              <input id="p-steps" className="input" type="number" inputMode="numeric" value={state.profile.stepTarget} onChange={(e) => updateProfile({ stepTarget: Number(e.target.value) || 0 })} />
            </div>
          </div>
        </div>

        <div className="section-title">Training</div>
        <div className="card">
          <Toggle
            on={state.settings.autoStartRest}
            onChange={(v) => updateSettings({ autoStartRest: v })}
            label="Auto-start rest timer"
            hint="Starts the right countdown the moment you tick a set"
          />
          <Toggle
            on={state.settings.restPreference === 'max'}
            onChange={(v) => updateSettings({ restPreference: v ? 'max' : 'min' })}
            label="Use the longer rest"
            hint={state.settings.restPreference === 'max' ? 'Resting the top of each range, e.g. 3 min on squats' : 'Resting the bottom of each range, e.g. 2 min on squats'}
          />
          <Toggle on={state.settings.sound} onChange={(v) => updateSettings({ sound: v })} label="Sound when rest ends" />
          <Toggle on={state.settings.vibrate} onChange={(v) => updateSettings({ vibrate: v })} label="Vibrate when rest ends" hint="Android and most browsers only" />
        </div>

        <div className="section-title">Cycle</div>
        <div className="card">
          <Toggle
            on={state.cycle.enabled}
            onChange={(v) => updateCycle({ enabled: v })}
            label="Cycle-aware training tips"
            hint="Shows a phase note on the Today screen"
          />
          {state.cycle.enabled && (
            <div className="stack" style={{ marginTop: 12 }}>
              <div className="field">
                <label htmlFor="c-start">First day of your last period</label>
                <input id="c-start" className="input" type="date" value={state.cycle.lastPeriodStart ?? ''} onChange={(e) => updateCycle({ lastPeriodStart: e.target.value })} />
              </div>
              <div className="row" style={{ gap: 10 }}>
                <div className="field grow">
                  <label htmlFor="c-length">Cycle length</label>
                  <input id="c-length" className="input" type="number" inputMode="numeric" value={state.cycle.cycleLength} onChange={(e) => updateCycle({ cycleLength: Number(e.target.value) || 28 })} />
                </div>
                <div className="field grow">
                  <label htmlFor="c-period">Period length</label>
                  <input id="c-period" className="input" type="number" inputMode="numeric" value={state.cycle.periodLength} onChange={(e) => updateCycle({ periodLength: Number(e.target.value) || 5 })} />
                </div>
              </div>
              {phase && (
                <div className="card card-flat card-tight">
                  <p className="small">
                    <strong>{phase.emoji} {phase.label}</strong>, day {phase.dayOfCycle}.
                    {nextIn != null && ` Next period in about ${nextIn} ${nextIn === 1 ? 'day' : 'days'}.`}
                  </p>
                </div>
              )}
              <p className="tiny faint">
                This is a simple calendar estimate, not a medical tool. Update the start date each month to keep it accurate.
              </p>
            </div>
          )}
        </div>

        <div className="section-title">Your data</div>
        <div className="card">
          <button className="link-row" onClick={doExport}>
            <span className="grow">
              <span className="small bold" style={{ display: 'block' }}>Download a backup</span>
              <span className="tiny faint">Workouts, meals, measurements and settings. Photos are separate</span>
            </span>
            <DownloadIcon />
          </button>
          <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => doImport(e.target.files?.[0])} />
          <button className="link-row" onClick={() => fileRef.current?.click()}>
            <span className="grow">
              <span className="small bold" style={{ display: 'block' }}>Restore from a backup</span>
              <span className="tiny faint">Replaces what is in the app right now</span>
            </span>
            <UploadIcon />
          </button>
          <button className="link-row" onClick={() => setInstallOpen(true)}>
            <span className="grow">
              <span className="small bold" style={{ display: 'block' }}>Install on your phone</span>
              <span className="tiny faint">Add it to your home screen like a real app</span>
            </span>
            <InfoIcon />
          </button>
          <button className="link-row" onClick={() => setAboutOpen(true)}>
            <span className="grow">
              <span className="small bold" style={{ display: 'block' }}>About this app</span>
              <span className="tiny faint">Where your data lives</span>
            </span>
            <InfoIcon />
          </button>
        </div>

        <button className="btn btn-danger btn-block" onClick={doReset}>Erase everything</button>

        <p className="tiny faint center" style={{ marginTop: 10 }}>
          Bloom · built from your 4-day glute-focused plan
        </p>
      </div>

      <Sheet open={installOpen} onClose={() => setInstallOpen(false)} title="Install on your phone">
        <div className="stack">
          <div className="card">
            <h3>iPhone / iPad</h3>
            <ol className="cue-list" style={{ marginTop: 8 }}>
              <li>Open this app in <strong>Safari</strong> (it must be Safari, not Chrome).</li>
              <li>Tap the <strong>Share</strong> button at the bottom, the square with an arrow.</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong>. The icon appears on your home screen.</li>
            </ol>
          </div>
          <div className="card">
            <h3>Android</h3>
            <ol className="cue-list" style={{ marginTop: 8 }}>
              <li>Open this app in <strong>Chrome</strong>.</li>
              <li>Tap the <strong>three dots</strong> menu, top right.</li>
              <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
            </ol>
          </div>
          <p className="small muted">
            Once installed it opens full screen with no browser bars, and works without signal, which matters in a
            basement gym. Your data stays on the phone either way.
          </p>
        </div>
      </Sheet>

      <Sheet open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Bloom">
        <div className="stack">
          <p className="small muted">
            Everything you log lives in this browser on this device. There is no account and no server, which means
            it is private and works offline, but also that clearing your browser data or losing the phone loses the log.
          </p>
          <p className="small muted">
            <strong>Download a backup every few weeks.</strong> That file restores everything onto a new phone.
          </p>
          <p className="small muted">
            Progress photos are stored separately on the device and are not included in the backup file. To keep one
            for good, open it in Progress → Photos and tap <strong>Save to my device</strong>, which puts it in your
            normal camera roll or downloads.
          </p>
          <div className="card card-flat">
            <p className="tiny muted">
              Training content and form cues come from your own plan and from @vera.armishaw's videos. This app tracks
              training, it does not give medical advice. Talk to a professional about pain, injury or anything to do with
              your cycle beyond general training adjustments.
            </p>
          </div>
        </div>
      </Sheet>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
