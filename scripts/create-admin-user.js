#!/usr/bin/env node

/**
 * Script to create admin user in database
 * Usage: node scripts/create-admin-user.js [username] [password]
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Support both DATABASE_URL (Railway) and individual variables
let poolConfig;
if (process.env.DATABASE_URL) {
  // Use DATABASE_URL connection string (Railway-compatible)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  };
} else {
  // Use individual environment variables
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'ial_analytics',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(poolConfig);

async function createAdminUser(username = 'admin', password = 'admin123') {
  try {
    console.log(`Creating admin user: ${username}`);
    
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hash generated');
    
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, email, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) 
       DO UPDATE SET 
         password_hash = EXCLUDED.password_hash,
         is_active = EXCLUDED.is_active
       RETURNING id, username, email, role`,
      [username, passwordHash, `${username}@inventallianceco.com`, 'admin', true]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin user created/updated successfully!');
      console.log('User details:', result.rows[0]);
      console.log(`\nCredentials:`);
      console.log(`  Username: ${username}`);
      console.log(`  Password: ${password}`);
    } else {
      console.log('❌ Failed to create user');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running and check your database configuration.');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'admin123';

createAdminUser(username, password);

