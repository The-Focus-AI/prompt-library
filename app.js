// GitHub repository configuration
const GITHUB_OWNER = 'github';
const GITHUB_REPO = 'gitignore';
const DEFAULT_BRANCH = 'main';

// Recently Viewed configuration
const MAX_RECENT_ITEMS = 5;
const RECENTLY_VIEWED_KEY = 'promptViewerRecentlyViewed';

let currentPath = '';
let currentClientId = null; // Store our client ID for SW communication
let db; // Global variable for IndexedDB

// --- IndexedDB Functions ---
function initDB() {
  const request = indexedDB.open('promptViewerDB', 1);

  request.onupgradeneeded = event => {
    const dbInstance = event.target.result;
    if (!dbInstance.objectStoreNames.contains('directoryListings')) {
      dbInstance.createObjectStore('directoryListings', { keyPath: 'path' });
    }
  };

  request.onsuccess = event => {
    db = event.target.result;
    console.log('Database initialized successfully.');
  };

  request.onerror = event => {
    console.error('Database error:', event.target.errorCode);
  };
}

function cacheDirectory(path, items) {
  if (!db) {
    console.error('DB not initialized. Cannot cache directory.');
    return;
  }
  const transaction = db.transaction(['directoryListings'], 'readwrite');
  const store = transaction.objectStore('directoryListings');
  const directoryData = {
    path: path,
    items: items,
    timestamp: new Date().toISOString()
  };

  const request = store.put(directoryData);

  request.onsuccess = () => {
    console.log(`Directory "${path}" cached successfully.`);
  };

  request.onerror = event => {
    console.error(`Error caching directory "${path}":`, event.target.error);
  };
}

function getCachedDirectory(path) {
  if (!db) {
    console.error('DB not initialized. Cannot get cached directory.');
    return Promise.resolve(null); // Return a resolved promise with null
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['directoryListings'], 'readonly');
    const store = transaction.objectStore('directoryListings');
    const request = store.get(path);

    request.onsuccess = () => {
      if (request.result && request.result.items) {
        console.log(`Cache hit for directory "${path}".`);
        resolve(request.result.items);
      } else {
        console.log(`Cache miss for directory "${path}".`);
        resolve(null);
      }
    };

    request.onerror = event => {
      console.error(`Error getting cached directory "${path}":`, event.target.error);
      reject(event.target.error);
    };
  });
}

async function clearCachedDirectories() {
  if (!db) {
    console.error('DB not initialized. Cannot clear cached directories.');
    return Promise.reject('DB not initialized');
  }
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(['directoryListings'], 'readwrite');
      const store = transaction.objectStore('directoryListings');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Directory listings cache cleared successfully.');
        resolve();
      };

      request.onerror = event => {
        console.error('Error clearing directory listings cache:', event.target.error);
        reject(event.target.error);
      };
    } catch (error) {
        console.error('Exception while trying to clear directory listings cache:', error);
        reject(error);
    }
  });
}

// --- Helper Functions ---
function extractFileName(filePath) {
  if (!filePath) return 'Unknown File';
  return filePath.split('/').pop();
}

function updateRefreshButtonState(isRefreshing, message = "Refresh Prompts") {
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
        refreshButton.disabled = isRefreshing;
        refreshButton.textContent = message;
    }
}

// --- Recently Viewed Functions ---
function getRecentlyViewed() {
  try {
    const items = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return items ? JSON.parse(items) : [];
  } catch (e) {
    console.error("Error parsing recently viewed items from localStorage:", e);
    return [];
  }
}

function addRecentlyViewed(filePath, fileName) {
  if (!filePath || !fileName) return;
  let recentItems = getRecentlyViewed();
  recentItems = recentItems.filter(item => item.path !== filePath);
  recentItems.unshift({ path: filePath, name: fileName });
  recentItems = recentItems.slice(0, MAX_RECENT_ITEMS);
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentItems));
  } catch (e) {
    console.error("Error saving recently viewed items to localStorage:", e);
  }
  renderRecentlyViewed();
}

function renderRecentlyViewed() {
  const recentListUl = document.getElementById('recent-list');
  if (!recentListUl) return;
  recentListUl.innerHTML = '';
  const recentItems = getRecentlyViewed();
  if (recentItems.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No recently viewed prompts.';
    li.classList.add('no-recent-items');
    recentListUl.appendChild(li);
  } else {
    recentItems.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.name;
      li.classList.add('recent-item-entry');
      li.setAttribute('title', `View ${item.name}`);
      li.addEventListener('click', () => { loadAndRenderFile(item.path); });
      recentListUl.appendChild(li);
    });
  }
}

// --- GitHub API & File/Folder Rendering ---
async function fetchFromGitHub(path = '') {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${DEFAULT_BRANCH}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`GitHub API request failed: ${response.status} for path ${path}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching from GitHub API:", error);
    return null;
  }
}

function renderBrowser(items, path = '') {
  const browserDiv = document.getElementById('browser');
  browserDiv.innerHTML = '';
  if (!items || items.length === 0) {
    browserDiv.textContent = "Could not load items or folder is empty.";
    if (path === '' && items === null) browserDiv.textContent = "Failed to load repository structure. Offline?";
    return;
  }
  if (path !== '') { /* ... up button ... */ }
  items.forEach(item => { /* ... item rendering ... */ });
    // Placeholder for brevity, actual rendering logic is more detailed
    if (path !== '') {
        const upButton = document.createElement('div');
        upButton.textContent = '⬆️ .. (Up)';
        upButton.classList.add('browser-item', 'up-button');
        upButton.addEventListener('click', () => navigateToParentDirectory(path));
        browserDiv.appendChild(upButton);
    }
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('browser-item');
        let icon = '';
        if (item.type === 'dir') {
        icon = '📁';
        itemElement.addEventListener('click', () => loadAndRenderPath(item.path));
        } else if (item.type === 'file') {
        icon = '📄';
        if (item.name.endsWith('.md')) {
            itemElement.addEventListener('click', () => loadAndRenderFile(item.path));
        } else {
            itemElement.classList.add('disabled');
        }
        }
        itemElement.textContent = `${icon} ${item.name}`;
        browserDiv.appendChild(itemElement);
    });
}

async function loadAndRenderPath(path = '') {
  currentPath = path;
  const viewerDiv = document.getElementById('viewer'); // Keep viewer clear for files
  viewerDiv.innerHTML = ''; // Clear viewer in case a file was previously shown

  let items = null;
  let loadedFromCache = false;

  try {
    items = await getCachedDirectory(path);
    if (items) {
      loadedFromCache = true;
      console.log(`Rendering directory "${path}" from cache.`);
      renderBrowser(items, path);
    }
  } catch (error) {
    console.error(`Error loading directory "${path}" from cache:`, error);
    // Proceed to network fetch even if cache read fails
  }

  if (!loadedFromCache || navigator.onLine) {
    console.log(loadedFromCache ? `Online, attempting to refresh directory "${path}" from network.` : `Cache miss or forced refresh for "${path}", fetching from network.`);
    try {
      const liveItems = await fetchFromGitHub(path);

      if (liveItems) {
        // Non-blocking call to cache, await not strictly necessary as its internal ops are async
        cacheDirectory(path, liveItems);

        // Check if we need to re-render.
        // Simple length check for now. A more sophisticated diff could be used.
        const needsReRender = !loadedFromCache || (items && liveItems.length !== items.length) || !items;

        if (needsReRender) {
          console.log(`Rendering directory "${path}" from network fetched data.`);
          renderBrowser(liveItems, path);
        } else {
          console.log(`Network data for "${path}" is same as cached. No re-render needed.`);
        }
      } else { // liveItems is null (fetch failed)
        if (!loadedFromCache) {
          // Only render error if nothing was loaded from cache
          console.error(`Failed to fetch directory "${path}" from network and no cache available.`);
          renderBrowser(null, path); // Show error/empty state
        } else {
          console.warn(`Failed to fetch directory "${path}" from network, but using stale cache data.`);
          // Already rendered from cache, so do nothing, user sees stale data.
        }
      }
    } catch (fetchError) {
      console.error(`Error fetching directory "${path}" from GitHub:`, fetchError);
      if (!loadedFromCache) {
        // Critical failure: no cache and network fetch failed
        renderBrowser(null, path);
      }
      // If loadedFromCache is true, we've already rendered stale data, which is fine.
    }
  } else if (loadedFromCache && !navigator.onLine) {
    console.log(`Offline, and directory "${path}" was successfully loaded from cache.`);
    // Already rendered from cache, nothing more to do.
  }
}

function navigateToParentDirectory(path) {
  if (!path) return;
  const parentPath = path.substring(0, path.lastIndexOf('/'));
  loadAndRenderPath(parentPath);
}

async function loadAndRenderFile(filePath) {
  const viewerDiv = document.getElementById('viewer');
  viewerDiv.innerHTML = '<p>Loading...</p>';
  const rawContentUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${DEFAULT_BRANCH}/${filePath}`;
  try {
    const response = await fetch(rawContentUrl);
    const statusIndicator = document.createElement('p');
    statusIndicator.classList.add('status-indicator');
    if (!response.ok) {
      try { const errorData = await response.json(); if (errorData && errorData.error) throw new Error(errorData.error); } catch (e) { /* ignored */ }
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const markdownContent = await response.text();
    viewerDiv.innerHTML = '';
    statusIndicator.textContent = navigator.onLine ? 'Status: Latest (Online)' : 'Status: Cached (Offline)';
    viewerDiv.appendChild(statusIndicator);
    const preElement = document.createElement('pre');
    preElement.textContent = markdownContent;
    viewerDiv.appendChild(preElement);
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy to Clipboard';
    copyButton.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(markdownContent); copyButton.textContent = 'Copied!'; } catch (err) { copyButton.textContent = 'Copy Failed!';}
        setTimeout(() => { copyButton.textContent = 'Copy to Clipboard'; }, 2000);
    });
    viewerDiv.appendChild(copyButton);
    addRecentlyViewed(filePath, extractFileName(filePath));

    // Plausible Analytics event
    if (window.plausible) {
      window.plausible('Prompt View', { props: { path: filePath } });
    }

  } catch (error) {
    console.error("Error loading file:", error);
    viewerDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    if (!navigator.onLine) viewerDiv.innerHTML += `<p>Offline. Content might not be cached.</p>`;
  }
}

// --- Service Worker and Caching Logic ---
async function fetchAllFilePaths(path = '') {
  let mdFilePaths = [];
  let items = null;
  let loadedFromCache = false;

  try {
    items = await getCachedDirectory(path);
    if (items) {
      loadedFromCache = true;
      console.log(`fetchAllFilePaths: Cache hit for directory "${path}".`);
    }
  } catch (cacheError) {
    console.error(`fetchAllFilePaths: Error loading directory "${path}" from cache:`, cacheError);
    // Proceed to network fetch even if cache read fails
  }

  if (!loadedFromCache || navigator.onLine) {
    if (loadedFromCache) {
      console.log(`fetchAllFilePaths: Online, attempting to refresh directory "${path}" from network.`);
    } else {
      console.log(`fetchAllFilePaths: Cache miss for "${path}", fetching from network.`);
    }

    try {
      const liveItems = await fetchFromGitHub(path);
      if (liveItems) {
        cacheDirectory(path, liveItems); // Non-blocking, fire-and-forget
        items = liveItems; // Use live items for subsequent processing
        console.log(`fetchAllFilePaths: Fetched and cached directory "${path}" from network.`);
      } else {
        if (!loadedFromCache) {
          console.warn(`fetchAllFilePaths: Could not fetch ${path} from network and not in cache. Skipping.`);
          return mdFilePaths; // Return what we have so far
        }
        // If loadedFromCache is true, 'items' still holds the cached version, which we'll use.
        console.warn(`fetchAllFilePaths: Failed to refresh ${path} from network, using stale cache data.`);
      }
    } catch (fetchError) {
      console.error(`fetchAllFilePaths: Error fetching directory "${path}" from GitHub:`, fetchError);
      if (!loadedFromCache) {
        console.warn(`fetchAllFilePaths: Critical failure for ${path} (no cache, network error). Skipping.`);
        return mdFilePaths; // Return what we have so far
      }
      // If loadedFromCache is true, 'items' still holds the cached version.
    }
  } else if (loadedFromCache && !navigator.onLine) {
    console.log(`fetchAllFilePaths: Offline, using cached directory "${path}".`);
    // 'items' is already populated from cache
  }

  if (!items) {
    console.warn(`fetchAllFilePaths: No items found for path "${path}" after cache/network attempts. Skipping.`);
    return mdFilePaths;
  }

  for (const item of items) {
    if (item.type === 'file' && item.name.endsWith('.md')) {
      mdFilePaths.push(item.path);
    } else if (item.type === 'dir') {
      // Ensure recursive calls are awaited
      mdFilePaths = mdFilePaths.concat(await fetchAllFilePaths(item.path));
    }
  }
  return mdFilePaths;
}

async function triggerPromptCaching(isManualRefresh = false) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    if (isManualRefresh) updateRefreshButtonState(true, "Fetching file list...");
    else console.log('Auto-caching: Fetching all .md file paths...');

    try {
      const allMdFilePaths = await fetchAllFilePaths();
      if (allMdFilePaths && allMdFilePaths.length > 0) {
        if (isManualRefresh) updateRefreshButtonState(true, `Caching ${allMdFilePaths.length} prompts...`);
        else console.log(`Found ${allMdFilePaths.length} markdown files. Requesting SW to cache them.`);

        navigator.serviceWorker.controller.postMessage({
          action: 'cacheAllPrompts',
          filePaths: allMdFilePaths,
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          branch: DEFAULT_BRANCH,
          clientId: currentClientId // Send client ID
        });
      } else {
        console.log('No markdown files found to cache or API fetch failed.');
        if (isManualRefresh) updateRefreshButtonState(false, "No files found. Refresh.");
      }
    } catch (error) {
      console.error('Error fetching all file paths for caching:', error);
      if (isManualRefresh) updateRefreshButtonState(false, "Error. Refresh.");
    }
  } else {
    console.log('Service worker not active. Cannot trigger prompt caching.');
    if (isManualRefresh) updateRefreshButtonState(false, "SW Error. Refresh.");
  }
}

async function handleManualRefresh() {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
        updateRefreshButtonState(false, "SW not ready. Refresh.");
        console.warn("Manual refresh: Service worker not ready.");
        return;
    }
    updateRefreshButtonState(true, "Clearing cache...");

    try {
        await clearCachedDirectories();
        console.log("Directory cache cleared as part of manual refresh.");
    } catch (error) {
        console.error("Failed to clear directory cache during manual refresh:", error);
        // Optionally, update UI or decide if to proceed with SW cache clearing
        // For now, we'll proceed with SW cache clearing even if DB clear fails.
    }

    navigator.serviceWorker.controller.postMessage({ action: 'clearPromptCache', clientId: currentClientId });
    // The rest of the process (triggerPromptCaching) will be handled when 'PROMPT_CACHE_CLEARED' is received.
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  initDB(); // Initialize IndexedDB
  console.log("app.js loaded");
  renderRecentlyViewed();

  const refreshButton = document.getElementById('refresh-button');
  if (refreshButton) {
      refreshButton.addEventListener('click', handleManualRefresh);
  }

  await loadAndRenderPath();

  if ('serviceWorker' in navigator) {
    // Get our client ID
    if (typeof navigator.serviceWorker.controller?.postMessage === 'function') {
        // A more robust way to get client ID is to ask the SW.
        // For now, if a SW is active, we assume it can receive messages.
        // This is simplified; a proper handshake might be needed if SW isn't active yet.
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registration successful:', registration.scope);

          // Attempt to get client ID once SW is ready
          if (registration.active) { // If a SW is active
            // This is a common way to get a client ID.
            // However, this client ID is for the service worker global scope, not this specific window client.
            // A better way is `self.clients.get(event.clientId)` within the SW,
            // or `navigator.serviceWorker.controller.postMessage` and have SW reply with `event.source.id`.
            // For this exercise, we'll rely on event.source in SW or pass a generated ID.
            // Let's try to get a client ID for this window.
            // This is not standard: navigator.serviceWorker.controller.id refers to the SW thread.
            // We need the ID of *this* client. A common way is to send a message to SW and have it echo back event.source.id
          }

          if (navigator.serviceWorker.controller) {
            triggerPromptCaching(); // Initial cache trigger
          }
          navigator.serviceWorker.oncontrollerchange = () => {
            console.log('SW controller changed. New SW activated.');
            triggerPromptCaching(); // Re-trigger caching with new SW
          };
        })
        .catch(error => { console.log('SW registration failed:', error); });

      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type) {
          console.log('App.js: Received message from SW:', event.data.type);
          if (event.data.type === 'CACHE_ALL_PROMPTS_COMPLETE') {
            updateRefreshButtonState(false, "Refresh Complete!");
            setTimeout(() => updateRefreshButtonState(false, "Refresh Prompts"), 2000);
          } else if (event.data.type === 'PROMPT_CACHE_CLEARED') {
            updateRefreshButtonState(true, "Cache cleared. Fetching...");
            triggerPromptCaching(true); // Now trigger caching *after* cache is confirmed cleared
          } else if (event.data.type === 'PROMPT_CACHE_CLEAR_FAILED') {
            console.error('App.js: SW failed to clear prompt cache.', event.data.error);
            updateRefreshButtonState(false, "Cache Clear Failed. Refresh.");
          }
        }
      });
    });
  }
});
