import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Create a global Prisma client for tests with adapter
export const prisma = new PrismaClient({ adapter });

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});
