import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { CircleHelp, Image, Video, FileText, FileIcon, File, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SessionFile = {
    id: string;
    name: string;
    fileName: string;
    type: string;
    size: number;
    url: string;
};

interface SessionFilesProps {
    files?: SessionFile[];
}

// Helper para determinar o ícone e cor baseado no tipo de arquivo
function getFileIcon(type: string): { Icon: typeof File; bgColor: string; textColor: string } {
    if (type.startsWith('image/')) {
        return { 
            Icon: Image, 
            bgColor: 'bg-blue-100 dark:bg-blue-950',
            textColor: 'text-blue-700 dark:text-blue-400'
        };
    }
    if (type.startsWith('video/')) {
        return { 
            Icon: Video, 
            bgColor: 'bg-purple-100 dark:bg-purple-950',
            textColor: 'text-purple-700 dark:text-purple-400'
        };
    }
    if (type === 'application/pdf') {
        return { 
            Icon: FileText, 
            bgColor: 'bg-red-100 dark:bg-red-950',
            textColor: 'text-red-700 dark:text-red-400'
        };
    }
    if (
        type === 'application/msword' ||
        type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        return { 
            Icon: FileIcon, 
            bgColor: 'bg-blue-100 dark:bg-blue-950',
            textColor: 'text-blue-700 dark:text-blue-400'
        };
    }
    // Outros arquivos
    return { 
        Icon: File, 
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-700 dark:text-gray-400'
    };
}

// Helper para formatar tamanho de arquivo
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function SessionFiles({ files }: SessionFilesProps) {
    const hasFiles = files && files.length > 0;

    const handleDownload = (file: SessionFile) => {
        // Criar link temporário para download
        const link = document.createElement('a');
        link.href = `/api/arquivos/${encodeURIComponent(file.url)}/download`;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card className="rounded-[5px]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base font-semibold">Arquivos da sessão</CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px]">
                                <p className="text-xs">
                                    Arquivos anexados durante o registro desta sessão, como fotos,
                                    vídeos ou documentos que complementam as informações registradas.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                    Arquivos anexados pelo terapeuta durante esta sessão
                </p>
            </CardHeader>
            <CardContent>
                {hasFiles ? (
                    <div className="grid gap-3">
                        {files.map((file) => {
                            const { Icon, bgColor, textColor } = getFileIcon(file.type);
                            return (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* Ícone com borda colorida - mesmo padrão dos indicadores */}
                                        <div 
                                            className={`flex items-center justify-center w-10 h-10 rounded-md shrink-0 ${bgColor} ${textColor}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {file.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs px-2 py-0 h-5 border-0 bg-muted"
                                                >
                                                    {formatFileSize(file.size)}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {file.fileName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDownload(file)}
                                        className="shrink-0 ml-2"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-md">
                        <File className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>Nenhum arquivo anexado a esta sessão</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
