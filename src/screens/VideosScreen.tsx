import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { allVideoSlots, matchSlot, type VideoSlot } from '../data/videoSlots';
import { deletePhoto, putPhoto } from '../store/idb';
import { ChevronLeft, InfoIcon, PlayIcon, TrashIcon } from '../components/Icons';
import { VideoSheet, type PlayRequest } from '../components/VideoSheet';

function formatMB(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

export function VideosScreen() {
  const { state, setMedia, clearMedia } = useApp();
  const navigate = useNavigate();
  const slots = useMemo(() => allVideoSlots(), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [report, setReport] = useState<string[] | null>(null);
  const [playing, setPlaying] = useState<PlayRequest | null>(null);
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);
  const bulkRef = useRef<HTMLInputElement>(null);
  const singleRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<string | null>(null);

  const saved = slots.filter((s) => state.media[s.key]?.clipId).length;

  const refreshUsage = () => {
    navigator.storage?.estimate?.().then((e) => {
      if (e.usage != null && e.quota != null) setUsage({ used: e.usage, quota: e.quota });
    });
  };
  useEffect(refreshUsage, [saved]);

  const saveOne = async (slotKey: string, file: File) => {
    const id = `vid-${slotKey}-${Date.now()}`;
    const previous = state.media[slotKey]?.clipId;
    await putPhoto(id, file);
    setMedia(slotKey, { clipId: id });
    if (previous) await deletePhoto(previous).catch(() => undefined);
  };

  const onBulk = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy('bulk');
    const lines: string[] = [];
    for (const file of Array.from(files)) {
      const slot = matchSlot(file.name, slots);
      if (!slot) {
        lines.push(`✗ ${file.name} — no match, add it manually below`);
        continue;
      }
      try {
        await saveOne(slot.key, file);
        lines.push(`✓ ${file.name} → ${slot.label}`);
      } catch {
        lines.push(`✗ ${file.name} — could not be saved, it may be too large`);
      }
    }
    setReport(lines);
    setBusy(null);
    refreshUsage();
    if (bulkRef.current) bulkRef.current.value = '';
  };

  const onSingle = async (file: File | undefined) => {
    const key = targetRef.current;
    if (!file || !key) return;
    setBusy(key);
    try {
      await saveOne(key, file);
    } catch {
      alert('That file could not be saved. It may be too large for the browser to store.');
    } finally {
      setBusy(null);
      targetRef.current = null;
      refreshUsage();
      if (singleRef.current) singleRef.current.value = '';
    }
  };

  const removeVideo = async (slot: VideoSlot) => {
    const id = state.media[slot.key]?.clipId;
    if (!id) return;
    if (!confirm(`Remove your saved video for ${slot.label}?`)) return;
    await deletePhoto(id).catch(() => undefined);
    clearMedia(slot.key, 'clipId');
    refreshUsage();
  };

  const groups = useMemo(() => {
    const map = new Map<string, VideoSlot[]>();
    for (const slot of slots) {
      if (!map.has(slot.group)) map.set(slot.group, []);
      map.get(slot.group)!.push(slot);
    }
    return [...map.entries()];
  }, [slots]);

  return (
    <>
      <div className="page-header">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Go back" style={{ marginBottom: 10 }}>
          <ChevronLeft />
        </button>
        <div className="eyebrow">Never lose a video again</div>
        <h1>My videos</h1>
        <p className="sub">{saved} of {slots.length} exercises have a video saved on this phone.</p>
      </div>

      <div className="page stack">
        <div className="card card-flat card-tight row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--pink-500)', flexShrink: 0, marginTop: 1 }}><InfoIcon size={16} /></span>
          <span className="tiny muted">
            A video saved here plays instantly, works with no signal, and cannot be taken away if the original post is
            deleted. This is the reliable option — TikTok often refuses to play inside another app, which is why some
            videos show an empty player.
          </span>
        </div>

        <div className="card stack-sm">
          <span className="bold">Import all at once</span>
          <p className="tiny muted">
            Pick every video file you saved from TikTok in one go. They are matched to exercises by filename, so name
            them something like <strong>hip thrust.mp4</strong> or <strong>lower a warm-up.mp4</strong> first.
          </p>
          <input
            ref={bulkRef}
            type="file"
            accept="video/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => onBulk(e.target.files)}
          />
          <button className="btn btn-block" disabled={busy === 'bulk'} onClick={() => bulkRef.current?.click()}>
            {busy === 'bulk' ? 'Saving…' : 'Choose video files'}
          </button>
          {report && (
            <div className="card card-flat" style={{ marginTop: 4 }}>
              {report.map((line) => (
                <p key={line} className="tiny" style={{ color: line.startsWith('✓') ? 'var(--pink-700)' : 'var(--ink-soft)' }}>
                  {line}
                </p>
              ))}
              <button className="btn btn-soft btn-sm" style={{ marginTop: 8 }} onClick={() => setReport(null)}>Done</button>
            </div>
          )}
        </div>

        {usage && (
          <div className="card card-tight">
            <div className="row-between">
              <span className="small">Storage used on this phone</span>
              <span className="small num bold">{formatMB(usage.used)}</span>
            </div>
            <div className="bar-track" style={{ marginTop: 8 }}>
              <div className="bar-fill" style={{ width: `${Math.min(100, (usage.used / usage.quota) * 100)}%` }} />
            </div>
            <p className="tiny faint" style={{ marginTop: 6 }}>
              About {formatMB(usage.quota)} available. A short clip is roughly 2 to 5 MB.
            </p>
          </div>
        )}

        <input
          ref={singleRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={(e) => onSingle(e.target.files?.[0])}
        />

        {groups.map(([group, items]) => (
          <div key={group}>
            <div className="section-title">{group}</div>
            <div className="card">
              {items.map((slot) => {
                const clipId = state.media[slot.key]?.clipId;
                return (
                  <div className="row-between" key={slot.key} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                    <span className="grow">
                      <span className="small bold" style={{ display: 'block' }}>{slot.label}</span>
                      <span className="tiny faint">{clipId ? 'Saved on this phone' : 'No file saved'}</span>
                    </span>
                    {clipId ? (
                      <span className="row" style={{ gap: 6 }}>
                        <button
                          className="icon-btn"
                          style={{ background: 'var(--pink-500)', color: '#fff' }}
                          onClick={() => setPlaying({ title: slot.label, subtitle: 'Your saved video', clipId })}
                          aria-label={`Play ${slot.label}`}
                        >
                          <PlayIcon size={15} />
                        </button>
                        <button className="icon-btn" onClick={() => removeVideo(slot)} aria-label={`Remove ${slot.label}`}>
                          <TrashIcon size={15} />
                        </button>
                      </span>
                    ) : (
                      <button
                        className="btn btn-soft btn-sm"
                        disabled={busy === slot.key}
                        onClick={() => {
                          targetRef.current = slot.key;
                          singleRef.current?.click();
                        }}
                      >
                        {busy === slot.key ? 'Saving…' : 'Add file'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="card card-flat">
          <div className="section-title" style={{ margin: '0 0 6px' }}>Where to get the files</div>
          <p className="small muted">
            In TikTok, tap Share then Save video, which puts the file in your camera roll. If you already put them in
            Google Drive, open Drive, download each one to your phone, then import them here. Once they are in, the app
            never needs TikTok again for that exercise.
          </p>
          <p className="tiny faint" style={{ marginTop: 8 }}>
            These stay on your phone for your own use. Keep a copy in Drive as your backup, since a phone reset would
            clear them, and the app's JSON backup is too small to carry video.
          </p>
        </div>
      </div>

      <VideoSheet request={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
