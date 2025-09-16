import { getClientesAtivos } from '../api';
import type { DashboardOverview } from '../types/dashboard';

export async function getDashboardOverview():Promise<DashboardOverview> {
    const totalClientesAtivos = await getClientesAtivos();

    return {
        activePatients: totalClientesAtivos ?? 18,
        weeklySessions: 12,
        activeOCPPrograms: 37,
        stimuliAccuracy: 78,
        moodAccuracyTrend: [
            { week: 'Semana 1', accuracy: 72 },
            { week: 'Semana 2', accuracy: 78 },
            { week: 'Semana 3', accuracy: 69 },
            { week: 'Semana 4', accuracy: 81 },
        ],
    }
}