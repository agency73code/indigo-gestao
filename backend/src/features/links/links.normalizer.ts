import * as LinkTypes from './links.types.js';

const EMPTY_ADDRESS = {
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
}

function normalizePostgraduateType(type: string | null | undefined): 'lato' | 'stricto' {
    if (type === 'stricto') return 'stricto';
    if (type === 'lato') return 'lato';
    return 'lato';
}

function normalizeRole(role: string | null | undefined): 'responsible' | 'co' {
    if (role === 'co') return 'co';
    return 'responsible';
}

function normalizeStatus(status: string | null | undefined): 'active' | 'ended' | 'archived' {
    if (status === 'ended') return 'ended';
    if (status === 'archived') return 'archived';
    return 'active';
}

export function normalizeLink(link: LinkTypes.DBLink) {
    return {
        id: String(link.id),
        patientId: link.cliente_id,
        therapistId: link.terapeuta_id,
        role: normalizeRole(link.papel),
        startDate: link.data_inicio.toISOString(),
        endDate: link.data_fim ? link.data_fim.toISOString() : null,
        status: normalizeStatus(link.status),
        notes: link.observacoes ?? null,
        coTherapistActuation: link.atuacao_coterapeuta ?? null,
        createdAt: link.criado_em.toISOString(),
        updatedAt: link.atualizado_em.toISOString(),
    }
}

export function getAllClients(dto: LinkTypes.DBClient[]) {
    return dto.map((client) => {
        const primaryCaregiver = client.cuidadores?.[0] ?? null;
        const primaryAddress = client.enderecos?.[0]?.endereco ?? null;

        return {
            id: client.id,
            nome: client.nome ?? '',
            email: client.emailContato ?? '',
            telefone: primaryCaregiver?.telefone ?? '',
            dataNascimento: client.dataNascimento
                ? client.dataNascimento.toISOString().split('T')[0]
                : '',
            cpf: client.cpf ?? '',
            endereco: primaryAddress
                ? {
                    cep: primaryAddress.cep ?? '',
                    rua: primaryAddress.rua ?? '',
                    numero: primaryAddress.numero ?? '',
                    complemento: primaryAddress.complemento ?? '',
                    bairro: primaryAddress.bairro ?? '',
                    cidade: primaryAddress.cidade ?? '',
                    estado: primaryAddress.uf ?? '',
                }
                : { ...EMPTY_ADDRESS },
            responsavel: primaryCaregiver
                ? {
                    nome: primaryCaregiver.nome ?? '',
                    telefone: primaryCaregiver.telefone ?? '',
                    email: primaryCaregiver.email ?? '',
                    parentesco: primaryCaregiver.descricaoRelacao
                        ?? primaryCaregiver.relacao
                        ?? '',
                }
                : undefined,
                observacoes: '',
        };
    });
}

export function getAllTherapists(dto: LinkTypes.DBTherapist[]) {
    return dto.map((therapist) => {
        const address = therapist.endereco;
        const mainTraining = therapist.formacao?.[0] ?? null;
        const professionalData = therapist.registro_profissional?.map((register) => ({
            areaAtuacao: register.area_atuacao,
            cargo: register.cargo ?? '',
            numeroConselho: register.numero_conselho ?? undefined,
        })) ?? [];
        const postgraduates = mainTraining?.pos_graduacao?.map((pg) => ({
            tipo: normalizePostgraduateType(pg.tipo),
            curso: pg.curso ?? '',
            instituicao: pg.instituicao ?? '',
            conclusao: pg.conclusao ?? '',
            comprovanteUrl: null,
        })) ?? [];

        return {
            id: therapist.id,
            nome: therapist.nome,
            email: therapist.email,
            emailIndigo: therapist.email_indigo,
            telefone: therapist.telefone ?? '',
            celular: therapist.celular,
            cpf: therapist.cpf,
            dataNascimento: therapist.data_nascimento.toISOString().split('T')[0],
            possuiVeiculo: therapist.possui_veiculo ? 'sim' : 'nao',
            placaVeiculo: therapist.placa_veiculo ?? undefined,
            modeloVeiculo: therapist.modelo_veiculo ?? undefined,
            banco: therapist.banco ?? '',
            agencia: therapist.agencia ?? '',
            conta: therapist.conta ?? '',
            chavePix: therapist.chave_pix ?? '',
            valorHoraAcordado: therapist.valor_hora != null
                ? Number(therapist.valor_hora)
                : null,
            professorUnindigo: therapist.professor_uni ? 'sim' : 'nao',
            disciplinaUniindigo: null,
            endereco: address
                ? {
                    cep: address.cep ?? '',
                    rua: address.rua ?? '',
                    numero: address.numero ?? '',
                    complemento: address.complemento ?? undefined,
                    bairro: address.bairro ?? '',
                    cidade: address.cidade ?? '',
                    estado: address.uf ?? '',
                }
                : { ...EMPTY_ADDRESS },
            dadosProfissionais: professionalData,
            dataInicio: therapist.data_entrada.toISOString().split('T')[0],
            dataFim: therapist.data_saida
                ? therapist.data_saida.toISOString().split('T')[0]
                : undefined,
            formacao: mainTraining
                ? {
                    graduacao: mainTraining.graduacao ?? '',
                    instituicaoGraduacao: mainTraining.instituicao_graduacao ?? '',
                    anoFormatura: mainTraining.ano_formatura
                        ? String(mainTraining.ano_formatura)
                        : '',
                    posGraduacoes: postgraduates,
                    participacaoCongressosDescricao: mainTraining.participacao_congressos ?? null,
                    publicacoesLivrosDescricao: mainTraining.publicacoes_descricao ?? null,
                }
                : {
                    gadruacao: '',
                    instituicaoGraduacao: '',
                    anoFormatura: '',
                    posGraduacoes: postgraduates,
                },
            arquivos: {},
            cnpj: therapist.pessoa_juridica
                ? {
                    numero: therapist.pessoa_juridica.cnpj ?? '',
                    razaoSocial: therapist.pessoa_juridica.razao_social ?? '',
                    nomeFantasia: '',
                    endereco: therapist.pessoa_juridica.endereco
                        ? {
                            cep: therapist.pessoa_juridica.endereco.cep ?? '',
                            rua: therapist.pessoa_juridica.endereco.rua ?? '',
                            numero: therapist.pessoa_juridica.endereco.numero ?? '',
                            complemento: therapist.pessoa_juridica.endereco.complemento ?? undefined,
                            bairro: therapist.pessoa_juridica.endereco.bairro ?? '',
                            cidade: therapist.pessoa_juridica.endereco.cidade ?? '',
                            estado: therapist.pessoa_juridica.endereco.uf ?? '',
                        }
                        : { ...EMPTY_ADDRESS }
                }
                : undefined,
        };
    });
}

export function getAllLinks(dto: LinkTypes.DBLink[]) {
    return dto.map((link) => normalizeLink(link))
}