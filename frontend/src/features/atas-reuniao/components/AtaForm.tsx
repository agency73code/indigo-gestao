import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, User, Building2, Users, Loader2, Save, CheckCircle, Paperclip, Upload, X, FileText, Image as ImageIcon, Link2 } from 'lucide-react';

import { UnsavedChangesDialog } from '@/components/dialogs/UnsavedChangesDialog';
import { Input } from '@/components/ui/input';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import type { Patient } from '@/features/programas/consultar-programas/types';

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
    type LinkRecomendacao,
    type Anexo,
    FINALIDADE_REUNIAO,
    FINALIDADE_LABELS,
    MODALIDADE_LABELS,
    TIPO_PARTICIPANTE,
} from '../types';
import { DADOS_FATURAMENTO_ATA_INITIAL } from '../types/billing';
import { AtaBillingData } from './AtaBillingData';

import { useAtaForm } from '../hooks/useAtaForm';

// ============================================
// TIPOS
// ============================================

interface AtaFormProps {
    ataId?: string;
    initialData?: AtaFormData;
    existingAnexos?: Anexo[];
    onSuccess?: () => void;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AtaForm({ ataId, initialData, existingAnexos = [], onSuccess }: AtaFormProps) {
    const navigate = useNavigate();

    // Hook que gerencia toda a lógica do formulário
    const {
        formData,
        cabecalho,
        errors,
        terapeutas,
        loadingTerapeutas,
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
        handleFaturamentoChange,
        // Seleção de área de atuação
        selectedAreaIndex,
        hasMultipleAreas,
        selectArea,
    } = useAtaForm({ ataId, initialData, onSuccess });

    // Estados locais para anexos com nome personalizado
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [anexos, setAnexos] = useState<Array<{ id: string; file: File; nome: string }>>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [nomeArquivo, setNomeArquivo] = useState('');
    
    // Estados para links de recomendação
    const [links, setLinks] = useState<LinkRecomendacao[]>(initialData?.links ?? []);
    const [novoLinkTitulo, setNovoLinkTitulo] = useState('');
    const [novoLinkUrl, setNovoLinkUrl] = useState('');
    const [linkUrlError, setLinkUrlError] = useState('');
    
    // Estado para PatientSelector
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
        formData.clienteId && formData.clienteNome 
            ? { id: formData.clienteId, name: formData.clienteNome } as Patient
            : null
    );
    
    // Handler para seleção de cliente via PatientSelector
    const handlePatientSelect = useCallback((patient: Patient) => {
        setSelectedPatient(patient);
        handleClienteChange(patient.id, patient.name);
    }, [handleClienteChange]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (!submitting) handleSubmit(anexos, links, false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [submitting, anexos, links, handleSubmit]);

    // ============================================
    // RENDERIZAÇÃO - DADOS DA REUNIÃO
    // ============================================

    const renderDadosReuniao = () => (
        <div className="space-y-6">
            {/* Seleção de Cliente */}
            <PatientSelector
                selected={selectedPatient}
                onSelect={handlePatientSelect}
                autoOpenIfEmpty={false}
            />

            {/* Seleção de Área de Atuação (quando múltiplas) */}
            {hasMultipleAreas && cabecalho?.dadosProfissionais && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-4">
                        <SelectFieldRadix
                            label="Área de Atuação / Registro Profissional"
                            value={String(selectedAreaIndex)}
                            onValueChange={(v) => selectArea(Number(v))}
                        >
                            {cabecalho.dadosProfissionais.map((dp, idx) => (
                                <SelectItem key={idx} value={String(idx)}>
                                    {dp.areaAtuacao}{dp.cargo ? ` - ${dp.cargo}` : ''}{dp.numeroConselho ? ` (${dp.numeroConselho})` : ''}
                                </SelectItem>
                            ))}
                        </SelectFieldRadix>
                        <p className="text-xs text-muted-foreground mt-2">
                            Você possui múltiplas áreas de atuação. Selecione qual será usada nesta ata.
                        </p>
                    </CardContent>
                </Card>
            )}
            
            {/* Dados da Reunião */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-medium">Dados da Reunião</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-4 gap-4">
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
        </div>
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

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isImageFile = (tipo: string): boolean => {
        return tipo.startsWith('image/');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Sugerir o nome do arquivo (sem extensão) como nome inicial
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setNomeArquivo(nameWithoutExt);
        }
    };

    const handleAddFile = () => {
        if (!selectedFile || !nomeArquivo.trim()) return;
        
        const novoAnexo = {
            id: crypto.randomUUID(),
            file: selectedFile,
            nome: nomeArquivo.trim(),
        };
        
        setAnexos((prev) => [...prev, novoAnexo]);
        
        // Limpar campos
        setSelectedFile(null);
        setNomeArquivo('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCancelFile = () => {
        setSelectedFile(null);
        setNomeArquivo('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveAnexo = useCallback((id: string) => {
        setAnexos((prev) => prev.filter((anexo) => anexo.id !== id));
    }, []);

    // ============================================
    // HANDLERS - LINKS
    // ============================================

    const isValidUrl = (urlString: string): boolean => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    };

    const handleAddLink = useCallback(() => {
        if (!novoLinkTitulo.trim() || !novoLinkUrl.trim()) return;
        
        let url = novoLinkUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        if (!isValidUrl(url)) {
            setLinkUrlError('URL inválida');
            return;
        }
        
        const novoLink: LinkRecomendacao = {
            id: crypto.randomUUID(),
            titulo: novoLinkTitulo.trim(),
            url,
        };
        
        setLinks((prev) => [...prev, novoLink]);
        setNovoLinkTitulo('');
        setNovoLinkUrl('');
        setLinkUrlError('');
    }, [novoLinkTitulo, novoLinkUrl]);

    const handleRemoveLink = useCallback((id: string) => {
        setLinks((prev) => prev.filter((link) => link.id !== id));
    }, []);

    const renderLinks = () => {
        return (
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Link2 className="h-5 w-5" />
                            Links de Recomendação
                            {links.length > 0 && (
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({links.length} {links.length === 1 ? 'link' : 'links'})
                                </span>
                            )}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Adicione links de brinquedos, materiais ou recursos que deseja recomendar para a família.
                    </p>
                    
                    {/* Formulário para adicionar novo link */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <Input
                            placeholder="Nome do item (ex: Brinquedo sensorial)"
                            value={novoLinkTitulo}
                            onChange={(e) => setNovoLinkTitulo(e.target.value)}
                            className="flex-1"
                        />
                        <div className="flex-1">
                            <Input
                                placeholder="URL (ex: amazon.com.br/...)"
                                value={novoLinkUrl}
                                onChange={(e) => {
                                    setNovoLinkUrl(e.target.value);
                                    if (linkUrlError) setLinkUrlError('');
                                }}
                                className={linkUrlError ? 'border-red-500' : ''}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddLink();
                                    }
                                }}
                            />
                            {linkUrlError && (
                                <p className="text-xs text-red-500 mt-1">{linkUrlError}</p>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddLink}
                            disabled={!novoLinkTitulo.trim() || !novoLinkUrl.trim()}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                        </Button>
                    </div>

                    {/* Lista de links adicionados */}
                    {links.length > 0 ? (
                        <div className="space-y-2">
                            {links.map((link) => (
                                <div
                                    key={link.id}
                                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border"
                                >
                                    <Link2 className="h-4 w-4 text-blue-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{link.titulo}</p>
                                        <a 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline truncate block"
                                        >
                                            {link.url}
                                        </a>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveLink(link.id)}
                                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                            Nenhum link adicionado
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    // ============================================
    // RENDERIZAÇÃO - FATURAMENTO
    // ============================================

    const renderFaturamento = () => (
        <AtaBillingData
            value={formData.faturamento || DADOS_FATURAMENTO_ATA_INITIAL}
            onChange={handleFaturamentoChange}
            disabled={submitting}
        />
    );

    const renderAnexos = () => {
        const totalAnexos = anexos.length + existingAnexos.length;
        return (
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Paperclip className="h-5 w-5" />
                            Anexos
                            {totalAnexos > 0 && (
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({totalAnexos} {totalAnexos === 1 ? 'arquivo' : 'arquivos'})
                                </span>
                            )}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Anexe documentos, fotos ou vídeos relevantes para a reunião (laudos, relatórios, etc).
                    </p>
                    
                    {/* Input de arquivo oculto */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Formulário de upload quando arquivo selecionado */}
                    {selectedFile ? (
                        <div className="p-4 bg-muted/30 rounded-lg border space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                {isImageFile(selectedFile.type) ? (
                                    <ImageIcon className="h-4 w-4 text-blue-500" />
                                ) : (
                                    <FileText className="h-4 w-4 text-orange-500" />
                                )}
                                <span className="text-muted-foreground truncate">
                                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                </span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Nome do arquivo *</label>
                                <Input
                                    placeholder="Digite o nome do arquivo"
                                    value={nomeArquivo}
                                    onChange={(e) => setNomeArquivo(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelFile}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleAddFile}
                                    disabled={!nomeArquivo.trim()}
                                    className="flex-1"
                                >
                                    Adicionar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="gap-2 w-full mb-4"
                        >
                            <Upload className="h-4 w-4" />
                            Selecionar arquivo
                        </Button>
                    )}

                    {/* Lista de anexos existentes (edição) */}
                    {existingAnexos.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Anexos existentes:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {existingAnexos.map((anexo) => (
                                    <div
                                        key={anexo.id}
                                        className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border"
                                    >
                                        {anexo.type?.startsWith('image') ? (
                                            <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />
                                        ) : (
                                            <FileText className="h-4 w-4 text-orange-500 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{anexo.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(anexo.size)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lista de novos arquivos anexados */}
                    {anexos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {anexos.map((anexo) => (
                                <div
                                    key={anexo.id}
                                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border"
                                >
                                    {isImageFile(anexo.file.type) ? (
                                        <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-orange-500 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{anexo.nome}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(anexo.file.size)}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveAnexo(anexo.id)}
                                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : !selectedFile && existingAnexos.length === 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                            Nenhum arquivo anexado
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    // ============================================
    // RENDERIZAÇÃO - AÇÕES
    // ============================================

    const renderActions = () => (
        <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => navigate('/app/atas')} disabled={submitting} aria-label="Cancelar e voltar">
                Cancelar
            </Button>
            <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleSubmit(anexos, links, false)} disabled={submitting} aria-label="Salvar como rascunho (Ctrl+S)">
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4 mr-2" aria-hidden="true" />}
                    Salvar Rascunho
                </Button>
                <Button onClick={() => handleSubmit(anexos, links, true)} disabled={submitting} aria-label="Finalizar ata">
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" /> : <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />}
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
                {renderLinks()}
                {renderFaturamento()}
                {renderAnexos()}
                {renderActions()}
            </div>

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
