#!/usr/bin/env node

/**
 * Setup script to generate .env.local file with secure JWT_SECRET
 * Run: node scripts/setup-env.js
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Generate a secure 128-character hex JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

const envContent = `# JWT Secret for authentication token signing
# This is a cryptographically secure random 128-character hex string
# Generated on: ${new Date().toISOString()}
JWT_SECRET=${jwtSecret}

# Admin credentials (change these in production!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_TO_EMAIL=contact@inventallianceco.com
ACADEMY_TO_EMAIL=contact@inventallianceco.com,contact@patrickogbonna.com

# Site URL
NEXT_PUBLIC_SITE_URL=https://www.inventallianceco.com
`;

const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('Reading existing file...');
  const existing = fs.readFileSync(envPath, 'utf8');
  
  // Check if JWT_SECRET already exists
  if (existing.includes('JWT_SECRET=')) {
    console.log('✅ JWT_SECRET already exists in .env.local');
    console.log('\nTo update it, manually edit .env.local and replace the JWT_SECRET value with:');
    console.log(`JWT_SECRET=${jwtSecret}`);
  } else {
    // Append JWT_SECRET to existing file
    console.log('Adding JWT_SECRET to existing .env.local...');
    fs.appendFileSync(envPath, `\n\n# JWT Secret (generated on ${new Date().toISOString()})\nJWT_SECRET=${jwtSecret}\n`);
    console.log('✅ JWT_SECRET added to .env.local');
  }
} else {
  // Create new .env.local file
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Created .env.local with secure JWT_SECRET');
}

console.log('\n📝 Generated JWT_SECRET:');
console.log(jwtSecret);
console.log('\n⚠️  Keep this secret secure and never commit it to version control!');
console.log('✅ .env.local is already in .gitignore and will not be committed.');

