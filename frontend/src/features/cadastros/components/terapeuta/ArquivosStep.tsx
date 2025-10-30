import { Label } from '@/ui/label';
import { Upload, FileText, X } from 'lucide-react';
import { useRef } from 'react';
import type { Terapeuta } from '../../types/cadastros.types';
import ProfilePhotoFieldSimple from '@/components/profile/ProfilePhotoFieldSimple';

interface ArquivosStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: File | null) => void;
    errors: Record<string, string>;
}

export default function ArquivosStep({ data, onUpdate, errors }: ArquivosStepProps) {

    const fileInputRefs = {
        diplomaGraduacao: useRef<HTMLInputElement>(null),
        diplomaPosGraduacao: useRef<HTMLInputElement>(null),
        registroCRP: useRef<HTMLInputElement>(null),
        comprovanteEndereco: useRef<HTMLInputElement>(null),
    };

    const handleFileChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onUpdate(`arquivos.${field}`, file);
    };

    const removeFile = (field: string) => {
        onUpdate(`arquivos.${field}`, null);
        const ref = fileInputRefs[field as keyof typeof fileInputRefs];
        if (ref.current) {
            ref.current.value = '';
        }
    };

    const FileUploadField = ({
        field,
        label,
        required = false,
        accept = 'image/*,.pdf,.doc,.docx',
    }: {
        field: string;
        label: string;
        required?: boolean;
        accept?: string;
    }) => {
        const file = data.arquivos?.[field as keyof typeof data.arquivos] as File;
        const hasFile = file instanceof File;
        const errorKey = `arquivos.${field}`;

        return (
            <div className="space-y-2">
                <Label>
                    {label} {required && '*'}
                </Label>

                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                        errors[errorKey]
                            ? 'border-destructive'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                    onClick={() => {
                        if (!hasFile) {
                            fileInputRefs[field as keyof typeof fileInputRefs]?.current?.click();
                        }
                    }}
                >
                    {hasFile ? (
                        <div className="flex items-center justify-between bg-muted rounded-md p-3">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <span
                                        className="text-sm block truncate max-w-[200px]"
                                        title={file.name}
                                    >
                                        {file.name.length > 30
                                            ? `${file.name.substring(0, 27)}...`
                                            : file.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(field);
                                }}
                                className="text-destructive hover:text-destructive/80 flex-shrink-0 ml-2"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">
                                Clique para selecionar ou arraste um arquivo aqui
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                            </p>
                        </div>
                    )}

                    <input
                        ref={fileInputRefs[field as keyof typeof fileInputRefs]}
                        type="file"
                        accept={accept}
                        onChange={(e) => handleFileChange(field, e)}
                        className="hidden"
                    />
                </div>

                {errors[errorKey] && <p className="text-sm text-destructive">{errors[errorKey]}</p>}
            </div>
        );
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <h3 className="text-base sm:text-lg font-semibold">Documentos e Arquivos</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                <ProfilePhotoFieldSimple
                    userId={data?.id || ''}
                    fullName=''
                    birthDate=''
                    value={data.arquivos?.fotoPerfil}
                    onChange={(file) => {
                        onUpdate('arquivos.fotoPerfil', file);
                    }}
                    error={errors['arquivos.fotoPerfil']}
                />

                <FileUploadField field="diplomaGraduacao" label="Diploma de Graduação" />

                <FileUploadField field="diplomaPosGraduacao" label="Diploma de Pós-Graduação" />

                <FileUploadField
                    field="registroCRP"
                    label="Registro do  Conselho Regional de Psicologia (CRP)"
                />

                <FileUploadField field="comprovanteEndereco" label="Comprovante de Endereço" />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Orientações para upload:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Arquivos devem ter no máximo 10MB</li>
                    <li>• Formatos aceitos: PDF, DOC, DOCX, JPG, PNG</li>
                    <li>• Certifique-se de que os documentos estão legíveis</li>
                    <li>• A foto de perfil deve ser recente e profissional</li>
                </ul>
            </div>
        </div>
    );
}
