import type { Request, Response } from 'express';
import * as FilesService from './files.service.js';
import { collectIncomingFiles } from './utils/collectIncomingFiles.js';
import { getFileStream } from './drive/viewFile.js';
import { createFolder } from './drive/createFolder.js';
import { normalizedBirthDate } from './types/files.normalizer.js';

/**
 * Controller responsável pelos uploads de arquivos.
 * Totalmente integrado ao novo fluxo de pastas no Drive.
 */
export async function uploadFile(req: Request, res: Response) {
    try {
        const { ownerType, ownerId, fullName, birthDate } = req.body as {
            ownerType: 'cliente' | 'terapeuta';
            ownerId: string;
            fullName: string;
            birthDate: string;
        };

        if (!ownerType || !ownerId || !fullName || !birthDate) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
        }

        const BirthDate = normalizedBirthDate(birthDate);

        const availableFiles = collectIncomingFiles(req);
        if (availableFiles.length === 0) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }

        const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
        const folderStructure = await createFolder(ownerType, fullName, BirthDate, rootFolderId);

        const uploadPromises = availableFiles.map(({ file, documentType }) => {
            const tipoDocumento = req.body.documentType || documentType || file.fieldname || 'arquivo';
            return FilesService.uploadAndPersistFile({
                ownerType,
                ownerId,
                fullName,
                birthDate,
                documentType: tipoDocumento,
                file,
                folderIds: folderStructure,
            });
        });

        const uploads = await Promise.all(uploadPromises);

        return res.json({ arquivos: uploads });
    } catch (error) {
        console.error('Erro no upload:', error);
        return res.status(500).json({ error: 'Falha ao processar upload' });
    }
}

/**
 * Lista arquivos de um cliente ou terapeuta.
 * Endpoint: GET /api/arquivos/novo-listar?ownerType=cliente&ownerId=123
 */
export async function listFiles(req: Request, res: Response) {
    try {
        const ownerType = req.query.ownerType as 'cliente' | 'terapeuta';
        const ownerId = req.query.ownerId as string;

        if (!ownerType || !ownerId) {
            return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
        }

        const files = await FilesService.listFiles(ownerType, ownerId);
        return res.json(files);
    } catch (error) {
        console.error('Erro ao listar arquivos:', error);
        return res.status(500).json({ error: 'Falha ao carregar arquivos.' });
    }
}

/**
 * Controller: streama um arquivo diretamente do Drive para o navegador.
 */
export async function viewFile(req: Request, res: Response) {
    const storageId = req.params.id ?? req.params.storageId;

    if (!storageId) {
        return res.status(400).json({ error: 'storageId é obrigatório.' });
    }

    try {
        const { metadata, stream } = await getFileStream(storageId);

        // Define os cabeçalhos corretos pro navegador renderizar
        res.setHeader('Content-Type', metadata.mimeType);
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
        res.setHeader('Cache-Control', 'public, must-revalidate, max-age=0');

        // Envia o stream diretamente
        stream.on('error', (err: unknown) => {
            if (err instanceof Error) {
                console.error('Erro ao streamar arquivo:', err.message);
            } else {
                console.error('Erro ao streamar arquivo:', err);
            }
            res.sendStatus(500);
        });

        stream.pipe(res);
    } catch (error) {
        console.error('Erro ao visualizar arquivo:', error);
        return res.status(404).json({ error: 'Arquivo não encontrado no Drive.' });
    }
}

/**
 * Controller: força o download de um arquivo do Google Drive.
 */
export async function downloadFile(req: Request, res: Response) {
    const storageId = req.params.id ?? req.params.storageId;

    if (!storageId) {
        return res.status(400).json({ error: 'storageId é obrigatório.' });
    }

    try {
        const { metadata, stream } = await getFileStream(storageId);

        res.setHeader('Content-Type', metadata.mimeType);
        res.setHeader(
            'Content-Disposition', 
            `attachment; filename="${metadata.name}"; filename*=UTF-8''${encodeURIComponent(metadata.name)}`
        );

        stream.on('error', (err: unknown) => {
            if (err instanceof Error) {
                console.error('Erro ao baixar arquivo:', err.message);
            } else {
                console.error('Erro ao baixar arquivo:', err);
            }
            res.sendStatus(500);
        });

        stream.pipe(res);
    } catch (error) {
        console.error('Erro ao baixar arquivo:', error);
        return res.status(404).json({ error: 'Arquivo não encontrado no Drive.' });
    }
}

/**
 * Controller: exclui um arquivo do banco e do Google Drive.
 */
export async function deleteFile(req: Request, res: Response) {
    const rawId = req.params.id;

    if (!rawId) {
        return res.status(400).json({ error: 'ID é obrigatório.' });
    }

    const id = Number.parseInt(rawId, 10);
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido.' });
    }

    try {
        const existing = await FilesService.findFileById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Arquivo não encontrado.' });
        }

        // Tenta excluir do Drive, se gouver arquivo remoto
        if (existing.arquivo_id) {
            await FilesService.deleteFromDrive(existing.arquivo_id);
        }

        // Remove o registro do banco
        await FilesService.deleteFromDatabase(id);

        return res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir arquivo:', error);
        return res.status(500).json({ error: 'Falha ao excluir arquivo.' });
    }
}

/**
 * Controller: retorna a foto de perfil do cliente/terapeuta.
 * Endpoint: GET /api/arquivos/getAvatar?ownerType=cliente&ownerId=123
 */
export async function getAvatar(req: Request, res: Response) {
    const ownerType = req.query.ownerType as 'cliente' | 'terapeuta';
    const ownerId = req.query.ownerId as string;

    if (!ownerType || !ownerId) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
    }

    try {
        // Busca os arquivos desse usuário
        const files = await FilesService.listFiles(ownerType, ownerId);

        // Localiza o arquivo de foto de perfil
        const avatar = files.find((f) => f.tipo_documento === 'fotoPerfil');
        if (!avatar) {
            return res.status(200).json({ avatarUrl: null });
        }
        
        const avatarUrl = `/api/arquivos/${avatar.storageId}/view`;
        return res.json({ avatarUrl });
    } catch (error) {
        console.error('Erro ao obter avatar:', error);
        return res.status(500).json({ error: 'Falha ao carregar foto de perfil.' });
    }
}