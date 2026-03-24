import type { prisma } from '../config/database.js';

export type PrismaTransactionClient = Omit<
    typeof prisma,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

export type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
