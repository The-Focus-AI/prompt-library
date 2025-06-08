// Service Worker for Prompt Viewer PWA
const CACHE_NAME = 'prompt-viewer-v1';
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

// Activate event - clean up old caches
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
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    // Cache GitHub API responses and raw files
                    if (event.request.url.includes('github.com') || 
                        event.request.url.includes('githubusercontent.com')) {
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    
                    return response;
                }).catch(() => {
                    // Return offline page if available
                    return caches.match('/index.html');
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
        // This would be used for caching all prompts
        event.waitUntil(
            cacheAllPrompts(event.data.urls)
        );
    }
});

// Helper function to cache all prompts
async function cacheAllPrompts(urls) {
    const cache = await caches.open(CACHE_NAME);
    
    // Fetch and cache each URL
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