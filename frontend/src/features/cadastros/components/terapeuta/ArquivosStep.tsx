import { FileText, X } from 'lucide-react';
import { useState } from 'react';
import type { Terapeuta } from '../../types/cadastros.types';
import ProfilePhotoFieldSimple from '@/components/profile/ProfilePhotoFieldSimple';
import { FileUploadBox } from '@/ui/file-upload-box';
import { SelectField } from '@/ui/select-field';

interface ArquivosStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: File | null) => void;
    errors: Record<string, string>;
}

const FILE_TYPES = [
    { value: 'diplomaGraduacao', label: 'Diploma de Graduação' },
    { value: 'diplomaPosGraduacao', label: 'Diploma de Pós-Graduação' },
    { value: 'registroCRP', label: 'Registro do Conselho Regional de Psicologia (CRP)' },
    { value: 'comprovanteEndereco', label: 'Comprovante de Endereço' },
    { value: 'outros', label: 'Outros' },
];

export default function ArquivosStep({ data, onUpdate, errors }: ArquivosStepProps) {
    const [selectedFileType, setSelectedFileType] = useState<string>('');

    const removeFile = (field: string) => {
        onUpdate(`arquivos.${field}`, null);
    };

    const getUploadedFiles = () => {
        return FILE_TYPES.map((type) => ({
            ...type,
            file: data.arquivos?.[type.value as keyof typeof data.arquivos] as File | undefined,
        })).filter((item) => item.file);
    };

    const uploadedFiles = getUploadedFiles();

    return (
        <div className="space-y-4">
            {/* Seção Foto de Perfil */}
            <div>
                <ProfilePhotoFieldSimple
                    userId={data?.id || ''}
                    fullName=""
                    birthDate=""
                    value={data.arquivos?.fotoPerfil}
                    onChange={(file) => {
                        onUpdate('arquivos.fotoPerfil', file);
                    }}
                    error={errors['arquivos.fotoPerfil']}
                />
            </div>

            {/* Seção Adicionar Documento */}
            <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <h3 className="font-medium text-sm">Adicionar Documento</h3>
                </div>

                <div>
                    <SelectField
                        label="Tipo de Documento"
                        value={selectedFileType}
                        onChange={(e) => setSelectedFileType(e.target.value)}
                    >
                        <option value="">Selecione o tipo</option>
                        {FILE_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </SelectField>
                </div>

                {selectedFileType && (
                    <div className="pt-2">
                        <FileUploadBox
                            value={null}
                            onChange={(file) => {
                                if (file) {
                                    onUpdate(`arquivos.${selectedFileType}`, file);
                                    setSelectedFileType('');
                                }
                            }}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            error={errors[`arquivos.${selectedFileType}`]}
                            allowedTypes="PDF, imagens ou documentos"
                        />
                    </div>
                )}
            </div>

            {/* Lista de Arquivos Enviados */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                    {uploadedFiles.map((item) => (
                        <div
                            key={item.value}
                            className="flex items-center justify-between bg-card rounded-lg p-3 border border-border hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        {item.label}
                                    </p>
                                    <span className="text-xs text-muted-foreground block truncate">
                                        Enviado há 7 dias
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(item.value)}
                                className="text-destructive hover:text-destructive/80 shrink-0 ml-2 p-1 hover:bg-destructive/10 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Orientações */}
            <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-1.5">Orientações para upload:</h4>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                    <li>• Arquivos devem ter no máximo 10MB</li>
                    <li>• Formatos aceitos: PDF, DOC, DOCX, JPG, PNG</li>
                    <li>• Certifique-se de que os documentos estão legíveis</li>
                    <li>• A foto de perfil deve ser recente e profissional</li>
                    <li>• Diplomas e certificados devem estar atualizados</li>
                </ul>
            </div>
        </div>
    );
}
