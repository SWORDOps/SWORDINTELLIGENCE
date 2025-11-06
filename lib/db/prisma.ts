/**
 * Prisma Database Client
 *
 * Singleton pattern for Prisma Client to prevent multiple instances
 * in development due to hot reloading.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Global reference for Prisma Client (prevents multiple instances in dev)
 */
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client instance
 * - Singleton in development
 * - New instance in production
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

/**
 * Health check
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Database statistics
 */
export async function getDatabaseStats() {
  const [
    userCount,
    messageCount,
    roomCount,
    documentCount,
    canaryCount,
    auditLogCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.message.count(),
    prisma.room.count(),
    prisma.document.count(),
    prisma.canaryToken.count(),
    prisma.auditLog.count(),
  ]);

  return {
    users: userCount,
    messages: messageCount,
    rooms: roomCount,
    documents: documentCount,
    canaryTokens: canaryCount,
    auditLogs: auditLogCount,
  };
}
