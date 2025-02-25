// app/lib/prisma.ts
// import { PrismaClient } from '@prisma/client';

// const prismaClientSingleton = () => new PrismaClient();

// const prisma = globalThis.prisma ?? prismaClientSingleton();

// if (process.env.NODE_ENV !== 'production') {
//   globalThis.prisma = prisma;
// }

// export { prisma };



import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma