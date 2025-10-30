import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function main() {
    const filePath = path.resolve('./scripts/tests/assets/teste.webp');
    const buffer = fs.readFileSync(filePath);

    const formData = new FormData();
    formData.append('ownerType', 'terapeuta');
    formData.append('ownerId', '376afd8b-8658-4e5a-abea-04738e31476a');
    formData.append('fullName', 'Cláudio Calebe Rodrigues');
    formData.append('birthDate', '1954-10-15');
    formData.append('fotoPerfil', buffer, 'teste.webp');

    const resp = await fetch('http://localhost:3000/api/arquivos/novo-upload', {
        method: 'POST',
        body: formData,
    });

    const data = await resp.json();
    console.log('Resposta do endpoint:', data);
}

main().catch(console.error);