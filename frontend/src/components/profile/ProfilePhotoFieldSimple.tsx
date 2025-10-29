import React, { useState, useCallback, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
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

export interface ProfilePhotoFieldSimpleRef {
    uploadPhoto: () => Promise<ProfilePhotoDTO | null>;
}

interface ProfilePhotoFieldSimpleProps {
    userId: string;
    value?: File | string | null;
    onChange?: (file: File | null) => void;
    onUploaded?: (profileDto: ProfilePhotoDTO) => void;
    disabled?: boolean;
    error?: string;
}

interface CropState {
    crop: { x: number; y: number };
    zoom: number;
    aspect: number;
    croppedAreaPixels: Area | null;
}

export default forwardRef<ProfilePhotoFieldSimpleRef, ProfilePhotoFieldSimpleProps>(function ProfilePhotoFieldSimple(
    {
        userId,
        value,
        onChange,
        onUploaded,
        disabled = false,
        error,
    },
    ref
) {
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

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadProfilePhoto, isUploading } = useProfilePhoto();

    // Expõe função para fazer upload quando necessário
    useImperativeHandle(ref, () => ({
        uploadPhoto: async () => {
            if (!value || typeof value === 'string') {
                return null;
            }

            try {
                const profileDto = await uploadProfilePhoto(value, userId);
                if (profileDto) {
                    onUploaded?.(profileDto);
                }
                return profileDto;
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Erro ao fazer upload da foto');
                return null;
            }
        },
    }), [value, userId, uploadProfilePhoto, onUploaded]);

    // Preview da imagem atual
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [hasImageError, setHasImageError] = useState(false);

    useEffect(() => {
        setHasImageError(false);

        if (value instanceof File) {
            setIsImageLoading(true);
            const url = URL.createObjectURL(value);
            setPreviewUrl(url);

            // Criar uma imagem para verificar se carrega corretamente
            const img = new Image();
            img.onload = () => {
                setIsImageLoading(false);
            };
            img.onerror = () => {
                setIsImageLoading(false);
                setHasImageError(true);
            };
            img.src = url;

            return () => URL.revokeObjectURL(url);
        } else if (typeof value === 'string' && value.trim()) {
            setIsImageLoading(true);
            setPreviewUrl(value);
        } else {
            setPreviewUrl('');
            setIsImageLoading(false);
        }
    }, [value]);

    const onCropChange = useCallback((crop: { x: number; y: number }) => {
        setCropState((prev) => ({ ...prev, crop }));
    }, []);

    const onZoomChange = useCallback((zoom: number) => {
        setCropState((prev) => ({ ...prev, zoom }));
    }, []);

    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCropState((prev) => ({ ...prev, croppedAreaPixels }));
    }, []);

    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        try {
            await validateImageFile(file);
            const imageDataUrl = await readFile(file);
            const imageOrientation = await getImageOrientation(file);

            setImageSrc(imageDataUrl);
            setOrientation(imageOrientation);
            setIsModalOpen(true);
            setCropState((prev) => ({
                ...prev,
                crop: { x: 0, y: 0 },
                zoom: 1,
                croppedAreaPixels: null,
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao processar imagem';
            toast.error(message);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (disabled) return;

            const files = e.dataTransfer.files;
            handleFileSelect(files);
        },
        [handleFileSelect, disabled],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFileSelect(e.target.files);
        },
        [handleFileSelect],
    );

    const handleCrop = useCallback(async () => {
        if (!imageSrc || !cropState.croppedAreaPixels) return;

        try {
            const croppedBlob = await getCroppedImage(
                imageSrc,
                cropState.croppedAreaPixels,
                orientation,
            );

            // Converte Blob para File para compatibilidade
            const croppedFile = new File([croppedBlob], 'profile-photo.webp', {
                type: 'image/webp',
                lastModified: Date.now(),
            });

            // Apenas atualiza o estado local para preview
            // O upload será feito quando o formulário pai for salvo
            onChange?.(croppedFile);

            setIsModalOpen(false);
            setImageSrc('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao processar foto';
            toast.error(message);
        }
    }, [
        imageSrc,
        cropState.croppedAreaPixels,
        orientation,
        onChange,
    ]);

    const handleRemove = useCallback(() => {
        onChange?.(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onChange]);

    const handleZoomIn = useCallback(() => {
        setCropState((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 0.1, 3) }));
    }, []);

    const handleZoomOut = useCallback(() => {
        setCropState((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 0.1, 1) }));
    }, []);

    const handleRotate = useCallback(() => {
        setOrientation((prev) => (prev === 8 ? 1 : prev + 1));
    }, []);

    const handleCancel = useCallback(() => {
        setIsModalOpen(false);
        setImageSrc('');
    }, []);

    return (
        <div className="space-y-2">
            <Label>Foto de Perfil</Label>

            <div
                className={`relative border-2 border-dashed rounded-lg p-4 h-32 flex items-center justify-center text-center transition-colors cursor-pointer ${
                    error
                        ? 'border-destructive'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <div className="flex items-center justify-center gap-4 w-full">
                        <div className="relative">
                            {hasImageError ? (
                                <div className="w-20 h-20 rounded-full bg-muted border-2 border-muted flex items-center justify-center">
                                    <X className="w-5 h-5 text-destructive" />
                                </div>
                            ) : isImageLoading ? (
                                <div className="w-20 h-20 rounded-full bg-muted animate-pulse border-2 border-muted flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-muted-foreground" />
                                </div>
                            ) : (
                                <img
                                    src={previewUrl}
                                    alt="Preview da foto de perfil"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-muted"
                                />
                            )}
                            {!disabled && !isImageLoading && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove();
                                    }}
                                    className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        {!disabled && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Alterar foto
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="w-full">
                        <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mb-1">
                            Clique para selecionar uma foto
                        </p>
                        <p className="text-xs text-muted-foreground opacity-70">
                            JPG, PNG, WebP (máx. 5MB)
                        </p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled}
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ajustar Foto de Perfil</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Área do Cropper */}
                        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                            {imageSrc && (
                                <Cropper
                                    image={imageSrc}
                                    crop={cropState.crop}
                                    zoom={cropState.zoom}
                                    aspect={cropState.aspect}
                                    onCropChange={onCropChange}
                                    onZoomChange={onZoomChange}
                                    onCropComplete={onCropComplete}
                                    showGrid
                                    cropShape="round"
                                />
                            )}
                        </div>

                        {/* Controles */}
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleZoomOut}
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>

                            <div className="flex-1 px-4">
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={cropState.zoom}
                                    onChange={(e) => onZoomChange(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleZoomIn}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleRotate}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleCrop} disabled={isUploading}>
                            {isUploading ? 'Processando...' : 'Confirmar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
});
