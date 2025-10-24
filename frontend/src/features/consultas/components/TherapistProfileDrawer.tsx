import { useState, useEffect } from 'react';
import { X, User, MapPin, Briefcase, Building, GraduationCap, FileText, Car, Save, Loader2, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/ui/label';
import ReadOnlyField from './ReadOnlyField';
import type { Therapist } from '../types/consultas.types';
import { useTerapeuta } from '../hooks/useTerapeuta';
import DocumentsTable from '../arquivos/components/DocumentsTable';
import { DocumentsEditor } from '../arquivos/components/DocumentsEditor';
import { updateTerapeuta, listFiles, type FileMeta } from '../service/consultas.service';

interface TherapistProfileDrawerProps {
    therapist: Therapist | null;
    open: boolean;
    onClose: () => void;
}

export default function TherapistProfileDrawer({
    therapist,
    open,
    onClose,
}: TherapistProfileDrawerProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [files, setFiles] = useState<FileMeta[]>([]);
    const [filesLoading, setFilesLoading] = useState(true);

    const terapeutaData = useTerapeuta(therapist?.id);

    const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
        defaultValues: terapeutaData ? {
            nome: terapeutaData.nome || '',
            email: terapeutaData.email || '',
            telefone: terapeutaData.telefone || '',
            celular: terapeutaData.celular || '',
            cpf: terapeutaData.cpf || '',
            dataNascimento: terapeutaData.dataNascimento,
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
            // Dados bancários
            banco: terapeutaData.banco || '',
            agencia: terapeutaData.agencia || '',
            conta: terapeutaData.conta || '',
            chavePix: terapeutaData.chavePix || '',
        } : undefined
    });

    // Atualizar form quando terapeutaData chegar
    useEffect(() => {
        if (terapeutaData && open) {
            reset({
                nome: terapeutaData.nome || '',
                email: terapeutaData.email || '',
                telefone: terapeutaData.telefone || '',
                celular: terapeutaData.celular || '',
                cpf: terapeutaData.cpf || '',
                dataNascimento: terapeutaData.dataNascimento,
                cep: terapeutaData.endereco?.cep || '',
                rua: terapeutaData.endereco?.rua || '',
                numero: terapeutaData.endereco?.numero || '',
                complemento: terapeutaData.endereco?.complemento || '',
                bairro: terapeutaData.endereco?.bairro || '',
                cidade: terapeutaData.endereco?.cidade || '',
                estado: terapeutaData.endereco?.estado || '',
                possuiVeiculo: terapeutaData.possuiVeiculo || 'nao',
                placaVeiculo: terapeutaData.placaVeiculo || '',
                modeloVeiculo: terapeutaData.modeloVeiculo || '',
                banco: terapeutaData.banco || '',
                agencia: terapeutaData.agencia || '',
                conta: terapeutaData.conta || '',
                chavePix: terapeutaData.chavePix || '',
            });
        }
    }, [terapeutaData, open, reset]);

    // Resetar modo de edição quando o drawer fechar
    useEffect(() => {
        if (!open && isEditMode) {
            setIsEditMode(false);
            setSaveError(null);
        }
    }, [open, isEditMode]);

    const handleEditClick = () => {
        setIsEditMode(true);
        setSaveError(null);
        
        if (therapist?.id) {
            setFilesLoading(true);
            listFiles({ ownerType: 'terapeuta', ownerId: therapist.id })
                .then(setFiles)
                .catch(console.error)
                .finally(() => setFilesLoading(false));
        }
        
        window.dispatchEvent(
            new CustomEvent('consulta:edit:enter', {
                detail: { ownerType: 'terapeuta', ownerId: therapist?.id }
            })
        );
    };

    const loadFiles = async () => {
        if (!therapist?.id) return;
        setFilesLoading(true);
        try {
            const data = await listFiles({ ownerType: 'terapeuta', ownerId: therapist.id });
            setFiles(data);
        } catch (err) {
            console.error('Erro ao carregar arquivos:', err);
        } finally {
            setFilesLoading(false);
        }
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
                detail: { ownerType: 'terapeuta', ownerId: therapist?.id }
            })
        );
    };

    const onSubmit = async (data: any) => {
        if (!therapist?.id) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            await updateTerapeuta(therapist.id, {
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                celular: data.celular,
                cpf: data.cpf,
                dataNascimento: data.dataNascimento,
                possuiVeiculo: data.possuiVeiculo,
                placaVeiculo: data.placaVeiculo,
                modeloVeiculo: data.modeloVeiculo,
                banco: data.banco,
                agencia: data.agencia,
                conta: data.conta,
                chavePix: data.chavePix,
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
                    detail: { ownerType: 'terapeuta', ownerId: therapist.id }
                })
            );

            setIsEditMode(false);
            window.location.reload();
        } catch (err: any) {
            const msg = err.message ?? 'Erro ao salvar dados do terapeuta';
            setSaveError(msg);

            window.dispatchEvent(
                new CustomEvent('consulta:edit:save:error', {
                    detail: { ownerType: 'terapeuta', ownerId: therapist.id, error: msg }
                })
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (!therapist || !open || !terapeutaData) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const fotoPerfil = Array.isArray(terapeutaData.arquivos)
        ? terapeutaData.arquivos.find((doc) => doc.nome === 'fotoPerfil')
        : null;

    const displayAvatar = fotoPerfil
        ? `${import.meta.env.VITE_API_URL}/arquivos/view/${fotoPerfil.arquivo_id}`
        : null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Não informado';
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    const maskCNPJ = (cnpj?: string) => {
        if (!cnpj) return 'Não informado';
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '**.***.***/****-**');
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
        const statusClasses =
            status === 'ATIVO'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';

        return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center rounded-[5px] p-2">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-background border rounded-[5px] shadow-2xl flex flex-col ">
                {/* Header - fixo */}
                <div className="flex items-center gap-4 border-b bg-muted/30 flex-shrink-0 p-2">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-lg font-medium text-blue-600 dark:text-blue-300">
                        {displayAvatar ? (
                            <img
                                src={displayAvatar}
                                alt={therapist.nome}
                                className="h-full w-full object-cover rounded-full"
                            />
                        ) : (
                            getInitials(therapist.nome)
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-foreground">{therapist.nome}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(therapist.status)}
                            {therapist.especialidade && (
                                <span className="text-sm text-muted-foreground">
                                    {therapist.especialidade}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {!isEditMode && (
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={handleEditClick}
                            className="h-8 gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Editar
                        </Button>
                    )}
                    
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Error Message */}
                {saveError && (
                    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm flex-shrink-0">
                        {saveError}
                    </div>
                )}

                {/* Content - rolável com todos os campos dos cadastros */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-0 overflow-y-auto">
                    <div className="space-y-8 pb-16 p-4">
                        {/* Seção 1: Dados Pessoais (DadosPessoaisStep) */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Dados Pessoais
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isEditMode ? (
                                    <>
                                        <div>
                                            <Label htmlFor="nome">Nome *</Label>
                                            <Input
                                                id="nome"
                                                {...register('nome')}
                                                placeholder="Nome completo"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="dataNascimento">
                                                Data de nascimento *
                                            </Label>
                                            <Input
                                                id="dataNascimento"
                                                type="date"
                                                {...register('dataNascimento')}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">E-mail *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...register('email')}
                                                placeholder="email@exemplo.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="telefone">Telefone</Label>
                                            <Input
                                                id="telefone"
                                                {...register('telefone')}
                                                placeholder="(00) 0000-0000"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="celular">Celular *</Label>
                                            <Input
                                                id="celular"
                                                {...register('celular')}
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cpf">CPF *</Label>
                                            <Input
                                                id="cpf"
                                                {...register('cpf')}
                                                placeholder="000.000.000-00"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ReadOnlyField label="Nome *" value={terapeutaData.nome} />
                                        <ReadOnlyField
                                            label="Data de nascimento *"
                                            value={formatDate(terapeutaData.dataNascimento)}
                                        />
                                        <ReadOnlyField label="E-mail *" value={terapeutaData.email} />
                                        <ReadOnlyField
                                            label="E-mail Índigo *"
                                            value={terapeutaData.emailIndigo}
                                        />
                                        <ReadOnlyField
                                            label="Telefone"
                                            value={terapeutaData.telefone}
                                        />
                                        <ReadOnlyField
                                            label="Celular *"
                                            value={terapeutaData.celular}
                                        />
                                        <ReadOnlyField label="CPF *" value={terapeutaData.cpf} />
                                    </>
                                )}
                            </div>

                            {/* Seção Veículo - Condicional */}
                            <div className="mt-6">
                                {isEditMode ? (
                                    <>
                                        <div>
                                            <Label htmlFor="possuiVeiculo">Possui Veículo? *</Label>
                                            <select
                                                id="possuiVeiculo"
                                                {...register('possuiVeiculo')}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="nao">Não</option>
                                                <option value="sim">Sim</option>
                                            </select>
                                        </div>

                                        {terapeutaData.possuiVeiculo?.toLowerCase() === 'sim' && (
                                            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                                    <Car className="w-4 h-4" />
                                                    Dados do Veículo
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="placaVeiculo">Placa do Veículo *</Label>
                                                        <Input
                                                            id="placaVeiculo"
                                                            {...register('placaVeiculo')}
                                                            placeholder="ABC-1234"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="modeloVeiculo">Modelo do Veículo *</Label>
                                                        <Input
                                                            id="modeloVeiculo"
                                                            {...register('modeloVeiculo')}
                                                            placeholder="Ex: Honda Civic 2020"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <ReadOnlyField
                                            label="Possui Veículo? *"
                                            value={
                                                terapeutaData.possuiVeiculo?.toLowerCase() === 'sim'
                                                    ? 'Sim'
                                                    : 'Não'
                                            }
                                        />

                                        {terapeutaData.possuiVeiculo?.toLowerCase() === 'sim' && (
                                            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                                    <Car className="w-4 h-4" />
                                                    Dados do Veículo
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <ReadOnlyField
                                                        label="Placa do Veículo *"
                                                        value={terapeutaData.placaVeiculo}
                                                    />
                                                    <ReadOnlyField
                                                        label="Modelo do Veículo *"
                                                        value={terapeutaData.modeloVeiculo}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Dados para pagamento */}
                            <div className="mt-6">
                                <h4 className="text-md font-semibold mb-3">Dados para pagamento</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {isEditMode ? (
                                        <>
                                            <div>
                                                <Label htmlFor="banco">Banco *</Label>
                                                <Input
                                                    id="banco"
                                                    {...register('banco')}
                                                    placeholder="Nome do banco"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="agencia">Agência *</Label>
                                                <Input
                                                    id="agencia"
                                                    {...register('agencia')}
                                                    placeholder="0000"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="conta">Conta *</Label>
                                                <Input
                                                    id="conta"
                                                    {...register('conta')}
                                                    placeholder="00000-0"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="chavePix">Chave PIX *</Label>
                                                <Input
                                                    id="chavePix"
                                                    {...register('chavePix')}
                                                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ReadOnlyField label="Banco *" value={terapeutaData.banco} />
                                            <ReadOnlyField
                                                label="Agência *"
                                                value={terapeutaData.agencia}
                                            />
                                            <ReadOnlyField label="Conta *" value={terapeutaData.conta} />
                                            <ReadOnlyField
                                                label="Chave PIX *"
                                                value={terapeutaData.chavePix}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-border"></div>

                        {/* Seção 2: Endereço (EnderecoStep) */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Endereço
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isEditMode ? (
                                    <>
                                        <div>
                                            <Label htmlFor="cep">CEP *</Label>
                                            <Input
                                                id="cep"
                                                {...register('cep')}
                                                placeholder="00000-000"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="estado">Estado *</Label>
                                            <Input
                                                id="estado"
                                                {...register('estado')}
                                                placeholder="SP"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="rua">Rua *</Label>
                                            <Input
                                                id="rua"
                                                {...register('rua')}
                                                placeholder="Nome da rua"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="numero">Número *</Label>
                                            <Input
                                                id="numero"
                                                {...register('numero')}
                                                placeholder="123"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="complemento">Complemento</Label>
                                            <Input
                                                id="complemento"
                                                {...register('complemento')}
                                                placeholder="Apto, Bloco, etc."
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="bairro">Bairro *</Label>
                                            <Input
                                                id="bairro"
                                                {...register('bairro')}
                                                placeholder="Nome do bairro"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cidade">Cidade *</Label>
                                            <Input
                                                id="cidade"
                                                {...register('cidade')}
                                                placeholder="Nome da cidade"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ReadOnlyField label="CEP *" value={terapeutaData.endereco?.cep} />
                                        <ReadOnlyField
                                            label="Estado *"
                                            value={terapeutaData.endereco?.estado}
                                        />
                                        <ReadOnlyField
                                            label="Rua *"
                                            value={terapeutaData.endereco?.rua}
                                            className="md:col-span-2"
                                        />
                                        <ReadOnlyField
                                            label="Número *"
                                            value={terapeutaData.endereco?.numero}
                                        />
                                        <ReadOnlyField
                                            label="Complemento"
                                            value={terapeutaData.endereco?.complemento}
                                        />
                                        <ReadOnlyField
                                            label="Bairro *"
                                            value={terapeutaData.endereco?.bairro}
                                        />
                                        <ReadOnlyField
                                            label="Cidade *"
                                            value={terapeutaData.endereco?.cidade}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Seção 3: Dados Profissionais (DadosProfissionaisStep) */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                Dados Profissionais
                            </h3>

                            {/* Dados profissionais (múltiplas áreas) */}
                            {terapeutaData.dadosProfissionais &&
                                terapeutaData.dadosProfissionais.length > 0 && (
                                    <div className="space-y-4">
                                        {terapeutaData.dadosProfissionais.map((dados, index) => (
                                            <div
                                                key={index}
                                                className="p-4 border rounded-lg bg-muted/30"
                                            >
                                                <h4 className="font-medium mb-3">
                                                    Área de Atuação {index + 1}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <ReadOnlyField
                                                        label="Área de atuação *"
                                                        value={dados.areaAtuacao}
                                                    />
                                                    <ReadOnlyField
                                                        label="Cargo *"
                                                        value={dados.cargo}
                                                    />
                                                    <ReadOnlyField
                                                        label="Número do conselho"
                                                        value={dados.numeroConselho}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            {/* Dados profissionais */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField
                                    label="Data início *"
                                    value={formatDate(terapeutaData.dataInicio)}
                                />
                                <ReadOnlyField
                                    label="Data fim"
                                    value={formatDate(terapeutaData.dataFim)}
                                />
                                <ReadOnlyField
                                    label="Valor hora acordado"
                                    value={
                                        terapeutaData.valorHoraAcordado
                                            ? `R$ ${terapeutaData.valorHoraAcordado}`
                                            : undefined
                                    }
                                />
                                <ReadOnlyField
                                    label="Professor Uniindigo"
                                    value={
                                        terapeutaData.professorUnindigo?.toLowerCase() === 'sim'
                                            ? 'Sim'
                                            : 'Não'
                                    }
                                />
                                {terapeutaData.disciplinaUniindigo && (
                                    <ReadOnlyField
                                        label="Disciplina Uniindigo"
                                        value={terapeutaData.disciplinaUniindigo}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Seção 4: Formação (FormacaoStep) */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                Formação
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ReadOnlyField
                                    label="Graduação *"
                                    value={terapeutaData.formacao?.graduacao}
                                />
                                <ReadOnlyField
                                    label="Instituição graduação *"
                                    value={terapeutaData.formacao?.instituicaoGraduacao}
                                />
                                <ReadOnlyField
                                    label="Ano formatura *"
                                    value={terapeutaData.formacao?.anoFormatura}
                                />
                            </div>

                            {/* Pós-graduações - Múltiplas */}
                            {terapeutaData.formacao?.posGraduacoes &&
                                terapeutaData.formacao.posGraduacoes.length > 0 && (
                                    <div className="mt-4 space-y-4">
                                        <h4 className="font-medium">Pós-graduações</h4>
                                        {terapeutaData.formacao.posGraduacoes.map(
                                            (pos: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="p-4 border rounded-lg bg-muted/30"
                                                >
                                                    <h5 className="font-medium mb-3 text-sm">
                                                        Pós-graduação {index + 1}
                                                    </h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <ReadOnlyField
                                                            label="Tipo"
                                                            value={
                                                                pos.tipo === 'lato'
                                                                    ? 'Lato Sensu (Especialização)'
                                                                    : 'Stricto Sensu (Mestrado/Doutorado)'
                                                            }
                                                        />
                                                        <ReadOnlyField
                                                            label="Curso"
                                                            value={pos.curso}
                                                        />
                                                        <ReadOnlyField
                                                            label="Instituição"
                                                            value={pos.instituicao}
                                                        />
                                                        <ReadOnlyField
                                                            label="Conclusão"
                                                            value={pos.conclusao}
                                                        />
                                                        {pos.comprovanteUrl && (
                                                            <ReadOnlyField
                                                                label="Comprovante"
                                                                value="Arquivo enviado"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                            {/* Participação em congressos */}
                            {terapeutaData.formacao?.participacaoCongressosDescricao && (
                                <div className="mt-4">
                                    <ReadOnlyField
                                        label="Participação em Congressos"
                                        value={
                                            terapeutaData.formacao.participacaoCongressosDescricao
                                        }
                                    />
                                </div>
                            )}

                            {/* Publicações de livros */}
                            {terapeutaData.formacao?.publicacoesLivrosDescricao && (
                                <div className="mt-4">
                                    <ReadOnlyField
                                        label="Publicações de Livros"
                                        value={terapeutaData.formacao.publicacoesLivrosDescricao}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Seção 5: Arquivos (ArquivosStep) */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Arquivos
                            </h3>
                            {isEditMode ? (
                                filesLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <DocumentsEditor
                                        files={files}
                                        ownerType="terapeuta"
                                        ownerId={therapist.id}
                                        onUploadSuccess={loadFiles}
                                        onDeleteSuccess={loadFiles}
                                    />
                                )
                            ) : (
                                <DocumentsTable ownerType="terapeuta" ownerId={therapist.id} />
                            )}
                        </div>

                        {/* Dados CNPJ - Seção Condicional */}
                        {terapeutaData.cnpj && (
                            <>
                                {/* Separador */}
                                <div className="border-t border-gray-200"></div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Building className="w-5 h-5" />
                                        Dados CNPJ
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ReadOnlyField
                                            label="CNPJ"
                                            value={maskCNPJ(terapeutaData.cnpj.numero)}
                                        />
                                        <ReadOnlyField
                                            label="Razão Social"
                                            value={terapeutaData.cnpj.razaoSocial}
                                        />
                                    </div>

                                    {/* Endereço da empresa */}
                                    <div className="mt-4">
                                        <h4 className="font-medium mb-3">Endereço da Empresa</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReadOnlyField
                                                label="CEP"
                                                value={terapeutaData.cnpj.endereco?.cep}
                                            />
                                            <ReadOnlyField
                                                label="Estado"
                                                value={terapeutaData.cnpj.endereco?.estado}
                                            />
                                            <ReadOnlyField
                                                label="Rua"
                                                value={terapeutaData.cnpj.endereco?.rua}
                                                className="md:col-span-2"
                                            />
                                            <ReadOnlyField
                                                label="Número"
                                                value={terapeutaData.cnpj.endereco?.numero}
                                            />
                                            <ReadOnlyField
                                                label="Complemento"
                                                value={terapeutaData.cnpj.endereco?.complemento}
                                            />
                                            <ReadOnlyField
                                                label="Bairro"
                                                value={terapeutaData.cnpj.endereco?.bairro}
                                            />
                                            <ReadOnlyField
                                                label="Cidade"
                                                value={terapeutaData.cnpj.endereco?.cidade}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                            <strong>Nota:</strong> Por questões de segurança, o CNPJ
                                            é exibido de forma mascarada.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Espaço extra para garantir scroll completo */}
                        <div className="h-4"></div>
                    </div>

                    {/* Action Buttons (Edit Mode) - Sticky Footer */}
                    {isEditMode && (
                        <div className="border-t p-4 bg-background flex justify-end gap-3 flex-shrink-0">
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
            </div>
        </div>
    );
}
