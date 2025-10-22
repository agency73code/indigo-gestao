import { useEffect, useMemo, useState} from 'react';
import { useForm } from 'react-hook-form';
import { X, User, MapPin, CreditCard, GraduationCap, Save, Loader2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/ui/label';
import ReadOnlyField from './ReadOnlyField';
import type { Patient } from '../types/consultas.types';
import { useCliente } from '../hooks/useCliente';
import DocumentsTable from '../arquivos/components/DocumentsTable';
import { DocumentsEditor } from '../arquivos/components/DocumentsEditor';
import { updateCliente, listFiles, type FileMeta } from '../service/consultas.service';

type CaregiverForm = {
    relacao: string;
    descricaoRelacao: string;
    nome: string;
    cpf: string;
    profissao: string;
    escolaridade: string;
    telefone: string;
    email: string;
    endereco: {
        cep: string;
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        uf: string;
    };
};

type AddressForm = {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    residenciaDe: string;
    outroResidencia: string;
};

type PaymentForm = {
    nomeTitular: string;
    numeroCarteirinha: string;
    telefone1: string;
    mostrarTelefone2: boolean;
    telefone2: string;
    mostrarTelefone3: boolean;
    telefone3: string;
    email1: string;
    mostrarEmail2: boolean;
    email2: string;
    mostrarEmail3: boolean;
    email3: string;
    sistemaPagamento: 'reembolso' | 'liminar' | 'particular';
    prazoReembolso: string;
    numeroProcesso: string;
    nomeAdvogado: string;
    telefoneAdvogado1: string;
    mostrarTelefoneAdvogado2: boolean;
    telefoneAdvogado2: string;
    mostrarTelefoneAdvogado3: boolean;
    telefoneAdvogado3: string;
    emailAdvogado1: string;
    mostrarEmailAdvogado2: boolean;
    emailAdvogado2: string;
    mostrarEmailAdvogado3: boolean;
    emailAdvogado3: string;
    houveNegociacao: 'sim' | 'nao' | '';
    valorAcordado: string;
};

type SchoolContactForm = {
    nome: string;
    telefone: string;
    email: string;
    funcao: string;
};

type SchoolForm = {
    tipoEscola: 'particular' | 'publica' | 'afastado' | 'clinica-escola';
    nome: string;
    telefone: string;
    email: string;
    endereco: {
        cep: string;
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        uf: string;
    };
    contatos: SchoolContactForm[];
};

type ClientFormValues = {
    nome: string;
    cpf: string;
    emailContato: string;
    dataNascimento: string;
    dataEntrada: string;
    dataSaida: string;
    cuidadores: CaregiverForm[];
    enderecos: AddressForm[];
    dadosPagamento: PaymentForm;
    dadosEscola: SchoolForm;
};

interface PatientProfileDrawerProps {
    patient: Patient | null;
    open: boolean;
    onClose: () => void;
}

const defaultClientFormValues: ClientFormValues = {
    nome: '',
    cpf: '',
    emailContato: '',
    dataNascimento: '',
    dataEntrada: '',
    dataSaida: '',
    cuidadores: [],
    enderecos: [],
    dadosPagamento: {
        nomeTitular: '',
        numeroCarteirinha: '',
        telefone1: '',
        mostrarTelefone2: false,
        telefone2: '',
        mostrarTelefone3: false,
        telefone3: '',
        email1: '',
        mostrarEmail2: false,
        email2: '',
        mostrarEmail3: false,
        email3: '',
        sistemaPagamento: 'reembolso',
        prazoReembolso: '',
        numeroProcesso: '',
        nomeAdvogado: '',
        telefoneAdvogado1: '',
        mostrarTelefoneAdvogado2: false,
        telefoneAdvogado2: '',
        mostrarTelefoneAdvogado3: false,
        telefoneAdvogado3: '',
        emailAdvogado1: '',
        mostrarEmailAdvogado2: false,
        emailAdvogado2: '',
        mostrarEmailAdvogado3: false,
        emailAdvogado3: '',
        houveNegociacao: '',
        valorAcordado: '',
    },
    dadosEscola: {
        tipoEscola: 'particular',
        nome: '',
        telefone: '',
        email: '',
        endereco: {
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: '',
        },
        contatos: [],
    },
};

const caregiverRelationLabels: Record<string, string> = {
    mae: 'Mãe',
    pai: 'Pai',
    avo: 'Avó/Avô',
    tio: 'Tio/Tia',
    responsavel: 'Responsável',
    tutor: 'Tutor',
    outro: 'Outro',
};

const residenciaOptions = [
    { value: '', label: 'Selecione' },
    { value: 'mae', label: 'Mãe' },
    { value: 'pai', label: 'Pai' },
    { value: 'avo', label: 'Avó/Avô' },
    { value: 'tio', label: 'Tio/Tia' },
    { value: 'responsavel', label: 'Responsável' },
    { value: 'tutor', label: 'Tutor' },
    { value: 'outro', label: 'Outro' },
];

function formatDateForInput(value?: string | Date | null) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
}

function formatDate(value?: string | null) {
    if (!value) return 'Não informado';
    const [year, month, day] = value.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
}

function emptyToNull(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

export default function PatientProfileDrawer({ patient, open, onClose }: PatientProfileDrawerProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [files, setFiles] = useState<FileMeta[]>([]);
    const [filesLoading, setFilesLoading] = useState(true);

    const normalizarEnderecos = (enderecos: any[]) =>
        enderecos.map((item) => {
            const e = item.endereco;
            return {
                cep: e.cep ?? '',
                logradouro: e.rua ?? e.logradouro ?? '',
                numero: e.numero ?? '',
                complemento: e.complemento ?? '',
                bairro: e.bairro ?? '',
                cidade: e.cidade ?? '',
                uf: e.uf ?? '',
                residenciaDe: item.residenciaDe ?? '',
                outroResidencia: item.outroResidencia ?? '',
            };
        });

    const rawData = useCliente(patient?.id, open);
    const clienteData = useMemo(() =>
        rawData
            ? {
                  ...rawData,
                  enderecos: normalizarEnderecos(rawData.enderecos ?? []),
              }
            : null,
    [rawData]);

    const clienteFormDefaults = useMemo<ClientFormValues | null>(() => {
        if (!clienteData) return null;

        return {
            nome: clienteData.nome ?? '',
            cpf: clienteData.cpf ?? '',
            emailContato: clienteData.emailContato ?? '',
            dataNascimento: formatDateForInput(clienteData.dataNascimento ?? null),
            dataEntrada: formatDateForInput(clienteData.dataEntrada ?? null),
            dataSaida: formatDateForInput(clienteData.dataSaida ?? null),
            cuidadores: (clienteData.cuidadores ?? []).map((c) => ({
                relacao: c.relacao ?? '',
                descricaoRelacao: c.descricaoRelacao ?? '',
                nome: c.nome ?? '',
                cpf: c.cpf ?? '',
                profissao: c.profissao ?? '',
                escolaridade: c.escolaridade ?? '',
                telefone: c.telefone ?? '',
                email: c.email ?? '',
                endereco: {
                    cep: c.endereco?.cep ?? '',
                    logradouro: (c.endereco as any)?.rua ?? c.endereco?.logradouro ?? '',
                    numero: c.endereco?.numero ?? '',
                    complemento: c.endereco?.complemento ?? '',
                    bairro: c.endereco?.bairro ?? '',
                    cidade: c.endereco?.cidade ?? '',
                    uf: c.endereco?.uf ?? '',
                },
            })),
            enderecos: (clienteData.enderecos ?? []).map((e) => ({
                cep: e.cep ?? '',
                logradouro: e.logradouro ?? '',
                numero: e.numero ?? '',
                complemento: e.complemento ?? '',
                bairro: e.bairro ?? '',
                cidade: e.cidade ?? '',
                uf: e.uf ?? '',
                residenciaDe: e.residenciaDe ?? '',
                outroResidencia: e.outroResidencia ?? '',
            })),
            dadosPagamento: {
                nomeTitular: clienteData.dadosPagamento?.nomeTitular ?? '',
                numeroCarteirinha: clienteData.dadosPagamento?.numeroCarteirinha ?? '',
                telefone1: clienteData.dadosPagamento?.telefone1 ?? '',
                mostrarTelefone2: Boolean(clienteData.dadosPagamento?.telefone2),
                telefone2: clienteData.dadosPagamento?.telefone2 ?? '',
                mostrarTelefone3: Boolean(clienteData.dadosPagamento?.telefone3),
                telefone3: clienteData.dadosPagamento?.telefone3 ?? '',
                email1: clienteData.dadosPagamento?.email1 ?? '',
                mostrarEmail2: Boolean(clienteData.dadosPagamento?.email2),
                email2: clienteData.dadosPagamento?.email2 ?? '',
                mostrarEmail3: Boolean(clienteData.dadosPagamento?.email3),
                email3: clienteData.dadosPagamento?.email3 ?? '',
                sistemaPagamento: clienteData.dadosPagamento?.sistemaPagamento ?? 'reembolso',
                prazoReembolso: clienteData.dadosPagamento?.prazoReembolso ?? '',
                numeroProcesso: clienteData.dadosPagamento?.numeroProcesso ?? '',
                nomeAdvogado: clienteData.dadosPagamento?.nomeAdvogado ?? '',
                telefoneAdvogado1: clienteData.dadosPagamento?.telefoneAdvogado1 ?? '',
                mostrarTelefoneAdvogado2: Boolean(clienteData.dadosPagamento?.telefoneAdvogado2),
                telefoneAdvogado2: clienteData.dadosPagamento?.telefoneAdvogado2 ?? '',
                mostrarTelefoneAdvogado3: Boolean(clienteData.dadosPagamento?.telefoneAdvogado3),
                telefoneAdvogado3: clienteData.dadosPagamento?.telefoneAdvogado3 ?? '',
                emailAdvogado1: clienteData.dadosPagamento?.emailAdvogado1 ?? '',
                mostrarEmailAdvogado2: Boolean(clienteData.dadosPagamento?.emailAdvogado2),
                emailAdvogado2: clienteData.dadosPagamento?.emailAdvogado2 ?? '',
                mostrarEmailAdvogado3: Boolean(clienteData.dadosPagamento?.emailAdvogado3),
                emailAdvogado3: clienteData.dadosPagamento?.emailAdvogado3 ?? '',
                houveNegociacao: clienteData.dadosPagamento?.houveNegociacao ?? '',
                valorAcordado: clienteData.dadosPagamento?.valorAcordado ?? '',
            },
            dadosEscola: {
                tipoEscola: clienteData.dadosEscola?.tipoEscola ?? 'particular',
                nome: clienteData.dadosEscola?.nome ?? '',
                telefone: clienteData.dadosEscola?.telefone ?? '',
                email: clienteData.dadosEscola?.email ?? '',
                endereco: {
                    cep: clienteData.dadosEscola?.endereco?.cep ?? '',
                    logradouro: (clienteData.dadosEscola?.endereco as any)?.rua ?? clienteData.dadosEscola?.endereco?.logradouro ?? '',
                    numero: clienteData.dadosEscola?.endereco?.numero ?? '',
                    complemento: clienteData.dadosEscola?.endereco?.complemento ?? '',
                    bairro: clienteData.dadosEscola?.endereco?.bairro ?? '',
                    cidade: clienteData.dadosEscola?.endereco?.cidade ?? '',
                    uf: clienteData.dadosEscola?.endereco?.uf ?? '',
                },
                contatos: (clienteData.dadosEscola?.contatos ?? []).map((c) => ({
                    nome: c.nome ?? '',
                    telefone: c.telefone ?? '',
                    email: c.email ?? '',
                    funcao: c.funcao ?? '',
                })),
            },
        };
    }, [clienteData]);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { isDirty },
    } = useForm<ClientFormValues>({
        defaultValues: clienteFormDefaults ?? defaultClientFormValues,
    });

    // Atualizar form quando clienteData chegar
    useEffect(() => {
        if (clienteFormDefaults && open) {
            reset(clienteFormDefaults);
        }
    }, [clienteFormDefaults, open, reset]);

    // Resetar modo de edição quando o drawer fechar
    useEffect(() => {
        if (!open && isEditMode) {
            setIsEditMode(false);
            setSaveError(null);
        }
    }, [open, isEditMode]);

    const watchCuidadores = watch('cuidadores');
    const watchEnderecos = watch('enderecos');
    const watchDadosPagamento = watch('dadosPagamento');
    const watchDadosEscola = watch('dadosEscola');

    const handleEditClick = () => {
        setIsEditMode(true);
        setSaveError(null);

        if (patient?.id) {
            setFilesLoading(true);
            listFiles({ ownerType: 'cliente', ownerId: patient.id })
                .then(setFiles)
                .catch(console.error)
                .finally(() => setFilesLoading(false));
        }

        window.dispatchEvent(
            new CustomEvent('consulta:edit:enter', {
                detail: { ownerType: 'cliente', ownerId: patient?.id },
            }),
        );
    };

    const loadFiles = async () => {
        if (!patient?.id) return;
        setFilesLoading(true);
        try {
            const data = await listFiles({ ownerType: 'cliente', ownerId: patient.id });
            setFiles(data);
        } catch (err) {
            console.error('Erro ao carregar arquivos:', err);
        } finally {
            setFilesLoading(false);
        }
    };

    const handleCancelClick = () => {
        if (isDirty) {
            const confirmCancel = window.confirm('Você tem alterações não salvas. Deseja realmente cancelar?');
            if (!confirmCancel) return;
        }

        setIsEditMode(false);
        setSaveError(null);
        if (clienteFormDefaults) return(clienteFormDefaults);
        else reset(defaultClientFormValues);

        window.dispatchEvent(
            new CustomEvent('consulta:edit:cancel', {
                detail: { ownerType: 'cliente', ownerId: patient?.id },
            }),
        );
    };

    const onSubmit = async (data: ClientFormValues) => {
        if (!patient?.id) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            await updateCliente(patient.id, {
                nome: data.nome,
                emailContato: data.emailContato,
                cpf: data.cpf,
                dataNascimento: data.dataNascimento,
                dataEntrada: data.dataEntrada,
                dataSaida: data.dataSaida || null,
                cuidadores: data.cuidadores.map((c) => ({
                    relacao: c.relacao,
                    descricaoRelacao: emptyToNull(c.descricaoRelacao),
                    nome: c.nome,
                    cpf: c.cpf,
                    profissao: emptyToNull(c.profissao),
                    escolaridade: emptyToNull(c.escolaridade),
                    telefone: c.telefone,
                    email: c.email,
                    endereco: {
                        cep: c.endereco.cep,
                        logradouro: c.endereco.logradouro,
                        numero: c.endereco.numero,
                        complemento: emptyToNull(c.endereco.complemento),
                        bairro: c.endereco.bairro,
                        cidade: c.endereco.cidade,
                        uf: c.endereco.uf,
                    },
                })),
                enderecos: data.enderecos.map((e) => ({
                    cep: e.cep,
                    logradouro: e.logradouro,
                    numero: e.numero,
                    complemento: emptyToNull(e.complemento),
                    bairro: e.bairro,
                    cidade: e.cidade,
                    uf: e.uf,
                    residenciaDe: emptyToNull(e.residenciaDe),
                    outroResidencia: e.residenciaDe === 'outro' ? emptyToNull(e.outroResidencia) : null,
                })),
                dadosPagamento: {
                    nomeTitular: data.dadosPagamento.nomeTitular,
                    numeroCarteirinha: emptyToNull(data.dadosPagamento.numeroCarteirinha),
                    telefone1: data.dadosPagamento.telefone1,
                    telefone2: data.dadosPagamento.mostrarTelefone2 ? emptyToNull(data.dadosPagamento.telefone2) : null,
                    telefone3: data.dadosPagamento.mostrarTelefone3 ? emptyToNull(data.dadosPagamento.telefone3) : null,
                    email1: data.dadosPagamento.email1,
                    email2: data.dadosPagamento.mostrarEmail2 ? emptyToNull(data.dadosPagamento.email2) : null,
                    email3: data.dadosPagamento.mostrarEmail3 ? emptyToNull(data.dadosPagamento.email3) : null,
                    sistemaPagamento: data.dadosPagamento.sistemaPagamento,
                    prazoReembolso:
                        data.dadosPagamento.sistemaPagamento === 'reembolso'
                            ? emptyToNull(data.dadosPagamento.prazoReembolso)
                            : null,
                    numeroProcesso:
                        data.dadosPagamento.sistemaPagamento === 'liminar'
                            ? emptyToNull(data.dadosPagamento.numeroProcesso)
                            : null,
                    nomeAdvogado:
                        data.dadosPagamento.sistemaPagamento === 'liminar'
                            ? emptyToNull(data.dadosPagamento.nomeAdvogado)
                            : null,
                    telefoneAdvogado1:
                        data.dadosPagamento.sistemaPagamento === 'liminar'
                            ? emptyToNull(data.dadosPagamento.telefoneAdvogado1)
                            : null,
                    telefoneAdvogado2:
                        data.dadosPagamento.sistemaPagamento === 'liminar' && data.dadosPagamento.mostrarTelefoneAdvogado2
                            ? emptyToNull(data.dadosPagamento.telefoneAdvogado2)
                            : null,
                    telefoneAdvogado3:
                        data.dadosPagamento.sistemaPagamento === 'liminar' && data.dadosPagamento.mostrarTelefoneAdvogado3
                            ? emptyToNull(data.dadosPagamento.telefoneAdvogado3)
                            : null,
                    emailAdvogado1:
                        data.dadosPagamento.sistemaPagamento === 'liminar'
                            ? emptyToNull(data.dadosPagamento.emailAdvogado1)
                            : null,
                    emailAdvogado2:
                        data.dadosPagamento.sistemaPagamento === 'liminar' && data.dadosPagamento.mostrarEmailAdvogado2
                            ? emptyToNull(data.dadosPagamento.emailAdvogado2)
                            : null,
                    emailAdvogado3:
                        data.dadosPagamento.sistemaPagamento === 'liminar' && data.dadosPagamento.mostrarEmailAdvogado3
                            ? emptyToNull(data.dadosPagamento.emailAdvogado3)
                            : null,
                    houveNegociacao:
                        data.dadosPagamento.sistemaPagamento === 'particular'
                            ? (data.dadosPagamento.houveNegociacao || null)
                            : null,
                    valorAcordado:
                        data.dadosPagamento.sistemaPagamento === 'particular' && data.dadosPagamento.houveNegociacao === 'sim'
                            ? emptyToNull(data.dadosPagamento.valorAcordado)
                            : null,
                },
                dadosEscola: {
                    tipoEscola: data.dadosEscola.tipoEscola,
                    nome: emptyToNull(data.dadosEscola.nome),
                    telefone: emptyToNull(data.dadosEscola.telefone),
                    email: emptyToNull(data.dadosEscola.email),
                    endereco: {
                        cep: data.dadosEscola.endereco.cep,
                        logradouro: data.dadosEscola.endereco.logradouro,
                        numero: data.dadosEscola.endereco.numero,
                        complemento: emptyToNull(data.dadosEscola.endereco.complemento),
                        bairro: data.dadosEscola.endereco.bairro,
                        cidade: data.dadosEscola.endereco.cidade,
                        uf: data.dadosEscola.endereco.uf,
                    },
                    contatos: (data.dadosEscola.contatos ?? []).map((c) => ({
                        nome: emptyToNull(c.nome),
                        telefone: emptyToNull(c.telefone),
                        email: emptyToNull(c.email),
                        funcao: emptyToNull(c.funcao),
                    })),
                },
            });

            window.dispatchEvent(
                new CustomEvent('consulta:edit:save:success', {
                    detail: { ownerType: 'cliente', ownerId: patient.id }
                }),
            );

            setIsEditMode(false);
            // Recarregar dados
            window.location.reload();
        } catch (err: any) {
            const msg = err.message ?? 'Erro ao salvar dados do cliente';
            setSaveError(msg);

            window.dispatchEvent(
                new CustomEvent('consulta:edit:save:error', {
                    detail: { ownerType: 'cliente', ownerId: patient?.id, error: msg },
                }),
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (!patient || !open || !clienteData) return null;

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    
    const arquivosMap = Array.isArray(clienteData.arquivos)
        ? new Map(clienteData.arquivos.map((a) => [a.tipo, a]))
        : new Map<string, any>();

    const caregiversToRender = isEditMode ? watchCuidadores ?? [] : clienteData.cuidadores ?? [];
    const addressesToRender = isEditMode ? watchEnderecos ?? [] : clienteData.enderecos ?? [];
    const paymentData = isEditMode ? watchDadosPagamento : clienteData.dadosPagamento;
    const schoolData = isEditMode ? watchDadosEscola : clienteData.dadosEscola;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-background border rounded-lg shadow-2xl flex flex-col">
                {/* Header - flex-shrink-0 mantém fixo */}
                <div className="flex items-center gap-4 p-6 border-b bg-muted/30 flex-shrink-0">
                    <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-lg font-medium text-purple-600 dark:text-purple-300">
                        {arquivosMap.has('fotoPerfil') ? (
                            <img
                                src={`${import.meta.env.VITE_API_URL}/arquivos/view/${arquivosMap.get('fotoPerfil')?.arquivo_id}`}
                                alt={patient.nome}
                                className="h-full w-full object-cover rounded-full"
                            />
                        ) : (
                            getInitials(patient.nome)
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-foreground">{patient.nome}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    patient.status === 'ATIVO'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                }`}
                            >
                                {patient.status}
                            </span>
                            {patient.responsavel && (
                                <span className="text-sm text-muted-foreground">
                                    Responsável: {patient.responsavel}
                                </span>
                            )}
                        </div>
                    </div>

                    {!isEditMode && (
                        <Button variant="secondary" size="sm" onClick={handleEditClick} className="h-8 gap-2">
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

                {/* Content - flex: 1 1 auto; min-height: 0; overflow-y: auto; para scroll */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-6 space-y-8">
                        {/* Dados Pessoais */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Dados Pessoais
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isEditMode ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="nome">Nome *</Label>
                                            <Input id="nome" {...register('nome')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dataNascimento">Data de nascimento *</Label>
                                            <Input id="dataNascimento" type="date" {...register('dataNascimento')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cpf">CPF *</Label>
                                            <Input id="cpf" {...register('cpf')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="emailContato">E-mail de contato *</Label>
                                            <Input id="emailContato" type="email" {...register('emailContato')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dataEntrada">Data Entrada *</Label>
                                            <Input id="dataEntrada" type="date" {...register('dataEntrada')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dataSaida">Data Saída</Label>
                                            <Input id="dataSaida" type="date" {...register('dataSaida')} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ReadOnlyField label="Nome *" value={clienteData.nome ?? ''} />
                                        <ReadOnlyField label="Data de nascimento *" value={formatDate(clienteData.dataNascimento ?? '')} />
                                        <ReadOnlyField label="CPF *" value={clienteData.cpf ?? ''} />
                                        <ReadOnlyField label="E-mail de contato *" value={clienteData.emailContato ?? ''} />
                                        <ReadOnlyField label="Data Entrada *" value={formatDate(clienteData.dataEntrada ?? '')} />
                                        <ReadOnlyField label="Data Saída" value={formatDate(clienteData.dataSaida ?? '')} />
                                    </>
                                )}
                            </div>

                            {/* Seção Cuidadores */}
                            {caregiversToRender && caregiversToRender.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-medium mb-4">Cuidadores</h4>
                                    <div className="space-y-4">
                                        {caregiversToRender.map((cuidador, index) => {
                                            const relation = isEditMode ? cuidador.relacao : cuidador.relacao;
                                            return (
                                                <div key={index} className="p-4 border rounded-lg bg-muted/30 space-y-4">
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <h5 className="font-medium text-sm">
                                                            Cuidador {index + 1}
                                                        </h5>
                                                        {relation && caregiverRelationLabels[relation] && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Relação: {caregiverRelationLabels[relation]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isEditMode ? (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Relação *</Label>
                                                                    <select
                                                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                                        {...register(`cuidadores.${index}.relacao` as const)}
                                                                    >
                                                                        <option value="">Selecione</option>
                                                                        {Object.entries(caregiverRelationLabels).map(([value, label]) => (
                                                                            <option key={value} value={value}>
                                                                                {label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                {watchCuidadores?.[index]?.relacao === 'outro' && (
                                                                    <div className="space-y-2">
                                                                        <Label>Descrição da relação</Label>
                                                                        <Input {...register(`cuidadores.${index}.descricaoRelacao` as const)} />
                                                                    </div>
                                                                )}
                                                                <div className="space-y-2">
                                                                    <Label>Nome *</Label>
                                                                    <Input {...register(`cuidadores.${index}.nome` as const)} />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>CPF *</Label>
                                                                    <Input {...register(`cuidadores.${index}.cpf` as const)} />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Profissão</Label>
                                                                    <Input {...register(`cuidadores.${index}.profissao` as const)} />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Escolaridade</Label>
                                                                    <Input {...register(`cuidadores.${index}.escolaridade` as const)} />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Telefone *</Label>
                                                                    <Input {...register(`cuidadores.${index}.telefone` as const)} />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Email *</Label>
                                                                    <Input type="email" {...register(`cuidadores.${index}.email` as const)} />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h6 className="text-xs font-medium text-muted-foreground">Endereço</h6>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>CEP *</Label>
                                                                        <Input {...register(`cuidadores.${index}.endereco.cep` as const)} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>UF *</Label>
                                                                        <Input maxLength={2} {...register(`cuidadores.${index}.endereco.uf` as const)} />
                                                                    </div>
                                                                    <div className="space-y-2 md:col-span-3">
                                                                        <Label>Logradouro *</Label>
                                                                        <Input {...register(`cuidadores.${index}.endereco.logradouro` as const)} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Número *</Label>
                                                                        <Input {...register(`cuidadores.${index}.endereco.numero` as const)} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Complemento</Label>
                                                                        <Input {...register(`cuidadores.${index}.endereco.complemento` as const)} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Bairro *</Label>
                                                                        <Input {...register(`cuidadores.${index}.endereco.bairro` as const)} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Cidade *</Label>
                                                                        <Input {...register(`cuidadores.${index}.endereco.cidade` as const)} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <ReadOnlyField label="Nome" value={cuidador.nome} />
                                                            <ReadOnlyField label="CPF" value={cuidador.cpf} />
                                                            <ReadOnlyField label="Profissão" value={cuidador.profissao} />
                                                            <ReadOnlyField label="Escolaridade" value={cuidador.escolaridade} />
                                                            <ReadOnlyField label="Telefone" value={cuidador.telefone} />
                                                            <ReadOnlyField label="Email" value={cuidador.email} />
                                                            {cuidador.descricaoRelacao && (
                                                                <ReadOnlyField label="Descrição relação" value={cuidador.descricaoRelacao} />
                                                            )}
                                                            {cuidador.endereco && (
                                                                <div className="md:col-span-2 space-y-2">
                                                                    <h6 className="text-xs font-medium text-muted-foreground">Endereço</h6>
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                        <ReadOnlyField label="CEP" value={cuidador.endereco.cep} />
                                                                        <ReadOnlyField label="UF" value={(cuidador.endereco as any).uf ?? ''} />
                                                                        <ReadOnlyField label="Logradouro" value={(cuidador.endereco as any).rua ?? cuidador.endereco.logradouro ?? ''} className="md:col-span-3" />
                                                                        <ReadOnlyField label="Número" value={cuidador.endereco.numero} />
                                                                        <ReadOnlyField label="Complemento" value={cuidador.endereco.complemento} />
                                                                        <ReadOnlyField label="Bairro" value={cuidador.endereco.bairro} />
                                                                        <ReadOnlyField label="Cidade" value={cuidador.endereco.cidade} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Endereços */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Endereços
                            </h3>

                            {isEditMode ? (
                                addressesToRender && addressesToRender.length > 0 ? (
                                    <div className="space-y-6">
                                        {addressesToRender.map((_endereco, index) => (
                                            <div key={index} className="space-y-4">
                                                {addressesToRender.length > 1 && (
                                                    <h4 className="text-sm font-medium">Endereço {index + 1}</h4>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>CEP *</Label>
                                                        <Input {...register(`enderecos.${index}.cep` as const)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>UF *</Label>
                                                        <Input maxLength={2} {...register(`enderecos.${index}.uf` as const)} />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-3">
                                                        <Label>Logradouro *</Label>
                                                        <Input {...register(`enderecos.${index}.logradouro` as const)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Número *</Label>
                                                        <Input {...register(`enderecos.${index}.numero` as const)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Complemento</Label>
                                                        <Input {...register(`enderecos.${index}.complemento` as const)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Bairro *</Label>
                                                        <Input {...register(`enderecos.${index}.bairro` as const)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Cidade *</Label>
                                                        <Input {...register(`enderecos.${index}.cidade` as const)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Residência de</Label>
                                                        <select
                                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                            {...register(`enderecos.${index}.residenciaDe` as const)}
                                                        >
                                                            {residenciaOptions.map((opt) => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {watchEnderecos?.[index]?.residenciaDe === 'outro' && (
                                                        <div className="space-y-2">
                                                            <Label>Outro responsável</Label>
                                                            <Input {...register(`enderecos.${index}.outroResidencia` as const)} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>CEP *</Label>
                                                    <Input {...register(`enderecos.0.cep` as const)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>UF *</Label>
                                                    <Input maxLength={2} {...register(`enderecos.0.uf` as const)} />
                                                </div>
                                                <div className="space-y-2 md:col-span-3">
                                                    <Label>Logradouro *</Label>
                                                    <Input {...register(`enderecos.0.logradouro` as const)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Número *</Label>
                                                    <Input {...register(`enderecos.0.numero` as const)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Complemento</Label>
                                                    <Input {...register(`enderecos.0.complemento` as const)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Bairro *</Label>
                                                    <Input {...register(`enderecos.0.bairro` as const)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Cidade *</Label>
                                                    <Input {...register(`enderecos.0.cidade` as const)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Residência de</Label>
                                                    <select
                                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        {...register(`enderecos.0.residenciaDe` as const)}
                                                    >
                                                        {residenciaOptions.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {watchEnderecos?.[0]?.residenciaDe === 'outro' && (
                                                    <div className="space-y-2">
                                                        <Label>Outro responsável</Label>
                                                        <Input {...register(`enderecos.0.outroResidencia` as const)} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : addressesToRender && addressesToRender.length > 0 ? (
                                addressesToRender.map((endereco, index) => (
                                    <div key={index} className="mb-6 space-y-4">
                                        {addressesToRender.length > 1 && (
                                            <h4 className="text-md font-medium">Endereço {index + 1}</h4>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <ReadOnlyField label="CEP *" value={endereco.cep ?? ''} />
                                            <ReadOnlyField label="UF *" value={endereco.uf ?? ''} />
                                            <ReadOnlyField label="Logradouro *" value={endereco.logradouro ?? ''} className="md:col-span-3" />
                                            <ReadOnlyField label="Número *" value={endereco.numero ?? ''} />
                                            <ReadOnlyField label="Complemento" value={endereco.complemento ?? ''} />
                                            <ReadOnlyField label="Bairro *" value={endereco.bairro ?? ''} />
                                            <ReadOnlyField label="Cidade *" value={endereco.cidade ?? ''} />
                                            <ReadOnlyField label="Residência de" value={endereco.residenciaDe ? caregiverRelationLabels[endereco.residenciaDe] ?? endereco.residenciaDe : ''} />
                                            {endereco.residenciaDe === 'outro' && endereco.outroResidencia && (
                                                <ReadOnlyField label="Outro responsável" value={endereco.outroResidencia} />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">Nenhum endereço informado</p>
                            )}
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Dados Pagamento */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Dados Pagamento
                            </h3>

                            {/* Dados básicos do titular */}
                            {isEditMode ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nome do titular *</Label>
                                            <Input {...register('dadosPagamento.nomeTitular')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Número carteirinha</Label>
                                            <Input {...register('dadosPagamento.numeroCarteirinha')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Telefone 1 *</Label>
                                            <Input {...register('dadosPagamento.telefone1')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <input type="checkbox" {...register('dadosPagamento.mostrarTelefone2')} />
                                                Telefone 2
                                            </Label>
                                            {watchDadosPagamento?.mostrarTelefone2 && (
                                                <Input {...register('dadosPagamento.telefone2')} />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <input type="checkbox" {...register('dadosPagamento.mostrarTelefone3')} />
                                                Telefone 3
                                            </Label>
                                            {watchDadosPagamento?.mostrarTelefone3 && (
                                                <Input {...register('dadosPagamento.telefone3')} />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>E-mail 1 *</Label>
                                            <Input type="email" {...register('dadosPagamento.email1')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <input type="checkbox" {...register('dadosPagamento.mostrarEmail2')} />
                                                E-mail 2
                                            </Label>
                                            {watchDadosPagamento?.mostrarEmail2 && (
                                                <Input type="email" {...register('dadosPagamento.email2')} />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <input type="checkbox" {...register('dadosPagamento.mostrarEmail3')} />
                                                E-mail 3
                                            </Label>
                                            {watchDadosPagamento?.mostrarEmail3 && (
                                                <Input type="email" {...register('dadosPagamento.email3')} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Sistema de pagamento *</Label>
                                        <div className="flex flex-wrap gap-4">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="radio"
                                                    value="reembolso"
                                                    {...register('dadosPagamento.sistemaPagamento')}
                                                    checked={watchDadosPagamento?.sistemaPagamento === 'reembolso'}
                                                />
                                                
                                                Reembolso
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="radio"
                                                    value="liminar"
                                                    {...register('dadosPagamento.sistemaPagamento')}
                                                    checked={watchDadosPagamento?.sistemaPagamento === 'liminar'}
                                                />
                                                Liminar
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="radio"
                                                    value="particular"
                                                    {...register('dadosPagamento.sistemaPagamento')}
                                                    checked={watchDadosPagamento?.sistemaPagamento === 'particular'}
                                                />
                                                Particular
                                            </label>
                                        </div>
                                    </div>

                                    {watchDadosPagamento?.sistemaPagamento === 'reembolso' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Prazo de reembolso</Label>
                                                <Input {...register('dadosPagamento.prazoReembolso')} />
                                            </div>
                                        </div>
                                    )}

                                    {watchDadosPagamento?.sistemaPagamento === 'liminar' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Número processo</Label>
                                                    <Input {...register('dadosPagamento.numeroProcesso')} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Nome advogado</Label>
                                                    <Input {...register('dadosPagamento.nomeAdvogado')} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Telefone advogado 1</Label>
                                                    <Input {...register('dadosPagamento.telefoneAdvogado1')} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2">
                                                        <input type="checkbox" {...register('dadosPagamento.mostrarTelefoneAdvogado2')} />
                                                        Telefone advogado 2
                                                    </Label>
                                                    {watchDadosPagamento?.mostrarTelefoneAdvogado2 && (
                                                        <Input {...register('dadosPagamento.telefoneAdvogado2')} />
                                                    )}
                                                    </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2">
                                                        <input type="checkbox" {...register('dadosPagamento.mostrarTelefoneAdvogado3')} />
                                                        Telefone advogado 3
                                                    </Label>
                                                    {watchDadosPagamento?.mostrarTelefoneAdvogado3 && (
                                                        <Input {...register('dadosPagamento.telefoneAdvogado3')} />
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Email advogado 1</Label>
                                                    <Input type="email" {...register('dadosPagamento.emailAdvogado1')} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2">
                                                        <input type="checkbox" {...register('dadosPagamento.mostrarEmailAdvogado2')} />
                                                        Email advogado 2
                                                    </Label>
                                                    {watchDadosPagamento?.mostrarEmailAdvogado2 && (
                                                        <Input type="email" {...register('dadosPagamento.emailAdvogado2')} />
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2">
                                                        <input type="checkbox" {...register('dadosPagamento.mostrarEmailAdvogado3')} />
                                                        Email advogado 3
                                                    </Label>
                                                    {watchDadosPagamento?.mostrarEmailAdvogado3 && (
                                                        <Input type="email" {...register('dadosPagamento.emailAdvogado3')} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {watchDadosPagamento?.sistemaPagamento === 'particular' && (
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-4">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        value="sim"
                                                        {...register('dadosPagamento.houveNegociacao')}
                                                        checked={watchDadosPagamento?.houveNegociacao === 'sim'}
                                                    />
                                                    Houve negociação
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        value="nao"
                                                        {...register('dadosPagamento.houveNegociacao')}
                                                        checked={watchDadosPagamento?.houveNegociacao === 'nao'}
                                                    />
                                                    Não houve negociação
                                                </label>
                                            </div>
                                            {watchDadosPagamento?.houveNegociacao === 'sim' && (
                                                <div className="space-y-2">
                                                    <Label>Valor acordado</Label>
                                                    <Input {...register('dadosPagamento.valorAcordado')} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ReadOnlyField label="Nome do titular *" value={paymentData?.nomeTitular ?? ''} />
                                        <ReadOnlyField label="Número carteirinha" value={paymentData?.numeroCarteirinha ?? ''} />
                                        <ReadOnlyField label="Telefone 1 *" value={paymentData?.telefone1 ?? ''} />
                                        {paymentData?.telefone2 && (
                                            <ReadOnlyField label="Telefone 2" value={paymentData.telefone2} />
                                        )}
                                        {paymentData?.telefone3 && (
                                            <ReadOnlyField label="Telefone 3" value={paymentData.telefone3} />
                                        )}
                                        <ReadOnlyField label="E-mail 1 *" value={paymentData?.email1 ?? ''} />
                                        {paymentData?.email2 && (
                                            <ReadOnlyField label="E-mail 2" value={paymentData.email2} />
                                        )}
                                        {paymentData?.email3 && (
                                            <ReadOnlyField label="E-mail 3" value={paymentData.email3} />
                                        )}
                                    </div>
                                    <ReadOnlyField label="Sistema de pagamento" value={
                                        paymentData?.sistemaPagamento === 'reembolso'
                                            ? 'Reembolso'
                                            : paymentData?.sistemaPagamento === 'liminar'
                                              ? 'Liminar'
                                              : paymentData?.sistemaPagamento === 'particular'
                                                ? 'Particular'
                                                : 'Não informado'
                                    } />
                                    {paymentData?.sistemaPagamento === 'reembolso' && (
                                        <ReadOnlyField label="Prazo de reembolso" value={paymentData?.prazoReembolso ?? ''} />
                                    )}
                                    {paymentData?.sistemaPagamento === 'liminar' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReadOnlyField label="Número processo" value={paymentData?.numeroProcesso ?? ''} />
                                            <ReadOnlyField label="Nome advogado" value={paymentData?.nomeAdvogado ?? ''} />
                                            <ReadOnlyField label="Telefone advogado 1" value={paymentData?.telefoneAdvogado1 ?? ''} />
                                            {paymentData?.telefoneAdvogado2 && (
                                                <ReadOnlyField label="Telefone advogado 2" value={paymentData.telefoneAdvogado2} />
                                            )}
                                            {paymentData?.telefoneAdvogado3 && (
                                                <ReadOnlyField label="Telefone advogado 3" value={paymentData.telefoneAdvogado3} />
                                            )}
                                            <ReadOnlyField label="Email advogado 1" value={paymentData?.emailAdvogado1 ?? ''} />
                                            {paymentData?.emailAdvogado2 && (
                                                <ReadOnlyField label="Email advogado 2" value={paymentData.emailAdvogado2} />
                                            )}
                                            {paymentData?.emailAdvogado3 && (
                                                <ReadOnlyField label="Email advogado 3" value={paymentData.emailAdvogado3} />
                                            )}
                                        </div>
                                    )}
                                    {paymentData?.sistemaPagamento === 'particular' && (
                                        <div className="space-y-2">
                                            <ReadOnlyField
                                                label="Houve negociação?"
                                                value={
                                                    paymentData?.houveNegociacao === 'sim'
                                                        ? 'Sim'
                                                        : paymentData?.houveNegociacao === 'nao'
                                                          ? 'Não'
                                                          : 'Não informado'
                                                }
                                            />
                                            {paymentData?.houveNegociacao === 'sim' && (
                                                <ReadOnlyField label="Valor acordado" value={paymentData?.valorAcordado ?? ''} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Dados Escola */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                Dados Escola
                            </h3>

                            {isEditMode ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Tipo de escola *</Label>
                                            <select
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                {...register('dadosEscola.tipoEscola')}
                                            >
                                                <option value="particular">Particular</option>
                                                <option value="publica">Pública</option>
                                                <option value="afastado">Afastado</option>
                                                <option value="clinica-escola">Clínica-escola</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nome *</Label>
                                            <Input {...register('dadosEscola.nome')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Telefone *</Label>
                                            <Input {...register('dadosEscola.telefone')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>E-mail</Label>
                                            <Input type="email" {...register('dadosEscola.email')} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Endereço da Escola</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>CEP</Label>
                                                <Input {...register('dadosEscola.endereco.cep')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>UF</Label>
                                                <Input maxLength={2} {...register('dadosEscola.endereco.uf')} />
                                            </div>
                                            <div className="space-y-2 md:col-span-3">
                                                <Label>Logradouro</Label>
                                                <Input {...register('dadosEscola.endereco.logradouro')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Número</Label>
                                                <Input {...register('dadosEscola.endereco.numero')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Complemento</Label>
                                                <Input {...register('dadosEscola.endereco.complemento')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Bairro</Label>
                                                <Input {...register('dadosEscola.endereco.bairro')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Cidade</Label>
                                                <Input {...register('dadosEscola.endereco.cidade')} />
                                            </div>
                                        </div>
                                    </div>
                                    {watchDadosEscola?.contatos && watchDadosEscola.contatos.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-medium">Contatos</h4>
                                            {watchDadosEscola.contatos.map((_contato, index) => (
                                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                                                    <div className="space-y-2">
                                                        <Label>Nome</Label>
                                                        <Input {...register(`dadosEscola.contatos.${index}.nome` as const)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Telefone</Label>
                                                        <Input {...register(`dadosEscola.contatos.${index}.telefone` as const)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Email</Label>
                                                        <Input type="email" {...register(`dadosEscola.contatos.${index}.email` as const)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Função</Label>
                                                        <Input {...register(`dadosEscola.contatos.${index}.funcao` as const)} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ReadOnlyField
                                            label="Tipo de escola"
                                            value={
                                                schoolData?.tipoEscola === 'particular'
                                                    ? 'Particular'
                                                    : schoolData?.tipoEscola === 'publica'
                                                      ? 'Pública'
                                                      : schoolData?.tipoEscola === 'afastado'
                                                        ? 'Afastado'
                                                        : schoolData?.tipoEscola === 'clinica-escola'
                                                          ? 'Clínica-escola'
                                                          : 'Não informado'
                                            }
                                        />
                                        <ReadOnlyField label="Nome *" value={schoolData?.nome ?? ''} />
                                        <ReadOnlyField label="Telefone *" value={schoolData?.telefone ?? ''} />
                                        <ReadOnlyField label="E-mail" value={schoolData?.email ?? ''} />
                                    </div>
                                    {schoolData?.endereco && (
                                        <div className="space-y-4">
                                            <h4 className="text-md font-medium">Endereço da Escola</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <ReadOnlyField label="CEP" value={schoolData.endereco.cep ?? ''} />
                                                <ReadOnlyField label="UF" value={schoolData.endereco.uf ?? ''} />
                                                <ReadOnlyField label="Logradouro" value={(schoolData.endereco as any).rua ?? schoolData.endereco.logradouro ?? ''} className="md:col-span-3" />
                                                <ReadOnlyField label="Número" value={schoolData.endereco.numero ?? ''} />
                                                <ReadOnlyField label="Complemento" value={schoolData.endereco.complemento ?? ''} />
                                                <ReadOnlyField label="Bairro" value={schoolData.endereco.bairro ?? ''} />
                                                <ReadOnlyField label="Cidade" value={schoolData.endereco.cidade ?? ''} />
                                            </div>
                                        </div>
                                    )}
                                    {schoolData?.contatos && schoolData.contatos.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-md font-medium">Contatos</h4>
                                            {schoolData.contatos.map((contato, index) => (
                                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                                                    <ReadOnlyField label="Nome" value={contato.nome ?? ''} />
                                                    <ReadOnlyField label="Telefone" value={contato.telefone ?? ''} />
                                                    <ReadOnlyField label="Email" value={contato.email ?? ''} />
                                                    <ReadOnlyField label="Função" value={contato.funcao ?? ''} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Arquivos */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                📎 Arquivos
                            </h3>
                            {isEditMode ? (
                                filesLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <DocumentsEditor
                                        files={files}
                                        ownerType="cliente"
                                        ownerId={patient.id}
                                        onUploadSuccess={loadFiles}
                                        onDeleteSuccess={loadFiles}
                                    />
                                )
                            ) : (
                                <DocumentsTable ownerType="cliente" ownerId={patient.id} />
                            )}
                        </div>

                        {/* Espaço extra para garantir scroll completo */}
                        <div className="h-4"></div>
                    </div>

                    {/* Action Buttons (Edit Mode) - Sticky Footer */}
                    {isEditMode && (
                        <div className="border-t p-4 bg-background flex justify-end gap-3 flex-shrink-0">
                            <Button type="button" variant="outline" onClick={handleCancelClick} disabled={isSaving}>
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
