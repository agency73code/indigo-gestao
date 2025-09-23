import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import Cropper from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
    readFile,
    validateImageFile,
    getImageOrientation,
    getCroppedImage,
    type Area,
} from '@/utils/image';
import { useProfilePhoto, type ProfilePhotoDTO } from '@/hooks/useProfilePhoto';

interface ProfilePhotoFieldProps {
    userId: string;
    control: Control<any>;
    name?: string;
    disabled?: boolean;
    onUploaded?: (value: ProfilePhotoDTO) => void;
}

interface CropState {
    crop: { x: number; y: number };
    zoom: number;
    aspect: number;
    croppedAreaPixels: Area | null;
}

export default function ProfilePhotoField({
    userId,
    control,
    name = 'profilePhoto',
    disabled = false,
    onUploaded,
}: ProfilePhotoFieldProps) {
    const { field, fieldState } = useController({
        name,
        control,
    });

    // Estados do componente
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orientation, setOrientation] = useState(1);
    const [cropState, setCropState] = useState<CropState>({
        crop: { x: 0, y: 0 },
        zoom: 1,
        aspect: 1,
        croppedAreaPixels: null,
    });

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hook para upload
    const { isUploading, uploadError, uploadProfilePhoto, clearError } = useProfilePhoto();

    // Reset error quando modal abre
    useEffect(() => {
        if (isModalOpen) {
            clearError();
        }
    }, [isModalOpen, clearError]);

    // Handler para seleção de arquivo
    const handleFileSelect = useCallback(async (file: File) => {
        // Validar arquivo
        const validation = validateImageFile(file);
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        try {
            // Ler arquivo e obter orientação
            const [imageUrl, imageOrientation] = await Promise.all([
                readFile(file),
                getImageOrientation(file),
            ]);

            setImageSrc(imageUrl);
            setOrientation(imageOrientation);
            setCropState({
                crop: { x: 0, y: 0 },
                zoom: 1,
                aspect: 1,
                croppedAreaPixels: null,
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error reading file:', error);
            toast.error('Erro ao carregar imagem. Tente novamente.');
        }
    }, []);

    // Handler para input de arquivo
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // Handler para drag & drop
    const handleDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [handleFileSelect],
    );

    // Handler para crop completo
    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCropState((prev) => ({ ...prev, croppedAreaPixels }));
    }, []);

    // Handler para salvar imagem cortada
    const handleSaveCrop = useCallback(async () => {
        if (!cropState.croppedAreaPixels || !imageSrc) {
            toast.error('Erro no recorte da imagem');
            return;
        }

        try {
            // Verificar se a área cortada não é muito pequena
            const { width, height } = cropState.croppedAreaPixels;
            if (width < 256 || height < 256) {
                const shouldContinue = window.confirm(
                    'A área selecionada é pequena e pode resultar em baixa qualidade. Deseja continuar?',
                );
                if (!shouldContinue) {
                    return;
                }
            }

            // Criar imagem cortada
            const croppedBlob = await getCroppedImage(
                imageSrc,
                cropState.croppedAreaPixels,
                512,
                orientation,
            );

            // Fazer upload
            const result = await uploadProfilePhoto(croppedBlob, userId);

            if (result) {
                // Atualizar campo do formulário
                field.onChange(result);

                // Callback opcional
                onUploaded?.(result);

                // Fechar modal
                setIsModalOpen(false);
                setImageSrc('');
            }
        } catch (error) {
            console.error('Error cropping/uploading image:', error);
            toast.error('Erro ao processar imagem. Tente novamente.');
        }
    }, [cropState, imageSrc, orientation, uploadProfilePhoto, userId, field, onUploaded]);

    // Handler para cancelar
    const handleCancel = () => {
        setIsModalOpen(false);
        setImageSrc('');
        setCropState({
            crop: { x: 0, y: 0 },
            zoom: 1,
            aspect: 1,
            croppedAreaPixels: null,
        });

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handler para trocar foto
    const handleChangePhoto = () => {
        fileInputRef.current?.click();
    };

    // Handler para remover foto
    const handleRemovePhoto = () => {
        field.onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Valor atual da foto
    const currentPhoto = field.value as ProfilePhotoDTO | null;
    const hasPhoto = currentPhoto && currentPhoto.webViewLink;

    return (
        <div className="space-y-2">
            <Label>
                Foto de Perfil
                <span className="text-xs text-muted-foreground ml-2">
                    (JPG, PNG ou WebP - máx. 5MB)
                </span>
            </Label>

            {/* Card principal */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    disabled
                        ? 'bg-muted cursor-not-allowed'
                        : hasPhoto
                          ? 'border-muted-foreground/25 bg-muted/50'
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer'
                } ${fieldState.error ? 'border-destructive' : ''}`}
                onClick={!disabled && !hasPhoto ? () => fileInputRef.current?.click() : undefined}
                onDrop={!disabled && !hasPhoto ? handleDrop : undefined}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
            >
                {hasPhoto ? (
                    // Preview da foto atual
                    <div className="space-y-4">
                        <div className="relative inline-block">
                            <img
                                src={currentPhoto.thumbnailLink || currentPhoto.webViewLink}
                                alt="Foto de perfil"
                                className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-border"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1">
                                <Camera className="w-4 h-4 text-primary-foreground" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleChangePhoto}
                                disabled={disabled || isUploading}
                            >
                                <Camera className="w-4 h-4 mr-1" />
                                Trocar foto
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemovePhoto}
                                disabled={disabled || isUploading}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Remover
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Estado inicial
                    <div>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                            Clique para selecionar ou arraste uma foto aqui
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Use JPG, PNG ou WebP (máx. 5MB)
                        </p>
                    </div>
                )}
            </div>

            {/* Input de arquivo oculto */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
                disabled={disabled}
            />

            {/* Erro de validação */}
            {fieldState.error && (
                <p className="text-sm text-destructive">{fieldState.error.message}</p>
            )}

            {/* Erro de upload */}
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

            {/* Modal de recorte */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Ajuste o recorte da sua foto de perfil</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Área de recorte */}
                        <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                            {imageSrc && (
                                <Cropper
                                    image={imageSrc}
                                    crop={cropState.crop}
                                    zoom={cropState.zoom}
                                    aspect={cropState.aspect}
                                    onCropChange={(crop) =>
                                        setCropState((prev) => ({ ...prev, crop }))
                                    }
                                    onZoomChange={(zoom) =>
                                        setCropState((prev) => ({ ...prev, zoom }))
                                    }
                                    onCropComplete={onCropComplete}
                                    cropShape="round"
                                    showGrid={false}
                                    style={{
                                        containerStyle: {
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: 'transparent',
                                        },
                                    }}
                                />
                            )}
                        </div>

                        {/* Controles de zoom */}
                        <div className="flex items-center gap-3">
                            <ZoomOut className="w-4 h-4 text-muted-foreground" />
                            <input
                                type="range"
                                min={0.5}
                                max={3}
                                step={0.1}
                                value={cropState.zoom}
                                onChange={(e) =>
                                    setCropState((prev) => ({
                                        ...prev,
                                        zoom: Number(e.target.value),
                                    }))
                                }
                                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <ZoomIn className="w-4 h-4 text-muted-foreground" />
                        </div>

                        {/* Botão para resetar */}
                        <div className="flex justify-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    setCropState((prev) => ({
                                        ...prev,
                                        crop: { x: 0, y: 0 },
                                        zoom: 1,
                                    }))
                                }
                            >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Refazer
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isUploading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveCrop}
                            disabled={isUploading || !cropState.croppedAreaPixels}
                        >
                            {isUploading ? 'Enviando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
