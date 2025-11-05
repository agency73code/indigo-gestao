import LinkCard from './LinkCard';
import type {
  LinkListProps,
  PatientWithLinks,
  TherapistWithLinks,
  SupervisorWithLinks,
  PatientTherapistLink,
  TherapistSupervisionLink,
} from '../types';

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
    onAddPatient,
    onEndLink,
    onArchiveLink,
    onReactivateLink,
    onTransferResponsible,
    onEndSupervisionLink,
    onArchiveSupervisionLink,
    onReactivateSupervisionLink,
    onToggleSupervisionScope,
    onAddTherapistToSupervisor,
    onBulkEndSupervisionLinks,
    onBulkArchiveSupervisionLinks,
    onBulkReactivateSupervisionLinks,
    onBulkEndLinks,
    onBulkArchiveLinks,
    onBulkReactivateLinks,
}: LinkListProps) {
    // Helper functions to find patient/therapist by ID
    const findPatient = (id: string) => patients.find((p) => p.id === id);
    const findTherapist = (id: string) => therapists.find((t) => t.id === id);

    // Group links by patient or therapist based on viewBy
    const groupedData =
        filters.viewBy === 'patient'
            ? groupLinksByPatient(links)
            : filters.viewBy === 'therapist'
            ? groupLinksByTherapist(links)
            : groupLinksBySupervisor(supervisionLinks);

    const sortedGroupedData = sortGroups(groupedData, filters.orderBy);

    function groupLinksByPatient(links: PatientTherapistLink[]) {
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

    function groupLinksByTherapist(links: PatientTherapistLink[]) {
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

    function groupLinksBySupervisor(links: TherapistSupervisionLink[]) {
        const grouped = new Map<string, SupervisorWithLinks>();

        links.forEach((link) => {
            const foundSupervisor = findTherapist(link.supervisorId);
            
            // Se não encontrar o supervisor, cria um placeholder
            const supervisor = foundSupervisor || {
                id: link.supervisorId || 'unknown',
                nome: 'Supervisor não encontrado',
                email: '',
                cpf: '',
            } as any;

            const supervisorId = supervisor.id || 'unknown';

            if (!grouped.has(supervisorId)) {
                grouped.set(supervisorId, {
                    supervisor,
                    links: [],
                });
            }

            grouped.get(supervisorId)!.links.push(link);
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
                        onAddPatient={onAddPatient}
                        onEndLink={onEndLink}
                        onArchive={onArchiveLink}
                        onReactivate={onReactivateLink}
                        onTransferResponsible={onTransferResponsible}
                        onEndSupervision={onEndSupervisionLink}
                        onArchiveSupervision={onArchiveSupervisionLink}
                        onReactivateSupervision={onReactivateSupervisionLink}
                        onToggleSupervisionScope={onToggleSupervisionScope}
                        onAddTherapistToSupervisor={onAddTherapistToSupervisor}
                        onBulkEndSupervision={onBulkEndSupervisionLinks}
                        onBulkArchiveSupervision={onBulkArchiveSupervisionLinks}
                        onBulkReactivateSupervision={onBulkReactivateSupervisionLinks}
                        onBulkEndLinks={onBulkEndLinks}
                        onBulkArchiveLinks={onBulkArchiveLinks}
                        onBulkReactivateLinks={onBulkReactivateLinks}
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
