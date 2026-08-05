/* Офлайн-кэш. Меняй VERSION при обновлении index.html — иначе телефон покажет старую копию. */
var VERSION = 'faza0-v3';
var FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return k === VERSION ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  // Страница: сначала сеть (чтобы прилетали обновления), при офлайне — кэш.
  if (e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).then(function(r){
        var copy = r.clone();
        caches.open(VERSION).then(function(c){ c.put('./index.html', copy); });
        return r;
      }).catch(function(){
        return caches.match('./index.html').then(function(r){ return r || caches.match('./'); });
      })
    );
    return;
  }
  // Всё остальное: сначала кэш.
  e.respondWith(
    caches.match(e.request).then(function(r){ return r || fetch(e.request); })
  );
});
