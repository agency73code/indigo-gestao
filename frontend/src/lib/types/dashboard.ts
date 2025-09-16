export interface TrendPoint {
    week: string;
    accuracy: number;
}

export interface DashboardOverview {
    activePatients: number;
    weeklySessions: number;
    activeOCPPrograms: number;
    stimuliAccuracy: number;
    moodAccuracyTrend: TrendPoint[];
}
