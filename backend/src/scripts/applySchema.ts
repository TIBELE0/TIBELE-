/**
 * Applies the Prisma schema SQL directly via pg pooler connection.
 * Used when prisma db push can't reach the DB via directUrl (port 5432 blocked).
 */
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const POOLER_URL = process.env.DATABASE_URL;

async function applySchema() {
  if (!POOLER_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: POOLER_URL,
    ssl: { rejectUnauthorized: false },
  });

  const sqlFile = path.join(__dirname, '../../prisma/schema.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('Connecting to PostgreSQL via pooler...');
  const client = await pool.connect();
  try {
    console.log('Applying schema...');
    await client.query(sql);
    console.log('Schema applied successfully!');
  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      console.log('WARNING: Some objects already exist (safe to ignore):', err.message);
    } else {
      throw err;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

applySchema().catch((err) => {
  console.error('Schema apply failed:', err.message);
  process.exit(1);
});
