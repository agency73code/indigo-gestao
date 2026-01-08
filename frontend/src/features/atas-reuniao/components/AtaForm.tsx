/**
 * Formulário de Ata de Reunião
 * 
 * Features:
 * - Cabeçalho read-only (dados do terapeuta logado)
 * - Seleção de participantes (família, externo, clínica)
 * - Campo condicional para finalidade "Outros"
 * - RichTextEditor para conteúdo
 * - Auto-save com useFormDraft
 * - Bloqueio de navegação com alterações não salvas
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Trash2, User, Building2, Users, Loader2, Save, CheckCircle } from 'lucide-react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/components/dialogs/UnsavedChangesDialog';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputField } from '@/ui/input-field';
import { SelectFieldRadix, SelectItem } from '@/ui/select-field-radix';
import { ComboboxField } from '@/ui/combobox-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

import {
    type AtaFormData,
    type CabecalhoAta,
    type Participante,
    type TerapeutaOption,
    type ClienteOption,
    FINALIDADE_REUNIAO,
    FINALIDADE_LABELS,
    MODALIDADE_REUNIAO,
    MODALIDADE_LABELS,
    TIPO_PARTICIPANTE,
    ataFormSchema,
    type FinalidadeReuniao,
    type ModalidadeReuniao,
} from '../types';

import {
    getTerapeutaLogado,
    listTerapeutas,
    listClientes,
    createAta,
    updateAta,
} from '../services/atas.service';

// ============================================
// TIPOS LOCAIS
// ============================================

interface AtaFormProps {
    /** ID da ata para edição (undefined para criação) */
    ataId?: string;
    /** Dados iniciais da ata (para edição) */
    initialData?: AtaFormData;
    /** Callback após salvar com sucesso */
    onSuccess?: () => void;
}

// Valor inicial do formulário
const getInitialFormData = (): AtaFormData => ({
    data: format(new Date(), 'yyyy-MM-dd'),
    horarioInicio: format(new Date(), 'HH:mm'),
    horarioFim: format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm'), // +1 hora
    finalidade: FINALIDADE_REUNIAO.ORIENTACAO_PARENTAL,
    modalidade: MODALIDADE_REUNIAO.PRESENCIAL,
    participantes: [],
    conteudo: '',
    clienteId: '',
    clienteNome: '',
});

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AtaForm({ ataId, initialData, onSuccess }: AtaFormProps) {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estados
    const [cabecalho, setCabecalho] = useState<CabecalhoAta | null>(null);
    const [terapeutas, setTerapeutas] = useState<TerapeutaOption[]>([]);
    const [clientes, setClientes] = useState<ClienteOption[]>([]);
    const [loadingTerapeutas, setLoadingTerapeutas] = useState(true);
    const [loadingClientes, setLoadingClientes] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-save com sessionStorage
    const { value: formData, setValue: setFormData, clearDraft, hasDraft } = useFormDraft<AtaFormData>({
        key: ataId ? `ata_reuniao_edit_${ataId}` : 'ata_reuniao_nova',
        initialValue: initialData ?? getInitialFormData(),
        debounceMs: 1500,
        showRestoreToast: true,
    });

    // Detectar alterações não salvas
    const isDirty = hasDraft || (formData.conteudo.length > 0 || formData.participantes.length > 0);
    const { isBlocked, proceed, reset } = useUnsavedChanges({
        isDirty,
        blockNavigation: !submitting,
    });

    // ============================================
    // EFEITOS - CARREGAR DADOS
    // ============================================

    // Carregar dados do terapeuta logado
    useEffect(() => {
        async function loadCabecalho() {
            if (!user?.id) return;
            try {
                const data = await getTerapeutaLogado(user.id);
                setCabecalho(data);
            } catch (error) {
                console.error('Erro ao carregar dados do terapeuta:', error);
                // Fallback usando dados do user
                setCabecalho({
                    terapeutaId: user.id,
                    terapeutaNome: user.name ?? 'Terapeuta',
                    profissao: undefined,
                    cargo: undefined,
                });
            }
        }
        loadCabecalho();
    }, [user]);

    // Carregar lista de terapeutas
    useEffect(() => {
        async function loadTerapeutas() {
            try {
                const data = await listTerapeutas();
                setTerapeutas(data);
            } catch (error) {
                console.error('Erro ao carregar terapeutas:', error);
                toast.error('Erro ao carregar lista de profissionais');
            } finally {
                setLoadingTerapeutas(false);
            }
        }
        loadTerapeutas();
    }, []);

    // Carregar lista de clientes
    useEffect(() => {
        async function loadClientes() {
            try {
                const data = await listClientes();
                setClientes(data);
            } catch (error) {
                console.error('Erro ao carregar clientes:', error);
                toast.error('Erro ao carregar lista de clientes');
            } finally {
                setLoadingClientes(false);
            }
        }
        loadClientes();
    }, []);

    // ============================================
    // HANDLERS - FORMULÁRIO
    // ============================================

    const updateField = useCallback(<K extends keyof AtaFormData>(field: K, value: AtaFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Limpar erro do campo
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    }, [setFormData, errors]);

    const handleClienteChange = useCallback((clienteId: string) => {
        const cliente = clientes.find((c) => c.id === clienteId);
        setFormData((prev) => ({
            ...prev,
            clienteId,
            clienteNome: cliente?.nome ?? '',
        }));
    }, [clientes, setFormData]);

    // ============================================
    // HANDLERS - PARTICIPANTES
    // ============================================

    const addParticipante = useCallback((tipo: keyof typeof TIPO_PARTICIPANTE) => {
        const novoParticipante: Participante = {
            id: crypto.randomUUID(),
            tipo: TIPO_PARTICIPANTE[tipo],
            nome: '',
            descricao: '',
        };
        setFormData((prev) => ({
            ...prev,
            participantes: [...prev.participantes, novoParticipante],
        }));
    }, [setFormData]);

    const updateParticipante = useCallback((id: string, updates: Partial<Participante>) => {
        setFormData((prev) => ({
            ...prev,
            participantes: prev.participantes.map((p) =>
                p.id === id ? { ...p, ...updates } : p
            ),
        }));
    }, [setFormData]);

    const removeParticipante = useCallback((id: string) => {
        setFormData((prev) => ({
            ...prev,
            participantes: prev.participantes.filter((p) => p.id !== id),
        }));
    }, [setFormData]);

    const selectTerapeutaParticipante = useCallback((participanteId: string, terapeutaId: string) => {
        const terapeuta = terapeutas.find((t) => t.id === terapeutaId);
        if (!terapeuta) return;
        
        updateParticipante(participanteId, {
            terapeutaId,
            nome: terapeuta.nome,
            especialidade: terapeuta.especialidade,
            cargo: terapeuta.cargo,
        });
    }, [terapeutas, updateParticipante]);

    // ============================================
    // VALIDAÇÃO E SUBMIT
    // ============================================

    const validateForm = useCallback((): boolean => {
        const result = ataFormSchema.safeParse(formData);
        
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                const path = err.path.join('.');
                newErrors[path] = err.message;
            });
            setErrors(newErrors);
            
            // Mostrar primeiro erro em toast
            const firstError = result.error.errors[0];
            toast.error(firstError.message);
            return false;
        }
        
        setErrors({});
        return true;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;
        if (!cabecalho) {
            toast.error('Dados do terapeuta não carregados');
            return;
        }

        setSubmitting(true);

        try {
            if (ataId) {
                // Atualizar ata existente
                await updateAta(ataId, { formData });
                toast.success('Ata atualizada com sucesso!');
            } else {
                // Criar nova ata
                await createAta({ formData, cabecalho });
                toast.success('Ata criada com sucesso!');
            }

            clearDraft();
            onSuccess?.();
            navigate('/app/atas');
        } catch (error) {
            console.error('Erro ao salvar ata:', error);
            toast.error('Erro ao salvar ata. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    }, [ataId, cabecalho, formData, validateForm, clearDraft, navigate, onSuccess]);

    // ============================================
    // RENDERIZAÇÃO - DADOS DA REUNIÃO
    // ============================================

    const renderDadosReuniao = () => (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Dados da Reunião</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Data (1/6), Horário Início (1/6), Horário Fim (1/6), Modalidade (1/6), Cliente (2/6) */}
                <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-1">
                        <DateFieldWithLabel
                            label="Data*"
                            value={formData.data}
                            onChange={(iso) => updateField('data', iso)}
                            error={errors['data']}
                        />
                    </div>
                    <div className="col-span-1">
                        <InputField
                            label="Início*"
                            type="time"
                            value={formData.horarioInicio}
                            onChange={(e) => updateField('horarioInicio', e.target.value)}
                            error={errors['horarioInicio']}
                        />
                    </div>
                    <div className="col-span-1">
                        <InputField
                            label="Término*"
                            type="time"
                            value={formData.horarioFim}
                            onChange={(e) => updateField('horarioFim', e.target.value)}
                            error={errors['horarioFim']}
                        />
                    </div>
                    <div className="col-span-1">
                        <SelectFieldRadix
                            label="Modalidade*"
                            value={formData.modalidade}
                            onValueChange={(v) => updateField('modalidade', v as ModalidadeReuniao)}
                            error={errors['modalidade']}
                        >
                            {Object.entries(MODALIDADE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectFieldRadix>
                    </div>
                    <div className="col-span-2">
                        {loadingClientes ? (
                            <Skeleton className="h-[60px] w-full rounded-lg" />
                        ) : (
                            <ComboboxField
                                label="Cliente/Paciente"
                                options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
                                value={formData.clienteId}
                                onValueChange={handleClienteChange}
                                placeholder="Selecione o cliente..."
                                searchPlaceholder="Buscar cliente..."
                                emptyMessage="Nenhum cliente encontrado"
                                error={errors['clienteId']}
                            />
                        )}
                    </div>
                </div>

                {/* Finalidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectFieldRadix
                        label="Finalidade da Reunião*"
                        value={formData.finalidade}
                        onValueChange={(v) => updateField('finalidade', v as FinalidadeReuniao)}
                        error={errors['finalidade']}
                    >
                        {Object.entries(FINALIDADE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectFieldRadix>

                    {/* Campo condicional para "Outros" */}
                    {formData.finalidade === FINALIDADE_REUNIAO.OUTROS && (
                        <InputField
                            label="Descreva a finalidade*"
                            value={formData.finalidadeOutros ?? ''}
                            onChange={(e) => updateField('finalidadeOutros', e.target.value)}
                            placeholder="Ex: Reunião com plano de saúde"
                            error={errors['finalidadeOutros']}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );

    // ============================================
    // RENDERIZAÇÃO - PARTICIPANTES
    // ============================================

    const renderParticipanteItem = (p: Participante) => {
        const isFamilia = p.tipo === TIPO_PARTICIPANTE.FAMILIA;
        const isClinica = p.tipo === TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA;

        return (
            <div
                key={p.id}
                className="flex items-start gap-4 p-4 border rounded-lg bg-card"
            >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isClinica ? (
                        // Profissional da clínica - usar combobox
                        <>
                            {loadingTerapeutas ? (
                                <Skeleton className="h-[60px] w-full rounded-lg" />
                            ) : (
                                <ComboboxField
                                    label="Profissional*"
                                    options={terapeutas.map((t) => ({
                                        value: t.id,
                                        label: t.nome,
                                        searchValue: `${t.nome} ${t.especialidade ?? ''}`,
                                    }))}
                                    value={p.terapeutaId}
                                    onValueChange={(id) => selectTerapeutaParticipante(p.id, id)}
                                    placeholder="Selecione o profissional..."
                                    searchPlaceholder="Buscar profissional..."
                                    emptyMessage="Nenhum profissional encontrado"
                                />
                            )}
                            <InputField
                                label="Especialidade/Cargo"
                                value={p.especialidade ? `${p.especialidade}${p.cargo ? ` - ${p.cargo}` : ''}` : ''}
                                disabled
                                readOnly
                            />
                        </>
                    ) : (
                        // Família ou Profissional Externo - campos manuais
                        <>
                            <InputField
                                label="Nome*"
                                value={p.nome}
                                onChange={(e) => updateParticipante(p.id, { nome: e.target.value })}
                                placeholder={isFamilia ? 'Ex: Maria Silva' : 'Ex: Dr. João Santos'}
                            />
                            <InputField
                                label={isFamilia ? 'Relação com o Cliente' : 'Área de Atuação'}
                                value={p.descricao ?? ''}
                                onChange={(e) => updateParticipante(p.id, { descricao: e.target.value })}
                                placeholder={isFamilia ? 'Ex: Mãe, Pai, Avó' : 'Ex: Pediatra, Neurologista'}
                            />
                        </>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0 mt-4"
                    onClick={() => removeParticipante(p.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    const renderParticipantes = () => {
        const familiaParticipantes = formData.participantes.filter(
            (p) => p.tipo === TIPO_PARTICIPANTE.FAMILIA
        );
        const externoParticipantes = formData.participantes.filter(
            (p) => p.tipo === TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO
        );
        const clinicaParticipantes = formData.participantes.filter(
            (p) => p.tipo === TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA
        );

        return (
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-medium">
                        Participantes da Reunião
                        {errors['participantes'] && (
                            <span className="text-destructive text-sm font-normal ml-2">
                                ({errors['participantes']})
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="familia" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="familia" className="gap-2">
                                <Users className="h-4 w-4" />
                                Família ({familiaParticipantes.length})
                            </TabsTrigger>
                            <TabsTrigger value="externo" className="gap-2">
                                <Building2 className="h-4 w-4" />
                                Externo ({externoParticipantes.length})
                            </TabsTrigger>
                            <TabsTrigger value="clinica" className="gap-2">
                                <User className="h-4 w-4" />
                                Clínica ({clinicaParticipantes.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="familia" className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Adicione familiares ou responsáveis que participaram da reunião.
                            </p>
                            {familiaParticipantes.map(renderParticipanteItem)}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => addParticipante('FAMILIA')}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Familiar/Responsável
                            </Button>
                        </TabsContent>

                        <TabsContent value="externo" className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Adicione profissionais externos à clínica (médicos, professores, etc).
                            </p>
                            {externoParticipantes.map(renderParticipanteItem)}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => addParticipante('PROFISSIONAL_EXTERNO')}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Profissional Externo
                            </Button>
                        </TabsContent>

                        <TabsContent value="clinica" className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Selecione profissionais da clínica que participaram da reunião.
                            </p>
                            {clinicaParticipantes.map(renderParticipanteItem)}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => addParticipante('PROFISSIONAL_CLINICA')}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Profissional da Clínica
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        );
    };

    // ============================================
    // RENDERIZAÇÃO - CONTEÚDO
    // ============================================

    const renderConteudo = () => (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">
                    Tópicos e Condutas
                    {errors['conteudo'] && (
                        <span className="text-destructive text-sm font-normal ml-2">
                            ({errors['conteudo']})
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Descreva os tópicos discutidos, orientações dadas e condutas definidas durante a reunião.
                </p>
                <RichTextEditor
                    value={formData.conteudo}
                    onChange={(html) => updateField('conteudo', html)}
                    placeholder="Descreva os tópicos e condutas da reunião..."
                    className={errors['conteudo'] ? 'border-destructive' : ''}
                />
            </CardContent>
        </Card>
    );

    // ============================================
    // RENDERIZAÇÃO - AÇÕES
    // ============================================

    const renderActions = () => (
        <div className="flex items-center justify-between pt-4">
            <Button
                variant="outline"
                onClick={() => navigate('/app/atas')}
                disabled={submitting}
            >
                Cancelar
            </Button>
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={() => handleSubmit()}
                    disabled={submitting}
                >
                    {submitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Rascunho
                </Button>
                <Button
                    onClick={() => handleSubmit()}
                    disabled={submitting}
                >
                    {submitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Finalizar Ata
                </Button>
            </div>
        </div>
    );

    // ============================================
    // RENDERIZAÇÃO PRINCIPAL
    // ============================================

    return (
        <>
            <div className="space-y-6">
                {renderDadosReuniao()}
                {renderParticipantes()}
                {renderConteudo()}
                {renderActions()}
            </div>

            {/* Dialog de alterações não salvas */}
            <UnsavedChangesDialog
                open={isBlocked}
                onConfirm={() => proceed?.()}
                onCancel={() => reset?.()}
                title="Ata em andamento"
                description="Você tem uma ata em andamento que não foi salva. Se sair agora, todos os dados preenchidos serão perdidos. Deseja continuar?"
            />
        </>
    );
}

export default AtaForm;
