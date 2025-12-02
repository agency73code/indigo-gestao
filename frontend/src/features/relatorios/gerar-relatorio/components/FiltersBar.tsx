import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { DateField } from '@/common/components/layout/DateField';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import type { Filters } from '../types';
import SearchableSelect from './SearchableSelect';
import { fetchAndSet } from '../utils/fetchAndSet';
import type { AreaType } from '@/contexts/AreaContext';

interface FiltersBarProps {
    value: Filters;
    onChange: (filters: Filters) => void;
    area?: AreaType | null;
}

export function FiltersBar({ value, onChange, area }: FiltersBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [terapeutas, setTerapeutas] = useState<{ id: string; nome: string }[]>([]);
    const [programas, setProgramas] = useState<{ id: string; nome: string }[]>([]);
    const [estimulos, setEstimulos] = useState<{ id: string; nome: string }[]>([]);
    useEffect(() => {
        fetchAndSet('/api/terapeutas/relatorio', setTerapeutas, 'terapeutas');
    }, []);

    useEffect(() => {
        if (value.pacienteId && area) {
            fetchAndSet(
                `/api/ocp/reports/filters/programs?clientId=${value.pacienteId}&area=${encodeURIComponent(area)}`,
                setProgramas,
                'programas'
            );
        } else {
            setProgramas([]);
        }
    }, [value.pacienteId, area]);

    useEffect(() => {
        if (value.pacienteId && area) {
            const url = `/api/ocp/reports/filters/stimulus?clientId=${value.pacienteId}${value.programaId ? `&programaId=${value.programaId}` : ''}&area=${area}`;
            fetchAndSet(url, setEstimulos, 'estimulos');
        }
    }, [value.pacienteId, value.programaId, area]);

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
                        className="md:hidden no-print"
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <Label htmlFor="programa">Programa / objetivo</Label>
                        <SearchableSelect
                            value={value.programaId || ''}
                            options={programas.map((p) => ({
                                id: p.id,
                                nome: p.nome,
                            }))}
                            placeholder="Todos os programas"
                            emptyMessage="Nenhum programa encontrado"
                            onSelect={(id) => updateFilter('programaId', id)}
                        />
                    </div>

                    {/* Estímulo */}
                    <div className="space-y-2">
                        <Label htmlFor="estimulo">Estímulo</Label>
                        <SearchableSelect
                            value={value.estimuloId || ''}
                            options={estimulos.map((e) => ({
                                id: e.id,
                                nome: e.nome,
                            }))}
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
                            options={terapeutas.map((t) => ({
                                id: t.id,
                                nome: t.nome,
                            }))}
                            placeholder="Todos os terapeutas"
                            emptyMessage="Nenhum terapeuta encontrado"
                            onSelect={(id) => updateFilter('terapeutaId', id)}
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
            </CardContent>
        </Card>
    );
}
