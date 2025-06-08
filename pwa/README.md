# Prompt Viewer PWA

A Progressive Web App for browsing and copying prompts from the prompt library on mobile devices.

## Quick Start

1. The app is already configured for the `The-Focus-AI/prompt-library` repository
2. Create icon files in the `icons/` directory (see `generate-icons.md`)
3. Deploy via GitHub Pages

## Files

- `index.html` - Main app HTML
- `app.js` - Application logic with GitHub integration
- `style.css` - Responsive styles with dark/light mode
- `service-worker.js` - Offline caching
- `manifest.json` - PWA configuration
- `deployment.md` - Deployment instructions
- `generate-icons.md` - Icon generation guide
- `project-brief.md` - Original project specifications

## Access

Once deployed, the PWA will be available at:
```
https://the-focus-ai.github.io/prompt-library/pwa/
```

## Features

- Browse GitHub repository structure
- View and copy markdown prompts
- Works offline after initial cache
- Install as mobile app
- Recently viewed prompts
- Auto dark/light mode