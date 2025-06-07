# Deployment Guide for GitHub Pages

This guide explains how to deploy the Prompt Viewer PWA to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Your prompt library repository on GitHub with markdown files
3. The PWA code (this repository)

## Step 1: Configure the App

1. Open `app.js` and update the configuration at the top:
   ```javascript
   const CONFIG = {
       GITHUB_OWNER: 'your-username',    // Your GitHub username
       GITHUB_REPO: 'your-repo-name',    // Your prompts repository name
       GITHUB_BRANCH: 'main',            // Branch containing prompts
       // ... rest of config
   };
   ```

2. Update the Plausible analytics domain in `index.html`:
   ```html
   <script defer data-domain="yourusername.github.io" src="https://plausible.io/js/script.js"></script>
   ```
   Or remove this line if you don't want analytics.

## Step 2: Create Icons

You'll need to create app icons for the PWA. Create an `icons` folder and add PNG icons in these sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

You can use a tool like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) or create them manually.

## Step 3: Push to GitHub

1. Create a new repository for your PWA (separate from your prompts repo)
2. Push all files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/prompt-viewer-pwa.git
   git push -u origin main
   ```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" → "Pages"
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

## Step 5: Access Your PWA

After a few minutes, your PWA will be available at:
```
https://YOUR-USERNAME.github.io/REPOSITORY-NAME/
```

## Step 6: Test PWA Features

1. **Installation**: Visit the site on mobile, you should see an "Add to Home Screen" prompt
2. **Offline Mode**: Install the PWA, turn on airplane mode, and verify it still works
3. **Copy Function**: Test copying prompts to clipboard
4. **Recently Viewed**: Check that recently viewed prompts appear

## Troubleshooting

### CORS Issues
If you encounter CORS errors when fetching from GitHub:
- Make sure you're using the correct raw.githubusercontent.com URLs
- Verify the repository is public

### PWA Not Installing
- Ensure you're serving over HTTPS (GitHub Pages does this automatically)
- Check browser console for manifest errors
- Verify all icon files exist

### Offline Not Working
- Clear browser cache and reinstall the PWA
- Check service worker registration in browser DevTools
- Ensure all assets are being cached properly

## Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file to your repository root with your domain
2. Configure DNS settings with your domain provider
3. Update the `start_url` in `manifest.json`

## Updates

To update the PWA after deployment:
1. Make your changes locally
2. Increment the cache version in `service-worker.js`:
   ```javascript
   const CACHE_NAME = 'prompt-viewer-v2'; // increment version
   ```
3. Commit and push changes
4. Users will get the update next time they open the app