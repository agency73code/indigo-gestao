import LinkCard from './LinkCard';
import type { LinkListProps, PatientWithLinks, TherapistWithLinks } from '../types';

export default function LinkList({
    links,
    loading,
    patients,
    therapists,
    filters,
    onEditLink,
    onAddTherapist,
    onEndLink,
    onArchiveLink,
    onTransferResponsible,
}: LinkListProps) {
    // Helper functions to find patient/therapist by ID
    const findPatient = (id: string) => patients.find((p) => p.id === id);
    const findTherapist = (id: string) => therapists.find((t) => t.id === id);

    // Filter links based on active filters
    const filteredLinks = links.filter((link) => {
        if (filters.status && filters.status !== 'all' && link.status !== filters.status) {
            return false;
        }
        if (filters.q) {
            const patient = findPatient(link.patientId);
            const therapist = findTherapist(link.therapistId);
            const searchTerm = filters.q.toLowerCase();
            const patientName = patient?.nome?.toLowerCase() || '';
            const therapistName = therapist?.nome?.toLowerCase() || '';

            if (!patientName.includes(searchTerm) && !therapistName.includes(searchTerm)) {
                return false;
            }
        }
        return true;
    });

    // Group links by patient or therapist based on viewBy
    const groupedData =
        filters.viewBy === 'patient'
            ? groupLinksByPatient(filteredLinks)
            : groupLinksByTherapist(filteredLinks);

    function groupLinksByPatient(links: typeof filteredLinks) {
        const grouped = new Map<string, PatientWithLinks>();

        links.forEach((link) => {
            const patient = findPatient(link.patientId);
            if (!patient || !patient.id) return;

            if (!grouped.has(patient.id)) {
                grouped.set(patient.id, {
                    patient,
                    links: [],
                });
            }

            grouped.get(patient.id)!.links.push(link);
        });

        return Array.from(grouped.values());
    }

    function groupLinksByTherapist(links: typeof filteredLinks) {
        const grouped = new Map<string, TherapistWithLinks>();

        links.forEach((link) => {
            const therapist = findTherapist(link.therapistId);
            if (!therapist || !therapist.id) return;

            if (!grouped.has(therapist.id)) {
                grouped.set(therapist.id, {
                    therapist,
                    links: [],
                });
            }

            grouped.get(therapist.id)!.links.push(link);
        });

        return Array.from(grouped.values());
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (groupedData.length === 0) {
        const emptyMessage =
            filters.viewBy === 'patient'
                ? 'Nenhum cliente encontrado com os filtros aplicados'
                : 'Nenhum terapeuta encontrado com os filtros aplicados';

        return (
            <div className="text-center py-8 text-gray-500">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
            {groupedData.map((item) => {
                const key = 'patient' in item ? item.patient.id : item.therapist.id;
                const props =
                    filters.viewBy === 'patient'
                        ? { patientWithLinks: item as PatientWithLinks }
                        : { therapistWithLinks: item as TherapistWithLinks };

                return (
                    <LinkCard
                        key={key}
                        {...props}
                        viewBy={filters.viewBy || 'patient'}
                        onEdit={onEditLink}
                        onAddTherapist={onAddTherapist}
                        onEndLink={onEndLink}
                        onArchive={onArchiveLink}
                        onTransferResponsible={onTransferResponsible}
                    />
                );
            })}
        </div>
    );
}
