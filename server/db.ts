import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Configure to handle SSL certificate issues in development
if (process.env.NODE_ENV === 'development') {
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineConnect = false;
}

let pool: Pool | null = null;
let db: any = null;
let isDbHealthy = false;

// Test database health
async function testDatabaseConnection(): Promise<boolean> {
  if (!pool || !db) return false;
  
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' 
    });
    db = drizzle({ client: pool, schema });
    
    // Test the connection
    testDatabaseConnection().then(healthy => {
      isDbHealthy = healthy;
      if (healthy) {
        console.log('✅ Connected to Neon PostgreSQL database');
      } else {
        console.log('⚠️  Database connection unhealthy, using fallback storage');
        pool = null;
        db = null;
      }
    }).catch(() => {
      console.log('⚠️  Database connection failed, using fallback storage');
      isDbHealthy = false;
      pool = null;
      db = null;
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    pool = null;
    db = null;
    isDbHealthy = false;
  }
} else {
  console.log('⚠️  DATABASE_URL not set, database operations will use fallback storage');
}

export { pool, db, isDbHealthy, testDatabaseConnection };