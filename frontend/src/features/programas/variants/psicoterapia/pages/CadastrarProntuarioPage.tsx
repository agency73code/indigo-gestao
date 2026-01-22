/**
 * Página de Cadastro de Prontuário Psicológico
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/ui/button';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import VerticalStepSidebar from '@/features/cadastros/components/VerticalStepSidebar';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/components/dialogs/UnsavedChangesDialog';
import {
    CabecalhoIdentificacao,
    InformacoesEducacionaisSection,
    NucleoFamiliar,
    AvaliacaoDemandaSection,
    ObjetivosTrabalho,
    AvaliacaoAtendimento,
} from '../components';
import { useProntuarioForm } from '../hooks';
import { PRONTUARIO_STEPS } from '../types';
import { 
    User, 
    GraduationCap, 
    Users, 
    FileText,
    Target,
    ClipboardCheck
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Ícones personalizados para cada step
const STEP_ICONS: LucideIcon[] = [
    User,          // 1. Identificação
    GraduationCap, // 2. Informações Educacionais
    Users,         // 3. Núcleo Familiar
    FileText,      // 4. Avaliação da Demanda
    Target,        // 5. Objetivos de Trabalho
    ClipboardCheck // 6. Avaliação do Atendimento
];

export default function CadastrarProntuarioPage() {
    const navigate = useNavigate();
    const { prontuarioId } = useParams<{ prontuarioId?: string }>();
    const isEditMode = !!prontuarioId;
    
    // Configurar título da página
    const { setPageTitle, setNoMainContainer, setShowBackButton } = usePageTitle();
    
    useEffect(() => {
        setPageTitle(isEditMode ? 'Editar Prontuário' : 'Prontuário Psicológico');
        setNoMainContainer(true);
        setShowBackButton(true);
        
        return () => {
            setNoMainContainer(false);
            setShowBackButton(false);
        };
    }, [setPageTitle, setNoMainContainer, setShowBackButton, isEditMode]);
    
    const [currentStep, setCurrentStep] = useState(1);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
    // Hook do formulário (passa prontuarioId para modo de edição)
    const {
        formData,
        setFormData,
        isLoading,
        isSaving,
        hasChanges,
        prontuarioExistente,
        handleClienteSelect,
        handleAddMembroFamiliar,
        handleRemoveMembroFamiliar,
        handleSave,
        resetForm,
    } = useProntuarioForm(prontuarioId);

    // Hook de mudanças não salvas
    const { 
        isBlocked, 
        proceed, 
        reset 
    } = useUnsavedChanges({
        isDirty: hasChanges && !!formData.clienteId,
    });

    // Validação básica do step atual
    const validateCurrentStep = useCallback((): boolean => {
        const errors: string[] = [];
        const fields: Record<string, string> = {};

        switch (currentStep) {
            case 1: // Identificação
                if (!formData.clienteId) {
                    errors.push('Selecione um cliente');
                    fields.clienteId = 'Cliente é obrigatório';
                }
                break;
            case 4: // Avaliação da Demanda
                if (!formData.motivoBuscaAtendimento?.trim()) {
                    errors.push('Motivo da busca é obrigatório');
                    fields.motivoBuscaAtendimento = 'Campo obrigatório';
                }
                break;
            case 5: // Objetivos de Trabalho
                if (!formData.objetivosTrabalho?.trim()) {
                    errors.push('Objetivos de trabalho são obrigatórios');
                    fields.objetivosTrabalho = 'Campo obrigatório';
                }
                break;
        }

        setValidationErrors(errors);
        setFieldErrors(fields);
        return errors.length === 0;
    }, [currentStep, formData]);

    // Navegação entre steps
    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setValidationErrors([]);
            setFieldErrors({});
        }
    };

    const handleNextStep = () => {
        if (validateCurrentStep()) {
            if (currentStep < PRONTUARIO_STEPS.length) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    // Salvar prontuário
    const handleSubmit = async () => {
        // Validar campos obrigatórios
        if (!formData.clienteId) {
            toast.error('Selecione um cliente para continuar');
            setCurrentStep(1);
            return;
        }
        
        if (!formData.motivoBuscaAtendimento?.trim()) {
            toast.error('Preencha o motivo da busca pelo atendimento');
            setCurrentStep(4);
            return;
        }
        
        if (!formData.objetivosTrabalho?.trim()) {
            toast.error('Preencha os objetivos de trabalho');
            setCurrentStep(5);
            return;
        }

        const result = await handleSave();
        
        if (result) {
            // Redirecionar para a página de detalhe do prontuário
            navigate(`/app/programas/psicoterapia/prontuario/${result.id}`);
        }
    };

    // Click no step da sidebar
    const handleStepClick = (step: number) => {
        // Permitir ir para steps anteriores ou atual
        if (step <= currentStep) {
            setCurrentStep(step);
            setValidationErrors([]);
            setFieldErrors({});
        }
    };

    // Renderizar conteúdo do step atual
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <CabecalhoIdentificacao
                        data={formData}
                        onChange={setFormData}
                        onClienteSelect={handleClienteSelect}
                        isLoading={isLoading}
                        prontuarioExistente={prontuarioExistente}
                        fieldErrors={fieldErrors}
                        isEditMode={isEditMode}
                    />
                );
            case 2:
                return (
                    <InformacoesEducacionaisSection
                        data={formData}
                        onChange={setFormData}
                        fieldErrors={fieldErrors}
                    />
                );
            case 3:
                return (
                    <NucleoFamiliar
                        data={formData}
                        onChange={setFormData}
                        onAddMembro={handleAddMembroFamiliar}
                        onRemoveMembro={handleRemoveMembroFamiliar}
                        fieldErrors={fieldErrors}
                    />
                );
            case 4:
                return (
                    <AvaliacaoDemandaSection
                        data={formData}
                        onChange={setFormData}
                        fieldErrors={fieldErrors}
                    />
                );
            case 5:
                return (
                    <ObjetivosTrabalho
                        data={formData}
                        onChange={setFormData}
                        fieldErrors={fieldErrors}
                    />
                );
            case 6:
                return (
                    <AvaliacaoAtendimento
                        data={formData}
                        onChange={setFormData}
                        fieldErrors={fieldErrors}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="flex h-full gap-1">
                {/* Sidebar Vertical com Steps */}
                <div 
                    className="w-64 shrink-0"
                    style={{ 
                        backgroundColor: 'var(--header-bg)',
                        borderRadius: '16px'
                    }}
                >
                    <VerticalStepSidebar
                        currentStep={currentStep}
                        totalSteps={PRONTUARIO_STEPS.length}
                        steps={[...PRONTUARIO_STEPS]}
                        stepIcons={STEP_ICONS}
                        onStepClick={handleStepClick}
                    />
                </div>

                {/* Card Principal com Formulário */}
                <div 
                    className="flex-1 flex flex-col min-w-0 p-4"
                    style={{ 
                        backgroundColor: 'var(--header-bg)',
                        borderRadius: '16px'
                    }}
                >
                    {/* Área de conteúdo com scroll */}
                    <div className="flex-1 overflow-y-auto">
                        <div>
                            {/* Erros de validação */}
                            {validationErrors.length > 0 && (
                                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <div className="flex items-center gap-2 text-destructive mb-2">
                                        <AlertCircle className="h-5 w-5" />
                                        <span className="font-medium">Campos obrigatórios</span>
                                    </div>
                                    <ul className="list-disc list-inside text-sm text-destructive/80">
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Conteúdo do Step */}
                            <div>
                                {renderStepContent()}
                            </div>
                        </div>
                    </div>

                    {/* Footer com navegação */}
                    <div className="shrink-0 pt-4 mt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={handlePreviousStep}
                                disabled={currentStep === 1}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Anterior
                            </Button>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Passo {currentStep} de {PRONTUARIO_STEPS.length}</span>
                            </div>

                            {currentStep < PRONTUARIO_STEPS.length ? (
                                <Button
                                    onClick={handleNextStep}
                                    disabled={!formData.clienteId && currentStep === 1}
                                >
                                    Próximo
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>Salvando...</>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Salvar Prontuário
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog de mudanças não salvas */}
            <UnsavedChangesDialog
                open={isBlocked}
                onConfirm={() => {
                    resetForm();
                    proceed?.();
                }}
                onCancel={() => reset?.()}
                title="Prontuário em andamento"
                description="Você tem um prontuário em andamento que não foi salvo. Se sair agora, todos os dados preenchidos serão perdidos. Deseja continuar?"
            />
        </>
    );
}
