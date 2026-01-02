import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // In Cloudflare Workers/Pages environment with D1
  if (process.env.DB && typeof process.env.DB === 'object') {
    const adapter = new PrismaD1(process.env.DB as any);
    return new PrismaClient({ adapter });
  }
  
  // Standard SQLite environment (development)
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
