import { v4 as uuidv4 } from "uuid";

export function generateResetToken() {
    const token = uuidv4();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    return { token, expiry };
}