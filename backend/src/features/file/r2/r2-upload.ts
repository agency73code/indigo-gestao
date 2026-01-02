import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../../config/r2.js';

const R2_BUCKET = process.env.R2_BUCKET;

if (!R2_BUCKET) {
    throw new Error('R2_BUCKET não configurado.');
}

export class R2UploadService {
    static async uploadFile(params: {
        buffer: Buffer;
        contentType: string;
        filename: string;
        programId: number;
        patientId: string;
    }) {
        const { buffer, contentType, filename, programId, patientId } = params;

        const safeName = filename.replace(/\s+/g, '_');
        const key = `sessions/${programId}/${patientId}/${safeName}`;

        try {
            await s3.send(
                new PutObjectCommand({
                    Bucket: R2_BUCKET,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType,
                }),
            );

            return { key };
        } catch (err) {
            console.error('Erro ao enviar arquivo para R2:', err);
            throw new Error('Falha ao enviar arquivo para o armazenamento.');
        }
    }
}
