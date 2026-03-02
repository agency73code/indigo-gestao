import { prisma } from "../../config/database.js";
import type { Tables } from "./auth.types.js";

export type RefreshTokenRow = {
    id: string;
    userId: string;
    userType: Tables;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
};

export async function createRefreshToken(params: {
    id: string;
    userId: string;
    userType: Tables;
    tokenHash: string;
    expiresAt: Date;
    deviceName?: string | undefined;
    ip?: string | undefined;
}) {
    await prisma.$executeRaw`
        INSERT INTO auth_refresh_token (
            id,
            userId,
            userType,
            tokenHash,
            expiresAt,
            deviceName,
            ip,
            updatedAt
        ) VALUES (
            ${params.id},
            ${params.userId},
            ${params.userType},
            ${params.tokenHash},
            ${params.expiresAt},
            ${params.deviceName ?? null},
            ${params.ip ?? null},
            NOW(3)
        )
    `;
}

export async function findValidRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    const rows = await prisma.$queryRaw<RefreshTokenRow[]>`
        SELECT id, userId, userType, tokenHash, expiresAt, revokedAt
        FROM auth_refresh_token
        WHERE tokenHash = ${tokenHash}
            AND revokedAt IS NULL
            AND expiresAt > NOW(3)
        LIMIT 1
    `;

    return rows[0] ?? null;
}

export async function revokeRefreshTokenById(id: string) {
    await prisma.$executeRaw`
        UPDATE auth_refresh_token
        SET revokedAt = NOW(3), updatedAt = NOW(3)
        WHERE id = ${id} AND revokedAt IS NULL
    `;
}

export async function revokeRefreshTokenByHash(tokenHash: string) {
    await prisma.$executeRaw`
        UPDATE auth_refresh_token
        SET revokedAt = NOW(3), updatedAt = NOW(3)
        WHERE tokenHash = ${tokenHash} AND revokedAt IS NULL
    `;
}