import { prisma } from "../../config/database.js";

export async function getBootstrapBase(therapistId: string) {
    const therapist = await prisma.terapeuta.findFirst({
        where: {
            id: therapistId,
            atividade: true,
        },
        select: {
            id: true,
            nome: true, 
            email_indigo: true,
            perfil_acesso: true,
            atividade: true,
            atualizado_em: true,
        },
    });

    const activeLinks = await prisma.terapeuta_cliente.findMany({
        where: {
            terapeuta_id: therapistId,
            status: 'active',
            cliente: {
                status: 'ativo',
            },
        },
        select: {
            id: true,
            terapeuta_id: true,
            cliente_id: true,
            area_atuacao_id: true,
            valor_sessao: true,
            data_inicio: true,
            data_fim: true,
            papel: true,
            status: true,
            criado_em: true,
            atualizado_em: true,
            cliente: {
                select: {
                    id: true,
                    nome: true,
                    status: true,
                    emailContato: true,
                    atualizado_em: true,
                },
            },
            areaAtuacao: {
                select: {
                    id: true,
                    nome: true,
                },
            },
        },
    });

    const clientsById = new Map(activeLinks.map((link) => [link.cliente.id, link.cliente]));
    const areaById = new Map(activeLinks.map((link) => [link.areaAtuacao.id, link.areaAtuacao]));

    return {
        terapeuta: therapist,
        clientes: Array.from(clientsById.values()),
        terapeuta_cliente: activeLinks.map(({ cliente: _cliente, areaAtuacao: _areaAtuacao, ...link }) => link),
        area_atuacao: Array.from(areaById.values()),
    };
}

export async function getBootstrapPrograms(therapistId: string) {
    const ocps = await prisma.ocp.findMany({
        where: {
            terapeuta_id: therapistId,
            status: 'ativado',
        },
        select: {
            id: true,
            cliente_id: true,
            terapeuta_id: true,
            nome_programa: true,
            area: true,
            status: true,
            data_inicio: true,
            data_fim: true,
            criado_em: true,
            atualizado_em: true,
        },
    });

    return { ocps };
}

export async function getBootstrapStimuli(therapistId: string) {
    const activeOcps = await prisma.ocp.findMany({
        where: {
            terapeuta_id: therapistId,
            status: 'ativado',
        },
        select: {
            id: true,
        },
    });

    const ocpIds = activeOcps.map((ocp) => ocp.id);

    if (ocpIds.length === 0) {
        return {
            estimulo_ocp: [],
            estimulos: [],
        };
    }

    const stimulusOcp = await prisma.estimulo_ocp.findMany({
        where: {
            id_ocp: { in: ocpIds },
            status: true,
        },
        select: {
            id: true,
            id_estimulo: true,
            id_ocp: true,
            nome: true,
            descricao: true,
            metodos: true,
            tecnicas_procedimentos: true,
            status: true,
        },
    });

    const stimulusIds = Array.from(new Set(stimulusOcp.map((item) => item.id_estimulo)));

    const stimuli = stimulusIds.length
        ? await prisma.estimulo.findMany({
            where: {
                id: { in: stimulusIds },
            },
            select: {
                id: true,
                nome: true,
                descricao: true,
            },
        })
        : [];
    
    return {
        estimulo_ocp: stimulusOcp,
        estimulos: stimuli,
    };
}

export async function getBootstrapSessions(therapistId: string, days: number) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    const sessions = await prisma.sessao.findMany({
        where: {
            terapeuta_id: therapistId,
            data_criacao: {
                gte: threshold,
            },
            ocp: {
                terapeuta_id: therapistId,
                status: 'ativado',
            },
        },
        select: {
            id: true,
            ocp_id: true,
            cliente_id: true,
            terapeuta_id: true,
            area: true,
            observacoes_sessao: true,
            data_criacao: true,
            criado_em: true,
            atualizado_em: true,
        },
    });

    const sessionsIds = sessions.map((session) => session.id);

    if (sessionsIds.length === 0) {
        return {
            sessoes: [],
            sessao_trials: [],
            faturamentos: [],
            sessao_arquivos: [],
        };
    }

    const [sessionTrials, billings, sessionFiles] = await Promise.all([
        prisma.sessao_trial.findMany({
            where: {
                sessao_id: { in: sessionsIds },
            },
            select: {
                id: true,
                sessao_id: true,
                estimulos_ocp_id: true,
                ordem: true,
                resultado: true,
                duracao_minutos: true,
                utilizou_carga: true,
                valor_carga: true,
                teve_desconforto: true,
                descricao_desconforto: true,
                teve_compensacao: true,
                descricao_compensacao: true,
                participacao: true,
                suporte: true,
            },
        }),
        prisma.faturamento.findMany({
            where: {
                sessao_id: { in: sessionsIds },
                terapeuta_id: therapistId,
            },
            select: {
                id: true,
                sessao_id: true,
                cliente_id: true,
                terapeuta_id: true,
                inicio_em: true,
                fim_em: true,
                tipo_atendimento: true,
                status: true,
                ajuda_custo: true,
                valor_ajuda_custo: true,
                observacao_faturamento: true,
                motivo_rejeicao: true,
                criado_em: true,
                atualizado_em: true,
            },
        }),
        prisma.sessao_arquivo.findMany({
            where: {
                sessao_id: { in: sessionsIds },
            },
            select: {
                id: true,
                sessao_id: true,
                nome: true,
                caminho: true,
                tamanho: true,
                criado_em: true,
                atualizado_em: true,
            },
        }),
    ]);

    return {
        sessoes: sessions,
        sessao_trial: sessionTrials,
        faturamentos: billings,
        sessao_arquivos: sessionFiles,
    };
}