import { useEffect, useState } from 'react';
import { getPhoto } from '../store/idb';
import type { PhotoMeta } from '../store/types';
import { formatShort } from '../utils/date';

export function PhotoTile({ photo, onClick }: { photo: PhotoMeta; onClick?: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    getPhoto(photo.id).then((blob) => {
      if (!blob || cancelled) return;
      revoke = URL.createObjectURL(blob);
      setUrl(revoke);
    });
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [photo.id]);

  return (
    <button className="photo-tile" onClick={onClick} aria-label={`Progress photo from ${formatShort(photo.date)}`}>
      {url ? <img src={url} alt={`${photo.angle} view, ${formatShort(photo.date)}`} /> : null}
      <span className="cap">{formatShort(photo.date)} · {photo.angle}</span>
    </button>
  );
}

/**
 * Shrinks a photo before storing it. Phone cameras produce 3–6MB files and a
 * year of progress photos at that size would be unreasonable to keep on device.
 */
export async function compressImage(file: File, maxEdge = 1280): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process that image.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
  if (!blob) throw new Error('Could not process that image.');
  return { blob, width, height };
}
