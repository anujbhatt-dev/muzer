// lib/prisma.ts (or wherever you store it)

import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // optional: for debugging
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
