type filesId = {
    id: number;
}

export function buildAvatarUrl(files?: filesId[] | null): string | undefined {
    const fileId = files?.[0]?.id;

    if (!fileId) return undefined;

    return `/api/arquivos/${fileId}/view`;
}

/** Para uso exclusivo do mobile — retorna URL absoluta usando API_URL. */
export function buildMobileAvatarUrl(files?: filesId[] | null): string | undefined {
    const fileId = files?.[0]?.id;

    if (!fileId) return undefined;

    const baseUrl = process.env.API_URL;
    if (!baseUrl) return undefined;

    return `${baseUrl}/api/arquivos/${fileId}/view`;
}