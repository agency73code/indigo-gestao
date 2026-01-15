/**
 * Componente de Formulário de Evolução Terapêutica
 */

import { useRef, useState } from 'react';
import { Upload, X, Image, Video, FileText } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/components/ui/input';
import { TextAreaField } from '@/ui/textarea-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import type { EvolucaoFormData, ArquivoEvolucao, CabecalhoEvolucao } from '../types';

interface EvolucaoFormProps {
    cabecalho: CabecalhoEvolucao;
    formData: EvolucaoFormData;
    onChange: (field: keyof EvolucaoFormData, value: any) => void;
    onAddArquivo: (arquivo: ArquivoEvolucao) => void;
    onRemoveArquivo: (id: string) => void;
    onSave: () => Promise<any>;
    isSaving?: boolean;
}

export default function EvolucaoForm({ 
    cabecalho,
    formData, 
    onChange,
    onAddArquivo,
    onRemoveArquivo,
    onSave,
    isSaving = false,
}: EvolucaoFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [nomeArquivo, setNomeArquivo] = useState('');
    
    // Handler para seleção de arquivo
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        const file = files[0];
        setSelectedFile(file);
        // Sugerir nome baseado no arquivo original (sem extensão)
        const nomeBase = file.name.replace(/\.[^/.]+$/, '');
        setNomeArquivo(nomeBase);
        
        // Limpar input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Adicionar arquivo com nome personalizado
    const handleAddFile = () => {
        if (!selectedFile || !nomeArquivo.trim()) return;
        
        const tipo = selectedFile.type.startsWith('image/') 
            ? 'foto' 
            : selectedFile.type.startsWith('video/') 
                ? 'video' 
                : 'documento';
        
        const arquivo: ArquivoEvolucao = {
            id: String(Date.now()) + '-' + Math.random().toString(36).substr(2, 9),
            nome: nomeArquivo.trim(),
            tipo,
            mimeType: selectedFile.type,
            tamanho: selectedFile.size,
            file: selectedFile,
        };
        
        onAddArquivo(arquivo);
        handleCancelFile();
    };

    // Cancelar seleção de arquivo
    const handleCancelFile = () => {
        setSelectedFile(null);
        setNomeArquivo('');
    };

    const arquivosAtivos = formData.arquivos.filter(a => !a.removed);

    const getArquivoIcon = (tipo: string) => {
        switch (tipo) {
            case 'foto':
                return <Image className="h-4 w-4 text-blue-500" />;
            case 'video':
                return <Video className="h-4 w-4 text-purple-500" />;
            default:
                return <FileText className="h-4 w-4 text-orange-500" />;
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImageFile = (type: string) => type?.startsWith('image/');
    const isVideoFile = (type: string) => type?.startsWith('video/');

    return (
        <div className="space-y-4">
            {/* Número da Sessão - Destaque */}
            <div 
                className="p-4 rounded-xl flex items-center justify-between"
                style={{ backgroundColor: 'var(--hub-card-background)' }}
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{cabecalho.numeroSessao}</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Sessão Nº {cabecalho.numeroSessao}</p>
                        <p className="text-xs text-muted-foreground">Registro de evolução terapêutica</p>
                    </div>
                </div>
            </div>

            {/* Data da Evolução - Card */}
            <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--hub-card-background)' }}
            >
                <DateFieldWithLabel
                    label="Data da Evolução *"
                    value={formData.dataEvolucao}
                    onChange={(iso) => onChange('dataEvolucao', iso)}
                />
            </div>

            {/* Descrição da Sessão - Card */}
            <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--hub-card-background)' }}
            >
                <TextAreaField
                    label="Descrição da Sessão *"
                    id="descricaoSessao"
                    value={formData.descricaoSessao}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('descricaoSessao', e.target.value)}
                    placeholder="Descreva detalhadamente o que foi trabalhado na sessão..."
                    rows={12}
                />
            </div>

            {/* Upload de Arquivos - Card */}
            <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--hub-card-background)' }}
            >
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">
                        Fotos e Vídeos
                    </label>
                </div>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                
                {/* Formulário de nomeação de arquivo selecionado */}
                {selectedFile ? (
                    <div className="p-4 bg-muted/30 rounded-lg border space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                            {isImageFile(selectedFile.type) ? (
                                <Image className="h-4 w-4 text-blue-500" />
                            ) : isVideoFile(selectedFile.type) ? (
                                <Video className="h-4 w-4 text-purple-500" />
                            ) : (
                                <FileText className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="text-muted-foreground">
                                {selectedFile.name} ({formatBytes(selectedFile.size)})
                            </span>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Nome do arquivo *</label>
                            <Input
                                placeholder="Digite o nome do arquivo"
                                value={nomeArquivo}
                                onChange={(e) => setNomeArquivo(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCancelFile}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleAddFile}
                                disabled={!nomeArquivo.trim()}
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
                        className="mb-4"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar arquivo
                    </Button>
                )}
                
                {arquivosAtivos.length > 0 ? (
                    <div className="space-y-2">
                        {arquivosAtivos.map((arquivo) => (
                            <div 
                                key={arquivo.id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-background"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        {getArquivoIcon(arquivo.tipo)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{arquivo.nome}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {arquivo.tipo.charAt(0).toUpperCase() + arquivo.tipo.slice(1)} • {formatBytes(arquivo.tamanho)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemoveArquivo(arquivo.id)}
                                    className="h-8 w-8 text-destructive hover:text-destructive/80"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 border-2 border-dashed rounded-xl text-sm text-muted-foreground">
                        Nenhum arquivo adicionado
                    </div>
                )}
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end pt-2">
                <Button
                    onClick={onSave}
                    disabled={isSaving || !formData.descricaoSessao.trim()}
                    size="sm"
                >
                    {isSaving ? 'Salvando...' : 'Registrar Evolução'}
                </Button>
            </div>
        </div>
    );
}
