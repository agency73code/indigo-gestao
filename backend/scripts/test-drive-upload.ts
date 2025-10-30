import fs from 'fs';
import path from 'path';
import { uploadAndPersistFile } from '../src/features/files/files.service.js';

async function main() {
    const fakeFilePath = path.resolve('./scripts/tests/assets/teste-delete.pdf');
    const fileBuffer = fs.readFileSync(fakeFilePath);

    const fakeFile = {
        originalname: 'teste.pdf',
        mimetype: 'application/pdf',
        size: fileBuffer.length,
        buffer: fileBuffer
    } as Express.Multer.File;

    const result = await uploadAndPersistFile({
        ownerType: 'cliente',
        ownerId: '5bb3331a-31fb-41f7-aefb-088d849fc9a3',
        fullName: 'Renan Renato Cauê Peixoto',
        birthDate: '2011-01-12',
        documentType: 'comprovanteResidencia',
        file: fakeFile,
    });

    console.log('✅ Upload realizado:', result);
}

main().catch(console.error);