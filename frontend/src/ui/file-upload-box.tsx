import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface FileUploadBoxProps {
    value?: File | null;
    onChange: (file: File | null) => void;
    accept?: string;
    maxSize?: number; // em MB
    error?: string;
    disabled?: boolean;
    allowedTypes?: string; // ex: "XLS TXT, PNG, JPEG, GIF"
}

export function FileUploadBox({
    onChange,
    accept = '.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif',
    maxSize = 10,
    error,
    disabled = false,
    allowedTypes = 'XLS TXT, PNG, JPEG, GIF',
}: FileUploadBoxProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled && !isLoading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled || isLoading) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = async (file: File) => {
        // Validação de tamanho
        if (file.size > maxSize * 1024 * 1024) {
            // Aqui você pode adicionar um toast ou callback de erro
            return;
        }

        setIsLoading(true);
        
        // Simula um pequeno delay para mostrar o loading
        setTimeout(() => {
            onChange(file);
            setIsLoading(false);
        }, 500);
    };

    const openFilePicker = () => {
        if (!disabled && !isLoading) {
            fileInputRef.current?.click();
        }
    };

    // Determina o estilo do border baseado no estado
    const getBorderStyle = () => {
        if (error) return 'border-red-500';
        if (disabled) return 'border-gray-300';
        if (isDragging) return 'border-primary border-2';
        return 'border-gray-300 border-dashed';
    };

    // Determina a cor do texto
    const getTextColor = () => {
        if (disabled) return 'text-gray-400';
        return 'text-gray-500';
    };

    return (
        <div className="space-y-1">
            <div
                className={`relative border-2 rounded-lg p-3 text-center transition-all ${getBorderStyle()} ${
                    disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFilePicker}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-primary mb-2" />
                        <p className="text-xs text-gray-600 font-medium">Carregando arquivos</p>
                    </div>
                ) : (
                    <>
                        <p className={`text-xs mb-2 ${getTextColor()}`}>
                            Arraste e solte os arquivos aqui
                        </p>
                        <p className={`text-xs mb-2 ${getTextColor()}`}>ou</p>
                        <button
                            type="button"
                            disabled={disabled}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                disabled
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-gray-800'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                openFilePicker();
                            }}
                        >
                            Escolher arquivos
                            <Upload className="w-3 h-3" />
                        </button>
                    </>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled || isLoading}
                />
            </div>

            {/* Tipos aceitos */}
            <p className={`text-[10px] text-center ${getTextColor()}`}>{allowedTypes}</p>

            {/* Mensagem de erro */}
            {error && <p className="text-[10px] text-red-500 text-center">{error}</p>}
        </div>
    );
}
