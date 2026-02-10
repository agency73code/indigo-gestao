import { FileText, Download, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

export type SessionFileView = {
    id: string;
    name: string;
    fileName: string;
    type: string;
    size: number;
    url: string; // base64 URL
};

interface ToSessionFilesViewerProps {
    files: SessionFileView[];
}

// Helper para determinar o emoji e cor baseado no tipo de arquivo
const getFileEmoji = (mimeType: string): { emoji: string; color: string } => {
    if (mimeType.startsWith('image/')) {
        return { emoji: '📸', color: 'text-blue-600' };
    }
    if (mimeType.startsWith('video/')) {
        return { emoji: '🎥', color: 'text-purple-600' };
    }
    if (mimeType === 'application/pdf') {
        return { emoji: '📄', color: 'text-red-600' };
    }
    if (
        mimeType === 'application/msword' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'text/plain'
    ) {
        return { emoji: '📝', color: 'text-green-600' };
    }
    return { emoji: '📎', color: 'text-gray-600' };
};

// Helper para formatar tamanho de arquivo
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default function ToSessionFilesViewer({ files }: ToSessionFilesViewerProps) {
    const [previewFile, setPreviewFile] = useState<SessionFileView | null>(null);

    const handleDownload = (file: SessionFileView) => {
        const link = document.createElement('a');
        link.href = `/api/arquivos/${file.id}/download`;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePreview = (file: SessionFileView) => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf') {
            setPreviewFile(file);
        } else {
            handleDownload(file);
        }
    };

    if (files.length === 0) {
        return null;
    }

    return (
        <>
            <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Anexos da Sessão
                        <Badge variant="secondary" className="ml-2">
                            {files.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="space-y-2">
                        {files.map((file) => {
                            const { emoji, color } = getFileEmoji(file.type);
                            return (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className={`text-2xl ${color}`}>{emoji}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {file.fileName} • {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePreview(file)}
                                            title="Visualizar"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDownload(file)}
                                            title="Baixar"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de preview */}
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span className="truncate">{previewFile?.name}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreviewFile(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="mt-4">
                        {previewFile?.type.startsWith('image/') && (
                            <img
                                src={previewFile.url}
                                alt={previewFile.name}
                                className="w-full h-auto rounded-lg"
                            />
                        )}
                        
                        {previewFile?.type.startsWith('video/') && (
                            <video
                                src={previewFile.url}
                                controls
                                className="w-full h-auto rounded-lg"
                            >
                                Seu navegador não suporta a reprodução de vídeo.
                            </video>
                        )}
                        
                        {previewFile?.type === 'application/pdf' && (
                            <iframe
                                src={previewFile.url}
                                className="w-full h-[70vh] rounded-lg"
                                title={previewFile.name}
                            />
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => previewFile && handleDownload(previewFile)}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
