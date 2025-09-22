import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import type { Filters } from '../types';

interface FiltersBarProps {
    value: Filters;
    onChange: (filters: Filters) => void;
}

export function FiltersBar({ value, onChange }: FiltersBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

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
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
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
                        <select
                            id="paciente"
                            value={value.pacienteId || ''}
                            onChange={(e) => updateFilter('pacienteId', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Selecione o paciente</option>
                            <option value="pac-1">João Silva</option>
                            <option value="pac-2">Maria Santos</option>
                            <option value="pac-3">Pedro Oliveira</option>
                        </select>
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
                        <select
                            id="programa"
                            value={value.programaId || ''}
                            onChange={(e) => updateFilter('programaId', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Todos os programas</option>
                            <option value="prog-1">Desenvolvimento Cognitivo</option>
                            <option value="prog-2">Habilidades Sociais</option>
                            <option value="prog-3">Comunicação</option>
                        </select>
                    </div>
                </div>

                {/* Período customizado */}
                {value.periodo.mode === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                        <div className="space-y-2">
                            <Label htmlFor="dataInicio">Data início</Label>
                            <Input
                                id="dataInicio"
                                type="date"
                                value={value.periodo.start || ''}
                                onChange={(e) => updatePeriodo('start', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataFim">Data fim</Label>
                            <Input
                                id="dataFim"
                                type="date"
                                value={value.periodo.end || ''}
                                onChange={(e) => updatePeriodo('end', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Filtros adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t">
                    {/* Estímulo */}
                    <div className="space-y-2">
                        <Label htmlFor="estimulo">Estímulo</Label>
                        <select
                            id="estimulo"
                            value={value.estimuloId || ''}
                            onChange={(e) => updateFilter('estimuloId', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Todos os estímulos</option>
                            <option value="est-1">Contar até 10</option>
                            <option value="est-2">Identificar cores</option>
                            <option value="est-3">Formar palavras</option>
                        </select>
                    </div>

                    {/* Terapeuta */}
                    <div className="space-y-2">
                        <Label htmlFor="terapeuta">Terapeuta</Label>
                        <select
                            id="terapeuta"
                            value={value.terapeutaId || ''}
                            onChange={(e) => updateFilter('terapeutaId', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Todos os terapeutas</option>
                            <option value="ter-1">Dr. Ana Silva</option>
                            <option value="ter-2">Dr. Carlos Mendes</option>
                        </select>
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
