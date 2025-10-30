import LinkCard from './LinkCard';
import type { LinkListProps, PatientWithLinks, TherapistWithLinks, SupervisorWithLinks } from '../types';

type GroupedItem = PatientWithLinks | TherapistWithLinks | SupervisorWithLinks;

export default function LinkList({
    links,
    supervisionLinks,
    loading,
    patients,
    therapists,
    filters,
    onEditLink,
    onAddTherapist,
    onEndLink,
    onArchiveLink,
    onTransferResponsible,
    onEditSupervisionLink,
    onEndSupervisionLink,
    onArchiveSupervisionLink,
}: LinkListProps) {
    // Helper functions to find patient/therapist by ID
    const findPatient = (id: string) => patients.find((p) => p.id === id);
    const findTherapist = (id: string) => therapists.find((t) => t.id === id);

    // Filter links based on active filters
    const filteredLinks = filters.viewBy === 'supervision' ? [] : links.filter((link) => {
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

    // Filter supervision links
    const filteredSupervisionLinks = filters.viewBy !== 'supervision' ? [] : supervisionLinks.filter((link) => {
        if (filters.status && filters.status !== 'all' && link.status !== filters.status) {
            return false;
        }
        if (filters.q) {
            const supervisor = findTherapist(link.supervisorId);
            const therapist = findTherapist(link.supervisedTherapistId);
            const searchTerm = filters.q.toLowerCase();
            const supervisorName = supervisor?.nome?.toLowerCase() || '';
            const therapistName = therapist?.nome?.toLowerCase() || '';

            if (!supervisorName.includes(searchTerm) && !therapistName.includes(searchTerm)) {
                return false;
            }
        }
        return true;
    });

    // Group links by patient or therapist based on viewBy
    const groupedData =
        filters.viewBy === 'patient'
            ? groupLinksByPatient(filteredLinks)
            : filters.viewBy === 'therapist'
            ? groupLinksByTherapist(filteredLinks)
            : groupLinksBySupervisor(filteredSupervisionLinks);

    const sortedGroupedData = sortGroups(groupedData, filters.orderBy);

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

    function groupLinksBySupervisor(links: typeof filteredSupervisionLinks) {
        const grouped = new Map<string, SupervisorWithLinks>();

        links.forEach((link) => {
            const supervisor = findTherapist(link.supervisorId);
            
            if (!supervisor || !supervisor.id) return;

            if (!grouped.has(supervisor.id)) {
                grouped.set(supervisor.id, {
                    supervisor,
                    links: [],
                });
            }

            grouped.get(supervisor.id)!.links.push(link);
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

    if (sortedGroupedData.length === 0) {
        const emptyMessage =
            filters.viewBy === 'patient'
                ? 'Nenhum cliente encontrado com os filtros aplicados'
                : filters.viewBy === 'therapist'
                ? 'Nenhum terapeuta encontrado com os filtros aplicados'
                : 'Nenhum supervisor encontrado com os filtros aplicados';

        return (
            <div className="text-center py-8 text-gray-500">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
            {sortedGroupedData.map((item) => {
                const key = 'patient' in item 
                    ? item.patient.id 
                    : 'therapist' in item 
                    ? item.therapist.id 
                    : item.supervisor.id;
                    
                const props =
                    filters.viewBy === 'patient'
                        ? { patientWithLinks: item as PatientWithLinks }
                        : filters.viewBy === 'therapist'
                        ? { therapistWithLinks: item as TherapistWithLinks }
                        : { supervisorWithLinks: item as SupervisorWithLinks };

                return (
                    <LinkCard
                        key={key}
                        {...props}
                        viewBy={filters.viewBy || 'patient'}
                        patients={patients}
                        therapists={therapists}
                        onEdit={onEditLink}
                        onAddTherapist={onAddTherapist}
                        onEndLink={onEndLink}
                        onArchive={onArchiveLink}
                        onTransferResponsible={onTransferResponsible}
                        onEditSupervision={onEditSupervisionLink}
                        onEndSupervision={onEndSupervisionLink}
                        onArchiveSupervision={onArchiveSupervisionLink}
                    />
                );
            })}
        </div>
    );

    function sortGroups(groups: GroupedItem[], orderBy: LinkListProps['filters']['orderBy']) {
        const sorted = [...groups];

        if (sorted.length <= 1) {
            return sorted;
        }

        if (orderBy === 'alpha') {
            return sorted.sort((a, b) =>
                getGroupDisplayName(a).localeCompare(getGroupDisplayName(b), 'pt-BR', {
                    sensitivity: 'base',
                }),
            );
        }

        return sorted.sort((a, b) => getMostRecentTimestamp(b) - getMostRecentTimestamp(a));
    }

    function getGroupDisplayName(item: GroupedItem) {
        if ('patient' in item) {
            return item.patient?.nome ?? '';
        }

        if ('therapist' in item) {
            return item.therapist?.nome ?? '';
        }

        return item.supervisor?.nome ?? '';
    }

    function getMostRecentTimestamp(item: GroupedItem) {
        const timestamps = item.links
            .map((link) => new Date(link.updatedAt || link.createdAt).getTime())
            .filter((time) => !Number.isNaN(time));

        if (timestamps.length === 0) {
            return 0;
        }

        return Math.max(...timestamps);
    }
}
