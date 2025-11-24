import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from '../../../config/r2.js';

export async function getFileStreamFromR2(storageId: string) {
    if (!storageId) {
        throw new Error('storageId é obrigatório');
    }

    const bucket = process.env.R2_BUCKET;
    if (!bucket) {
        throw new Error('R2_BUCKET não configurado.');
    }

    const response = await s3.send(
        new GetObjectCommand({
            Bucket: bucket,
            Key: storageId,
        })
    );

    return {
        metadata: {
            id: storageId,
            name: storageId.split('/').pop() || 'arquivo',
            mimeType: response.ContentType || 'application/octet-stream',
            size: Number(response.ContentLength ?? 0),
        },
        stream: response.Body as unknown as NodeJS.ReadableStream,
    };
}