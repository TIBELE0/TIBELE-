import { afterAll, afterEach, beforeAll, jest } from '@jest/globals';
import { execSync } from 'child_process';
import type { PrismaClient } from '@prisma/client';

const PG_TEST_CONTAINER = 'tibele-postgres-test';
const PG_TEST_PORT = 55432;
let prisma: PrismaClient;

jest.setTimeout(180000);

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_with_32_chars_minimum';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_key_with_32_chars_min';
  process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:5173';
  process.env.DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${PG_TEST_PORT}/tibele_test`;
  process.env.DIRECT_URL = process.env.DATABASE_URL;

  execSync(`docker rm -f ${PG_TEST_CONTAINER} >/dev/null 2>&1 || true`);
  execSync(
    `docker run -d --name ${PG_TEST_CONTAINER} -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tibele_test -p ${PG_TEST_PORT}:5432 postgres:16-alpine`,
    { stdio: 'ignore' },
  );

  for (let i = 0; i < 60; i += 1) {
    try {
      execSync(`docker exec ${PG_TEST_CONTAINER} pg_isready -U postgres`, { stdio: 'ignore' });
      break;
    } catch {
      if (i === 59) {
        throw new Error('PostgreSQL test container did not become ready in time');
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  execSync('npm run prisma:push', {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
    },
    stdio: 'ignore',
  });

  const prismaModule = await import('../config/prisma');
  prisma = prismaModule.default;
  await prisma.$connect();
});

afterEach(async () => {
  if (!prisma) return;
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "AuditLog", "Message", "Topic", "UserAnswer", "TrainingSession", "Question", "Pathology", "MedicalGroup", "SiteSetting", "User" RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
  execSync(`docker rm -f ${PG_TEST_CONTAINER} >/dev/null 2>&1 || true`);
});
