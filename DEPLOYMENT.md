# GitHub Pages Deployment Guide

## Quick Setup

1. **Enable GitHub Pages in Repository Settings**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **"GitHub Actions"**

2. **Push Your Code**:
   - Push your code to the `main` or `master` branch
   - The GitHub Action will automatically build and deploy

3. **Wait for Deployment**:
   - Check the **Actions** tab in your repository
   - Wait for the workflow to complete (usually 2-3 minutes)

## How It Works

- The GitHub Action builds your Next.js app as a static export
- Files are generated in the `out/` directory
- The workflow deploys these files to GitHub Pages
- A `404.html` file is included to handle client-side routing
- A `.nojekyll` file prevents Jekyll from processing the site

## Important Notes

### Client-Side Routing
Since GitHub Pages serves static files, all routes are handled client-side:
- The app uses `localStorage` for data, so all releases are managed in the browser
- Dynamic routes like `/review/[releaseId]` work through client-side routing
- If you create a new release, the review link will work even if it wasn't pre-generated at build time

### Custom Domain (Optional)
If deploying to a subdirectory (e.g., `https://username.github.io/repo-name`):

1. Update `next.config.ts`:
   ```typescript
   basePath: "/repo-name",
   trailingSlash: true,
   ```

2. Update the GitHub Actions workflow to reflect the basePath

## Troubleshooting

### Still Seeing README?
- Wait a few minutes for GitHub Pages to update
- Clear your browser cache
- Check that the GitHub Action completed successfully
- Verify that `out/index.html` exists in the repository (it should be in the GitHub Actions artifact)

### Routes Not Working?
- The `404.html` file handles client-side routing
- Make sure it's in the `out/` directory after build
- Check browser console for any JavaScript errors

### Build Failures?
- Ensure all dependencies are installed (`npm install`)
- Check that `npm run build` succeeds locally
- Review the GitHub Actions logs for specific errors

