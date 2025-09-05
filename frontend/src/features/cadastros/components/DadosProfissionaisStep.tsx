import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import type { Terapeuta } from '../types/cadastros.types';

interface DadosProfissionaisStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: string | string[]) => void;
    errors: Record<string, string>;
}

const AREAS_ATUACAO = [
    'Psicologia Clínica',
    'Psicologia Organizacional',
    'Psicologia Escolar/Educacional',
    'Psicologia do Esporte',
    'Psicologia Hospitalar',
    'Psicologia Jurídica',
    'Psicologia Social',
    'Neuropsicologia',
    'Psicologia do Trânsito',
    'Outras',
];

const CARGOS = [
    'Psicólogo Clínico',
    'Psicólogo Organizacional',
    'Psicólogo Escolar',
    'Psicólogo Hospitalar',
    'Neuropsicólogo',
    'Coordenador de Psicologia',
    'Supervisor de Psicologia',
    'Outro',
];

export default function DadosProfissionaisStep({
    data,
    onUpdate,
    errors,
}: DadosProfissionaisStepProps) {
    const handleAreaAtuacaoChange = (area: string, checked: boolean) => {
        const areasAtuais = data.areasAtuacao || [];
        if (checked) {
            onUpdate('areasAtuacao', [...areasAtuais, area]);
        } else {
            onUpdate(
                'areasAtuacao',
                areasAtuais.filter((a: string) => a !== area),
            );
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Dados Profissionais</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe os dados profissionais do terapeuta. Campos marcados com * são
                    obrigatórios.
                </p>
            </div>

            {/* Área de Atuação */}
            <div className="space-y-4">
                <Label>Área de Atuação *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {AREAS_ATUACAO.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                            <Checkbox
                                id={`area-${area}`}
                                checked={(data.areasAtuacao || []).includes(area)}
                                onCheckedChange={(checked: boolean) =>
                                    handleAreaAtuacaoChange(area, checked)
                                }
                                className={errors.areasAtuacao ? 'border-destructive' : ''}
                            />
                            <Label
                                htmlFor={`area-${area}`}
                                className="text-sm font-normal cursor-pointer"
                            >
                                {area}
                            </Label>
                        </div>
                    ))}
                </div>
                {errors.areasAtuacao && (
                    <p className="text-sm text-destructive">{errors.areasAtuacao}</p>
                )}
            </div>

            {/* Cargo */}
            <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <select
                    id="cargo"
                    value={data.cargo || ''}
                    onChange={(e) => onUpdate('cargo', e.target.value)}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.cargo ? 'border-destructive' : ''
                    }`}
                >
                    <option value="">Selecione o cargo</option>
                    {CARGOS.map((cargo) => (
                        <option key={cargo} value={cargo}>
                            {cargo}
                        </option>
                    ))}
                </select>
                {errors.cargo && <p className="text-sm text-destructive">{errors.cargo}</p>}
            </div>

            {/* Número do Conselho */}
            <div className="space-y-2">
                <Label htmlFor="numeroConselho">Número do Conselho</Label>
                <Input
                    id="numeroConselho"
                    value={data.numeroConselho || ''}
                    onChange={(e) => onUpdate('numeroConselho', e.target.value)}
                    placeholder="Ex: CRP 06/123456"
                    className={errors.numeroConselho ? 'border-destructive' : ''}
                />
                {errors.numeroConselho && (
                    <p className="text-sm text-destructive">{errors.numeroConselho}</p>
                )}
            </div>

            {/* Número do Convênio */}
            <div className="space-y-2">
                <Label htmlFor="numeroConvenio">Número do Convênio</Label>
                <Input
                    id="numeroConvenio"
                    value={data.numeroConvenio || ''}
                    onChange={(e) => onUpdate('numeroConvenio', e.target.value)}
                    placeholder="Digite o número do convênio"
                    className={errors.numeroConvenio ? 'border-destructive' : ''}
                />
                {errors.numeroConvenio && (
                    <p className="text-sm text-destructive">{errors.numeroConvenio}</p>
                )}
            </div>

            {/* Data de Entrada e Data de Saída */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dataEntrada">Data de Entrada *</Label>
                    <Input
                        id="dataEntrada"
                        type="date"
                        value={data.dataEntrada || ''}
                        onChange={(e) => onUpdate('dataEntrada', e.target.value)}
                        className={errors.dataEntrada ? 'border-destructive' : ''}
                    />
                    {errors.dataEntrada && (
                        <p className="text-sm text-destructive">{errors.dataEntrada}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dataSaida">Data de Saída</Label>
                    <Input
                        id="dataSaida"
                        type="date"
                        value={data.dataSaida || ''}
                        onChange={(e) => onUpdate('dataSaida', e.target.value)}
                        className={errors.dataSaida ? 'border-destructive' : ''}
                    />
                    {errors.dataSaida && (
                        <p className="text-sm text-destructive">{errors.dataSaida}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
