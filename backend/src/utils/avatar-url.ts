type filesId = {
    arquivo_id: string | null;
}

export function buildAvatarUrl(files?: filesId[] | null): string | undefined {
    const fileId = files?.[0]?.arquivo_id;

    if (!fileId) return undefined;

    const baseUrl = process.env.API_URL;
    if (!baseUrl) return undefined;

    return `${baseUrl}/api/arquivos/${encodeURIComponent(fileId)}/view/`;
}