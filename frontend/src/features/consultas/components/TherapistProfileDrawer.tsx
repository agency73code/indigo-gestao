import { useState, useEffect, useRef } from 'react';
import { X, User, MapPin, Briefcase, Building, GraduationCap, FileText, Car, Save, Loader2, Edit2, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/layout/CloseButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/ui/label';
import { Combobox } from '@/ui/combobox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReadOnlyField from './ReadOnlyField';
import { EditingBadge } from './EditingBadge';
import ProfilePhotoFieldSimple, { type ProfilePhotoFieldSimpleRef } from '@/components/profile/ProfilePhotoFieldSimple';
import { DateField } from '@/common/components/layout/DateField';
import type { Therapist } from '../types/consultas.types';
import { useTerapeuta } from '../hooks/useTerapeuta';
import DocumentsTable from '../arquivos/components/DocumentsTable';
import { DocumentsEditor } from '../arquivos/components/DocumentsEditor';
import { updateTerapeuta, listFiles, type FileMeta } from '../service/consultas.service';
import { fetchProfessionalMetadata, fetchBrazilianBanks } from '@/lib/api';
import { FALLBACK_BRAZILIAN_BANKS, formatBankLabel, type Bank } from '@/common/constants/banks';
import * as mask from '@/common/utils/mask';
import SimpleStepSidebar from './SimpleStepSidebar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { RequireAbility } from '@/features/auth/abilities/RequireAbility';

const STEPS = [
    'Dados Pessoais',
    'Endereço',
    'Dados Profissionais',
    'Formação',
    'Arquivos',
    'Dados CNPJ'
];

interface AvatarWithSkeletonProps {
    src: string | null | undefined;
    alt: string;
    initials: string;
    className?: string;
}

const AvatarWithSkeleton = ({ src, alt, initials, className = '' }: AvatarWithSkeletonProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Se não tem src, mostrar iniciais diretamente
    if (!src) {
        return <>{initials}</>;
    }

    if (imageError) {
        return <>{initials}</>;
    }

    return (
        <>
            {!imageLoaded && (
                <div className="absolute inset-0 bg-muted rounded-full animate-pulse" />
            )}
            <img
                src={src}
                alt={alt}
                className={`absolute inset-0 h-full w-full object-cover rounded-full transition-opacity duration-200 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${className}`}
                referrerPolicy="no-referrer"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                    setImageError(true);
                    setImageLoaded(false);
                }}
            />
        </>
    );
};

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
    const [currentStep, setCurrentStep] = useState(1);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [files, setFiles] = useState<FileMeta[]>([]);
    const [filesLoading, setFilesLoading] = useState(true);
    const [profilePhoto, setProfilePhoto] = useState<File | string | null>(null);
    const profilePhotoRef = useRef<ProfilePhotoFieldSimpleRef>(null);
    const [areaOptions, setAreaOptions] = useState<{ value: string; label: string }[]>([]);
    const [cargoOptions, setCargoOptions] = useState<{ value: string; label: string }[]>([]);
    const [temCNPJ, setTemCNPJ] = useState(false);
    const [pixTipo, setPixTipo] = useState<string>('email');
    
    // Estados para bancos
    const [banks, setBanks] = useState<Bank[]>(FALLBACK_BRAZILIAN_BANKS);
    const [banksLoading, setBanksLoading] = useState(false);
    const [banksMessage, setBanksMessage] = useState<string | null>(null);
    
    // Estados para validações
    const [cpfError, setCpfError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailIndigoError, setEmailIndigoError] = useState<string | null>(null);
    const [placaError, setPlacaError] = useState<string | null>(null);
    const [chavePixError, setChavePixError] = useState<string | null>(null);
    const [cnpjError, setCnpjError] = useState<string | null>(null);

    const terapeutaData = useTerapeuta(therapist?.id);

    const { register, handleSubmit, reset, watch, control, setValue, formState: { isDirty } } = useForm({
        defaultValues: terapeutaData ? {
            nome: mask.maskPersonName(terapeutaData.nome || ''),
            email: mask.normalizeEmail(terapeutaData.email || ''),
            emailIndigo: mask.normalizeEmail(terapeutaData.emailIndigo || ''),
            telefone: mask.maskBRPhone(terapeutaData.telefone || ''),
            celular: mask.maskBRPhone(terapeutaData.celular || ''),
            cpf: mask.maskCPF(terapeutaData.cpf || ''),
            dataNascimento: terapeutaData.dataNascimento 
                ? new Date(terapeutaData.dataNascimento).toISOString().split('T')[0] 
                : '',
            // Endereço
            cep: mask.maskCEP(terapeutaData.endereco?.cep || ''),
            rua: terapeutaData.endereco?.rua || '',
            numero: terapeutaData.endereco?.numero || '',
            complemento: terapeutaData.endereco?.complemento || '',
            bairro: terapeutaData.endereco?.bairro || '',
            cidade: terapeutaData.endereco?.cidade || '',
            estado: terapeutaData.endereco?.estado || '',
            // Veículo
            possuiVeiculo: (terapeutaData.possuiVeiculo?.toLowerCase() === 'sim' ? 'sim' : 'nao') as 'sim' | 'nao',
            placaVeiculo: mask.maskPlate(terapeutaData.placaVeiculo || ''),
            modeloVeiculo: terapeutaData.modeloVeiculo || '',
            // Dados bancários
            banco: terapeutaData.banco || '',
            agencia: terapeutaData.agencia || '',
            conta: terapeutaData.conta || '',
            pixTipo: terapeutaData.pixTipo || 'email',
            chavePix: terapeutaData.chavePix || '',
            dadosProfissionais: terapeutaData.dadosProfissionais && terapeutaData.dadosProfissionais.length > 0
                ? terapeutaData.dadosProfissionais.map(dp => ({
                    areaAtuacao: dp.areaAtuacao || '',
                    areaAtuacaoId: dp.areaAtuacaoId || null,
                    cargo: dp.cargo || '',
                    cargoId: dp.cargoId || null,
                    numeroConselho: dp.numeroConselho || '',
                }))
                : [{
                    areaAtuacao: '',
                    areaAtuacaoId: null,
                    cargo: '',
                    cargoId: null,
                    numeroConselho: '',
                }],
            // Dados profissionais adicionais
            dataInicio: terapeutaData.dataInicio 
                ? new Date(terapeutaData.dataInicio).toISOString().split('T')[0] 
                : '',
            dataFim: terapeutaData.dataFim 
                ? new Date(terapeutaData.dataFim).toISOString().split('T')[0] 
                : '',
            valorHoraAcordado: terapeutaData.valorHoraAcordado 
                ? terapeutaData.valorHoraAcordado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '',
            professorUnindigo: (terapeutaData.professorUnindigo?.toLowerCase() === 'sim' ? 'sim' : 'nao') as 'sim' | 'nao',
            disciplinaUniindigo: terapeutaData.disciplinaUniindigo || '',
            // Formação
            formacao: {
                graduacao: terapeutaData.formacao?.graduacao || '',
                instituicaoGraduacao: terapeutaData.formacao?.instituicaoGraduacao || '',
                anoFormatura: terapeutaData.formacao?.anoFormatura || '',
                posGraduacoes: terapeutaData.formacao?.posGraduacoes && terapeutaData.formacao.posGraduacoes.length > 0
                    ? terapeutaData.formacao.posGraduacoes
                    : [],
                participacaoCongressosDescricao: terapeutaData.formacao?.participacaoCongressosDescricao || '',
                publicacoesLivrosDescricao: terapeutaData.formacao?.publicacoesLivrosDescricao || '',
            },
            // CNPJ
            cnpj: {
                numero: mask.maskCNPJ(terapeutaData.cnpj?.numero || ''),
                razaoSocial: terapeutaData.cnpj?.razaoSocial || '',
                nomeFantasia: terapeutaData.cnpj?.nomeFantasia || '',
                endereco: {
                    cep: mask.maskCEP(terapeutaData.cnpj?.endereco?.cep || ''),
                    rua: terapeutaData.cnpj?.endereco?.rua || '',
                    numero: terapeutaData.cnpj?.endereco?.numero || '',
                    complemento: terapeutaData.cnpj?.endereco?.complemento || '',
                    bairro: terapeutaData.cnpj?.endereco?.bairro || '',
                    cidade: terapeutaData.cnpj?.endereco?.cidade || '',
                    estado: terapeutaData.cnpj?.endereco?.estado || '',
                }
            },
        } : undefined
    });

    // Observar mudanças no campo possuiVeiculo
    const watchPossuiVeiculo = watch('possuiVeiculo') || terapeutaData?.possuiVeiculo || 'nao';
    
    // Observar mudanças no campo professorUnindigo
    const watchProfessorUnindigo = watch('professorUnindigo') || terapeutaData?.professorUnindigo || 'nao';

    // Observar valores dos campos de data
    const watchDataInicio = watch('dataInicio');
    const watchDataFim = watch('dataFim');
    
    // Observar dados profissionais para os Comboboxes
    const watchDadosProfissionais = watch('dadosProfissionais');
    
    // Observar CNPJ para debug (comentado - não usado)
    // const watchCNPJ = watch('cnpj');

    // useFieldArray para gerenciar múltiplos dados profissionais
    const { fields: dadosProfissionaisFields, append: appendDadoProfissional, remove: removeDadoProfissional } = useFieldArray({
        control,
        name: 'dadosProfissionais' as any,
    });

    // useFieldArray para gerenciar múltiplas pós-graduações
    const { fields: posGraduacoesFields, append: appendPosGraduacao, remove: removePosGraduacao } = useFieldArray({
        control,
        name: 'formacao.posGraduacoes' as any,
    });

    // Atualizar form quando terapeutaData chegar
    useEffect(() => {
        if (terapeutaData && open) {
            reset({
                nome: mask.maskPersonName(terapeutaData.nome || ''),
                email: mask.normalizeEmail(terapeutaData.email || ''),
                emailIndigo: mask.normalizeEmail(terapeutaData.emailIndigo || ''),
                telefone: mask.maskBRPhone(terapeutaData.telefone || ''),
                celular: mask.maskBRPhone(terapeutaData.celular || ''),
                cpf: mask.maskCPF(terapeutaData.cpf || ''),
                dataNascimento: terapeutaData.dataNascimento 
                    ? new Date(terapeutaData.dataNascimento).toISOString().split('T')[0] 
                    : '',
                cep: mask.maskCEP(terapeutaData.endereco?.cep || ''),
                rua: terapeutaData.endereco?.rua || '',
                numero: terapeutaData.endereco?.numero || '',
                complemento: terapeutaData.endereco?.complemento || '',
                bairro: terapeutaData.endereco?.bairro || '',
                cidade: terapeutaData.endereco?.cidade || '',
                estado: terapeutaData.endereco?.estado || '',
                possuiVeiculo: (terapeutaData.possuiVeiculo?.toLowerCase() === 'sim' ? 'sim' : 'nao') as 'sim' | 'nao',
                placaVeiculo: mask.maskPlate(terapeutaData.placaVeiculo || ''),
                modeloVeiculo: terapeutaData.modeloVeiculo || '',
                banco: terapeutaData.banco || '',
                agencia: terapeutaData.agencia || '',
                conta: terapeutaData.conta || '',
                pixTipo: terapeutaData.pixTipo || 'email',
                chavePix: terapeutaData.chavePix 
                    ? mask.maskPixKey(terapeutaData.pixTipo || 'email', terapeutaData.chavePix)
                    : '',
                dadosProfissionais: terapeutaData.dadosProfissionais && terapeutaData.dadosProfissionais.length > 0
                    ? terapeutaData.dadosProfissionais.map(dp => ({
                        areaAtuacao: dp.areaAtuacao || '',
                        areaAtuacaoId: dp.areaAtuacaoId || null,
                        cargo: dp.cargo || '',
                        cargoId: dp.cargoId || null,
                        numeroConselho: dp.numeroConselho || '',
                    }))
                    : [{
                        areaAtuacao: '',
                        areaAtuacaoId: null,
                        cargo: '',
                        cargoId: null,
                        numeroConselho: '',
                    }],
                dataInicio: terapeutaData.dataInicio 
                    ? new Date(terapeutaData.dataInicio).toISOString().split('T')[0] 
                    : '',
                dataFim: terapeutaData.dataFim 
                    ? new Date(terapeutaData.dataFim).toISOString().split('T')[0] 
                    : '',
                valorHoraAcordado: terapeutaData.valorHoraAcordado 
                    ? mask.maskCurrencyBR(String(Math.round(terapeutaData.valorHoraAcordado * 100)))
                    : '',
                professorUnindigo: (terapeutaData.professorUnindigo?.toLowerCase() === 'sim' ? 'sim' : 'nao') as 'sim' | 'nao',
                disciplinaUniindigo: terapeutaData.disciplinaUniindigo || '',
                // Formação
                formacao: {
                    graduacao: terapeutaData.formacao?.graduacao || '',
                    instituicaoGraduacao: terapeutaData.formacao?.instituicaoGraduacao || '',
                    anoFormatura: terapeutaData.formacao?.anoFormatura || '',
                    posGraduacoes: terapeutaData.formacao?.posGraduacoes && terapeutaData.formacao.posGraduacoes.length > 0
                        ? terapeutaData.formacao.posGraduacoes
                        : [],
                    participacaoCongressosDescricao: terapeutaData.formacao?.participacaoCongressosDescricao || '',
                    publicacoesLivrosDescricao: terapeutaData.formacao?.publicacoesLivrosDescricao || '',
                },
                // CNPJ
                cnpj: {
                    numero: mask.maskCNPJ(terapeutaData.cnpj?.numero || ''),
                    razaoSocial: terapeutaData.cnpj?.razaoSocial || '',
                    nomeFantasia: terapeutaData.cnpj?.nomeFantasia || '',
                    endereco: {
                        cep: mask.maskCEP(terapeutaData.cnpj?.endereco?.cep || ''),
                        rua: terapeutaData.cnpj?.endereco?.rua || '',
                        numero: terapeutaData.cnpj?.endereco?.numero || '',
                        complemento: terapeutaData.cnpj?.endereco?.complemento || '',
                        bairro: terapeutaData.cnpj?.endereco?.bairro || '',
                        cidade: terapeutaData.cnpj?.endereco?.cidade || '',
                        estado: terapeutaData.cnpj?.endereco?.estado || '',
                    }
                },
            });
        }
    }, [terapeutaData, open, reset]);

    // Resetar modo de edição quando o drawer fechar
    useEffect(() => {
        if (!open && isEditMode) {
            setIsEditMode(false);
        }
    }, [open, isEditMode]);

    // Atualizar estado temCNPJ quando os dados carregarem
    useEffect(() => {
        if (terapeutaData && open) {
            setTemCNPJ(!!terapeutaData.cnpj?.numero);
            setPixTipo((terapeutaData as any).pixTipo || 'email');
        }
    }, [terapeutaData, open]);

    // Carregar metadados profissionais quando entrar em modo de edição
    useEffect(() => {
        if (!isEditMode) return;

        let isMounted = true;

        async function loadMetadata() {
            try {
                const metadata = await fetchProfessionalMetadata();
                if (!isMounted) return;
                
                setAreaOptions(
                    metadata.areasAtuacao.map((area) => ({
                        value: String(area.id),
                        label: area.nome,
                    })),
                );
                setCargoOptions(
                    metadata.cargos.map((cargo) => ({
                        value: String(cargo.id),
                        label: cargo.nome,
                    })),
                );
            } catch (error) {
                console.error('Falha ao carregar metadados profissionais:', error);
            }
        }

        loadMetadata();
        
        return () => {
            isMounted = false;
        };
    }, [isEditMode]);

    // Carregar lista de bancos
    useEffect(() => {
        let isMounted = true;
        setBanksLoading(true);

        fetchBrazilianBanks()
            .then((response) => {
                if (!isMounted) return;
                if (response.length === 0) {
                    setBanks(FALLBACK_BRAZILIAN_BANKS);
                    setBanksMessage('Lista atualizada indisponível. Exibindo opções padrão.');
                } else {
                    setBanks(response);
                    setBanksMessage(null);
                }
            })
            .catch((error) => {
                console.error('Erro ao carregar bancos da Brasil API:', error);
                if (!isMounted) return;
                setBanks(FALLBACK_BRAZILIAN_BANKS);
                setBanksMessage('Não foi possível atualizar a lista de bancos. Exibindo opções padrão.');
            })
            .finally(() => {
                if (isMounted) {
                    setBanksLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Opções de banco com suporte a valor customizado
    const bankOptions = banks
        .filter((bank) => Boolean(bank.code))
        .map((bank) => ({
            value: bank.code,
            label: formatBankLabel(bank),
            searchValue: `${bank.name} ${bank.code}`.toLowerCase(), // Permite buscar por nome ou código
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

    const bankPlaceholder = banksLoading 
        ? 'Carregando bancos...' 
        : !bankOptions.length 
        ? 'Nenhum banco disponível' 
        : 'Selecione um banco';

    const handleEditClick = () => {
        setIsEditMode(true);
        
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

        try {
            // Fazer upload da foto primeiro, se houver uma nova
            if (profilePhoto) {
                await profilePhotoRef.current?.uploadPhoto();
            }

            await updateTerapeuta(therapist.id, {
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
                banco: data.banco,
                agencia: data.agencia,
                conta: data.conta,
                // Para email, enviar como está. Para outros tipos, remover formatação
                chavePix: pixTipo === 'email' ? data.chavePix : data.chavePix?.replace(/\D/g, ''),
                pixTipo: pixTipo,
                endereco: {
                    cep: data.cep,
                    rua: data.rua,
                    numero: data.numero,
                    complemento: data.complemento,
                    bairro: data.bairro,
                    cidade: data.cidade,
                    estado: data.estado,
                },
                dadosProfissionais: data.dadosProfissionais || [],
                dataInicio: data.dataInicio,
                dataFim: data.dataFim,
                valorHoraAcordado: data.valorHoraAcordado ? mask.parseCurrencyBR(data.valorHoraAcordado).toString() : null,
                professorUnindigo: data.professorUnindigo,
                disciplinaUniindigo: data.disciplinaUniindigo,
                formacao: {
                    graduacao: data.formacao?.graduacao || '',
                    instituicaoGraduacao: data.formacao?.instituicaoGraduacao || '',
                    anoFormatura: data.formacao?.anoFormatura.toString() || '',
                    posGraduacoes: data.formacao?.posGraduacoes || [],
                    participacaoCongressosDescricao: data.formacao?.participacaoCongressosDescricao || null,
                    publicacoesLivrosDescricao: data.formacao?.publicacoesLivrosDescricao || null,
                },
                cnpj: temCNPJ && data.cnpj ? {
                    numero: data.cnpj.numero?.replace(/\D/g, '') || '',
                    razaoSocial: data.cnpj.razaoSocial || '',
                    nomeFantasia: data.cnpj.nomeFantasia || '',
                    endereco: {
                        cep: data.cnpj.endereco?.cep?.replace(/\D/g, '') || '',
                        rua: data.cnpj.endereco?.rua || '',
                        numero: data.cnpj.endereco?.numero || '',
                        complemento: data.cnpj.endereco?.complemento || '',
                        bairro: data.cnpj.endereco?.bairro || '',
                        cidade: data.cnpj.endereco?.cidade || '',
                        estado: data.cnpj.endereco?.estado || '',
                    }
                } : null,
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
            toast.error('Erro ao salvar', {
                description: msg,
                duration: 5000,
            });

            window.dispatchEvent(
                new CustomEvent('consulta:edit:save:error', {
                    detail: { ownerType: 'terapeuta', ownerId: therapist.id, error: msg }
                })
            );
        } finally {
            setIsSaving(false);
        }
    };

    // Handlers para área de atuação e cargo no useFieldArray
    const handleAreaAtuacaoSelect = (index: number, value: string) => {
        const option = areaOptions.find((item) => item.value === value);
        setValue(`dadosProfissionais.${index}.areaAtuacaoId` as any, value || null);
        setValue(`dadosProfissionais.${index}.areaAtuacao` as any, option?.label ?? '');
    };

    const handleCargoSelect = (index: number, value: string) => {
        const option = cargoOptions.find((item) => item.value === value);
        setValue(`dadosProfissionais.${index}.cargoId` as any, value || null);
        setValue(`dadosProfissionais.${index}.cargo` as any, option?.label ?? '');
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
        ? `${import.meta.env.VITE_API_URL}/arquivos/${encodeURIComponent(fotoPerfil.arquivo_id!)}/view`
        : null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Não informado';
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
        const normalizedStatus = status?.toUpperCase() || '';
        const isActive = normalizedStatus === 'ATIVO';
        const statusClasses = isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        
        const displayText = isActive ? 'Ativo' : 'Inativo';

        return <span className={`${baseClasses} ${statusClasses}`}>{displayText}</span>;
    };

    const getPixPlaceholder = (tipo: string): string => {
        switch (tipo) {
            case 'email':
                return 'terapeuta@dominio.com';
            case 'telefone':
                return '(11) 98888-7777';
            case 'cpf':
                return '123.456.789-09';
            case 'cnpj':
                return '12.345.678/0001-95';
            case 'aleatoria':
                return '123e4567-e89b-12d3-a456-426614174000';
            default:
                return 'Selecione o tipo primeiro';
        }
    };

    if (!therapist) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right" className="w-[75vw] max-w-[1400px] p-0 flex flex-col gap-0">
                {/* Header - shrink-0 mantém fixo */}
                <div className="flex items-center gap-4 px-4 py-4 bg-background shrink-0 rounded-2xl">
                    {/* Botão X - Esquerda */}
                    <CloseButton onClick={onClose} />

                    {/* Nome do Terapeuta - Alinhado à esquerda */}
                    <SheetTitle 
                        className="text-foreground" 
                        style={{ 
                            fontSize: 'var(--page-title-font-size)',
                            fontWeight: 'var(--page-title-font-weight)',
                            fontFamily: 'var(--page-title-font-family)'
                        }}
                    >
                        {therapist.nome}
                    </SheetTitle>

                    {/* Botão Editar - Direita com margin-left auto */}
                    <div className="ml-auto">
                        {!isEditMode ? (
                            <RequireAbility action="update" subject="Consultar">
                                <Button 
                                    variant="default" 
                                    size="sm" 
                                    onClick={handleEditClick} 
                                    className="h-10 gap-2 font-normal font-sora hover:scale-105 transition-transform"
                                    style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Editar
                                </Button>
                            </RequireAbility>
                        ) : (
                            <EditingBadge />
                        )}
                    </div>
                </div>

                {/* Layout: Sidebar + Content */}
                <div className="flex flex-1 min-h-0 p-2 gap-2 bg-background rounded-2xl">
                    {/* Sidebar de Navegação */}
                    <div className="w-64 bg-header-bg rounded-2xl shrink-0 shadow-sm flex flex-col">
                        {/* Avatar e Status no topo */}
                        <div className="flex flex-col items-center gap-3 p-4">
                            <div className="relative h-24 w-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl font-medium text-purple-600 dark:text-purple-300">
                                <AvatarWithSkeleton
                                    src={displayAvatar}
                                    alt={therapist.nome}
                                    initials={getInitials(therapist.nome)}
                                />
                            </div>
                            {getStatusBadge(therapist.status)}
                        </div>
                        
                        {/* Steps */}
                        <SimpleStepSidebar
                            currentStep={currentStep}
                            totalSteps={STEPS.length}
                            steps={STEPS}
                            stepIcons={[User, MapPin, Briefcase, GraduationCap, FileText, Building]}
                            onStepClick={setCurrentStep}
                        />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-h-0 bg-header-bg rounded-2xl overflow-hidden flex flex-col shadow-sm ">
                        {/* Content - rolável com todos os campos dos cadastros */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-0 overflow-y-auto">
                            <div className="space-y-8 pb-16 p-4">
                                
                                {/* Seção 1: Dados Pessoais (DadosPessoaisStep) */}
                                {currentStep === 1 && (
                        <div>
                            

                            {/* Foto de Perfil - aparece apenas em modo de edição */}
                            {isEditMode && (
                                <div className="mb-6">
                                    <ProfilePhotoFieldSimple
                                        ref={profilePhotoRef}
                                        userId={therapist?.id || ''}
                                        fullName={terapeutaData.nome}
                                        birthDate={terapeutaData.dataNascimento}
                                        value={profilePhoto}
                                        onChange={(file) => {
                                            setProfilePhoto(file);
                                        }}
                                        onUploaded={() => {
                                            // Recarregar arquivos para atualizar a lista
                                            if (therapist?.id) {
                                                listFiles({ ownerType: 'terapeuta', ownerId: therapist.id })
                                                    .then(setFiles)
                                                    .catch(console.error);
                                            }
                                        }}
                                    />
                                </div>
                            )}
                            
                            {isEditMode ? (
                                <>
                                    {/* Primeira linha: Nome (2/4) | CPF (1/4) | Data de Nascimento (1/4) */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div className="md:col-span-2">
                                            <Label htmlFor="nome">Nome *</Label>
                                            <Input
                                                id="nome"
                                                {...register('nome')}
                                                placeholder="Nome completo"
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const input = e.currentTarget;
                                                    const masked = mask.maskPersonName(input.value);
                                                    input.value = masked;
                                                    setValue('nome', masked, { shouldDirty: true });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cpf">CPF *</Label>
                                            <Input
                                                id="cpf"
                                                {...register('cpf')}
                                                placeholder="000.000.000-00"
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const input = e.currentTarget;
                                                    const masked = mask.maskCPF(input.value);
                                                    input.value = masked;
                                                    setValue('cpf', masked, { shouldDirty: true });
                                                    
                                                    // Validação em tempo real
                                                    if (masked.length === 14) {
                                                        if (mask.isValidCPF(masked)) {
                                                            setCpfError(null);
                                                        } else {
                                                            setCpfError('CPF inválido');
                                                        }
                                                    } else if (masked.length === 0) {
                                                        setCpfError(null);
                                                    } else {
                                                        setCpfError('CPF incompleto');
                                                    }
                                                }}
                                                maxLength={14}
                                                className={cpfError ? 'border-red-500' : ''}
                                            />
                                            {cpfError && (
                                                <p className="text-sm text-red-500 mt-1">{cpfError}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="dataNascimento">
                                                Data de nascimento *
                                            </Label>
                                            <DateField
                                                value={watch('dataNascimento') || ''}
                                                onChange={(value) => setValue('dataNascimento', value)}
                                                placeholder="DD/MM/AAAA"
                                                maxDate={new Date()}
                                            />
                                        </div>
                                    </div>

                                    {/* Segunda linha: Email | Email Índigo */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Label htmlFor="email">E-mail *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...register('email')}
                                                placeholder="email@exemplo.com"
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const input = e.currentTarget;
                                                    const normalized = mask.normalizeEmail(input.value);
                                                    input.value = normalized;
                                                    setValue('email', normalized, { shouldDirty: true });
                                                    
                                                    // Validação em tempo real
                                                    if (normalized.length > 0) {
                                                        if (mask.isValidEmail(normalized)) {
                                                            setEmailError(null);
                                                        } else {
                                                            setEmailError('E-mail inválido');
                                                        }
                                                    } else {
                                                        setEmailError(null);
                                                    }
                                                }}
                                                className={emailError ? 'border-red-500' : ''}
                                            />
                                            {emailError && (
                                                <p className="text-sm text-red-500 mt-1">{emailError}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="emailIndigo">E-mail Índigo *</Label>
                                            <Input
                                                id="emailIndigo"
                                                type="email"
                                                {...register('emailIndigo')}
                                                placeholder="email@indigo.com"
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const input = e.currentTarget;
                                                    const normalized = mask.normalizeEmail(input.value);
                                                    input.value = normalized;
                                                    setValue('emailIndigo', normalized, { shouldDirty: true });
                                                    
                                                    // Validação em tempo real
                                                    if (normalized.length > 0) {
                                                        if (mask.isValidEmail(normalized)) {
                                                            setEmailIndigoError(null);
                                                        } else {
                                                            setEmailIndigoError('E-mail inválido');
                                                        }
                                                    } else {
                                                        setEmailIndigoError(null);
                                                    }
                                                }}
                                                className={emailIndigoError ? 'border-red-500' : ''}
                                            />
                                            {emailIndigoError && (
                                                <p className="text-sm text-red-500 mt-1">{emailIndigoError}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Terceira linha: Celular | Telefone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="celular">Celular *</Label>
                                            <Input
                                                id="celular"
                                                {...register('celular')}
                                                placeholder="(00) 00000-0000"
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const input = e.currentTarget;
                                                    const masked = mask.maskBRPhone(input.value);
                                                    input.value = masked;
                                                    setValue('celular', masked, { shouldDirty: true });
                                                }}
                                                maxLength={15}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="telefone">Telefone</Label>
                                            <Input
                                                id="telefone"
                                                {...register('telefone')}
                                                placeholder="(00) 0000-0000"
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const input = e.currentTarget;
                                                    const masked = mask.maskBRPhone(input.value);
                                                    input.value = masked;
                                                    setValue('telefone', masked, { shouldDirty: true });
                                                }}
                                                maxLength={15}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Primeira linha: Nome (2/4) | CPF (1/4) | Data de Nascimento (1/4) */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <ReadOnlyField label="Nome *" value={mask.maskPersonName(terapeutaData.nome)} className="md:col-span-2" />
                                        <ReadOnlyField label="CPF *" value={mask.maskCPF(terapeutaData.cpf)} />
                                        <ReadOnlyField
                                            label="Data de nascimento *"
                                            value={formatDate(terapeutaData.dataNascimento)}
                                        />
                                    </div>

                                    {/* Segunda linha: Email | Email Índigo */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <ReadOnlyField label="E-mail *" value={terapeutaData.email} />
                                        <ReadOnlyField
                                            label="E-mail Índigo *"
                                            value={terapeutaData.emailIndigo}
                                        />
                                    </div>

                                    {/* Terceira linha: Celular | Telefone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ReadOnlyField
                                            label="Celular *"
                                            value={mask.maskBRPhone(terapeutaData.celular)}
                                        />
                                        <ReadOnlyField
                                            label="Telefone"
                                            value={mask.maskBRPhone(terapeutaData.telefone)}
                                        />
                                    </div>
                                </>
                            )}

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

                                        {watchPossuiVeiculo?.toLowerCase() === 'sim' && (
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
                                                            className={`bg-white ${placaError ? 'border-red-500' : ''}`}
                                                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                                const input = e.currentTarget;
                                                                const masked = mask.maskPlate(input.value);
                                                                input.value = masked;
                                                                setValue('placaVeiculo', masked, { shouldDirty: true });
                                                                
                                                                // Validação em tempo real
                                                                if (masked.length > 0) {
                                                                    if (mask.isValidPlateBR(masked)) {
                                                                        setPlacaError(null);
                                                                    } else if (masked.length >= 8) {
                                                                        setPlacaError('Placa inválida');
                                                                    }
                                                                } else {
                                                                    setPlacaError(null);
                                                                }
                                                            }}
                                                            maxLength={8}
                                                        />
                                                        {placaError && (
                                                            <p className="text-sm text-red-500 mt-1">{placaError}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="modeloVeiculo">Modelo do Veículo *</Label>
                                                        <Input
                                                            id="modeloVeiculo"
                                                            {...register('modeloVeiculo')}
                                                            placeholder="Ex: Honda Civic 2020"
                                                            className="bg-white"
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
                                                        value={mask.maskPlate(terapeutaData.placaVeiculo || '')}
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
                                <h4 className="text-md font-regular mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Dados para pagamento</h4>
                                
                                {isEditMode ? (
                                    <>
                                        {/* Banco, Agência e Conta - Proporção 4:1:1 */}
                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                            <div className="md:col-span-4">
                                                <Label htmlFor="banco">Banco *</Label>
                                                <Combobox
                                                    options={bankOptions}
                                                    value={watch('banco' as any) || ''}
                                                    onValueChange={(value) => setValue('banco' as any, value, { shouldDirty: true })}
                                                    placeholder={bankPlaceholder}
                                                    searchPlaceholder="Buscar banco..."
                                                    emptyMessage="Nenhum banco encontrado."
                                                    disabled={banksLoading}
                                                />
                                                {banksMessage && (
                                                    <p className="text-xs text-muted-foreground mt-1 truncate">{banksMessage}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="agencia">Agência *</Label>
                                                <Input
                                                    id="agencia"
                                                    {...register('agencia')}
                                                    placeholder="0000"
                                                    className="h-9 rounded-[5px]"
                                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                        const input = e.currentTarget;
                                                        const numbersOnly = input.value.replace(/\D/g, '');
                                                        input.value = numbersOnly;
                                                        setValue('agencia' as any, numbersOnly, { shouldDirty: true });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="conta">Conta *</Label>
                                                <Input
                                                    id="conta"
                                                    {...register('conta')}
                                                    placeholder="00000-0"
                                                    className="h-9 rounded-[5px]"
                                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                        const input = e.currentTarget;
                                                        const numbersOnly = input.value.replace(/\D/g, '');
                                                        input.value = numbersOnly;
                                                        setValue('conta' as any, numbersOnly, { shouldDirty: true });
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Tipo de Chave PIX - Ocupa toda a largura */}
                                        <div className="mt-4">
                                            <Label htmlFor="pixTipo">Tipo de Chave Pix *</Label>
                                            <Tabs
                                                value={pixTipo}
                                                onValueChange={(value: string) => {
                                                    setPixTipo(value);
                                                    setValue('pixTipo' as any, value, { shouldDirty: true });
                                                    setValue('chavePix' as any, '', { shouldDirty: true });
                                                    setChavePixError(null);
                                                }}
                                                className="w-full"
                                            >
                                                <TabsList className="grid w-full rounded-[5px] grid-cols-5">
                                                    <TabsTrigger value="email" className='rounded-[5px]'>E-mail</TabsTrigger>
                                                    <TabsTrigger value="telefone" className='rounded-[5px]'>Telefone</TabsTrigger>
                                                    <TabsTrigger value="cpf" className='rounded-[5px]'>CPF</TabsTrigger>
                                                    <TabsTrigger value="aleatoria" className='rounded-[5px]'>Chave aleatória</TabsTrigger>
                                                    <TabsTrigger value="cnpj" className='rounded-[5px]'>CNPJ</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>

                                        {/* Chave PIX e Valor Hora - Grid 3:1 */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                            <div className="md:col-span-3 space-y-2">
                                                <Label htmlFor="chavePix">Chave Pix *</Label>
                                                <Input
                                                    id="chavePix"
                                                    {...register('chavePix')}
                                                    placeholder={getPixPlaceholder(pixTipo)}
                                                    disabled={!pixTipo}
                                                    className={chavePixError ? 'border-red-500 h-9 rounded-[5px]' : 'h-9 rounded-[5px]'}
                                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                        const input = e.currentTarget;
                                                        const masked = mask.maskPixKey(pixTipo, input.value);
                                                        input.value = masked;
                                                        setValue('chavePix' as any, masked, { shouldDirty: true });
                                                        
                                                        // Validação em tempo real
                                                        if (masked.length > 0) {
                                                            const validation = mask.validatePixKey(pixTipo, masked);
                                                            if (validation.valid) {
                                                                setChavePixError(null);
                                                            } else {
                                                                setChavePixError(validation.message || 'Chave inválida');
                                                            }
                                                        } else {
                                                            setChavePixError(null);
                                                        }
                                                    }}
                                                />
                                                {chavePixError && (
                                                    <p className="text-sm text-red-500 mt-1">{chavePixError}</p>
                                                )}
                                                
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="valorHoraAcordado">Valor hora acordado</Label>
                                                <Input
                                                    id="valorHoraAcordado"
                                                    {...register('valorHoraAcordado')}
                                                    placeholder="R$ 0,00"
                                                    className="h-9 rounded-[5px]"
                                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                        const input = e.currentTarget;
                                                        const masked = mask.maskCurrencyBR(input.value);
                                                        input.value = masked;
                                                        setValue('valorHoraAcordado' as any, masked, { shouldDirty: true });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Linha 1: Banco, Agência, Conta, Tipo de Chave PIX */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <ReadOnlyField label="Banco *" value={terapeutaData.banco} />
                                            <ReadOnlyField
                                                label="Agência *"
                                                value={terapeutaData.agencia}
                                            />
                                            <ReadOnlyField label="Conta *" value={terapeutaData.conta} />
                                            <ReadOnlyField
                                                label="Tipo de Chave PIX"
                                                value={terapeutaData.pixTipo || 'N/A'}
                                            />
                                        </div>
                                        
                                        {/* Linha 2: Chave PIX e Valor hora acordado */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                            <div className="md:col-span-3">
                                                <ReadOnlyField
                                                    label="Chave PIX *"
                                                    value={terapeutaData.chavePix 
                                                        ? mask.maskPixKey(terapeutaData.pixTipo || 'email', terapeutaData.chavePix)
                                                        : 'N/A'
                                                    }
                                                />
                                            </div>
                                            <ReadOnlyField
                                                label="Valor hora acordado"
                                                value={
                                                    terapeutaData.valorHoraAcordado
                                                        ? Number(terapeutaData.valorHoraAcordado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                        : 'Não informado'
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                                )}

                        {/* Seção 2: Endereço (EnderecoStep) */}
                        {currentStep === 2 && (
                        <div>
                            
                            <div className="space-y-4">
                                {isEditMode ? (
                                    <>
                                        {/* Linha 1: CEP, Estado, Cidade */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="cep">CEP *</Label>
                                                <Input
                                                    id="cep"
                                                    {...register('cep')}
                                                    placeholder="00000-000"
                                                    maxLength={9}
                                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                        const input = e.currentTarget;
                                                        const masked = mask.maskCEP(input.value);
                                                        input.value = masked;
                                                        setValue('cep' as any, masked, { shouldDirty: true });
                                                    }}
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
                                            <div>
                                                <Label htmlFor="cidade">Cidade *</Label>
                                                <Input
                                                    id="cidade"
                                                    {...register('cidade')}
                                                    placeholder="Nome da cidade"
                                                />
                                            </div>
                                        </div>

                                        {/* Linha 2: Rua, Número */}
                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                            <div className="md:col-span-5">
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
                                        </div>

                                        {/* Linha 3: Complemento, Bairro */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Linha 1: CEP, Estado, Cidade */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <ReadOnlyField label="CEP *" value={mask.maskCEP(terapeutaData.endereco?.cep || '')} />
                                            <ReadOnlyField
                                                label="Estado *"
                                                value={terapeutaData.endereco?.estado}
                                            />
                                            <ReadOnlyField
                                                label="Cidade *"
                                                value={terapeutaData.endereco?.cidade}
                                            />
                                        </div>

                                        {/* Linha 2: Rua, Número */}
                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                            <ReadOnlyField
                                                label="Rua *"
                                                value={terapeutaData.endereco?.rua}
                                                className="md:col-span-5"
                                            />
                                            <ReadOnlyField
                                                label="Número *"
                                                value={terapeutaData.endereco?.numero}
                                            />
                                        </div>

                                        {/* Linha 3: Complemento, Bairro */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReadOnlyField
                                                label="Complemento"
                                                value={terapeutaData.endereco?.complemento}
                                            />
                                            <ReadOnlyField
                                                label="Bairro *"
                                                value={terapeutaData.endereco?.bairro}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        )}

                        {/* Seção 3: Dados Profissionais (DadosProfissionaisStep) */}
                        {currentStep === 3 && (
                        <div>
                            

                            {isEditMode ? (
                                <div className="space-y-4">
                                    {dadosProfissionaisFields.map((field, index) => (
                                        <div key={field.id} className="bg-muted/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-regular" style={{ fontFamily: 'Sora, sans-serif' }}>Área de Atuação {index + 1}</h4>
                                                {dadosProfissionaisFields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeDadoProfissional(index)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`dadosProfissionais.${index}.areaAtuacao`}>
                                                        Área de atuação *
                                                    </Label>
                                                    <Combobox
                                                        options={areaOptions}
                                                        value={watchDadosProfissionais?.[index]?.areaAtuacaoId ? String(watchDadosProfissionais[index].areaAtuacaoId) : ''}
                                                        onValueChange={(value) => handleAreaAtuacaoSelect(index, value)}
                                                        placeholder="Selecione a área de atuação"
                                                        searchPlaceholder="Buscar área de atuação..."
                                                        emptyMessage="Nenhuma área de atuação encontrada."
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`dadosProfissionais.${index}.cargo`}>
                                                        Cargo *
                                                    </Label>
                                                    <Combobox
                                                        options={cargoOptions}
                                                        value={watchDadosProfissionais?.[index]?.cargoId ? String(watchDadosProfissionais[index].cargoId) : ''}
                                                        onValueChange={(value) => handleCargoSelect(index, value)}
                                                        placeholder="Selecione o cargo"
                                                        searchPlaceholder="Buscar cargo..."
                                                        emptyMessage="Nenhum cargo encontrado."
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`dadosProfissionais.${index}.numeroConselho`}>
                                                        Número do conselho
                                                    </Label>
                                                    <Input
                                                        id={`dadosProfissionais.${index}.numeroConselho`}
                                                        {...register(`dadosProfissionais.${index}.numeroConselho` as any)}
                                                        placeholder="Ex: CRFa 123456"
                                                        className="h-9 rounded-[5px] bg-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => appendDadoProfissional({
                                            areaAtuacao: '',
                                            areaAtuacaoId: null,
                                            cargo: '',
                                            cargoId: null,
                                            numeroConselho: '',
                                        })}
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar Área de Atuação
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Dados profissionais (múltiplas áreas) - Modo visualização */}
                                    {terapeutaData.dadosProfissionais &&
                                        terapeutaData.dadosProfissionais.length > 0 && (
                                            <div className="space-y-4">
                                                {terapeutaData.dadosProfissionais.map((dados, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-muted/30"
                                                    >
                                                        <h4 className="font-regular mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
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
                                </>
                            )}

                            {/* Dados profissionais adicionais */}
                            <div className="mt-6 space-y-4">
                                {isEditMode ? (
                                    <>
                                        {/* Primeira linha: Data início (1/2) | Data fim (1/2) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="dataInicio">Data início *</Label>
                                                <DateField
                                                    value={watchDataInicio || ''}
                                                    onChange={(iso) => setValue('dataInicio', iso)}
                                                    placeholder="dd/mm/aaaa"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="dataFim">Data fim</Label>
                                                <DateField
                                                    value={watchDataFim || ''}
                                                    onChange={(iso) => setValue('dataFim', iso)}
                                                    placeholder="dd/mm/aaaa"
                                                    clearable={true}
                                                />
                                            </div>
                                        </div>

                                        {/* Segunda linha: Professor Uniíndigo (1/2) | Disciplina Uniíndigo (1/2) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="professorUnindigo">Professor Uniindigo *</Label>
                                                <select
                                                    id="professorUnindigo"
                                                    {...register('professorUnindigo')}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="nao">Não</option>
                                                    <option value="sim">Sim</option>
                                                </select>
                                            </div>
                                            {watchProfessorUnindigo?.toLowerCase() === 'sim' && (
                                                <div>
                                                    <Label htmlFor="disciplinaUniindigo">Disciplina Uniindigo</Label>
                                                    <Input
                                                        id="disciplinaUniindigo"
                                                        {...register('disciplinaUniindigo')}
                                                        placeholder="Ex: Análise do Comportamento"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Primeira linha: Data início (1/2) | Data fim (1/2) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReadOnlyField
                                                label="Data início *"
                                                value={formatDate(terapeutaData.dataInicio)}
                                            />
                                            <ReadOnlyField
                                                label="Data fim"
                                                value={formatDate(terapeutaData.dataFim)}
                                            />
                                        </div>

                                        {/* Segunda linha: Professor Uniíndigo (1/2) | Disciplina Uniíndigo (1/2) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReadOnlyField
                                                label="Professor Uniindigo"
                                                value={
                                                    terapeutaData.professorUnindigo?.toLowerCase() === 'sim'
                                                        ? 'Sim'
                                                        : 'Não'
                                                }
                                            />
                                            {terapeutaData.professorUnindigo?.toLowerCase() === 'sim' && (
                                                <ReadOnlyField
                                                    label="Disciplina Uniindigo"
                                                    value={terapeutaData.disciplinaUniindigo || undefined}
                                                />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        )}

                        {/* Seção 4: Formação (FormacaoStep) */}
                        {currentStep === 4 && (
                        <div>
                            
                            {isEditMode ? (
                                <>
                                    {/* Graduação - Campos editáveis */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="formacao.graduacao">Curso de Graduação *</Label>
                                                <Input
                                                    id="formacao.graduacao"
                                                    {...register('formacao.graduacao')}
                                                    placeholder="Ex: Psicologia"
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="formacao.anoFormatura">Ano de Conclusão *</Label>
                                                <Input
                                                    id="formacao.anoFormatura"
                                                    type="number"
                                                    min="1900"
                                                    max={new Date().getFullYear() + 10}
                                                    {...register('formacao.anoFormatura')}
                                                    placeholder="2020"
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="formacao.instituicaoGraduacao">Instituição *</Label>
                                            <Input
                                                id="formacao.instituicaoGraduacao"
                                                {...register('formacao.instituicaoGraduacao')}
                                                placeholder="Ex: Universidade de São Paulo"
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Pós-Graduação - Array dinâmico */}
                                    <div className="space-y-4 mt-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-md font-medium text-primary" style={{ fontFamily: 'Sora, sans-serif' }}>Pós-graduação</h4>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => appendPosGraduacao({
                                                    tipo: 'lato',
                                                    curso: '',
                                                    instituicao: '',
                                                    conclusao: '',
                                                    comprovanteUrl: null,
                                                })}
                                                className="flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" /> Adicionar pós-graduação
                                            </Button>
                                        </div>

                                        {posGraduacoesFields.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                Nenhuma pós-graduação adicionada.
                                            </p>
                                        )}

                                        {posGraduacoesFields.map((field, index) => (
                                            <div key={field.id} className="border rounded-lg p-4 space-y-4 relative bg-muted/30">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="font-medium">Pós-graduação {index + 1}</h5>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removePosGraduacao(index)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`formacao.posGraduacoes.${index}.tipo`}>Tipo *</Label>
                                                        <select
                                                            id={`formacao.posGraduacoes.${index}.tipo`}
                                                            {...register(`formacao.posGraduacoes.${index}.tipo` as any)}
                                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                        >
                                                            <option value="">Selecione</option>
                                                            <option value="lato">Lato Sensu</option>
                                                            <option value="stricto">Stricto Sensu</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`formacao.posGraduacoes.${index}.curso`}>Curso *</Label>
                                                        <Input
                                                            id={`formacao.posGraduacoes.${index}.curso`}
                                                            {...register(`formacao.posGraduacoes.${index}.curso` as any)}
                                                            placeholder="Ex: Especialização em TCC"
                                                            className="bg-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`formacao.posGraduacoes.${index}.instituicao`}>Instituição *</Label>
                                                        <Input
                                                            id={`formacao.posGraduacoes.${index}.instituicao`}
                                                            {...register(`formacao.posGraduacoes.${index}.instituicao` as any)}
                                                            placeholder="Ex: Instituto de Psicologia"
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`formacao.posGraduacoes.${index}.conclusao`}>Conclusão *</Label>
                                                        <DateField
                                                            value={watch(`formacao.posGraduacoes.${index}.conclusao` as any) || ''}
                                                            onChange={(value) => {
                                                                setValue(`formacao.posGraduacoes.${index}.conclusao` as any, value, { shouldDirty: true });
                                                            }}
                                                            placeholder="DD/MM/AAAA"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Participação em Congressos */}
                                    <div className="space-y-4 mt-6">
                                        <h4 className="text-md font-medium text-primary" style={{ fontFamily: 'Sora, sans-serif' }}>Participação em Congressos</h4>
                                        <div className="space-y-2">
                                            <textarea
                                                id="formacao.participacaoCongressosDescricao"
                                                {...register('formacao.participacaoCongressosDescricao')}
                                                className="flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Descreva participações relevantes, datas/eventos"
                                            />
                                        </div>
                                    </div>

                                    {/* Publicações e Livros */}
                                    <div className="space-y-4 mt-6">
                                        <h4 className="text-md font-medium text-primary" style={{ fontFamily: 'Sora, sans-serif' }}>Publicações e Livros</h4>
                                        <div className="space-y-2">
                                            <textarea
                                                id="formacao.publicacoesLivrosDescricao"
                                                {...register('formacao.publicacoesLivrosDescricao')}
                                                className="flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Liste publicações, livros, veículos/ano"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Modo leitura - Graduação */}
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
                                </>
                            )}
                        </div>
                        )}

                        {/* Seção 5: Arquivos (ArquivosStep) */}
                        {currentStep === 5 && (
                        <div>
                        
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
                                        fullName={therapist.nome}
                                        birthDate={therapist.pessoa?.dataNascimento}
                                        onUploadSuccess={loadFiles}
                                        onDeleteSuccess={loadFiles}
                                    />
                                )
                            ) : (
                                <DocumentsTable ownerType="terapeuta" ownerId={therapist.id} />
                            )}
                        </div>
                        )}

                        {/* Seção 6: Dados CNPJ */}
                        {currentStep === 6 && (
                        <div>

                            {isEditMode ? (
                                <>
                                    <div className="bg-muted/50 p-4 rounded-lg mb-6">
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Se você possui CNPJ para exercer a atividade profissional, marque "Possuo CNPJ" e preencha os dados abaixo.
                                        </p>

                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="temCNPJ"
                                                    checked={!temCNPJ}
                                                    onChange={() => setTemCNPJ(false)}
                                                    className="text-primary"
                                                />
                                                <span className="text-sm">Não possuo CNPJ</span>
                                            </label>

                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="temCNPJ"
                                                    checked={temCNPJ}
                                                    onChange={() => setTemCNPJ(true)}
                                                    className="text-primary"
                                                />
                                                <span className="text-sm">Possuo CNPJ</span>
                                            </label>
                                        </div>
                                    </div>

                                    {temCNPJ && (
                                        <div className="space-y-6">
                                            {/* Dados básicos do CNPJ */}
                                            <div className="space-y-4">
                                                <h4 className="text-md font-medium text-primary" style={{ fontFamily: 'Sora, sans-serif' }}>Dados da Empresa</h4>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cnpj.numero">CNPJ</Label>
                                                        <Input
                                                            id="cnpj.numero"
                                                            {...register('cnpj.numero' as any)}
                                                            placeholder="00.000.000/0000-00"
                                                            className={cnpjError ? 'bg-white border-red-500' : 'bg-white'}
                                                            maxLength={18}
                                                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                                const input = e.currentTarget;
                                                                const masked = mask.maskCNPJ(input.value);
                                                                input.value = masked;
                                                                setValue('cnpj.numero' as any, masked, { shouldDirty: true });
                                                                
                                                                // Validação em tempo real
                                                                if (masked.length === 18) {
                                                                    const isValid = mask.isValidCNPJ(masked);
                                                                    if (isValid) {
                                                                        setCnpjError(null);
                                                                    } else {
                                                                        setCnpjError('CNPJ inválido');
                                                                    }
                                                                } else if (masked.length > 0) {
                                                                    setCnpjError('CNPJ incompleto');
                                                                } else {
                                                                    setCnpjError(null);
                                                                }
                                                            }}
                                                        />
                                                        {cnpjError && (
                                                            <p className="text-sm text-red-500 mt-1">{cnpjError}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2 md:col-span-3">
                                                        <Label htmlFor="cnpj.razaoSocial">Razão Social</Label>
                                                        <Input
                                                            id="cnpj.razaoSocial"
                                                            {...register('cnpj.razaoSocial' as any)}
                                                            placeholder="Nome da empresa conforme registro"
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Endereço do CNPJ */}
                                            <div className="space-y-4">
                                                <h4 className="text-md font-regular text-primary" style={{ fontFamily: 'Sora, sans-serif' }}>Endereço da Empresa</h4>

                                                {/* Linha 1: CEP, Cidade, Estado */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cnpj.endereco.cep">CEP</Label>
                                                        <Input
                                                            id="cnpj.endereco.cep"
                                                            {...register('cnpj.endereco.cep' as any)}
                                                            placeholder="00000-000"
                                                            className="bg-white"
                                                            maxLength={9}
                                                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                                const input = e.currentTarget;
                                                                const masked = mask.maskCEP(input.value);
                                                                input.value = masked;
                                                                setValue('cnpj.endereco.cep' as any, masked, { shouldDirty: true });
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cnpj.endereco.cidade">Cidade</Label>
                                                        <Input
                                                            id="cnpj.endereco.cidade"
                                                            {...register('cnpj.endereco.cidade' as any)}
                                                            placeholder="Nome da cidade"
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cnpj.endereco.estado">Estado</Label>
                                                        <select
                                                            id="cnpj.endereco.estado"
                                                            {...register('cnpj.endereco.estado' as any)}
                                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <option value="">Selecione o estado</option>
                                                            <option value="AC">Acre</option>
                                                            <option value="AL">Alagoas</option>
                                                            <option value="AP">Amapá</option>
                                                            <option value="AM">Amazonas</option>
                                                            <option value="BA">Bahia</option>
                                                            <option value="CE">Ceará</option>
                                                            <option value="DF">Distrito Federal</option>
                                                            <option value="ES">Espírito Santo</option>
                                                            <option value="GO">Goiás</option>
                                                            <option value="MA">Maranhão</option>
                                                            <option value="MT">Mato Grosso</option>
                                                            <option value="MS">Mato Grosso do Sul</option>
                                                            <option value="MG">Minas Gerais</option>
                                                            <option value="PA">Pará</option>
                                                            <option value="PB">Paraíba</option>
                                                            <option value="PR">Paraná</option>
                                                            <option value="PE">Pernambuco</option>
                                                            <option value="PI">Piauí</option>
                                                            <option value="RJ">Rio de Janeiro</option>
                                                            <option value="RN">Rio Grande do Norte</option>
                                                            <option value="RS">Rio Grande do Sul</option>
                                                            <option value="RO">Rondônia</option>
                                                            <option value="RR">Roraima</option>
                                                            <option value="SC">Santa Catarina</option>
                                                            <option value="SP">São Paulo</option>
                                                            <option value="SE">Sergipe</option>
                                                            <option value="TO">Tocantins</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Linha 2: Rua, Número */}
                                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                                    <div className="space-y-2 md:col-span-5">
                                                        <Label htmlFor="cnpj.endereco.rua">Rua</Label>
                                                        <Input
                                                            id="cnpj.endereco.rua"
                                                            {...register('cnpj.endereco.rua' as any)}
                                                            placeholder="Nome da rua"
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cnpj.endereco.numero">Número</Label>
                                                        <Input
                                                            id="cnpj.endereco.numero"
                                                            {...register('cnpj.endereco.numero' as any)}
                                                            placeholder="123"
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Linha 3: Bairro, Complemento */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cnpj.endereco.bairro">Bairro</Label>
                                                        <Input
                                                            id="cnpj.endereco.bairro"
                                                            {...register('cnpj.endereco.bairro' as any)}
                                                            placeholder="Nome do bairro"
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cnpj.endereco.complemento">Complemento</Label>
                                                        <Input
                                                            id="cnpj.endereco.complemento"
                                                            {...register('cnpj.endereco.complemento' as any)}
                                                            placeholder="Sala, Andar..."
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {terapeutaData.cnpj?.numero ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <ReadOnlyField
                                                    label="CNPJ"
                                                    value={mask.maskCNPJ(terapeutaData.cnpj.numero || '')}
                                                />
                                                <ReadOnlyField
                                                    label="Razão Social"
                                                    value={terapeutaData.cnpj.razaoSocial}
                                                    className="md:col-span-3"
                                                />
                                            </div>

                                            {/* Endereço da empresa */}
                                            <div className="mt-4 space-y-4">
                                                <h4 className="font-regular mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Endereço da Empresa</h4>
                                                
                                                {/* Linha 1: CEP, Cidade, Estado */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <ReadOnlyField
                                                        label="CEP"
                                                        value={mask.maskCEP(terapeutaData.cnpj.endereco?.cep || '')}
                                                    />
                                                    <ReadOnlyField
                                                        label="Cidade"
                                                        value={terapeutaData.cnpj.endereco?.cidade}
                                                    />
                                                    <ReadOnlyField
                                                        label="Estado"
                                                        value={terapeutaData.cnpj.endereco?.estado}
                                                    />
                                                </div>

                                                {/* Linha 2: Rua, Número */}
                                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                                    <ReadOnlyField
                                                        label="Rua"
                                                        value={terapeutaData.cnpj.endereco?.rua}
                                                        className="md:col-span-5"
                                                    />
                                                    <ReadOnlyField
                                                        label="Número"
                                                        value={terapeutaData.cnpj.endereco?.numero}
                                                    />
                                                </div>

                                                {/* Linha 3: Bairro, Complemento */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <ReadOnlyField
                                                        label="Bairro"
                                                        value={terapeutaData.cnpj.endereco?.bairro}
                                                    />
                                                    <ReadOnlyField
                                                        label="Complemento"
                                                        value={terapeutaData.cnpj.endereco?.complemento}
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
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Nenhum CNPJ cadastrado</p>
                                    )}
                                </>
                            )}
                        </div>
                        )}

                        {/* Espaço extra para garantir scroll completo */}
                        <div className="h-4"></div>
                            </div>

                    {/* Action Buttons (Edit Mode) - Sticky Footer */}
                    {isEditMode && (
                        <div className="border-t p-4 bg-background flex justify-end gap-3 shrink-0">
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
            </SheetContent>
        </Sheet>
    );
}
