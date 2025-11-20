import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { createFolder, getOrCreateFolder, buildOwnerFolderName, sanitizeFolderName } from "../file/drive/createFolder.js";

dayjs.locale("pt-br");

interface EnsureReportFolderParams {
    fullName: string;
    birthDate: string;
    periodStart: Date;
    rootFolderId: string;
}

export interface ReportFolderInfo {
    parentId: string;
    reportsFolderId: string;
    monthFolderId: string;
    monthFolderName: string;
    clientFolderName: string;
    drivePath: string;
}

export async function ensureMonthlyReportFolder({ fullName, birthDate, periodStart, rootFolderId }: EnsureReportFolderParams): Promise<ReportFolderInfo> {
    const baseFolder = await createFolder('cliente', fullName, birthDate, rootFolderId);
    const reportsFolderId = await getOrCreateFolder('relatorios', baseFolder.parentId);
    const monthFolderName = buildMonthFolderName(periodStart);
    const monthFolderId = await getOrCreateFolder(monthFolderName, reportsFolderId);
    const clientFolderName = baseFolder.ownerFolderName ?? buildOwnerFolderName(fullName, birthDate);

    return {
        parentId: baseFolder.parentId,
        reportsFolderId,
        monthFolderId,
        monthFolderName,
        clientFolderName,
        drivePath: `${clientFolderName}/relatorios/${monthFolderName}`,
    };
}

function buildMonthFolderName(date: Date) {
    const reference = dayjs(date);
    const monthKey = reference.format('YYYY-MM');
    const monthLabel = reference.locale('pt-br').format('MMM');
    const normalizedMonth = sanitizeFolderName(monthLabel);
    return `${monthKey}_${normalizedMonth}`;
}