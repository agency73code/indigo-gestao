/**
 * RegistrarLancamentoPage
 * 
 * Página para registrar um novo lançamento de horas.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';

import { 
    TIPO_ATIVIDADE_LABELS,
    type TipoAtividade,
    type ClienteOption,
} from '../types';
import { 
    createLancamento, 
    updateLancamento,
    getLancamento,
    listClientes,
    getTerapeutaLogado,
} from '../services/faturamento.service';

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export function RegistrarLancamentoPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setPageTitle } = usePageTitle();

    const editarId = searchParams.get('editar');
    const isEditing = !!editarId;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    const [clientes, setClientes] = useState<ClienteOption[]>([]);
    const [loadingClientes, setLoadingClientes] = useState(true);
    const [terapeutaId, setTerapeutaId] = useState<string>('');

    // Form state
    const [formData, setFormData] = useState({
        clienteId: '',
        data: new Date().toISOString().split('T')[0],
        horarioInicio: '',
        horarioFim: '',
        tipoAtividade: '',
        isHomecare: false,
        observacoes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setPageTitle(isEditing ? 'Editar Lançamento' : 'Registrar Lançamento');
    }, [setPageTitle, isEditing]);

    // Carregar terapeuta logado
    useEffect(() => {
        getTerapeutaLogado()
            .then(terapeuta => setTerapeutaId(terapeuta.id))
            .catch(console.error);
    }, []);

    // Carregar clientes
    useEffect(() => {
        const loadClientes = async () => {
            try {
                const data = await listClientes();
                setClientes(data);
            } catch (error) {
                console.error('Erro ao carregar clientes:', error);
                toast.error('Erro ao carregar lista de clientes');
            } finally {
                setLoadingClientes(false);
            }
        };
        loadClientes();
    }, []);

    // Carregar dados para edição
    useEffect(() => {
        if (!editarId) return;

        const loadLancamento = async () => {
            try {
                const lancamento = await getLancamento(editarId);
                if (lancamento) {
                    setFormData({
                        clienteId: lancamento.clienteId,
                        data: lancamento.data,
                        horarioInicio: lancamento.horarioInicio,
                        horarioFim: lancamento.horarioFim,
                        tipoAtividade: lancamento.tipoAtividade,
                        isHomecare: lancamento.isHomecare,
                        observacoes: lancamento.observacoes || '',
                    });
                }
            } catch (error) {
                console.error('Erro ao carregar lançamento:', error);
                toast.error('Erro ao carregar lançamento para edição');
                navigate('/app/faturamento/minhas-horas');
            } finally {
                setLoadingData(false);
            }
        };
        loadLancamento();
    }, [editarId, navigate]);

    const tipoAtividadeOptions = useMemo(() => {
        return Object.entries(TIPO_ATIVIDADE_LABELS).map(([value, label]) => ({
            value,
            label,
        }));
    }, []);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpar erro do campo
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.clienteId) newErrors.clienteId = 'Selecione um cliente';
        if (!formData.data) newErrors.data = 'Informe a data';
        if (!formData.horarioInicio) newErrors.horarioInicio = 'Informe o horário de início';
        if (!formData.horarioFim) newErrors.horarioFim = 'Informe o horário de término';
        if (!formData.tipoAtividade) newErrors.tipoAtividade = 'Selecione o tipo de atividade';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;
        if (!terapeutaId) {
            toast.error('Erro: terapeuta não identificado');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                clienteId: formData.clienteId,
                data: formData.data,
                horarioInicio: formData.horarioInicio,
                horarioFim: formData.horarioFim,
                tipoAtividade: formData.tipoAtividade as TipoAtividade,
                isHomecare: formData.isHomecare,
                observacoes: formData.observacoes || undefined,
            };

            if (isEditing && editarId) {
                await updateLancamento(editarId, payload);
                toast.success('Lançamento atualizado com sucesso!');
            } else {
                await createLancamento(payload, terapeutaId);
                toast.success('Lançamento registrado com sucesso!');
            }
            
            navigate('/app/faturamento/minhas-horas');
        } catch (error) {
            console.error('Erro ao salvar lançamento:', error);
            toast.error(isEditing ? 'Erro ao atualizar lançamento' : 'Erro ao registrar lançamento');
        } finally {
            setLoading(false);
        }
    }, [formData, isEditing, editarId, navigate, terapeutaId]);

    const handleVoltar = () => {
        navigate(-1);
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleVoltar}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-medium" style={{ fontFamily: 'Sora, sans-serif' }}>
                        {isEditing ? 'Editar Lançamento' : 'Registrar Lançamento'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isEditing ? 'Atualize as informações do lançamento' : 'Preencha os dados para registrar suas horas'}
                    </p>
                </div>
            </div>

            {/* Formulário */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Informações do Lançamento</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Cliente */}
                        <div className="space-y-2">
                            <Label htmlFor="clienteId">Cliente *</Label>
                            <Select 
                                value={formData.clienteId}
                                onValueChange={(value) => handleChange('clienteId', value)}
                                disabled={loadingClientes}
                            >
                                <SelectTrigger id="clienteId">
                                    <SelectValue placeholder={loadingClientes ? 'Carregando...' : 'Selecione o cliente'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes.map((cliente) => (
                                        <SelectItem key={cliente.id} value={cliente.id}>
                                            {cliente.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.clienteId && <p className="text-sm text-destructive">{errors.clienteId}</p>}
                        </div>

                        {/* Tipo de Atividade */}
                        <div className="space-y-2">
                            <Label htmlFor="tipoAtividade">Tipo de Atividade *</Label>
                            <Select 
                                value={formData.tipoAtividade}
                                onValueChange={(value) => handleChange('tipoAtividade', value)}
                            >
                                <SelectTrigger id="tipoAtividade">
                                    <SelectValue placeholder="Selecione o tipo de atividade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tipoAtividadeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tipoAtividade && <p className="text-sm text-destructive">{errors.tipoAtividade}</p>}
                        </div>

                        {/* Data */}
                        <div className="space-y-2">
                            <Label htmlFor="data">Data *</Label>
                            <Input 
                                id="data"
                                type="date" 
                                value={formData.data}
                                onChange={(e) => handleChange('data', e.target.value)}
                            />
                            {errors.data && <p className="text-sm text-destructive">{errors.data}</p>}
                        </div>

                        {/* Horários */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="horarioInicio">Horário Início *</Label>
                                <Input 
                                    id="horarioInicio"
                                    type="time" 
                                    value={formData.horarioInicio}
                                    onChange={(e) => handleChange('horarioInicio', e.target.value)}
                                />
                                {errors.horarioInicio && <p className="text-sm text-destructive">{errors.horarioInicio}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="horarioFim">Horário Fim *</Label>
                                <Input 
                                    id="horarioFim"
                                    type="time" 
                                    value={formData.horarioFim}
                                    onChange={(e) => handleChange('horarioFim', e.target.value)}
                                />
                                {errors.horarioFim && <p className="text-sm text-destructive">{errors.horarioFim}</p>}
                            </div>
                        </div>

                        {/* Homecare */}
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Atendimento Homecare</Label>
                                <p className="text-sm text-muted-foreground">
                                    Marque se o atendimento foi realizado no domicílio do cliente
                                </p>
                            </div>
                            <Switch
                                checked={formData.isHomecare}
                                onCheckedChange={(checked) => handleChange('isHomecare', checked)}
                            />
                        </div>

                        {/* Observações */}
                        <div className="space-y-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea 
                                id="observacoes"
                                placeholder="Adicione observações sobre o atendimento (opcional)"
                                className="resize-none"
                                rows={4}
                                value={formData.observacoes}
                                onChange={(e) => handleChange('observacoes', e.target.value)}
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={handleVoltar}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="gap-2">
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {isEditing ? 'Salvar Alterações' : 'Registrar Lançamento'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default RegistrarLancamentoPage;
