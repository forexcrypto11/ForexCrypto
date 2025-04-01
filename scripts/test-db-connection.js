// Test Database Connection Script
const { Client } = require('pg');
require('dotenv').config();

const poolerConnectionString = process.env.DATABASE_URL;
const directConnectionString = process.env.DIRECT_URL;

if (!poolerConnectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function testConnection(connectionString, label) {
  console.log(`\nAttempting to connect to database using ${label}...`);
  console.log(`Connection string: ${connectionString.replace(/:[^:]*@/, ':***@')}`);
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Accept self-signed certificates
    },
    connectionTimeoutMillis: 15000, // 15 seconds timeout
  });

  try {
    await client.connect();
    console.log(`✅ Successfully connected to database using ${label}!`);
    
    // Test a simple query
    const res = await client.query('SELECT NOW() as current_time');
    console.log(`Current database time: ${res.rows[0].current_time}`);
    
    await client.end();
    return true;
  } catch (err) {
    console.error(`❌ Failed to connect to database using ${label}:`, err.message);
    
    // Additional connection diagnostics
    try {
      console.log('\nTrying to diagnose the issue:');
      const dbUrl = new URL(connectionString);
      console.log(`Host: ${dbUrl.hostname}`);
      console.log(`Port: ${dbUrl.port}`);
      console.log(`Database: ${dbUrl.pathname.substring(1)}`);
      console.log(`Username: ${dbUrl.username}`);
      console.log(`SSL Mode: ${dbUrl.searchParams.get('sslmode') || 'Not specified'}`);
    } catch (parseErr) {
      console.error('Could not parse connection URL:', parseErr.message);
    }
    
    return false;
  }
}

async function runTests() {
  // Test Pooler connection first
  const poolerResult = await testConnection(poolerConnectionString, 'Pooler Connection');
  
  // If Pooler fails, try the direct connection
  if (!poolerResult && directConnectionString) {
    console.log('\n--- Pooler connection failed, trying direct connection ---');
    await testConnection(directConnectionString, 'Direct Connection');
  }
  
  process.exit(0);
}

runTests(); 