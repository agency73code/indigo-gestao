import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTerapeuta } from '../hooks/useTerapeuta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/ui/label';
import { FileText, Edit2, Save, X, Loader2 } from 'lucide-react';
import ReadOnlyField from '../components/ReadOnlyField';
import DocumentsTable from '../arquivos/components/DocumentsTable';
import { DocumentsEditor } from '../arquivos/components/DocumentsEditor';
import { updateTerapeuta } from '../service/consultas.service';
import { listFiles, type FileMeta } from '../service/consultas.service';

export default function ConsultaTerapeutaPage() {
    const { terapeutaId } = useParams<{ terapeutaId: string }>();
    const terapeutaData = useTerapeuta(terapeutaId, Boolean(terapeutaId));
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [files, setFiles] = useState<FileMeta[]>([]);
    const [filesLoading, setFilesLoading] = useState(true);

    const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
        defaultValues: terapeutaData ? {
            nome: terapeutaData.nome || '',
            email: terapeutaData.email || '',
            emailIndigo: terapeutaData.emailIndigo || '',
            telefone: terapeutaData.telefone || '',
            celular: terapeutaData.celular || '',
            cpf: terapeutaData.cpf || '',
            dataNascimento: terapeutaData.dataNascimento 
                ? new Date(terapeutaData.dataNascimento).toISOString().split('T')[0] 
                : '',
            // Endereço
            cep: terapeutaData.endereco?.cep || '',
            rua: terapeutaData.endereco?.rua || '',
            numero: terapeutaData.endereco?.numero || '',
            complemento: terapeutaData.endereco?.complemento || '',
            bairro: terapeutaData.endereco?.bairro || '',
            cidade: terapeutaData.endereco?.cidade || '',
            estado: terapeutaData.endereco?.estado || '',
            // Veículo
            possuiVeiculo: terapeutaData.possuiVeiculo || 'nao',
            placaVeiculo: terapeutaData.placaVeiculo || '',
            modeloVeiculo: terapeutaData.modeloVeiculo || '',
        } : undefined
    });

    const loadFiles = async () => {
        if (!terapeutaId) return;
        setFilesLoading(true);
        try {
            const data = await listFiles({ ownerType: 'terapeuta', ownerId: terapeutaId });
            setFiles(data);
        } catch (err) {
            console.error('Erro ao carregar arquivos:', err);
        } finally {
            setFilesLoading(false);
        }
    };

    const handleEditClick = () => {
        setIsEditMode(true);
        setSaveError(null);
        loadFiles();
        
        window.dispatchEvent(
            new CustomEvent('consulta:edit:enter', {
                detail: { ownerType: 'terapeuta', ownerId: terapeutaId }
            })
        );
    };

    const handleCancelClick = () => {
        if (isDirty) {
            const confirm = window.confirm('Você tem alterações não salvas. Deseja realmente cancelar?');
            if (!confirm) return;
        }

        setIsEditMode(false);
        setSaveError(null);
        reset();

        window.dispatchEvent(
            new CustomEvent('consulta:edit:cancel', {
                detail: { ownerType: 'terapeuta', ownerId: terapeutaId }
            })
        );
    };

    const onSubmit = async (data: any) => {
        if (!terapeutaId) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            await updateTerapeuta(terapeutaId, {
                nome: data.nome,
                email: data.email,
                emailIndigo: data.emailIndigo,
                telefone: data.telefone,
                celular: data.celular,
                cpf: data.cpf,
                dataNascimento: data.dataNascimento,
                possuiVeiculo: data.possuiVeiculo,
                placaVeiculo: data.placaVeiculo,
                modeloVeiculo: data.modeloVeiculo,
                endereco: {
                    cep: data.cep,
                    rua: data.rua,
                    numero: data.numero,
                    complemento: data.complemento,
                    bairro: data.bairro,
                    cidade: data.cidade,
                    estado: data.estado,
                }
            });

            window.dispatchEvent(
                new CustomEvent('consulta:edit:save:success', {
                    detail: { ownerType: 'terapeuta', ownerId: terapeutaId }
                })
            );

            setIsEditMode(false);
        } catch (err: any) {
            const msg = err.message ?? 'Erro ao salvar dados do terapeuta';
            setSaveError(msg);

            window.dispatchEvent(
                new CustomEvent('consulta:edit:save:error', {
                    detail: { ownerType: 'terapeuta', ownerId: terapeutaId, error: msg }
                })
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (!terapeutaId) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">ID do terapeuta não fornecido</p>
            </div>
        );
    }

    if (!terapeutaData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full w-full px-1 py-4 md:p-4 sm:p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1
                        className="text-2xl font-semibold text-primary"
                        style={{ fontFamily: 'Sora, sans-serif' }}
                    >
                        Consulta do Terapeuta
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Detalhes e documentos do terapeuta {terapeutaData.nome}
                    </p>
                </div>

                {!isEditMode && (
                    <Button onClick={handleEditClick} className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Editar
                    </Button>
                )}
            </div>

            {saveError && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                    {saveError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Dados Pessoais */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Dados Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isEditMode ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome</Label>
                                        <Input id="nome" {...register('nome')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" {...register('email')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emailIndigo">Email Indigo</Label>
                                        <Input id="emailIndigo" type="email" {...register('emailIndigo')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefone">Telefone</Label>
                                        <Input id="telefone" {...register('telefone')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="celular">Celular</Label>
                                        <Input id="celular" {...register('celular')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cpf">CPF</Label>
                                        <Input id="cpf" {...register('cpf')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                                        <Input id="dataNascimento" type="date" {...register('dataNascimento')} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ReadOnlyField label="Nome" value={terapeutaData.nome || ''} />
                                    <ReadOnlyField label="Email" value={terapeutaData.email || ''} />
                                    <ReadOnlyField label="Email Indigo" value={terapeutaData.emailIndigo || ''} />
                                    <ReadOnlyField label="Telefone" value={terapeutaData.telefone || ''} />
                                    <ReadOnlyField label="Celular" value={terapeutaData.celular || ''} />
                                    <ReadOnlyField label="CPF" value={terapeutaData.cpf || ''} />
                                    <ReadOnlyField
                                        label="Data de Nascimento"
                                        value={
                                            terapeutaData.dataNascimento
                                                ? new Date(terapeutaData.dataNascimento).toLocaleDateString('pt-BR')
                                                : ''
                                        }
                                    />
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Endereço */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Endereço</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isEditMode ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="cep">CEP</Label>
                                        <Input id="cep" {...register('cep')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rua">Rua</Label>
                                        <Input id="rua" {...register('rua')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="numero">Número</Label>
                                        <Input id="numero" {...register('numero')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="complemento">Complemento</Label>
                                        <Input id="complemento" {...register('complemento')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bairro">Bairro</Label>
                                        <Input id="bairro" {...register('bairro')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cidade">Cidade</Label>
                                        <Input id="cidade" {...register('cidade')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estado">Estado</Label>
                                        <Input id="estado" maxLength={2} {...register('estado')} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ReadOnlyField label="CEP" value={terapeutaData.endereco?.cep || ''} />
                                    <ReadOnlyField label="Rua" value={terapeutaData.endereco?.rua || ''} />
                                    <ReadOnlyField label="Número" value={terapeutaData.endereco?.numero || ''} />
                                    <ReadOnlyField label="Complemento" value={terapeutaData.endereco?.complemento || ''} />
                                    <ReadOnlyField label="Bairro" value={terapeutaData.endereco?.bairro || ''} />
                                    <ReadOnlyField label="Cidade" value={terapeutaData.endereco?.cidade || ''} />
                                    <ReadOnlyField label="Estado" value={terapeutaData.endereco?.estado || ''} />
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons (Edit Mode) */}
                {isEditMode && (
                    <div className="flex justify-end gap-3 mb-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelClick}
                            disabled={isSaving}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </form>

            {/* Arquivos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Arquivos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditMode ? (
                        filesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <DocumentsEditor
                                files={files}
                                ownerType="terapeuta"
                                ownerId={terapeutaId}
                                onUploadSuccess={loadFiles}
                                onDeleteSuccess={loadFiles}
                            />
                        )
                    ) : (
                        <DocumentsTable ownerType="terapeuta" ownerId={terapeutaId} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
