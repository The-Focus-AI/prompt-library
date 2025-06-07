# Project Brief: Prompt Viewer PWA

## Project Goal
A simple, standalone Progressive Web App (PWA) to browse and copy prompts from a prompt library stored in Markdown files on a GitHub repo. The app will cache all prompts for offline use and include a "recently viewed" list.

---

## Core Features

### ✅ Browse Prompts
- Display a simple file/folder browser that mirrors the repo structure.
- Allow easy navigation of folders and Markdown files.
- Maintain a "recently viewed" list.

### ✅ View Prompts
- Display raw Markdown or basic rendered view (whichever is simplest).
- Show full prompt content in a readable view.

### ✅ Copy to Clipboard
- Provide a "Copy to Clipboard" button for each prompt (copies the entire prompt).

### ✅ Offline Functionality
- Cache all prompts (not just viewed ones) for offline access.
- Show last cached version if offline or if updates can't be fetched.

### ✅ Manual Refresh
- Allow the user to pull the latest prompts from the default branch (main) via a manual refresh action.

### ✅ Light/Dark Mode
- Follow the system's light/dark mode automatically.

### ✅ Analytics
- Integrate Plausible for lightweight usage tracking (e.g., prompt views).

### ✅ PWA Installation
- Support "Add to Home Screen" behavior with icon and splash screen.
- Provide offline fallback for core functionality.

### ✅ Cross-Platform
- Works on both Android and iOS (primary testing focus on Android).

### ✅ No User Authentication
- No GitHub or personal logins—completely open access.

### ✅ Deployment
- Deploy as a static site via GitHub Pages (using the default domain initially).
- No additional hosting or backend services.

---

## Tech Stack & Architecture

### ✅ HTML, CSS, and JavaScript only
- Keep the stack as simple as possible—no frameworks (like Next.js, React, Vue).
- Use vanilla JavaScript for data fetching and DOM manipulation.

### ✅ PWA Features
- Use a service worker to cache all prompt content and offline assets.
- Configure manifest (manifest.json) for standalone install.

### ✅ Fetching Prompts
- Fetch raw Markdown files directly from the GitHub repo's raw URLs (e.g., `https://raw.githubusercontent.com/username/repo/main/path/to/file.md`).
- Use the GitHub API or plain HTTP fetch if needed to enumerate folder contents.

### ✅ Prompt Caching
- On manual refresh, download all prompts and store them in IndexedDB or Cache Storage.
- On offline access, read from the cache without showing errors.

### ✅ Error Handling
- If updates can't be fetched (offline, repo down), show last cached content seamlessly—no user-facing errors.
- Indicate whether the view is "cached" or "latest."

---

## Testing Plan

### ✅ Core Testing Areas
1. **Browsing** – Verify folder and file structure is accurately reflected.
2. **Prompt Viewing** – Ensure prompt content renders correctly in Markdown or raw text.
3. **Copy Function** – Validate clipboard copying works on all major browsers (mobile + desktop).
4. **Offline Behavior** – Test offline usage by simulating network loss.
5. **PWA Install** – Verify "Add to Home Screen" works on Android and iOS Safari.
6. **Plausible Analytics** – Validate tracking is recording page views (no personal data).
7. **Manual Refresh** – Confirm updates pull fresh content when online.

### ✅ Target Platforms
- **Android**: Primary test device.
- **iOS**: Safari testing for install and offline.
- **Desktop Browsers**: Optional, but ensure PWA features work on Chrome/Edge.

---

## Additional Notes
- Initial deployment on default GitHub Pages domain (no custom domain for now).
- No user-facing settings beyond system-based dark/light.
- No export features—copy-to-clipboard only.
- Analytics via Plausible's simple script.
- Focus on the simplest possible implementation—no external frameworks or complex build pipelines.

---

## Next Steps

Would you like me to draft any of the following next steps?

- ✅ Basic HTML/CSS/JS boilerplate structure
- ✅ Example service worker for offline caching
- ✅ Deployment steps for GitHub Pages
- ✅ Anything else?

Let me know if you'd like these included or if we're done here! 🚀