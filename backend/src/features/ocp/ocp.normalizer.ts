export type createOCP = {
    clientId: string;
    therapistId: string;
    name: string | null;
    goalTitle: string;
    goalDescription?: string | null;
    criteria?: string | null;
    notes?: string | null;
    stimuli: {
        label: string;
        description?: string;
        active: boolean;
        order: number;
    }[];
}