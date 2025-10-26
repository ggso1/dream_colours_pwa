const CACHE_NAME = 'pwa-simple-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.json',
    '/pwa-handler.js',
    '/icon-512x512.png' // Кешуємо іконку
];

// 1. Інсталяція Service Worker і кешування ресурсів
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Кешування ресурсів');
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Активація Service Worker (очищення старих кешів)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Видалення старого кешу:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. Обробка мережевих запитів (стратегія "Cache-first")
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Відповідь знайдено в кеші, повертаємо її
                if (response) {
                    console.log('Завантажено з кешу:', event.request.url);
                    return response;
                }
                // Запиту немає в кеші, йдемо в мережу
                console.log('Завантажено з мережі:', event.request.url);
                return fetch(event.request);
            })
    );
});