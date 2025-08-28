import crypto from 'crypto';

export function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function generateExpiry(hours: number = 1): number {
    return Date.now() + hours * 60 * 60 * 1000;
}