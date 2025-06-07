const CACHE_NAME = 'prompt-viewer-v1'; // For app shell
const PROMPT_CACHE_NAME = 'prompt-viewer-prompts-v1'; // For Markdown prompts

const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'https://via.placeholder.com/192',
  'https://via.placeholder.com/512'
];

const RAW_GITHUB_CONTENT_URL_PREFIX = 'https://raw.githubusercontent.com/';

// Install event: caches the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting(); // Activate the new service worker immediately
      })
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== PROMPT_CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of uncontrolled clients
    })
  );
});

// Fetch event listener
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return; // Only handle GET requests
  }

  const requestUrl = event.request.url;

  // Strategy for prompt content (from raw.githubusercontent.com)
  if (requestUrl.startsWith(RAW_GITHUB_CONTENT_URL_PREFIX)) {
    event.respondWith(
      caches.open(PROMPT_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(error => {
            console.warn('Service Worker: Network fetch failed for prompt.', event.request.url, error);
            if (!cachedResponse) {
              return new Response(
                JSON.stringify({ error: "Prompt content is not available offline and not found in cache." }),
                { status: 404, statusText: "Not Found in Cache and Offline", headers: { 'Content-Type': 'application/json' } }
              );
            }
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
  // Strategy for app shell assets (Cache-First)
  else if (ASSETS_TO_CACHE.includes(requestUrl) || ASSETS_TO_CACHE.includes(new URL(requestUrl).pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) { return cachedResponse; }
          return fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => { cache.put(event.request, responseToCache); });
            }
            return networkResponse;
          });
        })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});

// Message event listener
self.addEventListener('message', event => {
  if (!event.data || !event.data.action) {
    return;
  }

  if (event.data.action === 'cacheAllPrompts') {
    const { filePaths, owner, repo, branch, clientId } = event.data;
    console.log('Service Worker: Received request to cache all prompts.', filePaths.length, 'files');
    event.waitUntil(
      caches.open(PROMPT_CACHE_NAME).then(cache => {
        const promises = filePaths.map(filePath => {
          const fullRawUrl = `${RAW_GITHUB_CONTENT_URL_PREFIX}${owner}/${repo}/${branch}/${filePath}`;
          return fetch(fullRawUrl)
            .then(response => {
              if (response.ok) {
                console.log('Service Worker: Caching prompt:', filePath);
                return cache.put(fullRawUrl, response.clone());
              }
              console.error('Service Worker: Failed to fetch prompt for caching:', filePath, response.status);
              return Promise.resolve();
            })
            .catch(error => {
              console.error('Service Worker: Error fetching prompt for caching:', filePath, error);
              return Promise.resolve();
            });
        });
        return Promise.all(promises);
      }).then(() => {
        console.log('Service Worker: Finished attempting to cache all prompts.');
        // Try to get client that sent the message to respond directly
        if (clientId && self.clients && typeof self.clients.get === 'function') {
            self.clients.get(clientId).then(client => {
                if (client) {
                    client.postMessage({ type: 'CACHE_ALL_PROMPTS_COMPLETE' });
                } else if (event.source) { // Fallback to event.source if client not found by ID
                    event.source.postMessage({ type: 'CACHE_ALL_PROMPTS_COMPLETE' });
                }
            });
        } else if (event.source) { // Fallback if no clientId provided
             event.source.postMessage({ type: 'CACHE_ALL_PROMPTS_COMPLETE' });
        }
      })
    );
  } else if (event.data.action === 'clearPromptCache') {
    console.log('Service Worker: Received request to clear prompt cache.');
    event.waitUntil(
      caches.delete(PROMPT_CACHE_NAME)
        .then(() => {
          console.log('Service Worker: Prompt cache cleared successfully.');
          if (event.source) { // Ensure event.source is available
            event.source.postMessage({ type: 'PROMPT_CACHE_CLEARED' });
          } else if (event.data.clientId && self.clients && typeof self.clients.get === 'function') {
            self.clients.get(event.data.clientId).then(client => {
                if (client) {
                    client.postMessage({ type: 'PROMPT_CACHE_CLEARED' });
                }
            });
          }
        })
        .catch(err => {
          console.error('Service Worker: Failed to clear prompt cache:', err);
          // Optionally, notify client of failure
           if (event.source) {
            event.source.postMessage({ type: 'PROMPT_CACHE_CLEAR_FAILED', error: err.message });
          } else if (event.data.clientId && self.clients && typeof self.clients.get === 'function') {
            self.clients.get(event.data.clientId).then(client => {
                if (client) {
                    client.postMessage({ type: 'PROMPT_CACHE_CLEAR_FAILED', error: err.message });
                }
            });
          }
        })
    );
  }
});
