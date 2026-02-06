type AddressFromDb = {
    cep: string | null;
    rua: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    complemento?: string | null;
};

export function buildAddress(input: {
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    complemento: string | null | undefined;
}) {
    return {
        cep: input.cep,
        rua: input.rua,
        numero: input.numero,
        bairro: input.bairro,
        cidade: input.cidade,
        uf: input.estado,
        complemento: input.complemento ?? '',
    };
}

export function normalizeAddress(input?: AddressFromDb | null) {
    if (!input) return undefined;

    return {
        cep: input.cep ?? '',
        rua: input.rua ?? '',
        numero: input.numero ?? '', // casa sem número -> ''
        bairro: input.bairro ?? '',
        cidade: input.cidade ?? '',
        estado: input.uf ?? '',
        complemento: input.complemento ?? '',
    };
}