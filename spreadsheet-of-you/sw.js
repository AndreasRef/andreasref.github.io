const CACHE_NAME = 'spreadsheet-of-you-v1';

// Cache these on first fetch — model weights + WASM binaries
const CACHEABLE_PATTERNS = [
  'cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js',  // face-api weights
  'cdn.jsdelivr.net/npm/@mediapipe/tasks-vision',        // MediaPipe WASM + models
  'storage.googleapis.com/mediapipe',                    // MediaPipe model files
];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Only intercept cacheable CDN requests
  const shouldCache = CACHEABLE_PATTERNS.some(p => url.includes(p));
  if (!shouldCache) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        });
      })
    )
  );
});
