import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DateField } from '@/common/components/layout/DateField';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import type { Filters } from '../types';
import SearchableSelect from './SearchableSelect';
import { fetchAndSet } from '../utils/fetchAndSet';

interface FiltersBarProps {
    value: Filters;
    onChange: (filters: Filters) => void;
}

export function FiltersBar({ value, onChange }: FiltersBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [terapeutas, setTerapeutas] = useState<{ id: string; nome: string }[]>([
        // mock inicial
        { id: "ter-1", nome: "Dr. Ana Silva" },
        { id: "ter-2", nome: "Dr. Carlos Mendes" },
    ]);
    const [pacientes, setPacientes] = useState<{ id: string; nome: string }[]>([
        { id: "pac-1", nome: "João Silva" },
        { id: "pac-2", nome: "Maria Santos" },
        { id: "pac-3", nome: "Pedro Oliveira" },
    ]);
    const [programas, setProgramas] = useState<{ id: string; nome: string }[]>([
        { id: "prog-1", nome: "Desenvolvimento Cognitivo" },
        { id: "prog-2", nome: "Habilidades Sociais" },
        { id: "prog-3", nome: "Comunicação" },
    ]);
    const [estimulos, setEstimulos] = useState<{ id: string; nome: string }[]>([
        { id: "est-1", nome: "Contar até 10" },
        { id: "est-2", nome: "Identificar cores" },
        { id: "est-3", nome: "Formar palavras" },
    ]);

    useEffect(() => {
        fetchAndSet("/api/terapeutas/relatorio", setTerapeutas, "terapeutas");
        fetchAndSet("/api/clientes/relatorios", setPacientes, "pacientes");
        fetchAndSet("/api/ocp/reports/filters/programs", setProgramas, "programas");
        fetchAndSet("/api/ocp/reports/filters/stimulus", setEstimulos, "estimulos");
    }, []);

    const updateFilter = (key: keyof Filters, newValue: any) => {
        onChange({ ...value, [key]: newValue });
    };

    const updatePeriodo = (key: keyof Filters['periodo'], newValue: any) => {
        onChange({
            ...value,
            periodo: { ...value.periodo, [key]: newValue },
        });
    };

    return (
        <Card className="px-1 py-0 md:px-8 md:py-10 lg:px-0 lg:py-0">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="md:hidden"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className={`space-y-4 ${!isExpanded ? 'hidden md:block' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Paciente */}
                    <div className="space-y-2">
                        <Label htmlFor="paciente">Paciente *</Label>
                        <SearchableSelect
                            value={value.pacienteId || ''}
                            options={[
                                { id: 'pac-1', nome: 'João Silva' },
                                { id: 'pac-2', nome: 'Maria Santos' },
                                { id: 'pac-3', nome: 'Pedro Oliveira' },
                            ]}
                            placeholder="Selecione o paciente"
                            emptyMessage="Nenhum paciente encontrado"
                            onSelect={(id) => updateFilter('pacienteId', id)}
                        />
                    </div>

                    {/* Período */}
                    <div className="space-y-2">
                        <Label htmlFor="periodo">Período</Label>
                        <select
                            id="periodo"
                            value={value.periodo.mode}
                            onChange={(e) => updatePeriodo('mode', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="30d">Últimos 30 dias</option>
                            <option value="90d">Últimos 90 dias</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>

                    {/* Programa */}
                    <div className="space-y-2">
                        <Label htmlFor="programa">Programa (OCP)</Label>
                        <SearchableSelect
                            value={value.programaId || ''}
                            options={[
                                { id: 'prog-1', nome: 'Desenvolvimento Cognitivo' },
                                { id: 'prog-2', nome: 'Habilidades Sociais' },
                                { id: 'prog-3', nome: 'Comunicação' },
                            ]}
                            placeholder="Todos os programas"
                            emptyMessage="Nenhum programa encontrado"
                            onSelect={(id) => updateFilter('programaId', id)}
                        />
                    </div>
                </div>

                {/* Período customizado */}
                {value.periodo.mode === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                        <div className="space-y-2">
                            <Label htmlFor="dataInicio">Data início</Label>
                            <DateField
                                value={value.periodo.start || ''}
                                onChange={(iso) => updatePeriodo('start', iso)}
                                placeholder="Selecione a data início"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataFim">Data fim</Label>
                            <DateField
                                value={value.periodo.end || ''}
                                onChange={(iso) => updatePeriodo('end', iso)}
                                placeholder="Selecione a data fim"
                                minDate={
                                    value.periodo.start ? new Date(value.periodo.start) : undefined
                                }
                            />
                        </div>
                    </div>
                )}

                {/* Filtros adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t">
                    {/* Estímulo */}
                    <div className="space-y-2">
                        <Label htmlFor="estimulo">Estímulo</Label>
                        <SearchableSelect
                            value={value.estimuloId || ''}
                            options={[
                                { id: 'est-1', nome: 'Contar até 10' },
                                { id: 'est-2', nome: 'Identificar cores' },
                                { id: 'est-3', nome: 'Formar palavras' },
                            ]}
                            placeholder="Todos os estímulos"
                            emptyMessage="Nenhum estímulo encontrado"
                            onSelect={(id) => updateFilter('estimuloId', id)}
                        />
                    </div>

                    {/* Terapeuta */}
                    <div className="space-y-2">
                        <Label htmlFor="terapeuta">Terapeuta</Label>
                        <SearchableSelect
                            value={value.terapeutaId || ''}
                            options={[
                                { id: 'ter-1', nome: 'Dr. Ana Silva' },
                                { id: 'ter-2', nome: 'Dr. Carlos Mendes' },
                            ]}
                            placeholder="Todos os terapeutas"
                            emptyMessage="Nenhum terapeuta encontrado"
                            onSelect={(id) => updateFilter('terapeutaId', id)}
                        />
                    </div>

                    {/* Comparar */}
                    <div className="space-y-2">
                        <Label htmlFor="comparar">Comparar com período anterior</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="comparar"
                                checked={value.comparar || false}
                                onCheckedChange={(checked) => updateFilter('comparar', !!checked)}
                            />
                            <span className="text-sm text-muted-foreground">
                                {value.comparar ? 'Ativado' : 'Desativado'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
