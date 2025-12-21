#!/usr/bin/env node

/**
 * Setup PDFKit fonts for Next.js
 * Copies font files to where PDFKit expects them in the Next.js build
 */

const fs = require('fs');
const path = require('path');

function setupPDFKitFonts() {
  try {
    // Find PDFKit installation
    // require.resolve('pdfkit') resolves to a JS file, not the package root
    const pdfkitPath = require.resolve('pdfkit');
    let pdfkitDir = path.dirname(pdfkitPath);
    
    // If we're in the js/ directory, go up to the package root
    if (path.basename(pdfkitDir) === 'js') {
      pdfkitDir = path.dirname(pdfkitDir);
    }
    
    const fontSourceDir = path.join(pdfkitDir, 'js', 'data');
    
    // Check if source font directory exists
    if (!fs.existsSync(fontSourceDir)) {
      console.log('PDFKit font directory not found at:', fontSourceDir);
      console.log('PDFKit should use embedded fonts by default.');
      return;
    }
    
    // Create target directory in .next if it doesn't exist
    const nextDir = path.join(process.cwd(), '.next');
    const targetDir = path.join(nextDir, 'server', 'vendor-chunks', 'data');
    
    // Only copy if .next directory exists (after build)
    if (fs.existsSync(nextDir)) {
      // Create target directory structure
      fs.mkdirSync(targetDir, { recursive: true });
      
      // Copy font files
      const fontFiles = fs.readdirSync(fontSourceDir).filter(f => f.endsWith('.afm'));
      
      if (fontFiles.length > 0) {
        console.log(`Copying ${fontFiles.length} font files...`);
        fontFiles.forEach(file => {
          const source = path.join(fontSourceDir, file);
          const target = path.join(targetDir, file);
          fs.copyFileSync(source, target);
          console.log(`  ✓ ${file}`);
        });
        console.log('PDFKit fonts setup complete!');
      } else {
        console.log('No font files found in PDFKit directory.');
      }
    } else {
      console.log('.next directory not found. Run "npm run build" or "npm run dev" first.');
    }
  } catch (error) {
    console.error('Error setting up PDFKit fonts:', error.message);
    console.log('PDFKit should still work with embedded fonts.');
  }
}

setupPDFKitFonts();

