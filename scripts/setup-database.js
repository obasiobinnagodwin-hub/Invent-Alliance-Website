#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script helps set up the PostgreSQL database for the IAL Analytics Dashboard.
 * It can create the database, run migrations, and seed test data.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function getEnvVar(name, defaultValue) {
  return process.env[name] || defaultValue;
}

async function main() {
  console.log('🚀 IAL Analytics Database Setup\n');

  const dbHost = getEnvVar('DB_HOST', 'localhost');
  const dbPort = getEnvVar('DB_PORT', '5432');
  const dbName = getEnvVar('DB_NAME', 'ial_analytics');
  const dbUser = getEnvVar('DB_USER', 'postgres');
  const dbPassword = getEnvVar('DB_PASSWORD', '');

  console.log('Database Configuration:');
  console.log(`  Host: ${dbHost}`);
  console.log(`  Port: ${dbPort}`);
  console.log(`  Database: ${dbName}`);
  console.log(`  User: ${dbUser}\n`);

  // Check if psql is available
  try {
    execSync('psql --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Error: psql command not found. Please install PostgreSQL client tools.');
    process.exit(1);
  }

  // Set PGPASSWORD environment variable
  if (dbPassword) {
    process.env.PGPASSWORD = dbPassword;
  }

  const action = await question('What would you like to do?\n  1. Run schema migration\n  2. Seed test data\n  3. Both\n  4. Exit\n\nEnter choice (1-4): ');

  if (action === '4') {
    console.log('Exiting...');
    rl.close();
    return;
  }

  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');

  try {
    if (action === '1' || action === '3') {
      console.log('\n📋 Running schema migration...');
      if (!fs.existsSync(schemaPath)) {
        console.error(`❌ Error: Schema file not found at ${schemaPath}`);
        process.exit(1);
      }

      const schemaCmd = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${schemaPath}"`;
      execSync(schemaCmd, { stdio: 'inherit' });
      console.log('✅ Schema migration completed!\n');
    }

    if (action === '2' || action === '3') {
      const confirmSeed = await question('\n⚠️  This will insert test data. Continue? (y/n): ');
      if (confirmSeed.toLowerCase() === 'y') {
        console.log('\n🌱 Seeding test data...');
        if (!fs.existsSync(seedPath)) {
          console.error(`❌ Error: Seed file not found at ${seedPath}`);
          process.exit(1);
        }

        const seedCmd = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${seedPath}"`;
        execSync(seedCmd, { stdio: 'inherit' });
        console.log('✅ Test data seeded!\n');
      }
    }

    console.log('✨ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Update your .env.local with database credentials');
    console.log('  2. Generate a proper password hash for the admin user');
    console.log('  3. Start your Next.js application: npm run dev');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Ensure PostgreSQL is running');
    console.error('  2. Verify database credentials in .env.local');
    console.error('  3. Check that the database exists: CREATE DATABASE ial_analytics;');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);

