import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Create connection pool if it doesn't exist
if (!globalForPrisma.pool) {
  const connectionString = process.env.DATABASE_URL;
  globalForPrisma.pool = new Pool({ connectionString });
}

const adapter = new PrismaPg(globalForPrisma.pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
