import { CardContent } from '@/components/ui/card';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import type { Patient } from '@/features/programas/consultar-programas/types';

interface PatientBlockProps {
    patient: Patient | null;
    onPatientSelect: (patient: Patient) => void;
    onPatientClear: () => void;
}

export default function PatientBlock({
    patient,
    onPatientSelect,
    onPatientClear,
}: PatientBlockProps) {
    return (
        <CardContent className="">
            <PatientSelector
                selected={patient}
                onSelect={onPatientSelect}
                onClear={onPatientClear}
            />
        </CardContent>
    );
}
