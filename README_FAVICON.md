# Favicon Setup Guide

## Quick Setup (Recommended)

The easiest way to generate favicons is using an online tool:

1. **Download the logo:**
   - Go to: https://www.inventallianceco.com/wp-content/uploads/2018/01/invent_mainx1.png
   - Save it to your computer

2. **Generate favicons online:**
   - Visit: https://realfavicongenerator.net/
   - Upload the logo image
   - Configure settings (optional):
     - iOS: Use the logo as-is
     - Android: Use the logo as-is
     - Windows: Use the logo as-is
   - Click "Generate your Favicons and HTML code"
   - Download the generated package

3. **Extract and place files:**
   - Extract the downloaded ZIP file
   - Copy all files to the `public/` directory in your project:
     - `favicon.ico`
     - `favicon-16x16.png`
     - `favicon-32x32.png`
     - `apple-touch-icon.png`
     - `android-chrome-192x192.png`
     - `android-chrome-512x512.png`
     - `site.webmanifest`

4. **Done!** The site will automatically use these favicons.

## Alternative: Using Scripts

### Node.js Script (requires sharp)
```bash
npm install sharp
# Download logo.png to project root
node scripts/generate-favicon.js
```

### Python Script (requires Pillow)
```bash
pip install Pillow
# Download logo.png to project root
python scripts/generate-favicon-python.py
```

## Files Created

The following favicon files should be in the `public/` directory:

- `favicon.ico` - Main favicon (16x16, 32x32, 48x48)
- `favicon-16x16.png` - Small favicon
- `favicon-32x32.png` - Standard favicon
- `apple-touch-icon.png` - iOS home screen icon (180x180)
- `android-chrome-192x192.png` - Android icon
- `android-chrome-512x512.png` - Android icon (high-res)
- `site.webmanifest` - Web app manifest

## Verification

After adding the files, restart your development server and check:
- Browser tab shows the favicon
- Mobile devices can add to home screen with the icon
- All sizes display correctly

