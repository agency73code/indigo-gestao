import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { env } from "../../config/env.js";
import type { Tables, UserRow } from "./auth.types.js";
import {
    createRefreshToken,
    findValidRefreshTokenByHash,
    revokeRefreshTokenByHash,
    revokeRefreshTokenById
} from './refresh-token.repository.js';

const ACCESS_TOKEN_EXPIRES_IN = '1h';
const ACCESS_TOKEN_MAX_AGE_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export function getAccessTokenMaxAgeMs() {
    return ACCESS_TOKEN_MAX_AGE_MS;
}

export function generateAccessToken(user: Pick<UserRow, 'id' | 'perfil_acesso'>) {
    return jwt.sign({ sub: user.id, perfil_acesso: user.perfil_acesso }, env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
}

function generateOpaqueRefreshToken() {
    return crypto.randomBytes(48).toString('base64url');
}

function hashRefreshToken(refreshToken: string) {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
}

export async function issueRefreshToken(params: {
    userId: string;
    userType: Tables;
    deviceName?: string | undefined;
    ip?: string | undefined;
}) {
    const refreshToken = generateOpaqueRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    await createRefreshToken({
        id: uuidv4(),
        userId: params.userId,
        userType: params.userType,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        deviceName: params.deviceName,
        ip: params.ip,
    });

    return refreshToken;
}

export async function rotateRefreshToken(refreshToken: string, deviceName?: string, ip?: string) {
    const tokenHash = hashRefreshToken(refreshToken);
    const currentToken = await findValidRefreshTokenByHash(tokenHash);

    if (!currentToken) {
        return null;
    }

    await revokeRefreshTokenById(currentToken.id);

    const newRefreshToken = await issueRefreshToken({
        userId: currentToken.userId,
        userType: currentToken.userType,
        deviceName,
        ip,
    });

    return {
        userId: currentToken.userId,
        userType: currentToken.userType,
        refreshToken: newRefreshToken,
    };
}

export async function revokeRefreshToken(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);
    await revokeRefreshTokenByHash(tokenHash);
}