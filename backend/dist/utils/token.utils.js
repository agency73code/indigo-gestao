import crypto from 'crypto';
export function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}
export function generateExpiry(hours = 1) {
    return Date.now() + hours * 60 * 60 * 1000;
}
//# sourceMappingURL=token.utils.js.map