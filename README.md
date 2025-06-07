# Prompt Viewer PWA

A simple, offline-capable Progressive Web App for browsing and copying prompts from a GitHub repository.

## Features

- 📱 **PWA Support** - Install as a standalone app on mobile/desktop
- 🔍 **Browse Prompts** - Navigate folder structure mirroring your GitHub repo
- 📋 **Copy to Clipboard** - One-click copy for any prompt
- 🌐 **Offline Mode** - Access all cached prompts without internet
- 🌓 **Dark/Light Mode** - Follows system preferences automatically
- 📊 **Analytics** - Optional Plausible integration for usage tracking
- 🕒 **Recently Viewed** - Quick access to your recent prompts

## Quick Start

1. **Configure** - Update `app.js` with your GitHub repo details:
   ```javascript
   const CONFIG = {
       GITHUB_OWNER: 'your-username',
       GITHUB_REPO: 'your-prompts-repo',
       GITHUB_BRANCH: 'main'
   };
   ```

2. **Add Icons** - Create an `icons/` folder with PWA icons (see deployment.md)

3. **Deploy** - Push to GitHub and enable GitHub Pages

4. **Access** - Visit `https://your-username.github.io/your-repo-name/`

## Project Structure

```
prompt-viewer-pwa/
├── index.html          # Main HTML file
├── style.css           # Styles with dark/light mode
├── app.js              # Core application logic
├── service-worker.js   # Offline caching logic
├── manifest.json       # PWA manifest
├── deployment.md       # Deployment instructions
├── project-brief.md    # Detailed project specifications
└── icons/              # PWA icons (create this)
```

## Configuration

### Required Changes
- Update GitHub owner/repo in `app.js`
- Update Plausible domain in `index.html` (or remove)
- Create icon files in various sizes

### Optional Changes
- Customize colors in `style.css`
- Modify cache strategy in `service-worker.js`
- Update app name/description in `manifest.json`

## Browser Support

- ✅ Chrome/Edge (Android)
- ✅ Safari (iOS)
- ✅ Firefox
- ✅ Desktop browsers with PWA support

## Offline Behavior

The app caches:
- All viewed prompts automatically
- App assets (HTML, CSS, JS)
- GitHub API responses

When offline, the app shows the last cached version seamlessly.

## Development

No build process required! This is vanilla HTML/CSS/JavaScript.

To test locally:
1. Use a local web server (e.g., `python -m http.server`)
2. Update the service worker cache version when making changes
3. Test offline mode using browser DevTools

## License

This project is open source. Feel free to modify and use for your own prompt libraries.

## Contributing

Issues and pull requests are welcome! Please check the project brief for design decisions and constraints.
