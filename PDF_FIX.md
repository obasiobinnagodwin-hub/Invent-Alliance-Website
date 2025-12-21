# PDF Download Fix

## Problem
PDFKit is trying to load font files (`Helvetica.afm`) from a path that doesn't exist in Next.js's bundled environment, causing `ENOENT` errors.

## Solution Applied

1. **Dynamic Import**: Changed to dynamic import of PDFKit to avoid font loading during module initialization
2. **Webpack Configuration**: Updated `next.config.ts` to handle PDFKit font files properly
3. **Font Path Configuration**: Added code to configure PDFKit's font path at runtime

## Steps to Fix

1. **Stop your dev server** (Ctrl+C)

2. **Clear cache and rebuild**:
   ```bash
   npm run clean
   npm run dev
   ```

3. **If the error persists**, try:
   ```bash
   # Remove node_modules and reinstall
   Remove-Item -Recurse -Force node_modules
   npm install
   npm run dev
   ```

## Alternative Solution

If the above doesn't work, you can temporarily disable PDF downloads or use CSV exports instead. The PDF functionality will work once the font files are properly configured.

## Technical Details

PDFKit requires font metric files (`.afm`) to render text. In Next.js's bundled/serverless environment, these files need to be:
1. Included in the webpack bundle
2. Accessible at runtime
3. Properly configured in PDFKit's font path

The webpack configuration now handles copying these font files to the output directory.

## Verification

After restarting, try downloading a PDF report. If you still see errors, check:
1. Server console for specific error messages
2. Browser console for client-side errors
3. Verify `.next` directory contains font files after build

