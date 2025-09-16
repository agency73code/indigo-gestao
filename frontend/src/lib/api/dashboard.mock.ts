import type { DashboardOverview } from '@/lib/types/dashboard';

export async function getDashboardOverviewMock(): Promise<DashboardOverview> {
    return {
        activePatients: 18,
        weeklySessions: 12,
        activeOCPPrograms: 37,
        stimuliAccuracy: 78,
        moodAccuracyTrend: [
            { week: 'Semana 1', accuracy: 72 },
            { week: 'Semana 2', accuracy: 78 },
            { week: 'Semana 3', accuracy: 69 },
            { week: 'Semana 4', accuracy: 81 },
        ],
    };
}
