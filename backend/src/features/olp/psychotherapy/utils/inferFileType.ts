type ApiFileType = 'foto' | 'video' | 'documento';

export function inferFileType(mimeType: string | null | undefined): ApiFileType {
    const mt = (mimeType ?? '').toLowerCase().trim();

    if (mt.startsWith('image/')) return 'foto';
    if (mt.startsWith('video/')) return 'video';

    if (
        mt === 'application/pdf' ||
        mt.startsWith('text/') ||
        mt.includes('officedocument') ||
        mt.includes('msword') ||
        mt.includes('excel') ||
        mt.includes('powerpoint')
    ) {
        return 'documento';
    }

    return 'documento';
}