import { prisma } from '../../../config/database.js';
import { R2UploadService } from '../../file/r2/r2-upload.js';
import type {
    CreatePhysiotherapySessionInput,
    CreateProgramPayload,
    CreateSessionInDatabaseInput,
    CreateSpeechSessionInput,
    CreateToSessionInput,
} from '../types/olp.types.js';

export async function program(data: CreateProgramPayload) {
    const isTO = data.area === 'terapia-ocupacional';

    return prisma.ocp.create({
        data: {
            cliente: { connect: { id: data.patientId } },
            terapeuta: { connect: { id: data.therapistId } },
            nome_programa: data.name ?? data.goalTitle,
            data_inicio: new Date(data.prazoInicio),
            data_fim: new Date(data.prazoFim),
            objetivo_programa: data.goalTitle,
            objetivo_descricao: data.goalDescription ?? null,
            criterio_aprendizagem: data.criteria ?? null,
            objetivo_curto: data.shortTermGoalDescription,
            descricao_aplicacao: data.stimuliApplicationDescription,
            observacao_geral: data.notes ?? null,
            estimulo_ocp: {
                create: data.stimuli.map((s) => ({
                    nome: s.label,
                    status: s.active,
                    descricao: s.description ?? null,
                    metodos: s.metodos ?? null,
                    tecnicas_procedimentos: s.tecnicasProcedimentos ?? null,
                    estimulo: {
                        connectOrCreate: {
                            where: { nome: s.label },
                            create: {
                                nome: s.label,
                                descricao: s.description ?? null,
                            },
                        },
                    },
                })),
            },
            area: data.area,
            desempenho_atual: isTO ? (data.currentPerformanceLevel ?? null) : null,
        },
    });
}

export async function SpeechSession (input: CreateSpeechSessionInput) {
    const { programId, patientId, therapistId, notes, attempts, files = [], area } = input;

    const ocp = await prisma.ocp.findUnique({
        where: { id: programId },
        include: { estimulo_ocp: true },
    });

    if (!ocp) {
        throw new Error('Programa não encontrado.');
    }

    const trialsData = attempts.map((a) => {
        const link = ocp.estimulo_ocp.find((v) => v.id_estimulo === Number(a.stimulusId));

        if (!link) {
            throw new Error(`A atividade ${a.stimulusId} não pertence a este programa.`);
        }

        return {
            estimulos_ocp_id: link.id,
            ordem: a.attemptNumber,
            resultado: a.type,
        };
    });

    const uploadedFiles = await uploadSessionFiles(files, programId, patientId);

    return await createSessionInDatabase({
        programId,
        patientId,
        therapistId,
        notes,
        area,
        trialsData,
        uploadedFiles,
    })
}

export async function TOSession(input: CreateToSessionInput) {
    const { programId, patientId, therapistId, notes, attempts, files = [], area } = input;

    const ocp = await prisma.ocp.findUnique({
        where: { id: programId },
        include: { estimulo_ocp: true },
    });

    if (!ocp) {
        throw new Error('Programa não encontrado.');
    }

    const trialsData = attempts.map((a) => {
        const vinculo = ocp.estimulo_ocp.find((v) => v.id_estimulo === Number(a.activityId));

        if (!vinculo) {
            throw new Error(`A atividade ${a.activityId} não pertence a este programa.`);
        }

        a.type = mapPerformanceType(a.type);

        return {
            estimulos_ocp_id: vinculo.id,
            ordem: a.attemptNumber,
            resultado: a.type,
            duracao_minutos: a.durationMinutes ?? null,
        };
    });

    const uploadedFiles = await uploadSessionFiles(files, programId, patientId);

    return await createSessionInDatabase({
        programId,
        patientId,
        therapistId,
        notes,
        area,
        trialsData,
        uploadedFiles,
    });
}

export async function physiotherapySession(input: CreatePhysiotherapySessionInput) {
    const { programId, patientId, therapistId, notes, attempts, files = [], area } = input;

    const ocp = await prisma.ocp.findUnique({
        where: { id: programId },
        include: { estimulo_ocp: true },
    });

    if (!ocp) {
        throw new Error('Programa não encontrado.');
    }

    const trialsData = attempts.map((a) => {
        const vinculo = ocp.estimulo_ocp.find((v) => v.id_estimulo === Number(a.activityId));

        if (!vinculo) {
            throw new Error(`A atividade ${a.activityId} não pertence a este programa.`);
        }

        a.type = mapPerformanceType(a.type);

        return {
            estimulos_ocp_id: vinculo.id,
            ordem: a.attemptNumber,
            resultado: a.type,
            duracao_minutos: a.durationMinutes ?? null,
            utilizou_carga: a.usedLoad ?? false,
            valor_carga: parseLoadValue(a.loadValue),
            teve_desconforto: a.hadDiscomfort ?? false,
            descricao_desconforto: a.discomfortDescription ?? null,
            teve_compensacao: a.hadCompensation ?? false,
            descricao_compensacao: a.compensationDescription ?? null,
        };
    });

    const uploadedFiles = await uploadSessionFiles(files, programId, patientId);

    return await createSessionInDatabase({
        programId,
        patientId,
        therapistId,
        notes,
        area,
        trialsData,
        uploadedFiles,
    });
}

function mapPerformanceType(type: string): string {
    const map: Record<string, string> = {
        'desempenhou': 'independent',
        'desempenhou-com-ajuda': 'prompted',
        'nao-desempenhou': 'error'
    };

    return map[type] ?? 'error';
}

async function uploadSessionFiles(files: Express.Multer.File[], programId: number, patientId: string) {
  const uploadedFiles = [];

  for (const file of files) {
    const uploaded = await R2UploadService.uploadFile({
      buffer: file.buffer,
      contentType: file.mimetype,
      filename: file.originalname,
      programId,
      patientId,
    });

    uploadedFiles.push({
      nome: file.originalname,
      caminho: uploaded.key,
      tamanho: file.size,
    });
  }

  return uploadedFiles;
}

async function createSessionInDatabase(input: CreateSessionInDatabaseInput) {
  const {
    programId,
    patientId,
    therapistId,
    notes,
    area,
    trialsData,
    uploadedFiles,
  } = input;

  return prisma.sessao.create({
    data: {
      ocp_id: programId,
      cliente_id: patientId,
      terapeuta_id: therapistId,
      observacoes_sessao: notes?.trim() || null,
      area,

      trials: { create: trialsData },
      arquivos: { create: uploadedFiles },
    },

    include: {
      trials: true,
      arquivos: true,
    },
  });
}

function parseLoadValue(raw: string | number | null | undefined): number | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'number') {
        return Number.isFinite(raw) ? raw : null;
    }

    const normalized = raw
        .trim()
        .replace(',', '.')
        .replace(/[^0-9.]/g, '');

    if (!normalized) return null;

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
}