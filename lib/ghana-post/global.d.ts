// global.d.ts
import { PrismaClient } from '@prisma/client';

/* eslint-disable no-var */
declare global {
  var prisma: PrismaClient | undefined;
}

// An empty export makes this a module.
export {};
