import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../../config/r2.js';


const R2_BUCKET = process.env.R2_BUCKET;

if (!R2_BUCKET) {
    throw new Error('R2_BUCKET não configurado.');
}

export async function uploadBillingFiles(params: {
    billingId: number;
    files: Express.Multer.File[];
}) {
    const { billingId, files } = params;

    const uploaded: {
        key: string;
        originalName: string;
        size: number;
        mimeType: string
    }[] = [];

    for (const file of files) {
        const safeName = file.originalname.replace(/\s+/g, '_');

        const key = `billing/${billingId}/${Date.now()}_${safeName}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        uploaded.push({
            key,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
        });
    }

    return uploaded;
}
