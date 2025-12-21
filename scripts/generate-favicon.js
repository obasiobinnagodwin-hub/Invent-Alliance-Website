/**
 * Favicon Generation Script
 * 
 * This script helps generate favicons from the Invent Alliance logo.
 * 
 * Prerequisites:
 * - Node.js installed
 * - sharp package: npm install sharp
 * 
 * Usage:
 * 1. Download the logo: https://www.inventallianceco.com/wp-content/uploads/2018/01/invent_mainx1.png
 * 2. Save it as 'logo.png' in the project root
 * 3. Run: node scripts/generate-favicon.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

const logoPath = path.join(__dirname, '..', 'logo.png');
const publicDir = path.join(__dirname, '..', 'public');

async function generateFavicons() {
  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo file not found!');
    console.log('Please download the logo from:');
    console.log('https://www.inventallianceco.com/wp-content/uploads/2018/01/invent_mainx1.png');
    console.log('And save it as "logo.png" in the project root.');
    process.exit(1);
  }

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('🔄 Generating favicons...');

  try {
    // Generate PNG favicons
    for (const { name, size } of sizes) {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(path.join(publicDir, name));
      console.log(`✅ Generated ${name}`);
    }

    // Generate favicon.ico (using 32x32 as base)
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFormat('ico')
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('✅ Generated favicon.ico');

    // Generate site.webmanifest
    const manifest = {
      name: 'Invent Alliance Limited',
      short_name: 'Invent Alliance',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone'
    };

    fs.writeFileSync(
      path.join(publicDir, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('✅ Generated site.webmanifest');

    console.log('\n✨ All favicons generated successfully!');
    console.log('📁 Files are in the public/ directory');
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();

