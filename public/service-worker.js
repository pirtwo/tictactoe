self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open('8-puzzle').then(function (cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                '/js/bundle.js',
                '/js/tictac-worker.js',
                '/css/app.css',
                '/favicon.ico',
                '/icons/icon_192.png',
                '/icons/icon_512.png',
                '/assets/sprites/atlas.png',
                '/assets/sprites/atlas.json',
                '/assets/sounds/click.ogg',
                '/assets/sounds/switch.ogg',
                '/assets/sounds/win.ogg',
                '/assets/sounds/lose.ogg',
                '/assets/sounds/music.mp3'
            ]);
        })
    );
});

self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
});