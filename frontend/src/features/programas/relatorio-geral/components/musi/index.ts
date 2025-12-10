/**
 * Componentes de relatório para Musicoterapia
 * 
 * Componentes específicos de Musicoterapia:
 * - MusiKpiCards: KPI cards com Participação e Suporte (sem tempo)
 * - MusiParticipacaoChart: Radial chart para média de participação (0-5)
 * - MusiSuporteChart: Radial chart para média de suporte (1-5)
 * - MusiParticipacaoSuporteEvolutionChart: Evolução de participação e suporte ao longo do tempo
 * - MusiAttentionActivitiesCard: Atividades que precisam de atenção com participação e suporte
 * 
 * Reutiliza alguns componentes de TO como aliases
 */

// Componentes específicos de Musicoterapia
export { 
    MusiKpiCards,
    type MusiKpisData 
} from './MusiKpiCards';

export { 
    MusiParticipacaoChart,
    type MusiParticipacaoData 
} from './MusiParticipacaoChart';

export { 
    MusiSuporteChart,
    type MusiSuporteData 
} from './MusiSuporteChart';

export {
    MusiParticipacaoSuporteEvolutionChart,
    type MusiEvolutionData
} from './MusiParticipacaoSuporteEvolutionChart';

export {
    MusiAttentionActivitiesCard,
    type MusiAttentionActivityItem
} from './MusiAttentionActivitiesCard';

// Re-exportar componentes de TO como aliases para Musicoterapia
export { 
    ToAutonomyByCategoryChart as MusiAutonomyByCategoryChart,
    type ToAutonomyData as MusiAutonomyData 
} from '../to/ToAutonomyByCategoryChart';
