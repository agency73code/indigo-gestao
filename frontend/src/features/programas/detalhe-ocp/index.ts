// Components exports
export { default as HeaderProgram } from './components/HeaderProgram';
export { default as GoalSection } from './components/GoalSection';
export { default as CriteriaSection } from './components/CriteriaSection';
export { default as NotesSection } from './components/NotesSection';
export { default as StimuliSection } from './components/StimuliSection';
export { default as SessionsList } from './components/SessionsList';
export { default as LastSessionPreview } from './components/LastSessionPreview';
export { default as SummaryCard } from './components/SummaryCard';
export { default as ActionBar } from './components/ActionBar';
export { default as ErrorBanner } from './components/ErrorBanner';
export { default as EmptyState } from './components/EmptyState';

// Types exports
export type { ProgramDetail, SessionListItem } from './types';

// Services exports
export { fetchProgramById, fetchRecentSessions } from './services';
