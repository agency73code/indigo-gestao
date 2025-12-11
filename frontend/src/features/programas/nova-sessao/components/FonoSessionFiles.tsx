import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, Image, Video, File, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export type SessionFile = {
    id: string;
    file: File;
    name: string;
    preview?: string;
};

interface FonoSessionFilesProps {
    files: SessionFile[];
    onFilesChange: (files: SessionFile[]) => void;
    disabled?: boolean;
}

// Helper para determinar o ícone e cor baseado no tipo de arquivo
const getFileIcon = (mimeType: string): { Icon: typeof FileText; color: string } => {
    // Imagens
    if (mimeType.startsWith('image/')) {
        return { Icon: Image, color: 'text-blue-600' };
    }
    
    // Vídeos
    if (mimeType.startsWith('video/')) {
        return { Icon: Video, color: 'text-purple-600' };
    }
    
    // PDFs
    if (mimeType === 'application/pdf') {
        return { Icon: FileText, color: 'text-red-600' };
    }
    
    // Documentos (Word, TXT, etc)
    if (
        mimeType === 'application/msword' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'text/plain'
    ) {
        return { Icon: FileIcon, color: 'text-green-600' };
    }
    
    // Outros arquivos
    return { Icon: File, color: 'text-gray-600' };
};

// Helper para formatar tamanho de arquivo
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default function FonoSessionFiles({
    files,
    onFilesChange,
    disabled = false,
}: FonoSessionFilesProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Sugerir o nome do arquivo (sem extensão) como nome inicial
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setFileName(nameWithoutExt);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setFileName(nameWithoutExt);
        }
    };

    const handleAddFile = async () => {
        if (!selectedFile || !fileName.trim()) {
            toast.error('Preencha o nome do arquivo');
            return;
        }

        setUploading(true);

        try {
            // Criar preview para imagens
            let preview: string | undefined;
            if (selectedFile.type.startsWith('image/')) {
                preview = URL.createObjectURL(selectedFile);
            }

            const newFile: SessionFile = {
                id: `file-${Date.now()}-${Math.random()}`,
                file: selectedFile,
                name: fileName.trim(),
                preview,
            };

            onFilesChange([...files, newFile]);

            // Limpar campos
            setSelectedFile(null);
            setFileName('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            toast.success('Arquivo adicionado com sucesso!');
        } catch (err) {
            console.error('Erro ao adicionar arquivo:', err);
            toast.error('Erro ao adicionar arquivo');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (fileId: string) => {
        const fileToRemove = files.find((f) => f.id === fileId);
        if (fileToRemove?.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
        onFilesChange(files.filter((f) => f.id !== fileId));
        toast.success('Arquivo removido');
    };

    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Arquivos da Sessão
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                    Adicione fotos, vídeos ou documentos relacionados a esta sessão
                </p>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
                {/* Área de upload */}
                <div className="space-y-3">
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                            isDragOver
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                        } ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-center">
                            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-1">
                                Clique para selecionar ou arraste um arquivo aqui
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Formatos aceitos: Imagens (JPG, PNG), Vídeos (MP4, MOV), Documentos (PDF, DOC, TXT)
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={disabled}
                        />
                    </div>

                    {/* Formulário de nome do arquivo */}
                    {selectedFile && (
                        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                    {(() => {
                                        const { Icon, color } = getFileIcon(selectedFile.type);
                                        return <Icon className={`h-5 w-5 ${color}`} />;
                                    })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file-name">
                                    Nome do arquivo <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="file-name"
                                    type="text"
                                    placeholder="Ex: Atividade de coordenação motora"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    disabled={uploading || disabled}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Dê um nome descritivo para facilitar a identificação
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleAddFile}
                                    disabled={!fileName.trim() || uploading || disabled}
                                    className="flex-1"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Adicionando...
                                        </>
                                    ) : (
                                        'Adicionar'
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setFileName('');
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    disabled={uploading || disabled}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lista de arquivos adicionados */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Arquivos adicionados ({files.length})</h4>
                        <div className="space-y-2">
                            {files.map((file) => {
                                const { Icon, color } = getFileIcon(file.file.type);
                                return (
                                    <div
                                        key={file.id}
                                        className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                            <Icon className={`h-5 w-5 ${color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {file.file.name} • {formatFileSize(file.file.size)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveFile(file.id)}
                                            disabled={disabled}
                                            className="shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {files.length === 0 && !selectedFile && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                        Nenhum arquivo anexado ainda
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
