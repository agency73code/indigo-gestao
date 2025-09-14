// Components exports
export { default as HeaderInfo } from './components/HeaderInfo';
export { default as GoalSection } from './components/GoalSection';
export { default as StimuliEditor } from './components/StimuliEditor';
export { default as StimulusRow } from './components/StimulusRow';
export { default as CriteriaSection } from './components/CriteriaSection';
export { default as NotesSection } from './components/NotesSection';
export { default as StatusToggle } from './components/StatusToggle';
export { default as SaveBar } from './components/SaveBar';
export { default as ValidationErrors } from './components/ValidationErrors';

// Types exports
export type { 
    Patient, 
    Therapist, 
    StimulusInput, 
    ProgramStatus, 
    ProgramDetail, 
    UpdateProgramInput
} from './types';

export type { ValidationErrors as ValidationErrorsType } from './types';

// Services exports
export { 
    fetchProgramById, 
    updateProgram, 
    createProgramVersion, 
    archiveProgram 
} from './services';