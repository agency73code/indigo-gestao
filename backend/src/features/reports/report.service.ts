import dayjs from 'dayjs';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { sanitizeFolderName } from '../file/r2/createFolder.js';
import { ensureMonthlyReportFolder } from './report-drive.service.js';
import { formatDateOnly } from './report.utils.js';
import type { ReportListFilters, ReportStatus, ReportType, SavedReport, StructuredReportData } from './report.types.js';
import { deleteFromR2 } from '../file/files.service.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../config/r2.js'; 

const reportInclude = {
    cliente: {
        select: {
            id: true,
            nome: true,
            cpf: true,
            dataNascimento: true,
        },
    },
    terapeuta: {
        select: {
            id: true,
            nome: true,
            email: true,
            email_indigo: true,
        },
    },
};

type ReportRecord = Prisma.relatorioGetPayload<{ include: typeof reportInclude; }>;

interface SaveReportInput {
    title: string;
    type: ReportType;
    status: ReportStatus;
    patientId: string;
    therapistId: string;
    periodStart: Date;
    periodEnd: Date;
    clinicalObservations?: string;
    data: StructuredReportData;
    pdfFile: Express.Multer.File;
}

export async function saveReport(input: SaveReportInput): Promise<SavedReport> {
    if (!input.pdfFile) {
        throw new AppError('REPORT_PDF_REQUIRED', 'O arquivo PDF do relatório é obrigatório.', 400);
    }

    const patient = await prisma.cliente.findUnique({
        where: { id: input.patientId },
        select: { id: true, nome: true, dataNascimento: true },
    });

    if (!patient) {
        throw new AppError('PATIENT_NOT_FOUND', 'Cliente não encontrado para salvar o relatório.', 404);
    }

    const therapist = await prisma.terapeuta.findUnique({
        where: { id: input.therapistId },
        select: { id: true },
    });

    if (!therapist) {
        throw new AppError('THERAPIST_NOT_FOUND', 'Terapeuta não encontrado para salvar o relatório.', 404);
    }

    const folderInfo = await ensureMonthlyReportFolder({
        fullName: patient.nome ?? 'Cliente Indigo',
        birthDate: patient.dataNascimento ? formatDateOnly(patient.dataNascimento) : 'sem-data',
        periodStart: input.periodStart,
    });

    const fileDescriptor = buildReportFileDescriptor(input.title, patient.nome ?? 'cliente', input.periodStart);

    const ext = '.pdf';
    const fileName = `${sanitizeFolderName(fileDescriptor)}${ext}`;
    
    const storageKey = `${folderInfo.monthPrefix}/${fileName}`;

    const r2Meta = await uploadReportToR2(storageKey, input.pdfFile);

    const created = await prisma.relatorio.create({
        data: {
            titulo: input.title,
            tipo: input.type,
            status: input.status,
            periodo_inicio: input.periodStart,
            periodo_fim: input.periodEnd,
            observacoes_clinicas: input.clinicalObservations ?? null,
            filtros: input.data.filters as Prisma.InputJsonValue,
            dados_gerados: input.data.generatedData as Prisma.InputJsonValue,
            pdf_arquivo_id: r2Meta.storageId,
            pdf_nome: r2Meta.name,
            pdf_mime: r2Meta.mimeType,
            pdf_tamanho: r2Meta.size,
            pdf_url: null,
            pasta_relatorios_drive: folderInfo.monthPrefix,
            cliente: { connect: { id: patient.id } },
            terapeuta: { connect: { id: therapist.id } },
        },
        include: reportInclude,
    });

    return mapToSavedReport(created);
}

export async function listReports(filters: ReportListFilters = {}): Promise<SavedReport[]> {
    const where: Prisma.relatorioWhereInput = {};

    if (filters.patientId) {
        where.clienteId = filters.patientId;
    }

    const therapistFilter = filters.restrictToTherapistId ?? filters.therapistId;
    if (therapistFilter) {
        where.terapeutaId = therapistFilter;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.type) {
        where.tipo = filters.type;
    }

    const andConditions: Prisma.relatorioWhereInput[] = [];
    if (filters.startDate) {
        andConditions.push({ periodo_inicio: { gte: filters.startDate } });
    }
    if (filters.endDate) {
        andConditions.push({ periodo_fim: { lte: filters.endDate } });
    }

    if (andConditions.length > 0) {
        where.AND = andConditions;
    }

    const records = await prisma.relatorio.findMany({
        where,
        orderBy: { criado_em: 'desc' },
        include: reportInclude,
    });

    return records.map(mapToSavedReport);
}

export async function getReportById(id: string): Promise<SavedReport | null> {
    const record = await prisma.relatorio.findUnique({
        where: { id },
        include: reportInclude,
    });

    if (!record) return null;

    return mapToSavedReport(record as ReportRecord);
}

export async function getReportRecord(id: string): Promise<ReportRecord | null> {
    return prisma.relatorio.findUnique({ where: { id }, include: reportInclude });
}

export async function deleteReport(record: Pick<ReportRecord, 'id' | 'pdf_arquivo_id'>): Promise<void> {
    if (record.pdf_arquivo_id) {
        await deleteFromR2(record.pdf_arquivo_id);
    }

    await prisma.relatorio.delete({ where: { id: record.id } });
}

function mapToSavedReport(record: ReportRecord): SavedReport {
    return {
        id: record.id,
        title: record.titulo,
        type: record.tipo as ReportType,
        status: (record.status as ReportStatus) ?? 'final',
        patientId: record.clienteId,
        therapistId: record.terapeutaId,
        periodStart: formatDateOnly(record.periodo_inicio),
        periodEnd: formatDateOnly(record.periodo_fim),
        createdAt: record.criado_em.toISOString(),
        updatedAt: record.atualizado_em.toISOString(),
        filters: normalizeJsonValue(record.filtros),
        generatedData: normalizeJsonValue(record.dados_gerados),

        ...(record.observacoes_clinicas && {
            clinicalObservations: record.observacoes_clinicas,
        }),

        ...(record.pdf_arquivo_id && {
            pdfUrl: `/api/arquivos/${encodeURIComponent(record.pdf_arquivo_id)}/view`,
        }),
        ...(record.pdf_nome && { pdfFilename: record.pdf_nome }),
        ...(record.pasta_relatorios_drive && {
            r2FolderPath: record.pasta_relatorios_drive,
        }),

        ...(record.cliente && {
            patient: {
                id: record.cliente.id,
                nome: record.cliente.nome,
                cpf: record.cliente.cpf,
                dataNascimento: record.cliente.dataNascimento ?? null,
            },
        }),

        ...(record.terapeuta && {
            therapist: {
                id: record.terapeuta.id,
                nome: record.terapeuta.nome,
                email: record.terapeuta.email,
                email_indigo: record.terapeuta.email_indigo,
            },
        }),
    };
}

function normalizeJsonValue(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
    if (value && typeof value === 'object') {
        return value as Record<string, unknown>;
    }
    return {};
}

function buildReportFileDescriptor(title: string, patientName: string, periodStart: Date) {
    const monthKey = dayjs(periodStart).format('YYYY-MM');
    const normalizedTitle = sanitizeFolderName(title);
    const normalizedPatient = sanitizeFolderName(patientName);
    return `relatorio_${monthKey}_${normalizedPatient}_${normalizedTitle}`;
}

async function uploadReportToR2(path: string, file: Express.Multer.File) {
    const bucket = process.env.R2_BUCKET;

    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: path,
            Body: file.buffer,
            ContentType: file.mimetype,
        })
    );

    return {
        storageId: path,
        name: path.split('/').pop()!,
        mimeType: file.mimetype,
        size: file.size,
    };
} 