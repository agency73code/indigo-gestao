import * as LinkTypes from './links.types.js';

function normalizeRole(role: string | null | undefined): 'responsible' | 'co' {
    if (role === 'co') return 'co';
    return 'responsible';
}

function normalizeStatus(status: string | null | undefined): 'active' | 'ended' | 'archived' {
    if (status === 'ended') return 'ended';
    if (status === 'archived') return 'archived';
    return 'active';
}

function buildAvatarUrl(fileId: string | null | undefined) {
    if (!fileId) return null;
    return `/api/arquivos/${encodeURIComponent(fileId)}/view`;
}

export function normalizeLink(link: LinkTypes.DBLink) {
    return {
        id: String(link.id),
        patientId: link.cliente_id,
        therapistId: link.terapeuta_id,
        role: normalizeRole(link.papel),
        startDate: link.data_inicio,
        endDate: link.data_fim ? link.data_fim : null,
        status: normalizeStatus(link.status),
        notes: link.observacoes ?? null,
        actuationArea: link.terapeuta?.registro_profissional?.[0]?.area_atuacao?.nome ?? null,
        createdAt: link.criado_em.toISOString(),
        updatedAt: link.atualizado_em.toISOString(),
    };
}

export function normalizeClientOptions(dto: LinkTypes.DBClientOption[]): LinkTypes.ClientOptionDTO[] {
    return dto.map((client) => {
        const avatarFile = client.arquivos?.[0];

        return {
            id: client.id,
            nome: client.nome ?? '',
            avatarUrl: avatarFile?.arquivo_id
                ? `/api/arquivos/${encodeURIComponent(avatarFile.arquivo_id)}/view`
                : null,
        };
    });
}

export function normalizeClientList(
    dto: Array<{
        id: string;
        nome: string | null;
        dataNascimento: Date | null;
        cuidadores?: Array <{ nome: string | null }> | null;
        arquivos?: Array<{ arquivo_id: string | null }> | null;
    }>,
    includeResponsavel: boolean,
): LinkTypes.ClientListDTO[] {
    return dto.map((client) => {
        const avatarFile = client.arquivos?.[0];
        const caregiver = includeResponsavel ? client.cuidadores?.[0] ?? null : null;

        return {
            id: client.id,
            nome: client.nome ?? 'Cliente sem nome',
            dataNascimento: client.dataNascimento
                ? client.dataNascimento.toISOString().split('T')[0]
                : null,
            avatarUrl: avatarFile?.arquivo_id
                ? `/api/arquivos/${encodeURIComponent(avatarFile.arquivo_id)}/view`
                : null,
            ...(includeResponsavel ? { responsavelNome: caregiver?.nome ?? null }: {}),
        };
    });
}

export function normalizeSelectTherapists(records: LinkTypes.TherapistRecord[]): LinkTypes.TherapistSelectDTO[] {
    return records.map((therapist) => {
        const avatarFile = therapist.arquivos?.[0]?.arquivo_id ?? null;
        const professional = therapist.registro_profissional?.[0];

        return {
            id: therapist.id,
            nome: therapist.nome,
            avatarUrl: buildAvatarUrl(avatarFile),
            dadosProfissionais: [
                {
                    cargo: professional?.cargo?.nome ?? 'Cargo sem nome',
                    areaAtuacao: professional?.area_atuacao?.nome ?? 'Area de atuação sem nome',
                },
            ],
        };
    });
}

export function normalizeListTherapists(
    records: LinkTypes.TherapistRecord[],
    includeNumeroConselho: boolean,
) {
    return records.map((therapist) => {
        const avatarFile = therapist.arquivos?.[0]?.arquivo_id ?? null;
        const regs = therapist.registro_profissional ?? [];

        const dadosProfissionais = regs
            .map((rp) => ({
                cargo: rp.cargo?.nome ?? 'Cargo sem nome',
                areaAtuacao: rp.area_atuacao?.nome ?? 'Area de atuação sem nome',
                ...(includeNumeroConselho ? { numeroConselho: rp.numero_conselho ?? null } : {}),
            }));

        return {
            id: therapist.id,
            nome: therapist.nome,
            avatarUrl: buildAvatarUrl(avatarFile),
            dadosProfissionais:
                dadosProfissionais.length > 0
                    ? dadosProfissionais
                    : [],
        };
    });
}

export function getAllLinks(dto: LinkTypes.DBLink[]) {
    return dto.map((link) => normalizeLink(link));
}
