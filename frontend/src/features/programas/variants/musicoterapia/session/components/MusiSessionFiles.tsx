import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Video, FileIcon, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export type SessionFile = {
    id: string;
    file: File;
    name: string;
    preview?: string;
};

interface MusiSessionFilesProps {
    files: SessionFile[];
    onFilesChange: (files: SessionFile[]) => void;
    disabled?: boolean;
}

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
    if (
        mimeType === 'application/msword' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'text/plain'
    ) {
        return { Icon: FileIcon, color: 'text-green-600' };
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

export default function MusiSessionFiles({ files, onFilesChange, disabled = false }: MusiSessionFilesProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFileName('');
        }
    };

    const handleAddFile = () => {
        if (!selectedFile || !fileName.trim()) {
            toast.error('Preencha o nome do arquivo');
            return;
        }

        const newFile: SessionFile = {
            id: `file-${Date.now()}`,
            file: selectedFile,
            name: fileName.trim(),
        };

        onFilesChange([...files, newFile]);
        setSelectedFile(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast.success('Arquivo adicionado!');
    };

    const handleRemoveFile = (fileId: string) => {
        onFilesChange(files.filter((f) => f.id !== fileId));
        toast.success('Arquivo removido');
    };

    return (
        <Card className="rounded-[5px]">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    📎 Arquivos da Sessão
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upload */}
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Clique para selecionar arquivo</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        disabled={disabled}
                        className="hidden"
                        id="musi-file-upload"
                    />
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                    >
                        Selecionar Arquivo
                    </Button>
                </div>

                {/* Preview do arquivo selecionado */}
                {selectedFile && (
                    <div className="p-3 rounded-[5px] border bg-muted/30 space-y-3">
                        <div className="flex items-center gap-2">
                            {(() => {
                                const { Icon, color } = getFileIcon(selectedFile.type);
                                return <Icon className={`h-5 w-5 ${color}`} />;
                            })()}
                            <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                                {formatFileSize(selectedFile.size)}
                            </span>
                        </div>
                        <Input
                            placeholder="Nome do arquivo (obrigatório)"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleAddFile} disabled={!fileName.trim()}>
                                Adicionar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setSelectedFile(null);
                                    setFileName('');
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                {/* Lista de arquivos */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Arquivos anexados ({files.length})</p>
                        {files.map((file) => {
                            const { Icon, color } = getFileIcon(file.file.type);
                            return (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-2 p-2 rounded-[5px] border bg-background"
                                >
                                    <Icon className={`h-4 w-4 ${color}`} />
                                    <span className="text-sm truncate flex-1">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatFileSize(file.file.size)}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveFile(file.id)}
                                        disabled={disabled}
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
