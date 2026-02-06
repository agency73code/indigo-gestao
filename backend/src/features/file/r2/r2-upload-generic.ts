import { DeleteObjectCommand, DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../../config/r2.js';

const R2_BUCKET = process.env.R2_BUCKET;

function sanitizePrefix(prefix?: string) {
    if (!prefix) return 'uploads';

    // normaliza barras e remove espaços
    let p = prefix.trim().replace(/\\/g, '/');

    // remove barras no começo/fim
    p = p.replace(/^\/+/, '').replace(/\/+$/, '');

    if (!p || p.includes('..')) return 'uploads';

    return p;
}

function sanitizeFilename(filename: string) {
  // troca espaços, remove caracteres muito problemáticos
  const base = filename.trim().replace(/\s+/g, '_').replace(/[^\w.\-()]/g, '');
  return base || 'file';
}

export class R2GenericUploadService {
  static async uploadMany(params: {
    files: Array<{
      buffer: Buffer;
      mimetype: string;
      originalname: string;
      size: number 
    }>;
    prefix?: string;
  }) {
    const prefix = sanitizePrefix(params.prefix);

    const results: Array<{
      key: string;
      nome: string;
      tipo: string;
      tamanho: number;
    }> = [];

    for (const f of params.files) {
      const safeName = sanitizeFilename(f.originalname);
      const key = `${prefix}/${safeName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: f.buffer,
          ContentType: f.mimetype || 'application/octet-stream',
        }),
      );

      results.push({
        key, // "caminho"
        nome: f.originalname,
        tipo: f.mimetype,
        tamanho: f.size,
      });
    }

    return results;
  }

  static async delete(key: string): Promise<void> {
    const safeKey = key.trim();
    if (!safeKey) return;

    await s3.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: safeKey,
      }),
    );
  }

  static async deleteMany(keys: string[]): Promise<void> {
    const uniqueKeys = Array.from(
      new Set(keys.map((k) => k.trim()).filter(Boolean)),
    );

    if (uniqueKeys.length === 0) return;

    const chunks: string[][] = [];
    for (let i = 0; i < uniqueKeys.length; i += 100) {
      chunks.push(uniqueKeys.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      const res = await s3.send(
        new DeleteObjectsCommand({
          Bucket: R2_BUCKET,
          Delete: {
            Quiet: true,
            Objects: chunk.map((Key) => ({ Key })),
          },
        }),
      );

      if (res.Errors && res.Errors.length > 0) {
        const [first] = res.Errors;

        if (!first) throw new Error('Falha ao deletar anexos no R2');

        throw new Error(
          `Falha ao deletar anexos no R2. Ex: ${first.Key ?? ''} ${first.Code ?? ''} ${first.Message ?? ''}`.trim(),
        );
      }
    }
  }
}