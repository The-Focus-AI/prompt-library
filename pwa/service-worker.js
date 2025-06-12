// Service Worker for Prompt Viewer PWA
const CACHE_VERSION = 2; // <--- INCREMENT THIS ON EVERY DEPLOY
const CACHE_NAME = `prompt-viewer-v${CACHE_VERSION}`;
const urlsToCache = [
    '/prompt-library/pwa/',
    '/prompt-library/pwa/index.html',
    '/prompt-library/pwa/style.css',
    '/prompt-library/pwa/app.js',
    '/prompt-library/pwa/manifest.json'
];

// Install event - cache basic assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - clean up old caches and notify clients
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Notify all clients about the new version
            self.clients.matchAll({ type: 'window' }).then(clients => {
                clients.forEach(client => {
                    client.postMessage({ action: 'swUpdated' });
                });
            });
        })
    );
});

// Fetch event - stale-while-revalidate for static assets
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Only use stale-while-revalidate for our static assets
    const isStaticAsset = urlsToCache.some(url => event.request.url.endsWith(url.replace('/prompt-library/pwa/', '')) || event.request.url.includes(url));

    if (isStaticAsset) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache =>
                cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse);
                    // Return cached response immediately, update in background
                    return cachedResponse || fetchPromise;
                })
            )
        );
        return;
    }

    // Default: cache-first for GitHub API/raw files, fallback to offline page
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                const fetchRequest = event.request.clone();
                return fetch(fetchRequest).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    if (event.request.url.includes('github.com') || 
                        event.request.url.includes('githubusercontent.com')) {
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    return response;
                }).catch(() => {
                    return caches.match('/prompt-library/pwa/index.html');
                });
            })
    );
});

// Message event - handle cache updates
self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    if (event.data.action === 'cacheAll') {
        event.waitUntil(
            cacheAllPrompts(event.data.urls)
        );
    }
});

// Helper function to cache all prompts
async function cacheAllPrompts(urls) {
    const cache = await caches.open(CACHE_NAME);
    const promises = urls.map(async url => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
            }
        } catch (error) {
            console.error('Failed to cache:', url, error);
        }
    });
    return Promise.all(promises);
}