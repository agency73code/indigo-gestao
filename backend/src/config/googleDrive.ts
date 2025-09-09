import { google } from "googleapis";
import { env } from "./env.js";

const auth = new google.auth.GoogleAuth({
    credentials: {
        project_id: env.GOOGLE_PROJECT_ID,
        client_email: env.GOOGLE_CLIENT_EMAIL,
        private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.file",
    ],
});

export const drive = google.drive({ version: 'v3', auth });