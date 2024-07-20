const CACHE_NAME = 'space-impact-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/game.js',
  '/images/spaceship.png',
  '/images/bullet.png',
  '/images/enemy.png',
  '/images/icon.png',
  '/images/icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
