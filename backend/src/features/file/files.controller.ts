import type { Request, Response } from 'express';
import * as FilesService from './files.service.js';
import { collectIncomingFiles } from './utils/collectIncomingFiles.js';
import { getFileStreamFromR2 } from './r2/getFileStream.js';
import { createFolder } from './r2/createFolder.js';
import { normalizedBirthDate } from './types/files.normalizer.js';

/**
 * Controller responsável pelos uploads de arquivos.
 * Totalmente integrado ao novo fluxo de pastas no R2.
 */
export async function uploadFile(req: Request, res: Response) {
    try {
        const { ownerType, ownerId, fullName, birthDate } = req.body as {
            ownerType: 'cliente' | 'terapeuta';
            ownerId: string;
            fullName: string;
            birthDate: string;
        };

        const normalizeBodyString = (value: unknown) => {
            if (typeof value === 'string') {
                return value;
            }
            if (Array.isArray(value)) {
                const [first] = value;
                return typeof first === 'string' ? first : undefined;
            }
            return undefined;
        };

        const documentTypeFromBody = normalizeBodyString(
            (req.body as Record<string, unknown>).documentType,
        );
        const descricaoFromBody = normalizeBodyString(
            (req.body as Record<string, unknown>).descricao_documento,
        );
        const descricaoNormalizada = descricaoFromBody?.trim() ?? '';

        if (!ownerType || !ownerId || !fullName || !birthDate) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
        }

        const BirthDate = normalizedBirthDate(birthDate);

        const availableFiles = collectIncomingFiles(req);
        if (availableFiles.length === 0) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }

        const folderStructure = await createFolder(ownerType, fullName, BirthDate);

        const uploadPromises = availableFiles.map(({ file, documentType }) => {
            const tipoDocumento =
                documentTypeFromBody || documentType || file.fieldname || 'arquivo';
            const descricaoDocumento =
                tipoDocumento === 'outros' && descricaoNormalizada.length > 0
                    ? descricaoNormalizada
                    : undefined;
            return FilesService.uploadAndPersistFile({
                ownerType,
                ownerId,
                fullName,
                birthDate,
                documentType: tipoDocumento,
                documentDescription: descricaoDocumento ?? '',
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
 * Controller: streama um arquivo diretamente do R2 para o navegador.
 */
export async function viewFile(req: Request, res: Response) {
    const storageId = req.params.id ?? req.params.storageId;

    if (!storageId) {
        return res.status(400).json({ error: 'storageId é obrigatório.' });
    }

    try {
        const { metadata, stream } = await getFileStreamFromR2(storageId);

        if (!stream) {
            return res.status(500).json({ error: 'Falha ao obter stream do arquivo.' });
        }

        // Define os cabeçalhos corretos pro navegador renderizar
        res.setHeader('Content-Type', metadata.mimeType);
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
        res.setHeader('Cache-Control', 'public, must-revalidate, max-age=0');

        // Envia o stream diretamente
        (stream as NodeJS.ReadableStream).on('error', (err) => {
            console.error('Erro ao streamar arquivo:', err);
            res.sendStatus(500);
        });

        return (stream as NodeJS.ReadableStream).pipe(res);
    } catch (error) {
        console.error('Erro ao visualizar arquivo:', error);
        return res.status(404).json({ error: 'Arquivo não encontrado no R2.' });
    }
}

/**
 * Controller: força o download de um arquivo do Google R2.
 */
export async function downloadFile(req: Request, res: Response) {
    const storageId = req.params.id ?? req.params.storageId;

    if (!storageId) {
        return res.status(400).json({ error: 'storageId é obrigatório.' });
    }

    try {
        const { metadata, stream } = await getFileStreamFromR2(storageId);

        if (!stream) {
            return res.status(500).json({ error: 'Falha ao obter stream do arquivo.' });
        }

        res.setHeader('Content-Type', metadata.mimeType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${metadata.name}"; filename*=UTF-8''${encodeURIComponent(metadata.name)}`,
        );

        (stream as NodeJS.ReadableStream).on('error', (err) => {
            console.error('Erro ao baixar arquivo:', err);
            res.sendStatus(500);
        });

        return (stream as NodeJS.ReadableStream).pipe(res);
    } catch (error) {
        console.error('Erro ao baixar arquivo:', error);
        return res.status(404).json({ error: 'Arquivo não encontrado no R2.' });
    }
}

/**
 * Controller: exclui um arquivo do banco e do Google R2.
 */
export async function deleteFile(req: Request, res: Response) {
    const fileId = req.params.id;
    
    if (!fileId) {
        return res.status(400).json({ error: 'ID é obrigatório.' });
    }

    try {
        const existing = await FilesService.findFileById(fileId);

        if (!existing) {
            return res.status(404).json({ error: 'Arquivo não encontrado.' });
        }

        // Tenta excluir do R2, se gouver arquivo remoto
        if (existing.arquivo_id) {
            await FilesService.deleteFromR2(existing.arquivo_id);
        }

        // Remove o registro do banco
        await FilesService.deleteFromDatabase(existing.id);

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

        const encoded = encodeURIComponent(avatar.storageId);
        const avatarUrl = `/api/arquivos/${encoded}/view`;
        return res.json({ avatarUrl });
    } catch (error) {
        console.error('Erro ao obter avatar:', error);
        return res.status(500).json({ error: 'Falha ao carregar foto de perfil.' });
    }
}
