/*

Evita múltiplas instâncias do Prisma (memory leak)
Configura logs diferentes por ambiente
Otimiza performance em desenvolvimento

*/

import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { getAuditUserId } from '../utils/auditContext.js';

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
};

type FindManyIdsDelegate = {
    findMany(args: { where: Record<string, unknown>, select: { id: true } }): Promise<{ id: unknown }[]>;
}
type AuditableManyModel = 'terapeuta' | 'cliente' | 'faturamento' | 'ata_participante';

const prismaBase = globalForPrisma.prisma ??
    new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
    });

const auditableManyMap: Record<AuditableManyModel, FindManyIdsDelegate> = {
    terapeuta: prismaBase.terapeuta,
    cliente: prismaBase.cliente,
    faturamento: prismaBase.faturamento,
    ata_participante: prismaBase.ata_participante,
}

export const prisma = prismaBase.$extends({
    query: {
        $allModels: {
            async create({ model, args, query }) {
                const result = await query(args)
                const userId = getAuditUserId()
                if (!userId) return result
                const data = (args as { data?: Record<string, unknown> }).data
                await prismaBase.auditLog.create({ data: {
                    usuarioId: userId,
                    model,
                    acao: 'create',
                    registroId: String(data?.id ?? (result as Record<string, unknown>)?.id ?? 'unknown'),
                }})
                return result
            },
            async update({ model, args, query }) {
                const where = (args as { where: Record<string, unknown> }).where
                const result = await query(args)
                const userId = getAuditUserId()
                if (!userId) return result
                await prismaBase.auditLog.create({ data: {
                    usuarioId: userId,
                    model,
                    acao: 'update',
                    registroId: String(where?.id ?? (result as Record<string, unknown>)?.id ?? 'unknown'),
                }})
                return result
            },
            async delete({ model, args, query }) {
                const where = (args as { where: Record<string, unknown> }).where
                const result = await query(args)
                const userId = getAuditUserId()
                if (!userId) return result
                await prismaBase.auditLog.create({ data: {
                    usuarioId: userId,
                    model,
                    acao: 'delete',
                    registroId: String(where?.id ?? 'unknown'),
                }})
                return result
            },
            async updateMany({ model, args, query }) {
                const where = (args as { where: Record<string, unknown> }).where
                const delegate = auditableManyMap[model as AuditableManyModel]
                const ids = delegate ? await delegate.findMany({ where, select: { id: true } }) : []
                const result = await query(args)
                const userId = getAuditUserId()
                if (!userId) return result
                if (ids.length > 0) {
                    await prismaBase.auditLog.createMany({ data: ids.map(({ id }) => ({
                        usuarioId: userId,
                        model,
                        acao: 'update',
                        registroId: String(id ?? 'unknown'),
                    }))})
                }
                return result
            },
            async deleteMany({ model, args, query }) {
                const where = (args as { where: Record<string, unknown> }).where
                const delegate = auditableManyMap[model as AuditableManyModel]
                const ids = delegate ? await delegate.findMany({ where, select: { id: true } }) : []
                const result = await query(args)
                const userId = getAuditUserId()
                if (!userId) return result
                if (ids.length > 0) {
                    await prismaBase.auditLog.createMany({ data: ids.map(({ id }) => ({
                        usuarioId: userId,
                        model,
                        acao: 'delete',
                        registroId: String(id ?? 'unknown'),
                    }))})
                }
                return result
            },
            async upsert({ model, args, query }) {
                const result = await query(args)
                const userId = getAuditUserId()
                if (!userId) return result
                const where = (args as { where: Record<string, unknown> }).where
                await prismaBase.auditLog.create({ data: {
                    usuarioId: userId,
                    model,
                    acao: 'upsert',
                    registroId: String(where?.id ?? (result as Record<string, unknown>)?.id ?? 'unknown'),
                }})
                return result
            },
        }
    }
})


if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaBase;

if (env.NODE_ENV === 'production') {
    process.on('beforeExit', async () => {
        await prismaBase.$disconnect();
    });
}
