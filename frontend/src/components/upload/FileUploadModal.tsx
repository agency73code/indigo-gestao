import { FileText, Upload, X, Image as ImageIcon, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { CloseButton } from '@/components/layout/CloseButton';

interface FileUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    files: File[];
    onFilesChange: (files: File[]) => void;
    error?: string;
    maxFiles?: number;
    acceptedFormats?: string;
    formatDescription?: string;
}

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Documentos - Azul
    if (['pdf', 'txt', 'doc', 'docx'].includes(extension || '')) {
        return { icon: <FileText className="h-5 w-5 text-blue-600" />, bgColor: 'bg-blue-100' };
    }
    
    // Imagens - Verde
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension || '')) {
        return { icon: <ImageIcon className="h-5 w-5 text-green-600" />, bgColor: 'bg-green-100' };
    }
    
    // Vídeos - Roxo
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(extension || '')) {
        return { icon: <Play className="h-5 w-5 text-purple-600" />, bgColor: 'bg-purple-100' };
    }
    
    // Padrão para outros tipos - Cinza
    return { icon: <FileText className="h-5 w-5 text-gray-600" />, bgColor: 'bg-gray-100' };
};

export function FileUploadModal({
    open,
    onOpenChange,
    files,
    onFilesChange,
    error,
    maxFiles = 5,
    acceptedFormats = "application/pdf,image/jpeg,image/png,image/gif,text/plain,video/mp4,video/avi,video/mov",
    formatDescription = "PDF, TXT, PNG, JPEG, GIF, MP4, AVI, MOV"
}: FileUploadModalProps) {
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            const newFiles = [...files, ...selectedFiles].slice(0, maxFiles);
            onFilesChange(newFiles);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, idx) => idx !== index);
        onFilesChange(newFiles);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[50vw] max-w-[600px] p-0 flex flex-col gap-0">
                {/* Header */}
                <div className="flex items-center gap-4 px-4 py-4 bg-background shrink-0 rounded-2xl">
                    <CloseButton onClick={() => onOpenChange(false)} />
                    <SheetTitle 
                        className="text-foreground" 
                        style={{ 
                            fontSize: 'var(--page-title-font-size)',
                            fontWeight: 'var(--page-title-font-weight)',
                            fontFamily: 'var(--page-title-font-family)'
                        }}
                    >
                        Adicionar arquivos
                    </SheetTitle>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 p-6 overflow-y-auto bg-background rounded-2xl">
                    <Card padding="hub" className="border-0" style={{ backgroundColor: 'var(--header-bg)' }}>
                        <CardContent className="space-y-4 pt-6">
                            {/* Upload area */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-muted/30">
                                <Input
                                    id="upload-modal"
                                    type="file"
                                    multiple
                                    accept={acceptedFormats}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label htmlFor="upload-modal" className="cursor-pointer">
                                    <div className="space-y-3">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Upload className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Arraste e solte arquivos aqui</p>
                                            <p className="text-xs text-muted-foreground mt-1">ou</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById('upload-modal')?.click();
                                            }}
                                        >
                                            Escolher arquivos
                                        </Button>
                                    </div>
                                </label>
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                                {formatDescription} - Máximo {maxFiles} arquivos
                            </p>

                            {/* Lista de arquivos */}
                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Arquivos selecionados ({files.length})</h3>
                                    {files.map((file, idx) => {
                                        const fileInfo = getFileIcon(file.name);
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 bg-muted rounded-lg border"
                                            >
                                                <div className={`flex-shrink-0 w-10 h-10 ${fileInfo.bgColor} rounded flex items-center justify-center`}>
                                                    {fileInfo.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(idx)}
                                                    className="flex-shrink-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {error && (
                                <p className="text-xs text-destructive text-center">{error}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-background flex justify-end gap-3 shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => onOpenChange(false)}
                    >
                        Salvar
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
