import fs from 'fs';
import path from 'path';
import { getFileStream } from '../src/features/files/drive/viewFile.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const storageId = '1N-lRzqNQyz1jzO-ZG5Yv__MC5awm1TeL';

    const { metadata, stream } = await getFileStream(storageId);

    console.log('📄 Metadados:', metadata);

    const outputPath = path.resolve(`./scripts/tests/output_${metadata.name}`);
    const writeStream = fs.createWriteStream(outputPath);

    await new Promise<void>((resolve, reject) => {
        stream.pipe(writeStream);
        stream.on('end', resolve);
        stream.on('error', reject);
    });

    console.log(`✅ Arquivo baixado e salvo em: ${outputPath}`);
}

main().catch(console.error);