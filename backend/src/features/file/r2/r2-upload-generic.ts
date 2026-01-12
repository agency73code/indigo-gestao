import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../../config/r2.js';
import { randomUUID } from 'crypto';
import path from 'path';

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
    files: Array<{ buffer: Buffer; mimetype: string; originalname: string; size: number }>;
    prefix?: string;
  }) {
    const prefix = sanitizePrefix(params.prefix);

    const results = [];
    for (const f of params.files) {
      const safeName = sanitizeFilename(f.originalname);
      const ext = path.extname(safeName); // ".pdf"

      // key gerada pelo backend (evita sobrescrever)
      const key = `${prefix}/${randomUUID()}${ext}`;

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
}