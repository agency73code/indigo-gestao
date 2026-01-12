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

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, User, Building2, Users, Loader2, Save, CheckCircle, Paperclip } from 'lucide-react';

import { UnsavedChangesDialog } from '@/components/dialogs/UnsavedChangesDialog';
import { FileUploadModal } from '@/components/upload/FileUploadModal';
import { FileAttachmentList, filesToAttachments, type FileAttachment } from '@/components/upload/FileAttachmentList';

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
    type Participante,
    type FinalidadeReuniao,
    type ModalidadeReuniao,
    FINALIDADE_REUNIAO,
    FINALIDADE_LABELS,
    MODALIDADE_LABELS,
    TIPO_PARTICIPANTE,
} from '../types';

import { useAtaForm } from '../hooks/useAtaForm';

// ============================================
// TIPOS
// ============================================

interface AtaFormProps {
    ataId?: string;
    initialData?: AtaFormData;
    onSuccess?: () => void;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AtaForm({ ataId, initialData, onSuccess }: AtaFormProps) {
    const navigate = useNavigate();

    // Hook que gerencia toda a lógica do formulário
    const {
        formData,
        errors,
        terapeutas,
        clientes,
        loadingTerapeutas,
        loadingClientes,
        submitting,
        isBlocked,
        proceedNavigation,
        resetNavigation,
        updateField,
        handleClienteChange,
        addParticipante,
        updateParticipante,
        removeParticipante,
        selectTerapeutaParticipante,
        handleSubmit,
    } = useAtaForm({ ataId, initialData, onSuccess });

    // Estados locais para anexos (não gerenciados pelo hook pois são arquivos)
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [anexos, setAnexos] = useState<File[]>([]);

    // ============================================
    // RENDERIZAÇÃO - DADOS DA REUNIÃO
    // ============================================

    const renderDadosReuniao = () => (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Dados da Reunião</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
            <div key={p.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isClinica ? (
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
        const familiaParticipantes = formData.participantes.filter((p) => p.tipo === TIPO_PARTICIPANTE.FAMILIA);
        const externoParticipantes = formData.participantes.filter((p) => p.tipo === TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO);
        const clinicaParticipantes = formData.participantes.filter((p) => p.tipo === TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA);

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
                            <Button variant="outline" className="w-full" onClick={() => addParticipante('FAMILIA')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Familiar/Responsável
                            </Button>
                        </TabsContent>

                        <TabsContent value="externo" className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Adicione profissionais externos à clínica (médicos, professores, etc).
                            </p>
                            {externoParticipantes.map(renderParticipanteItem)}
                            <Button variant="outline" className="w-full" onClick={() => addParticipante('PROFISSIONAL_EXTERNO')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Profissional Externo
                            </Button>
                        </TabsContent>

                        <TabsContent value="clinica" className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Selecione profissionais da clínica que participaram da reunião.
                            </p>
                            {clinicaParticipantes.map(renderParticipanteItem)}
                            <Button variant="outline" className="w-full" onClick={() => addParticipante('PROFISSIONAL_CLINICA')}>
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
                        <span className="text-destructive text-sm font-normal ml-2">({errors['conteudo']})</span>
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
    // RENDERIZAÇÃO - ANEXOS
    // ============================================

    const handleRemoveAnexo = useCallback((id: string) => {
        const index = parseInt(id.split('-')[1]);
        setAnexos((prev) => prev.filter((_, idx) => idx !== index));
    }, []);

    const renderAnexos = () => {
        const attachments: FileAttachment[] = filesToAttachments(anexos);

        return (
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Paperclip className="h-5 w-5" />
                            Anexos
                            {anexos.length > 0 && (
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({anexos.length} {anexos.length === 1 ? 'arquivo' : 'arquivos'})
                                </span>
                            )}
                        </CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={() => setUploadModalOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Adicionar Arquivos
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Anexe documentos, fotos ou vídeos relevantes para a reunião (laudos, relatórios, etc).
                    </p>
                    <FileAttachmentList
                        files={attachments}
                        onRemove={handleRemoveAnexo}
                        emptyMessage="Clique em 'Adicionar Arquivos' para anexar documentos"
                    />
                </CardContent>
            </Card>
        );
    };

    // ============================================
    // RENDERIZAÇÃO - AÇÕES
    // ============================================

    const renderActions = () => (
        <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => navigate('/app/atas')} disabled={submitting}>
                Cancelar
            </Button>
            <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleSubmit()} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Rascunho
                </Button>
                <Button onClick={() => handleSubmit()} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
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
                {renderAnexos()}
                {renderActions()}
            </div>

            <FileUploadModal
                open={uploadModalOpen}
                onOpenChange={setUploadModalOpen}
                files={anexos}
                onFilesChange={setAnexos}
                maxFiles={10}
                formatDescription="PDF, DOC, DOCX, XLS, XLSX, TXT, PNG, JPG, GIF, MP4, AVI"
            />

            <UnsavedChangesDialog
                open={isBlocked}
                onConfirm={() => proceedNavigation?.()}
                onCancel={() => resetNavigation?.()}
                title="Ata em andamento"
                description="Você tem uma ata em andamento que não foi salva. Se sair agora, todos os dados preenchidos serão perdidos. Deseja continuar?"
            />
        </>
    );
}

export default AtaForm;
