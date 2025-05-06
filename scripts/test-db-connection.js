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
 
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Accept self-signed certificates
    },
    connectionTimeoutMillis: 15000, // 15 seconds timeout
  });

  try {
    await client.connect();
    
    // Test a simple query
    const res = await client.query('SELECT NOW() as current_time');
    
    await client.end();
    return true;
  } catch (err) {
    
    // Additional connection diagnostics
    try {
      const dbUrl = new URL(connectionString);
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
    await testConnection(directConnectionString, 'Direct Connection');
  }
  
  process.exit(0);
}

runTests(); 