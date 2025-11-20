import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { buildOwnerFolderName, sanitizeFolderName } from "../file/r2/createFolder.js";

dayjs.locale("pt-br");

interface EnsureReportFolderParams {
    fullName: string;
    birthDate: string;
    periodStart: Date;
}

export interface ReportFolderInfo {
    basePrefix: string;
    reportsPrefix: string;
    monthPrefix: string;
    monthFolderName: string;
    clientFolderName: string;
}

export function ensureMonthlyReportFolder({ fullName, birthDate, periodStart }: EnsureReportFolderParams): ReportFolderInfo {
    const clientFolderName = buildOwnerFolderName(fullName, birthDate);
    const monthFolderName = buildMonthFolderName(periodStart);

    const basePrefix = `clientes/${clientFolderName}`;
    const reportsPrefix = `${basePrefix}/relatorios`;
    const monthPrefix = `${reportsPrefix}/${monthFolderName}`;

    return {
        basePrefix,
        reportsPrefix,
        monthPrefix,
        monthFolderName,
        clientFolderName,
    };
}

function buildMonthFolderName(date: Date) {
    const reference = dayjs(date);
    const monthKey = reference.format('YYYY-MM');
    const monthLabel = reference.locale('pt-br').format('MMM');
    const normalizedMonth = sanitizeFolderName(monthLabel);
    return `${monthKey}_${normalizedMonth}`;
}