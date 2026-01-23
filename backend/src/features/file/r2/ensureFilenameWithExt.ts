function getExtFromPath(path: string): string | null {
    const last = path.split('/').pop();
    if (!last) return null;

    const dot = last.lastIndexOf('.');
    if (dot === -1 || dot === last.length - 1) return null;

    const ext = last.slice(dot + 1).toLowerCase();

    const clean = ext.split('?')[0]?.split('#')[0] ?? ext;
    return clean || null;
}

function getExtFromMime(mime: string): string | null {
    const m = mime.toLowerCase();

    if (m === 'application/pdf') return 'pdf';
    if (m === 'image/jpeg') return 'jpg';
    if (m === 'image/png') return 'png';
    if (m === 'image/webp') return 'webp';
    if (m === 'application/zip') return 'zip';

    return null;
}

function hasExtension(filename: string): boolean {
    const base = filename.split('/').pop() ?? filename;
    const dot = base.lastIndexOf('.');
    return dot > 0 && dot < base.length - 1;
}

export function ensureFilenameWithExt(args: {
    name: string | null | undefined;
    path: string | null | undefined;
    mime_type: string | null | undefined;
}): string | null {
    const name = args.name?.trim() || null;
    if (!name) return null;

    if (hasExtension(name)) return name;

    const ext =
        (args.path ? getExtFromPath(args.path) : null) ??
        (args.mime_type ? getExtFromMime(args.mime_type) : null);

    return ext ? `${name}.${ext}` : name;
}