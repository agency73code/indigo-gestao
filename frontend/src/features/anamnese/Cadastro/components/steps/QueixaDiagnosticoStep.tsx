import { Plus, Trash2, Upload, X, FileText, Image } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/ui/select-field';
import { InputField } from '@/ui/input-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import AutoExpandTextarea from '../../ui/AutoExpandTextarea';
import type { AnamneseQueixaDiagnostico, EspecialidadeConsultada, MedicamentoEmUso, ExamePrevio, TerapiaPrevia, EspecialidadeMedica, ArquivoAnexo } from '../../types/anamnese.types';
import { ESPECIALIDADES_MEDICAS } from '../../types/anamnese.types';

// Subcomponente para card de exame com upload de arquivos
interface ExameCardProps {
    exame: ExamePrevio;
    index: number;
    onUpdate: (id: string, field: keyof ExamePrevio, value: string | ArquivoAnexo[]) => void;
    onRemove: (id: string) => void;
    onAddArquivo: (exameId: string, file: File, nomePersonalizado: string) => void;
    onRemoveArquivo: (exameId: string, arquivoId: string) => void;
    fieldErrors?: Record<string, string>;
}

function ExameCard({ exame, index, onUpdate, onRemove, onAddArquivo, onRemoveArquivo, fieldErrors = {} }: ExameCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [nomeArquivo, setNomeArquivo] = useState('');

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
        
        onAddArquivo(exame.id, selectedFile, nomeArquivo.trim());
        
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

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isImageFile = (tipo: string): boolean => {
        return tipo.startsWith('image/');
    };

    return (
        <div className="rounded-2xl border bg-white p-4 space-y-4">
            {/* Título da linha com botão de remover */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                    Exame {index + 1}
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(exame.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Linha 1: Nome, Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Nome do Exame *"
                    placeholder="Ex: Audiometria, EEG..."
                    value={exame.nome}
                    onChange={(e) => onUpdate(exame.id, 'nome', e.target.value)}
                    error={fieldErrors[`examesPrevios.${index}.nome`]}
                />
                <DateFieldWithLabel
                    label="Data do Exame *"
                    value={exame.data || ''}
                    onChange={(iso) => onUpdate(exame.id, 'data', iso)}
                    error={fieldErrors[`examesPrevios.${index}.data`]}
                />
            </div>

            {/* Linha 2: Resultado */}
            <InputField
                label="Resultado"
                placeholder="Resumo do resultado do exame"
                value={exame.resultado}
                onChange={(e) => onUpdate(exame.id, 'resultado', e.target.value)}
            />

            {/* Upload de Arquivos */}
            <div className="space-y-3">
                <span className="text-sm font-medium text-foreground">Anexos</span>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Formulário de upload quando arquivo selecionado */}
                {selectedFile ? (
                    <div className="p-3 bg-muted/30 rounded-lg border space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            {isImageFile(selectedFile.type) ? (
                                <Image className="h-4 w-4 text-blue-500" />
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
                        className="gap-2 w-full"
                    >
                        <Upload className="h-4 w-4" />
                        Selecionar arquivo
                    </Button>
                )}

                {/* Lista de arquivos anexados */}
                {((exame.arquivos || []).filter((arquivo) => !arquivo.removed)).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {exame.arquivos?.filter((arquivo) => !arquivo.removed).map((arquivo) => (
                            <div
                                key={arquivo.id}
                                className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border"
                            >
                                {isImageFile(arquivo.tipo) ? (
                                    <Image className="h-4 w-4 text-blue-500 shrink-0" />
                                ) : (
                                    <FileText className="h-4 w-4 text-orange-500 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{arquivo.nome}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(arquivo.tamanho)}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemoveArquivo(exame.id, arquivo.id)}
                                    className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {((exame.arquivos || []).filter((arquivo) => !arquivo.removed)).length === 0 && !selectedFile && (
                    <div className="text-center py-4 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                        Nenhum arquivo anexado
                    </div>
                )}
            </div>
        </div>
    );
}

interface QueixaDiagnosticoStepProps {
    data: Partial<AnamneseQueixaDiagnostico>;
    onChange: (data: Partial<AnamneseQueixaDiagnostico>) => void;
    fieldErrors?: Record<string, string>;
}

export default function QueixaDiagnosticoStep({ data, onChange, fieldErrors = {} }: QueixaDiagnosticoStepProps) {
    // Gerar ID único para novos itens
    const generateId = () => crypto.randomUUID();

    // Máscara para mês/ano (MM/AAAA)
    const formatMesAno = (value: string): string => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');
        
        // Aplica a máscara MM/AAAA
        if (numbers.length <= 2) {
            return numbers;
        }
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 6)}`;
    };

    // Handlers para Especialidades
    const handleAddEspecialidade = () => {
        const novaEspecialidade: EspecialidadeConsultada = {
            id: generateId(),
            especialidade: 'Pediatra',
            nome: '',
            data: '',
            observacao: '',
            ativo: true,
        };
        onChange({
            ...data,
            especialidadesConsultadas: [...(data.especialidadesConsultadas || []), novaEspecialidade],
        });
    };

    const handleUpdateEspecialidade = (id: string, field: keyof EspecialidadeConsultada, value: string | boolean) => {
        const updated = (data.especialidadesConsultadas || []).map((esp) =>
            esp.id === id ? { ...esp, [field]: value } : esp
        );
        onChange({ ...data, especialidadesConsultadas: updated });
    };

    const handleRemoveEspecialidade = (id: string) => {
        const updated = (data.especialidadesConsultadas || []).filter((esp) => esp.id !== id);
        onChange({ ...data, especialidadesConsultadas: updated });
    };

    // Handlers para Medicamentos
    const handleAddMedicamento = () => {
        const novoMedicamento: MedicamentoEmUso = {
            id: generateId(),
            nome: '',
            dosagem: '',
            dataInicio: '',
            motivo: '',
        };
        onChange({
            ...data,
            medicamentosEmUso: [...(data.medicamentosEmUso || []), novoMedicamento],
        });
    };

    const handleUpdateMedicamento = (id: string, field: keyof MedicamentoEmUso, value: string) => {
        const updated = (data.medicamentosEmUso || []).map((med) =>
            med.id === id ? { ...med, [field]: value } : med
        );
        onChange({ ...data, medicamentosEmUso: updated });
    };

    const handleRemoveMedicamento = (id: string) => {
        const updated = (data.medicamentosEmUso || []).filter((med) => med.id !== id);
        onChange({ ...data, medicamentosEmUso: updated });
    };

    // Handlers para Exames Prévios
    const handleAddExame = () => {
        const novoExame: ExamePrevio = {
            id: generateId(),
            nome: '',
            data: '',
            resultado: '',
            arquivos: [],
        };
        onChange({
            ...data,
            examesPrevios: [...(data.examesPrevios || []), novoExame],
        });
    };

    const handleUpdateExame = (id: string, field: keyof ExamePrevio, value: string | ArquivoAnexo[]) => {
        const updated = (data.examesPrevios || []).map((exame) =>
            exame.id === id ? { ...exame, [field]: value } : exame
        );
        onChange({ ...data, examesPrevios: updated });
    };

    const handleAddArquivoExame = (exameId: string, file: File, nomePersonalizado: string) => {
        const novoArquivo: ArquivoAnexo = {
            id: generateId(),
            nome: nomePersonalizado,
            tipo: file.type,
            tamanho: file.size,
            file: file,
            removed: false,
        };
        const exame = data.examesPrevios?.find(e => e.id === exameId);
        if (exame) {
            handleUpdateExame(exameId, 'arquivos', [...(exame.arquivos || []), novoArquivo]);
        }
    };

    const handleRemoveArquivoExame = (exameId: string, arquivoId: string) => {
        const exame = data.examesPrevios?.find(e => e.id === exameId);
        if (exame) {
            const arquivosAtualizados = (exame.arquivos || []).map((arquivo) =>
                arquivo.id === arquivoId ? { ...arquivo, removed: true } : arquivo,
            );
            handleUpdateExame(exameId, 'arquivos', arquivosAtualizados);
        }
    };

    const handleRemoveExame = (id: string) => {
        const updated = (data.examesPrevios || []).filter((exame) => exame.id !== id);
        onChange({ ...data, examesPrevios: updated });
    };

    // Handlers para Terapias Prévias
    const handleAddTerapia = () => {
        const novaTerapia: TerapiaPrevia = {
            id: generateId(),
            profissional: '',
            especialidadeAbordagem: '',
            tempoIntervencao: '',
            observacao: '',
            ativo: true,
        };
        onChange({
            ...data,
            terapiasPrevias: [...(data.terapiasPrevias || []), novaTerapia],
        });
    };

    const handleUpdateTerapia = (id: string, field: keyof TerapiaPrevia, value: string | boolean) => {
        const updated = (data.terapiasPrevias || []).map((ter) =>
            ter.id === id ? { ...ter, [field]: value } : ter
        );
        onChange({ ...data, terapiasPrevias: updated });
    };

    const handleRemoveTerapia = (id: string) => {
        const updated = (data.terapiasPrevias || []).filter((ter) => ter.id !== id);
        onChange({ ...data, terapiasPrevias: updated });
    };

    return (
        <div className="space-y-4">
           

            {/* 1. Queixa Principal Atual */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="1. Queixa Principal Atual"
                    placeholder="Sua resposta"
                    value={data.queixaPrincipal || ''}
                    onChange={(value) => onChange({ ...data, queixaPrincipal: value })}
                    required
                    error={fieldErrors.queixaPrincipal}
                />
            </div>

            {/* 2. Diagnóstico Prévio */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="2. Diagnóstico Prévio"
                    description="(Quando foi dado, por quem, quantos anos tinha ao receber)"
                    placeholder="Sua resposta"
                    value={data.diagnosticoPrevio || ''}
                    onChange={(value) => onChange({ ...data, diagnosticoPrevio: value })}
                    required
                    error={fieldErrors.diagnosticoPrevio}
                />
            </div>

            {/* 3. Suspeita de Outra Condição Associada */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="3. Há Suspeita de Outra Condição Associada?"
                    placeholder="Sua resposta"
                    value={data.suspeitaCondicaoAssociada || ''}
                    onChange={(value) => onChange({ ...data, suspeitaCondicaoAssociada: value })}
                    required
                    error={fieldErrors.suspeitaCondicaoAssociada}
                />
            </div>

            {/* 4. Médicos Consultados */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">
                            4. Médicos Consultados até o Momento
                        </span>
                        <p className="text-xs text-muted-foreground">
                            (Nome do profissional e data - mês e ano)
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddEspecialidade}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar
                    </Button>
                </div>

                {/* Lista de Especialidades */}
                <div className="space-y-3">
                    {(data.especialidadesConsultadas || []).map((esp, index) => (
                        <div
                            key={esp.id}
                            className="rounded-2xl border bg-white p-4 space-y-4"
                        >
                            {/* Título da linha com switch e botão de remover */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-foreground">
                                        Médico {index + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={esp.ativo ?? true}
                                            onCheckedChange={(checked) => handleUpdateEspecialidade(esp.id, 'ativo', checked)}
                                        />
                                        <span className={`text-xs ${esp.ativo ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {esp.ativo ? 'Ainda consulta' : 'Não consulta mais'}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveEspecialidade(esp.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Linha 1: Especialidade, Data, Nome do Profissional */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SelectField
                                    label="Especialidade *"
                                    value={esp.especialidade}
                                    onChange={(e) => handleUpdateEspecialidade(esp.id, 'especialidade', e.target.value as EspecialidadeMedica)}
                                    error={fieldErrors[`especialidadesConsultadas.${index}.especialidade`]}
                                >
                                    {ESPECIALIDADES_MEDICAS.map((especialidade) => (
                                        <option key={especialidade} value={especialidade}>
                                            {especialidade}
                                        </option>
                                    ))}
                                </SelectField>
                                <InputField
                                    label="Data (mês/ano) *"
                                    placeholder="MM/AAAA"
                                    value={esp.data}
                                    onChange={(e) => handleUpdateEspecialidade(esp.id, 'data', formatMesAno(e.target.value))}
                                    maxLength={7}
                                    error={fieldErrors[`especialidadesConsultadas.${index}.data`]}
                                />
                                <InputField
                                    label="Nome do Profissional"
                                    placeholder="Nome do profissional"
                                    value={esp.nome}
                                    onChange={(e) => handleUpdateEspecialidade(esp.id, 'nome', e.target.value)}
                                />
                            </div>
                            
                            {/* Linha 2: Observação (estilo Google Forms) */}
                            <AutoExpandTextarea
                                label="Observação"
                                placeholder="Sua resposta"
                                value={esp.observacao || ''}
                                onChange={(value) => handleUpdateEspecialidade(esp.id, 'observacao', value)}
                            />
                        </div>
                    ))}

                    {(data.especialidadesConsultadas || []).length === 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-2xl">
                            Nenhum médico adicionado. Clique em "Adicionar" para incluir.
                        </div>
                    )}
                </div>
            </div>

            {/* 5. Medicamentos em Uso */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">
                            5. Uso de Medicamentos
                        </span>
                        <p className="text-xs text-muted-foreground">
                            (Descrever efeitos colaterais, se houver)
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddMedicamento}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar
                    </Button>
                </div>

                {/* Lista de Medicamentos */}
                <div className="space-y-3">
                    {(data.medicamentosEmUso || []).map((med, index) => (
                        <div
                            key={med.id}
                            className="rounded-2xl border bg-white p-4 space-y-4"
                        >
                            {/* Título da linha com botão de remover */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                    Medicamento {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveMedicamento(med.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Linha 1: Medicamento (2/4), Dosagem (1/4), Data (1/4) */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <InputField
                                        label="Medicamento *"
                                        placeholder="Nome do medicamento"
                                        value={med.nome}
                                        onChange={(e) => handleUpdateMedicamento(med.id, 'nome', e.target.value)}
                                        error={fieldErrors[`medicamentosEmUso.${index}.nome`]}
                                    />
                                </div>
                                <InputField
                                    label="Dosagem *"
                                    placeholder="Ex: 10mg"
                                    value={med.dosagem}
                                    onChange={(e) => handleUpdateMedicamento(med.id, 'dosagem', e.target.value)}
                                    error={fieldErrors[`medicamentosEmUso.${index}.dosagem`]}
                                />
                                <DateFieldWithLabel
                                    label="Início do uso"
                                    value={med.dataInicio || ''}
                                    onChange={(iso) => handleUpdateMedicamento(med.id, 'dataInicio', iso)}
                                />
                            </div>
                            
                            {/* Linha 2: Observações (estilo Google Forms) */}
                            <AutoExpandTextarea
                                label="Observações"
                                description="(Existe algum em fase de adaptação? Já foram tentadas outras medicações? Como foi a resposta?)"
                                placeholder="Sua resposta"
                                value={med.motivo}
                                onChange={(value) => handleUpdateMedicamento(med.id, 'motivo', value)}
                            />
                        </div>
                    ))}

                    {(data.medicamentosEmUso || []).length === 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-2xl">
                            Nenhum medicamento adicionado. Clique em "Adicionar" para incluir.
                        </div>
                    )}
                </div>
            </div>

            {/* 6. Exames Prévios Realizados */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">
                            6. Exames Prévios Realizados, Datas e Resultados
                        </span>
                        <p className="text-xs text-muted-foreground">
                            Anexe laudos e documentos relacionados
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddExame}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar
                    </Button>
                </div>

                {/* Lista de Exames */}
                <div className="space-y-3 mb-4">
                    {(data.examesPrevios || []).map((exame, index) => (
                        <ExameCard 
                            key={exame.id}
                            exame={exame}
                            index={index}
                            onUpdate={handleUpdateExame}
                            onRemove={handleRemoveExame}
                            onAddArquivo={handleAddArquivoExame}
                            onRemoveArquivo={handleRemoveArquivoExame}
                            fieldErrors={fieldErrors}
                        />
                    ))}

                    {(data.examesPrevios || []).length === 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-2xl">
                            Nenhum exame adicionado. Clique em "Adicionar" para incluir.
                        </div>
                    )}
                </div>
            </div>

            {/* 7. Terapias Prévias e/ou em Andamento */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">
                            7. Terapias Prévias e/ou em Andamento
                        </span>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddTerapia}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar
                    </Button>
                </div>

                {/* Lista de Terapias */}
                <div className="space-y-3 mb-4">
                    {(data.terapiasPrevias || []).map((terapia, index) => (
                        <div
                            key={terapia.id}
                            className="rounded-2xl border bg-white p-4 space-y-4"
                        >
                            {/* Título da linha com switch e botão de remover */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-foreground">
                                        Terapia {index + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={terapia.ativo ?? true}
                                            onCheckedChange={(checked) => handleUpdateTerapia(terapia.id, 'ativo', checked)}
                                        />
                                        <span className={`text-xs ${terapia.ativo ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {terapia.ativo ? 'Em andamento' : 'Encerrada'}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveTerapia(terapia.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Linha 1: Profissional, Especialidade/Abordagem, Tempo de Intervenção */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField
                                    label="Profissional *"
                                    placeholder="Nome do profissional"
                                    value={terapia.profissional}
                                    onChange={(e) => handleUpdateTerapia(terapia.id, 'profissional', e.target.value)}
                                    error={fieldErrors[`terapiasPrevias.${index}.profissional`]}
                                />
                                <InputField
                                    label="Especialidade/Abordagem *"
                                    placeholder="Ex: TO, Fono, ABA..."
                                    value={terapia.especialidadeAbordagem}
                                    onChange={(e) => handleUpdateTerapia(terapia.id, 'especialidadeAbordagem', e.target.value)}
                                    error={fieldErrors[`terapiasPrevias.${index}.especialidadeAbordagem`]}
                                />
                                <InputField
                                    label="Tempo de Intervenção"
                                    placeholder="Ex: 1 ano, 6 meses..."
                                    value={terapia.tempoIntervencao}
                                    onChange={(e) => handleUpdateTerapia(terapia.id, 'tempoIntervencao', e.target.value)}
                                />
                            </div>
                            
                            {/* Linha 2: Observações */}
                            <AutoExpandTextarea
                                label="Observações"
                                description="(Quantas horas semanais de intervenção fez; assiduidade; motivo do encerramento com o prestador de serviço)"
                                placeholder="Sua resposta"
                                value={terapia.observacao || ''}
                                onChange={(value) => handleUpdateTerapia(terapia.id, 'observacao', value)}
                            />
                        </div>
                    ))}

                    {(data.terapiasPrevias || []).length === 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-2xl">
                            Nenhuma terapia adicionada. Clique em "Adicionar" para incluir.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
