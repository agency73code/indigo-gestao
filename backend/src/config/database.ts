/*

Evita múltiplas instâncias do Prisma (memory leak)
Configura logs diferentes por ambiente
Otimiza performance em desenvolvimento

*/

import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
    });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

if (env.NODE_ENV === 'production') {
    process.on('beforeExit', async () => {
        await prisma.$disconnect();
    });
}
