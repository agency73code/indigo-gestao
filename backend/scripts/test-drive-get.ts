import { getFile } from '../src/features/files/drive/getFile.js';
import fs from 'fs';

async function main() {
    const fileId = '1N-lRzqNQyz1jzO-ZG5Yv__MC5awm1TeL';

    const file = await getFile(fileId);
    console.log('📄 Metadados:', {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
    });

    const outputPath = `./scripts/tests/output_${file.name}`;
    const writeStream = fs.createWriteStream(outputPath);
    file.stream.pipe(writeStream);

    writeStream.on('finish', () => {
        console.log(`✅ Arquivo salvo localmente em: ${outputPath}`);
    });
}

main().catch(console.error);