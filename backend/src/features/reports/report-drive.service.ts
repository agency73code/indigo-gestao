import dayjs from "dayjs";
import "dayjs/locale/pt-br.js";
import { buildOwnerFolderName, sanitizeFolderName } from "../file/r2/createFolder.js";

dayjs.locale("pt-br");

interface EnsureReportFolderParams {
    fullName: string;
    birthDate: string;
    generationDate: Date;
    area?: string;
}

export interface ReportFolderInfo {
    basePrefix: string;
    reportsPrefix: string;
    monthPrefix: string;
    monthFolderName: string;
    clientFolderName: string;
    areaFolderName?: string;
}

export function ensureMonthlyReportFolder({ fullName, birthDate, generationDate, area }: EnsureReportFolderParams): ReportFolderInfo {
    const clientFolderName = buildOwnerFolderName(fullName, birthDate);
    const monthFolderName = buildMonthFolderName(generationDate);

    const basePrefix = `clientes/${clientFolderName}`;
    const reportsPrefix = `${basePrefix}/relatorios`;
    const areaFolderName = area ? sanitizeFolderName(area) : '';
    const areaPrefix = areaFolderName ? `${reportsPrefix}/${areaFolderName}` : reportsPrefix;
    const monthPrefix = `${areaPrefix}/${monthFolderName}`;

    return {
        basePrefix,
        reportsPrefix: areaPrefix,
        monthPrefix,
        monthFolderName,
        clientFolderName,
        areaFolderName,
    };
}

function buildMonthFolderName(date: Date) {
    const reference = dayjs(date);
    const monthKey = reference.format('YYYY-MM');
    const monthLabel = reference.locale('pt-br').format('MMM');
    const normalizedMonth = sanitizeFolderName(monthLabel);
    return `${monthKey}_${normalizedMonth}`;
}