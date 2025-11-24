// Components
export { default as HeaderInfo } from './components/HeaderInfo';
export { default as GoalSection } from './components/GoalSection';
export { default as StimuliList } from './components/StimuliList';
export { default as StimulusRow } from './components/StimulusRow';
export { default as CriteriaSection } from './components/CriteriaSection';
export { default as CurrentPerformanceSection } from './components/CurrentPerformanceSection';
export { default as NotesSection } from './components/NotesSection';
export { default as SaveBar } from './components/SaveBar';

// Types
export type {
    Patient,
    Therapist,
    StimulusInput,
    CreateProgramInput,
    ProgramStatus,
    ValidationErrors,
    FormState,
} from './types';

// Services
export {
    fetchPatientById,
    fetchTherapistById,
    createProgram,
    searchPatients,
    searchTherapists,
} from './services';
