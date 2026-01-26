/**
 * LancamentoDrawer
 * 
 * Drawer lateral para criação/edição de lançamentos.
 * Segue o padrão visual do sistema (TherapistProfileDrawer).
 */

import { useState, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import {
    Loader2,
    Save,
    FileText,
    Image,
    Video,
    File,
    Trash2,
    Check,
    X,
    DollarSign,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CloseButton } from '@/components/layout/CloseButton';
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from '@/components/ui/sheet';

import { TextAreaField } from '@/ui/textarea-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import { TimeFieldWithLabel } from '@/ui/time-field-with-label';
import { ComboboxField } from '@/ui/combobox-field';
import { FileUploadBox } from '@/ui/file-upload-box';

import type { Lancamento } from '../types';
import { TIPO_ATIVIDADE_LABELS } from '../types';
import { useLancamentoForm } from '../hooks/useLancamentoForm';
import { cn } from '@/lib/utils';

interface LancamentoDrawerProps {
    /** Se o drawer está aberto */
    open: boolean;
    /** Callback ao fechar */
    onClose: () => void;
    /** Lançamento para edição (se null, é criação) */
    lancamento?: Lancamento | null;
    /** Callback após salvar com sucesso */
    onSuccess?: (lancamento: Lancamento) => void;
}

// Funções auxiliares para ícones de arquivo
const getFileIcon = (mimeType: string): { Icon: typeof FileText; color: string } => {
    if (mimeType.startsWith('image/')) {
        return { Icon: Image, color: 'text-blue-600' };
    }
    if (mimeType.startsWith('video/')) {
        return { Icon: Video, color: 'text-purple-600' };
    }
    if (mimeType === 'application/pdf') {
        return { Icon: FileText, color: 'text-red-600' };
    }
    return { Icon: File, color: 'text-gray-600' };
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export function LancamentoDrawer({
    open,
    onClose,
    lancamento,
    onSuccess,
}: LancamentoDrawerProps) {
    const handleSuccess = useCallback((saved: Lancamento) => {
        onSuccess?.(saved);
        onClose();
    }, [onSuccess, onClose]);

    const {
        form,
        saving,
        clientes,
        loadingClientes,
        anexos,
        addAnexo,
        removeAnexo,
        renameAnexo,
        handleSubmit,
        handleCancel,
        isEditing,
    } = useLancamentoForm({
        lancamento,
        onSuccess: handleSuccess,
        onCancel: onClose,
    });

    const { control, formState: { errors } } = form;

    // Estado para edição de nome de arquivo
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [editingFileName, setEditingFileName] = useState('');

    const startEditingFileName = (id: string, currentName: string) => {
        setEditingFileId(id);
        setEditingFileName(currentName);
    };

    const saveFileName = (id: string) => {
        if (editingFileName.trim()) {
            renameAnexo(id, editingFileName.trim());
        }
        setEditingFileId(null);
        setEditingFileName('');
    };

    const cancelEditingFileName = () => {
        setEditingFileId(null);
        setEditingFileName('');
    };

    // Preparar opções de clientes para combobox
    const clienteOptions = clientes.map(c => ({
        value: c.id,
        label: c.nome,
        searchValue: c.nome,
    }));

    // Preparar opções de tipo de atividade para combobox
    const tipoAtividadeOptions = Object.entries(TIPO_ATIVIDADE_LABELS).map(([value, label]) => ({
        value,
        label,
        searchValue: label,
    }));

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent side="right" className="w-[50vw] max-w-[600px] p-0 flex flex-col gap-0">
                {/* Header - igual ao TherapistProfileDrawer */}
                <div className="flex items-center gap-4 px-4 py-4 bg-background shrink-0 rounded-2xl">
                    {/* Botão X - Esquerda */}
                    <CloseButton onClick={onClose} />

                    {/* Título - Alinhado à esquerda */}
                    <SheetTitle 
                        style={{ 
                            fontSize: 'var(--page-title-font-size)',
                            fontWeight: 'var(--page-title-font-weight)',
                            fontFamily: 'var(--page-title-font-family)',
                            color: 'hsl(var(--foreground))'
                        }}
                    >
                        {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
                    </SheetTitle>

                    {/* Espaçador */}
                    <div className="ml-auto" />
                </div>

                {/* Content Area - igual ao padrão do sistema */}
                <div className="flex flex-1 min-h-0 p-2 gap-2 bg-background rounded-2xl">
                    {/* Caixa de conteúdo única (sem sidebar) */}
                    <div className="flex-1 min-h-0 bg-header-bg rounded-2xl overflow-hidden flex flex-col shadow-sm">
                        {/* Formulário scrollável */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">

                            {/* Cliente */}
                            <Controller
                                name="clienteId"
                                control={control}
                                render={({ field }) => (
                                    <ComboboxField
                                        label="Cliente*"
                                        options={clienteOptions}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="Selecione o cliente"
                                        searchPlaceholder="Buscar cliente..."
                                        emptyMessage="Nenhum cliente encontrado"
                                        error={errors.clienteId?.message}
                                        disabled={loadingClientes}
                                    />
                                )}
                            />

                            {/* Data e Horários */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Controller
                                    name="data"
                                    control={control}
                                    render={({ field }) => (
                                        <DateFieldWithLabel
                                            label="Data da Sessão*"
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Selecione"
                                            error={errors.data?.message}
                                            maxDate={new Date()}
                                        />
                                    )}
                                />

                                <Controller
                                    name="horarioInicio"
                                    control={control}
                                    render={({ field }) => (
                                        <TimeFieldWithLabel
                                            label="Horário Início*"
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Selecione"
                                            error={errors.horarioInicio?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="horarioFim"
                                    control={control}
                                    render={({ field }) => (
                                        <TimeFieldWithLabel
                                            label="Horário Fim*"
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Selecione"
                                            error={errors.horarioFim?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Tipo de Atividade */}
                            <Controller
                                name="tipoAtividade"
                                control={control}
                                render={({ field }) => (
                                    <ComboboxField
                                        label="Tipo de Atividade*"
                                        options={tipoAtividadeOptions}
                                        value={field.value || ''}
                                        onValueChange={field.onChange}
                                        placeholder="Selecione o tipo"
                                        searchPlaceholder="Buscar tipo..."
                                        emptyMessage="Nenhum tipo encontrado"
                                        error={errors.tipoAtividade?.message}
                                    />
                                )}
                            />

                            {/* Ajuda de Custo */}
                            <Controller
                                name="isHomecare"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Ajuda de Custo<span className="text-destructive">*</span>
                                        </label>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(true)}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                                                    field.value
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-muted hover:border-muted-foreground/30"
                                                )}
                                            >
                                                <DollarSign className="h-5 w-5" />
                                                <span className="font-medium">Sim</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(false)}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                                                    !field.value
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-muted hover:border-muted-foreground/30"
                                                )}
                                            >
                                                <X className="h-5 w-5" />
                                                <span className="font-medium">Não</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            />

                            {/* Observações */}
                            <Controller
                                name="observacoes"
                                control={control}
                                render={({ field }) => (
                                    <TextAreaField
                                        label="Observações"
                                        placeholder="Adicione observações sobre a sessão (opcional)"
                                        {...field}
                                        value={field.value || ''}
                                        error={errors.observacoes?.message}
                                    />
                                )}
                            />

                            {/* Upload de Arquivos */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Anexos (opcional)
                                </label>
                                
                                <FileUploadBox
                                    onChange={(file) => file && addAnexo(file)}
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov"
                                    maxSize={50}
                                    allowedTypes="PDF, DOC, PNG, JPG, MP4"
                                />

                                {/* Lista de anexos com edição de nome */}
                                {anexos.length > 0 && (
                                    <div className="space-y-2">
                                        {anexos.map((anexo) => {
                                            const { Icon, color } = getFileIcon(anexo.file.type);
                                            const isEditing = editingFileId === anexo.id;
                                            
                                            return (
                                                <div 
                                                    key={anexo.id}
                                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                                                >
                                                    <Icon className={cn("h-5 w-5 shrink-0", color)} />
                                                    
                                                    {isEditing ? (
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <Input
                                                                value={editingFileName}
                                                                onChange={(e) => setEditingFileName(e.target.value)}
                                                                className="h-8 text-sm"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') saveFileName(anexo.id);
                                                                    if (e.key === 'Escape') cancelEditingFileName();
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => saveFileName(anexo.id)}
                                                            >
                                                                <Check className="h-4 w-4 text-green-600" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={cancelEditingFileName}
                                                            >
                                                                <X className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div 
                                                                className="flex-1 min-w-0 cursor-pointer hover:text-primary transition-colors"
                                                                onClick={() => startEditingFileName(anexo.id, anexo.nome)}
                                                                title="Clique para editar o nome"
                                                            >
                                                                <p className="text-sm truncate">{anexo.nome}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatFileSize(anexo.file.size)}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 shrink-0"
                                                                onClick={() => removeAnexo(anexo.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer com ações - dentro da caixa */}
                        <div className="flex gap-3 p-4 border-t bg-header-bg shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                className="flex-1"
                                onClick={handleSubmit}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {isEditing ? 'Salvar Alterações' : 'Registrar Lançamento'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
