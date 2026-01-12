type SimNao = 'sim' | 'nao' | null | undefined;

type MarcoPayload = {
    meses?: string | null | undefined;
    naoRealiza?: boolean | null | undefined;
    nao?: boolean | null | undefined;
    naoSoubeInformar?: boolean | null | undefined;
};

type MarcoMapped = {
    months: string | null;
    notPerform: boolean;
    didntKnow: boolean;
};

export function mapSimNao(value: SimNao): boolean | null {
    if (value === 'sim') return true;
    if (value === 'nao') return false;
    return null;
}

export function mapMarco(marco?: MarcoPayload): MarcoMapped {
    return {
        months: marco?.meses ?? null,
        notPerform: marco?.naoRealiza ?? marco?.nao ?? false,
        didntKnow: marco?.naoSoubeInformar ?? false,
    };
}

export function maybeCreateList<T, U>(
    items: T[] | null | undefined,
    mapItem: (item: T) => U,
): { create: U[] } | undefined {
    if (!items || items.length === 0) {
        return undefined;
    }

    return { create: items.map(mapItem) };
}
