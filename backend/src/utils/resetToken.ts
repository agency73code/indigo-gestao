import crypto from 'crypto';

export function generateResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    return { token, expiry };
}
