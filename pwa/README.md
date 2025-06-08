# Prompt Viewer PWA

This folder contains a simple Progressive Web App for browsing and copying prompts stored in a GitHub repository.

## Development

Open `index.html` in a browser to run locally. A service worker caches the core assets for offline use. Icons are embedded directly in `manifest.json` using base64 data URIs so no binary image files are necessary.

## Deployment to GitHub Pages

1. Push the `pwa` folder to the `main` branch of your repository.
2. In the repository settings, enable **GitHub Pages** and choose the `main` branch with `/pwa` as the root.
3. GitHub Pages will serve the app at `https://<username>.github.io/<repo>/`.

After enabling Pages, any updates pushed to the `pwa` folder on the main branch will automatically redeploy the site.
