import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCliente } from '../hooks/useCliente';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/ui/label';
import { FileText, Edit2, Save, X, Loader2 } from 'lucide-react';
import ReadOnlyField from '../components/ReadOnlyField';
import DocumentsTable from '../arquivos/components/DocumentsTable';
import { DocumentsEditor } from '../arquivos/components/DocumentsEditor';
import { updateCliente } from '../service/consultas.service';
import { listFiles, type FileMeta } from '../service/consultas.service';

export default function ConsultaClientePage() {
    const { clienteId } = useParams<{ clienteId: string }>();
    const clienteData = useCliente(clienteId, Boolean(clienteId));
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [files, setFiles] = useState<FileMeta[]>([]);
    const [filesLoading, setFilesLoading] = useState(true);

    const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
        defaultValues: clienteData ? {
            nome: clienteData.nome || '',
            emailContato: clienteData.emailContato || '',
            cpf: clienteData.cpf || '',
            dataNascimento: clienteData.dataNascimento 
                ? new Date(clienteData.dataNascimento).toISOString().split('T')[0] 
                : '',
            // Endereço (simplificado: apenas primeiro endereço)
            cep: clienteData.enderecos?.[0]?.cep || '',
            logradouro: clienteData.enderecos?.[0]?.logradouro || '',
            numero: clienteData.enderecos?.[0]?.numero || '',
            complemento: clienteData.enderecos?.[0]?.complemento || '',
            bairro: clienteData.enderecos?.[0]?.bairro || '',
            cidade: clienteData.enderecos?.[0]?.cidade || '',
            uf: clienteData.enderecos?.[0]?.uf || '',
        } : undefined
    });

    // Load files when entering edit mode
    const loadFiles = async () => {
        if (!clienteId) return;
        setFilesLoading(true);
        try {
            const data = await listFiles({ ownerType: 'cliente', ownerId: clienteId });
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
                detail: { ownerType: 'cliente', ownerId: clienteId }
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
                detail: { ownerType: 'cliente', ownerId: clienteId }
            })
        );
    };

    const onSubmit = async (data: any) => {
        if (!clienteId) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            await updateCliente(clienteId, {
                nome: data.nome,
                emailContato: data.emailContato,
                cpf: data.cpf,
                dataNascimento: data.dataNascimento,
                enderecos: [{
                    cep: data.cep,
                    logradouro: data.logradouro,
                    numero: data.numero,
                    complemento: data.complemento,
                    bairro: data.bairro,
                    cidade: data.cidade,
                    uf: data.uf,
                }]
            });

            window.dispatchEvent(
                new CustomEvent('consulta:edit:save:success', {
                    detail: { ownerType: 'cliente', ownerId: clienteId }
                })
            );

            setIsEditMode(false);
            // Aqui você pode recarregar os dados do cliente se necessário
        } catch (err: any) {
            const msg = err.message ?? 'Erro ao salvar dados do cliente';
            setSaveError(msg);

            window.dispatchEvent(
                new CustomEvent('consulta:edit:save:error', {
                    detail: { ownerType: 'cliente', ownerId: clienteId, error: msg }
                })
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (!clienteId) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">ID do cliente não fornecido</p>
            </div>
        );
    }

    if (!clienteData) {
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
                        Consulta do Cliente
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Detalhes e documentos do cliente {clienteData.nome}
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
                                        <Label htmlFor="emailContato">Email</Label>
                                        <Input id="emailContato" type="email" {...register('emailContato')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cpf">CPF</Label>
                                        <Input id="cpf" {...register('cpf')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                                        <Input id="dataNascimento" type="date" {...register('dataNascimento')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Data de Entrada</Label>
                                        <Input 
                                            value={clienteData.dataEntrada ? new Date(clienteData.dataEntrada).toLocaleDateString('pt-BR') : ''} 
                                            disabled 
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ReadOnlyField label="Nome" value={clienteData.nome || ''} />
                                    <ReadOnlyField label="Email" value={clienteData.emailContato || ''} />
                                    <ReadOnlyField label="CPF" value={clienteData.cpf || ''} />
                                    <ReadOnlyField
                                        label="Data de Nascimento"
                                        value={
                                            clienteData.dataNascimento
                                                ? new Date(clienteData.dataNascimento).toLocaleDateString('pt-BR')
                                                : ''
                                        }
                                    />
                                    <ReadOnlyField
                                        label="Data de Entrada"
                                        value={
                                            clienteData.dataEntrada
                                                ? new Date(clienteData.dataEntrada).toLocaleDateString('pt-BR')
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
                                        <Label htmlFor="logradouro">Logradouro</Label>
                                        <Input id="logradouro" {...register('logradouro')} />
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
                                        <Label htmlFor="uf">UF</Label>
                                        <Input id="uf" maxLength={2} {...register('uf')} />
                                    </div>
                                </>
                            ) : (
                                clienteData.enderecos && clienteData.enderecos.length > 0 ? (
                                    <>
                                        <ReadOnlyField label="CEP" value={clienteData.enderecos[0].cep || ''} />
                                        <ReadOnlyField label="Logradouro" value={clienteData.enderecos[0].logradouro || ''} />
                                        <ReadOnlyField label="Número" value={clienteData.enderecos[0].numero || ''} />
                                        <ReadOnlyField label="Complemento" value={clienteData.enderecos[0].complemento || ''} />
                                        <ReadOnlyField label="Bairro" value={clienteData.enderecos[0].bairro || ''} />
                                        <ReadOnlyField label="Cidade" value={clienteData.enderecos[0].cidade || ''} />
                                        <ReadOnlyField label="UF" value={clienteData.enderecos[0].uf || ''} />
                                    </>
                                ) : (
                                    <p className="text-muted-foreground col-span-full">Nenhum endereço cadastrado</p>
                                )
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
                                ownerType="cliente"
                                ownerId={clienteId}
                                onUploadSuccess={loadFiles}
                                onDeleteSuccess={loadFiles}
                            />
                        )
                    ) : (
                        <DocumentsTable ownerType="cliente" ownerId={clienteId} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
