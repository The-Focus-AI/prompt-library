// Configuration
const CONFIG = {
    GITHUB_OWNER: 'your-username', // Replace with your GitHub username
    GITHUB_REPO: 'your-repo-name', // Replace with your repo name
    GITHUB_BRANCH: 'main',
    DB_NAME: 'promptViewerDB',
    DB_VERSION: 1,
    STORE_NAME: 'prompts',
    RECENT_STORE: 'recentlyViewed',
    MAX_RECENT: 10
};

// Application State
const state = {
    currentPath: '',
    isOffline: false,
    db: null,
    recentlyViewed: []
};

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await loadRecentlyViewed();
    setupEventListeners();
    checkOnlineStatus();
    await loadContent();
});

// IndexedDB Setup
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            state.db = request.result;
            resolve();
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains(CONFIG.STORE_NAME)) {
                db.createObjectStore(CONFIG.STORE_NAME, { keyPath: 'path' });
            }
            
            if (!db.objectStoreNames.contains(CONFIG.RECENT_STORE)) {
                const recentStore = db.createObjectStore(CONFIG.RECENT_STORE, { keyPath: 'path' });
                recentStore.createIndex('timestamp', 'timestamp');
            }
        };
    });
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('refresh-btn').addEventListener('click', refreshContent);
    document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
    
    window.addEventListener('online', () => updateOnlineStatus(true));
    window.addEventListener('offline', () => updateOnlineStatus(false));
}

// Online/Offline Status
function checkOnlineStatus() {
    state.isOffline = !navigator.onLine;
    updateOnlineStatus(navigator.onLine);
}

function updateOnlineStatus(isOnline) {
    state.isOffline = !isOnline;
    showStatus(isOnline ? 'Back online' : 'Offline mode', isOnline ? 'online' : 'offline');
}

// Content Loading
async function loadContent(path = '') {
    state.currentPath = path;
    updateBreadcrumb(path);
    
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        let content;
        if (state.isOffline) {
            content = await loadFromCache(path);
        } else {
            content = await fetchFromGitHub(path);
            await saveToCache(path, content);
        }
        
        if (path && path.endsWith('.md')) {
            showPrompt(content);
        } else {
            showFileList(content);
        }
    } catch (error) {
        console.error('Error loading content:', error);
        fileList.innerHTML = '<div class="error">Failed to load content</div>';
        showStatus('Failed to load content', 'error');
    }
}

// GitHub API Integration
async function fetchFromGitHub(path = '') {
    // For .md files, use raw content URL
    // For directories (including root), use GitHub API
    const url = path && path.endsWith('.md')
        ? `https://raw.githubusercontent.com/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${path}`
        : `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${path}?ref=${CONFIG.GITHUB_BRANCH}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch from GitHub');
    
    if (path && path.endsWith('.md')) {
        return await response.text();
    } else {
        return await response.json();
    }
}

// Cache Management
async function saveToCache(path, content) {
    const transaction = state.db.transaction([CONFIG.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(CONFIG.STORE_NAME);
    
    await store.put({
        path: path || 'root',
        content: content,
        timestamp: Date.now()
    });
}

async function loadFromCache(path) {
    const transaction = state.db.transaction([CONFIG.STORE_NAME], 'readonly');
    const store = transaction.objectStore(CONFIG.STORE_NAME);
    
    return new Promise((resolve, reject) => {
        const request = store.get(path || 'root');
        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result.content);
            } else {
                reject(new Error('Not found in cache'));
            }
        };
        request.onerror = () => reject(request.error);
    });
}

// UI Updates
function showFileList(items) {
    const browserSection = document.getElementById('browser-section');
    const viewerSection = document.getElementById('viewer-section');
    const fileList = document.getElementById('file-list');
    
    browserSection.classList.remove('hidden');
    viewerSection.classList.add('hidden');
    
    fileList.innerHTML = '';
    
    // Sort items: folders first, then files
    const sorted = items.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
    });
    
    sorted.forEach(item => {
        const element = document.createElement('div');
        element.className = item.type === 'dir' ? 'folder-item' : 'file-item';
        element.textContent = item.name;
        element.addEventListener('click', () => loadContent(item.path));
        fileList.appendChild(element);
    });
}

function showPrompt(content) {
    const browserSection = document.getElementById('browser-section');
    const viewerSection = document.getElementById('viewer-section');
    const promptContent = document.getElementById('prompt-content');
    
    browserSection.classList.add('hidden');
    viewerSection.classList.remove('hidden');
    
    promptContent.textContent = content;
    
    // Add to recently viewed
    addToRecentlyViewed(state.currentPath);
    
    // Track view with Plausible
    if (window.plausible) {
        window.plausible('pageview', { props: { prompt: state.currentPath } });
    }
}

function updateBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';
    
    const parts = ['Home', ...path.split('/').filter(Boolean)];
    const paths = [''];
    
    for (let i = 1; i < parts.length; i++) {
        paths.push(paths[i - 1] + (paths[i - 1] ? '/' : '') + parts[i]);
    }
    
    parts.forEach((part, index) => {
        const span = document.createElement('span');
        span.className = 'breadcrumb-item';
        span.textContent = part;
        span.dataset.path = paths[index];
        span.addEventListener('click', () => loadContent(paths[index]));
        breadcrumb.appendChild(span);
    });
}

// Recently Viewed
async function addToRecentlyViewed(path) {
    const transaction = state.db.transaction([CONFIG.RECENT_STORE], 'readwrite');
    const store = transaction.objectStore(CONFIG.RECENT_STORE);
    
    await store.put({
        path: path,
        name: path.split('/').pop(),
        timestamp: Date.now()
    });
    
    await loadRecentlyViewed();
}

async function loadRecentlyViewed() {
    const transaction = state.db.transaction([CONFIG.RECENT_STORE], 'readonly');
    const store = transaction.objectStore(CONFIG.RECENT_STORE);
    const index = store.index('timestamp');
    
    const items = [];
    const request = index.openCursor(null, 'prev');
    
    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && items.length < CONFIG.MAX_RECENT) {
            items.push(cursor.value);
            cursor.continue();
        } else {
            updateRecentlyViewedUI(items);
        }
    };
}

function updateRecentlyViewedUI(items) {
    const recentSection = document.getElementById('recent-section');
    const recentList = document.getElementById('recent-list');
    
    if (items.length === 0) {
        recentSection.classList.add('hidden');
        return;
    }
    
    recentSection.classList.remove('hidden');
    recentList.innerHTML = '';
    
    items.forEach(item => {
        const element = document.createElement('div');
        element.className = 'file-item';
        element.textContent = item.name;
        element.addEventListener('click', () => loadContent(item.path));
        recentList.appendChild(element);
    });
}

// Utility Functions
async function refreshContent() {
    if (state.isOffline) {
        showStatus('Cannot refresh while offline', 'error');
        return;
    }
    
    showStatus('Refreshing content...', 'info');
    
    try {
        // For a full refresh, you would recursively fetch all files
        // This is a simplified version that refreshes current view
        await loadContent(state.currentPath);
        showStatus('Content refreshed', 'online');
    } catch (error) {
        showStatus('Failed to refresh', 'error');
    }
}

async function copyToClipboard() {
    const content = document.getElementById('prompt-content').textContent;
    
    try {
        await navigator.clipboard.writeText(content);
        showStatus('Copied to clipboard!', 'online');
    } catch (error) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showStatus('Copied to clipboard!', 'online');
    }
}

function showStatus(message, type = 'info') {
    const indicator = document.getElementById('status-indicator');
    indicator.textContent = message;
    indicator.className = `status-indicator show ${type}`;
    
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 3000);
}