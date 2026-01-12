import { FileText, Image as ImageIcon, Play, Download, X, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Tipos
export interface FileAttachment {
    id: string;
    name: string;
    size: number; // em bytes
    type: string;
    url?: string; // URL para download (quando salvo)
}

interface FileAttachmentListProps {
    files: FileAttachment[];
    onRemove?: (id: string) => void;
    onDownload?: (file: FileAttachment) => void;
    variant?: 'default' | 'compact';
    readonly?: boolean;
    className?: string;
    emptyMessage?: string;
}

// Helper: formatar tamanho do arquivo
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Helper: obter ícone baseado no tipo/extensão
const getFileIcon = (fileName: string, mimeType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Imagens
    if (mimeType?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(extension || '')) {
        return { icon: <ImageIcon className="h-4 w-4 text-green-600" />, bgColor: 'bg-green-100', color: 'text-green-600' };
    }
    
    // Vídeos
    if (mimeType?.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(extension || '')) {
        return { icon: <Play className="h-4 w-4 text-purple-600" />, bgColor: 'bg-purple-100', color: 'text-purple-600' };
    }
    
    // PDFs
    if (mimeType === 'application/pdf' || extension === 'pdf') {
        return { icon: <FileText className="h-4 w-4 text-red-600" />, bgColor: 'bg-red-100', color: 'text-red-600' };
    }
    
    // Documentos Word
    if (['doc', 'docx'].includes(extension || '')) {
        return { icon: <FileText className="h-4 w-4 text-blue-600" />, bgColor: 'bg-blue-100', color: 'text-blue-600' };
    }
    
    // Planilhas
    if (['xls', 'xlsx', 'csv'].includes(extension || '')) {
        return { icon: <FileText className="h-4 w-4 text-emerald-600" />, bgColor: 'bg-emerald-100', color: 'text-emerald-600' };
    }
    
    // Arquivos compactados
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
        return { icon: <FileText className="h-4 w-4 text-amber-600" />, bgColor: 'bg-amber-100', color: 'text-amber-600' };
    }
    
    // Padrão
    return { icon: <FileText className="h-4 w-4 text-gray-600" />, bgColor: 'bg-gray-100', color: 'text-gray-600' };
};

export function FileAttachmentList({
    files,
    onRemove,
    onDownload,
    variant = 'default',
    readonly = false,
    className,
    emptyMessage = 'Nenhum arquivo anexado',
}: FileAttachmentListProps) {
    if (files.length === 0) {
        return (
            <div className={cn("flex items-center gap-2 text-muted-foreground text-sm py-2", className)}>
                <Paperclip className="h-4 w-4" />
                <span className="italic">{emptyMessage}</span>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={cn("flex flex-wrap gap-2", className)}>
                {files.map((file) => {
                    const fileInfo = getFileIcon(file.name, file.type);
                    return (
                        <div
                            key={file.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm"
                        >
                            <span className={cn("shrink-0", fileInfo.color)}>
                                {fileInfo.icon}
                            </span>
                            <span className="font-medium truncate max-w-[150px]" title={file.name}>
                                {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                            </span>
                            {!readonly && onRemove && (
                                <button
                                    type="button"
                                    onClick={() => onRemove(file.id)}
                                    className="hover:text-destructive transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Variante default - cards estilo da referência
    return (
        <div className={cn("space-y-2", className)}>
            {files.map((file) => {
                const fileInfo = getFileIcon(file.name, file.type);
                return (
                    <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border hover:bg-muted transition-colors group"
                    >
                        {/* Ícone */}
                        <div className={cn(
                            "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                            fileInfo.bgColor
                        )}>
                            {fileInfo.icon}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" title={file.name}>
                                {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                            </p>
                        </div>
                        
                        {/* Ações */}
                        <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {file.url && onDownload && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onDownload(file)}
                                    title="Download"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}
                            {!readonly && onRemove && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:text-destructive"
                                    onClick={() => onRemove(file.id)}
                                    title="Remover"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Componente auxiliar para converter File[] em FileAttachment[]
export function filesToAttachments(files: File[]): FileAttachment[] {
    return files.map((file, index) => ({
        id: `temp-${index}-${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
    }));
}

export default FileAttachmentList;
