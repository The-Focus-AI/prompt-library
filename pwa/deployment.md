# Deployment Guide for GitHub Pages

This guide explains how to deploy the Prompt Viewer PWA to GitHub Pages from the `pwa` subdirectory.

## Prerequisites

1. A GitHub account
2. Your prompt library repository on GitHub with markdown files
3. The PWA code in the `pwa/` directory

## Step 1: Configure the App

1. Open `pwa/app.js` and verify the configuration:
   ```javascript
   const CONFIG = {
       GITHUB_OWNER: 'The-Focus-AI',    // Your GitHub username
       GITHUB_REPO: 'prompt-library',    // Your prompts repository name
       GITHUB_BRANCH: 'main',            // Branch containing prompts
       // ... rest of config
   };
   ```

2. The Plausible analytics domain in `pwa/index.html` is already configured:
   ```html
   <script defer data-domain="the-focus-ai.github.io" src="https://plausible.io/js/script.js"></script>
   ```
   Or remove this line if you don't want analytics.

## Step 2: Create Icons

You'll need to create app icons for the PWA. Create an `icons` folder inside the `pwa` directory and add PNG icons in these sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

You can use a tool like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) or create them manually. See `generate-icons.md` for detailed instructions.

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub (https://github.com/The-Focus-AI/prompt-library)
2. Click on "Settings" → "Pages"
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

**Note**: GitHub Pages serves from the root, but your PWA files are in the `pwa/` subdirectory.

## Step 4: Update Service Worker Paths

Since the PWA is in a subdirectory, update the cache paths in `pwa/service-worker.js`:
```javascript
const urlsToCache = [
    '/prompt-library/pwa/',
    '/prompt-library/pwa/index.html',
    '/prompt-library/pwa/style.css',
    '/prompt-library/pwa/app.js',
    '/prompt-library/pwa/manifest.json'
];
```

## Step 5: Update Manifest Start URL

Update `pwa/manifest.json` to use the correct start URL:
```json
{
    "start_url": "/prompt-library/pwa/",
    // ... rest of manifest
}
```

## Step 6: Access Your PWA

After deployment, your PWA will be available at:
```
https://the-focus-ai.github.io/prompt-library/pwa/
```

## Step 7: Test PWA Features

1. **Installation**: Visit the site on mobile, you should see an "Add to Home Screen" prompt
2. **Offline Mode**: Install the PWA, turn on airplane mode, and verify it still works
3. **Copy Function**: Test copying prompts to clipboard
4. **Recently Viewed**: Check that recently viewed prompts appear

## Alternative: Deploy PWA to Root

If you prefer the PWA to be at the root URL, you can:

1. Move all files from `pwa/` to the root directory
2. Keep your prompt files in their subdirectories
3. The PWA will then be available at: `https://the-focus-ai.github.io/prompt-library/`

## Troubleshooting

### PWA Not Installing
- Ensure you're serving over HTTPS (GitHub Pages does this automatically)
- Check browser console for manifest errors
- Verify all icon files exist in `pwa/icons/`

### Paths Not Working
- Make sure all paths in service-worker.js include the repository name
- Update manifest.json start_url to include the full path

### Offline Not Working
- Clear browser cache and reinstall the PWA
- Check service worker registration in browser DevTools
- Ensure all assets are being cached with correct paths

## Updates

To update the PWA after deployment:
1. Make your changes locally
2. Increment the cache version in `pwa/service-worker.js`:
   ```javascript
   const CACHE_NAME = 'prompt-viewer-v2'; // increment version
   ```
3. Commit and push changes
4. Users will get the update next time they open the app