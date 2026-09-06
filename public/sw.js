/**
 * Offline support for Bloom.
 *
 * Vite fingerprints its build output, so instead of a fixed precache list this
 * caches what the app actually requests. First visit needs a connection; after
 * that the app opens with no signal at all, which is the point — gyms have
 * terrible reception.
 */
const CACHE = 'bloom-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/**
 * Saved videos are served from here rather than from a blob: URL.
 * Safari will not render video from a blob URL because it cannot make byte
 * range requests against one, which plays the audio track and leaves the
 * picture blank. A real URL that answers Range requests fixes that.
 */
const MEDIA_PREFIX = '__media/';

function openMediaDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('bloom-photos', 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('photos')) req.result.createObjectStore('photos');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function readMedia(id) {
  return openMediaDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const req = db.transaction('photos', 'readonly').objectStore('photos').get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

async function serveMedia(request, id) {
  const blob = await readMedia(id).catch(() => null);
  if (!blob) return new Response('Not found', { status: 404 });

  const type = blob.type || 'video/mp4';
  const total = blob.size;
  const range = request.headers.get('range');

  if (!range) {
    return new Response(blob, {
      status: 200,
      headers: { 'Content-Type': type, 'Content-Length': String(total), 'Accept-Ranges': 'bytes' },
    });
  }

  const match = /bytes=(\d*)-(\d*)/.exec(range);
  const start = match && match[1] ? parseInt(match[1], 10) : 0;
  const end = match && match[2] ? parseInt(match[2], 10) : total - 1;
  const safeEnd = Math.min(end, total - 1);
  if (start > safeEnd) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
  }

  return new Response(blob.slice(start, safeEnd + 1, type), {
    status: 206,
    headers: {
      'Content-Type': type,
      'Content-Length': String(safeEnd - start + 1),
      'Content-Range': `bytes ${start}-${safeEnd}/${total}`,
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin && url.pathname.includes(MEDIA_PREFIX)) {
    const id = decodeURIComponent(url.pathname.split(MEDIA_PREFIX)[1] || '');
    if (id) {
      event.respondWith(serveMedia(request, id));
      return;
    }
  }
  // Never cache TikTok embeds or anything else off-origin.
  if (url.origin !== self.location.origin) return;

  // Navigations: try the network so a new deploy is picked up, fall back to the shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./'))),
    );
    return;
  }

  // Everything else: serve from cache immediately, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
