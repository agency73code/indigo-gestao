import { FileText, X } from 'lucide-react';
import { useState } from 'react';
import type { Cliente } from '../../types/cadastros.types';
import ProfilePhotoFieldSimple from '@/components/profile/ProfilePhotoFieldSimple';
import { FileUploadBox } from '@/ui/file-upload-box';
import { SelectField } from '@/ui/select-field';
import { Input } from '@/components/ui/input';

interface ArquivosStepProps {
    data: Partial<Cliente>;
    onUpdate: (field: string, value: File | string | null) => void;
    errors: Record<string, string>;
}

const FILE_TYPES = [
    { value: 'documentoIdentidade', label: 'Documento de Identidade (RG)' },
    { value: 'comprovanteCpf', label: 'CPF' },
    { value: 'comprovanteResidencia', label: 'Comprovante de Residência' },
    { value: 'relatoriosMedicos', label: 'Laudo Médico' },
    { value: 'carterinhaPlano', label: 'Carteirinha do Convênio' },
    { value: 'prescricaoMedica', label: 'Prescrição Médica' },
    { value: 'outros', label: 'Outros' },
];

export default function ArquivosStep({ data, onUpdate, errors }: ArquivosStepProps) {
    const [selectedFileType, setSelectedFileType] = useState<string>('');
    const [descricaoOutros, setDescricaoOutros] = useState<string>('');

    const removeFile = (field: string) => {
        onUpdate(`arquivos.${field}`, null);
        if (field === 'outros') {
            onUpdate('arquivos.descricaoOutros', null);
        }
    };

    const getUploadedFiles = () => {
        return FILE_TYPES.map((type) => ({
            ...type,
            file: data.arquivos?.[type.value as keyof typeof data.arquivos] as File | undefined,
            descricao: type.value === 'outros' ? (data.arquivos?.descricaoOutros ?? null) : null,
        })).filter((item) => item.file && item.file instanceof File);
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

                {/* Campo de descrição para "Outros" */}
                {selectedFileType === 'outros' && (
                    <div className="pt-2">
                        <label className="block text-sm font-medium mb-1.5">Descrição do Documento</label>
                        <Input
                            type="text"
                            placeholder="Ex: Atestado médico, Declaração escolar..."
                            value={descricaoOutros}
                            onChange={(e) => setDescricaoOutros(e.target.value)}
                        />
                    </div>
                )}

                {selectedFileType && !(selectedFileType === 'outros' && !descricaoOutros.trim()) && (
                    <div className="pt-2">
                        <FileUploadBox
                            value={null}
                            onChange={(file) => {
                                if (file) {
                                    onUpdate(`arquivos.${selectedFileType}`, file);
                                    if (selectedFileType === 'outros' && descricaoOutros.trim()) {
                                        onUpdate('arquivos.descricaoOutros', descricaoOutros.trim());
                                    }
                                    setSelectedFileType('');
                                    setDescricaoOutros('');
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
                                        {item.descricao || item.label}
                                    </p>
                                    {item.descricao && (
                                        <span className="text-xs text-muted-foreground block">
                                            {item.label}
                                        </span>
                                    )}
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
                    <li>• A foto de perfil deve ser recente</li>
                    <li>• Documentos médicos devem estar atualizados</li>
                </ul>
            </div>
        </div>
    );
}
