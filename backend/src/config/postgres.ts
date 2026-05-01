import { Pool } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool | null = null;

export const getPostgresPool = (): Pool => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL manquant pour PostgreSQL');
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  return pool;
};

export const checkPostgresConnection = async (): Promise<void> => {
  const client = await getPostgresPool().connect();
  try {
    await client.query('SELECT 1');
    logger.info('PostgreSQL connected successfully');
  } finally {
    client.release();
  }
};
