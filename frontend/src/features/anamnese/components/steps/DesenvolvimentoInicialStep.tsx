import { InputField } from '@/ui/input-field';
import { Checkbox } from '@/components/ui/checkbox';
import AutoExpandTextarea from '../ui/AutoExpandTextarea';
import NumberSpinner from '../ui/NumberSpinner';
import type { AnamneseDesenvolvimentoInicial, SimNao } from '../../types/anamnese.types';

interface DesenvolvimentoInicialStepProps {
    data: Partial<AnamneseDesenvolvimentoInicial>;
    onChange: (data: Partial<AnamneseDesenvolvimentoInicial>) => void;
}

// Componente auxiliar para campo Sim/Não
function SimNaoField({ 
    label, 
    value, 
    onChange 
}: { 
    label: string; 
    value: SimNao; 
    onChange: (value: SimNao) => void;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-foreground">{label}</span>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={label}
                        checked={value === 'sim'}
                        onChange={() => onChange('sim')}
                        className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={label}
                        checked={value === 'nao'}
                        onChange={() => onChange('nao')}
                        className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">Não</span>
                </label>
            </div>
        </div>
    );
}

// Componente para marco motor com meses + checkbox "Não realiza"
function MarcoMotorField({
    label,
    meses,
    naoRealiza,
    onMesesChange,
    onNaoRealizaChange,
}: {
    label: string;
    meses: string;
    naoRealiza: boolean;
    onMesesChange: (value: string) => void;
    onNaoRealizaChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-foreground flex-1">{label}</span>
            <NumberSpinner
                value={meses}
                onChange={onMesesChange}
                disabled={naoRealiza}
                placeholder="0"
                suffix="meses."
                min={0}
                max={120}
            />
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                <Checkbox
                    checked={naoRealiza}
                    onCheckedChange={(checked) => onNaoRealizaChange(checked === true)}
                />
                <span className="text-sm text-muted-foreground">Não realiza até o momento</span>
            </label>
        </div>
    );
}

// Componente para marco de fala com meses + checkbox "Não"
function MarcoFalaField({
    label,
    meses,
    nao,
    onMesesChange,
    onNaoChange,
}: {
    label: string;
    meses: string;
    nao: boolean;
    onMesesChange: (value: string) => void;
    onNaoChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-foreground flex-1">{label}</span>
            <NumberSpinner
                value={meses}
                onChange={onMesesChange}
                disabled={nao}
                placeholder="0"
                suffix="meses."
                min={0}
                max={120}
            />
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                <Checkbox
                    checked={nao}
                    onCheckedChange={(checked) => onNaoChange(checked === true)}
                />
                <span className="text-sm text-muted-foreground">Não</span>
            </label>
        </div>
    );
}

export default function DesenvolvimentoInicialStep({ data, onChange }: DesenvolvimentoInicialStepProps) {
    // Helpers para atualizar dados aninhados
    const updateGestacaoParto = (field: string, value: unknown) => {
        onChange({
            ...data,
            gestacaoParto: {
                ...data.gestacaoParto,
                tipoParto: data.gestacaoParto?.tipoParto ?? null,
                semanas: data.gestacaoParto?.semanas ?? '',
                apgar: data.gestacaoParto?.apgar ?? '',
                intercorrencias: data.gestacaoParto?.intercorrencias ?? '',
                [field]: value,
            },
        });
    };

    const updateNeuropsicomotor = (field: string, value: unknown) => {
        const defaultMarco = { meses: '', naoRealiza: false };
        onChange({
            ...data,
            neuropsicomotor: {
                sustentouCabeca: data.neuropsicomotor?.sustentouCabeca ?? defaultMarco,
                rolou: data.neuropsicomotor?.rolou ?? defaultMarco,
                sentou: data.neuropsicomotor?.sentou ?? defaultMarco,
                engatinhou: data.neuropsicomotor?.engatinhou ?? defaultMarco,
                andouComApoio: data.neuropsicomotor?.andouComApoio ?? defaultMarco,
                andouSemApoio: data.neuropsicomotor?.andouSemApoio ?? defaultMarco,
                correu: data.neuropsicomotor?.correu ?? defaultMarco,
                andouDeMotoca: data.neuropsicomotor?.andouDeMotoca ?? defaultMarco,
                andouDeBicicleta: data.neuropsicomotor?.andouDeBicicleta ?? defaultMarco,
                subiuEscadasSozinho: data.neuropsicomotor?.subiuEscadasSozinho ?? defaultMarco,
                motricidadeFina: data.neuropsicomotor?.motricidadeFina ?? '',
                ...data.neuropsicomotor,
                [field]: value,
            },
        });
    };

    const updateFalaLinguagem = (field: string, value: unknown) => {
        const defaultMarcoFala = { meses: '', nao: false };
        onChange({
            ...data,
            falaLinguagem: {
                balbuciou: data.falaLinguagem?.balbuciou ?? defaultMarcoFala,
                primeirasPalavras: data.falaLinguagem?.primeirasPalavras ?? defaultMarcoFala,
                primeirasFrases: data.falaLinguagem?.primeirasFrases ?? defaultMarcoFala,
                apontouParaFazerPedidos: data.falaLinguagem?.apontouParaFazerPedidos ?? defaultMarcoFala,
                fazUsoDeGestos: data.falaLinguagem?.fazUsoDeGestos ?? null,
                fazUsoDeGestosQuais: data.falaLinguagem?.fazUsoDeGestosQuais ?? '',
                audicao: data.falaLinguagem?.audicao ?? null,
                teveOtiteDeRepeticao: data.falaLinguagem?.teveOtiteDeRepeticao ?? null,
                otiteVezes: data.falaLinguagem?.otiteVezes ?? '',
                otitePeriodoMeses: data.falaLinguagem?.otitePeriodoMeses ?? '',
                fazOuFezUsoTuboVentilacao: data.falaLinguagem?.fazOuFezUsoTuboVentilacao ?? null,
                fazOuFezUsoObjetoOral: data.falaLinguagem?.fazOuFezUsoObjetoOral ?? null,
                objetoOralEspecificar: data.falaLinguagem?.objetoOralEspecificar ?? '',
                usaMamadeira: data.falaLinguagem?.usaMamadeira ?? null,
                mamadeiraHa: data.falaLinguagem?.mamadeiraHa ?? '',
                mamadeiraVezesAoDia: data.falaLinguagem?.mamadeiraVezesAoDia ?? '',
                comunicacaoAtual: data.falaLinguagem?.comunicacaoAtual ?? '',
                ...data.falaLinguagem,
                [field]: value,
            },
        });
    };

    const updateMarcoNeuropsicomotor = (marco: string, field: 'meses' | 'naoRealiza', value: string | boolean) => {
        const currentMarco = data.neuropsicomotor?.[marco as keyof typeof data.neuropsicomotor] as { meses: string; naoRealiza: boolean } | undefined;
        updateNeuropsicomotor(marco, {
            meses: currentMarco?.meses ?? '',
            naoRealiza: currentMarco?.naoRealiza ?? false,
            [field]: value,
        });
    };

    const updateMarcoFala = (marco: string, field: 'meses' | 'nao', value: string | boolean) => {
        const currentMarco = data.falaLinguagem?.[marco as keyof typeof data.falaLinguagem] as { meses: string; nao: boolean } | undefined;
        updateFalaLinguagem(marco, {
            meses: currentMarco?.meses ?? '',
            nao: currentMarco?.nao ?? false,
            [field]: value,
        });
    };

    return (
        <div className="space-y-4">
            {/* 10. Gestação e Parto */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">10. Gestação e Parto</h3>
                
                {/* Tipo de Parto */}
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="tipoParto"
                            checked={data.gestacaoParto?.tipoParto === 'cesarea'}
                            onChange={() => updateGestacaoParto('tipoParto', 'cesarea')}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Parto Cesárea</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="tipoParto"
                            checked={data.gestacaoParto?.tipoParto === 'natural'}
                            onChange={() => updateGestacaoParto('tipoParto', 'natural')}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Parto Natural</span>
                    </label>
                </div>

                {/* Semanas e Apgar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Semanas"
                        placeholder="Ex: 38"
                        value={data.gestacaoParto?.semanas ?? ''}
                        onChange={(e) => updateGestacaoParto('semanas', e.target.value)}
                    />
                    <InputField
                        label="Apgar"
                        placeholder="Ex: 9/10"
                        value={data.gestacaoParto?.apgar ?? ''}
                        onChange={(e) => updateGestacaoParto('apgar', e.target.value)}
                    />
                </div>

                {/* Intercorrências */}
                <AutoExpandTextarea
                    label="Intercorrências na gestação e/ou no parto"
                    description="(Foi planejada? Desejada? Tomou alguma medicação durante a gestação? Fez algum tratamento durante a gestação? Passou por algum estresse importante? Adoeceu em algum momento da gestação?)"
                    placeholder="Sua resposta"
                    value={data.gestacaoParto?.intercorrencias ?? ''}
                    onChange={(value) => updateGestacaoParto('intercorrencias', value)}
                />
            </div>

            {/* 11. Desenvolvimento Neuropsicomotor */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">11. Desenvolvimento Neuropsicomotor</h3>
                
                <div className="space-y-1">
                    <MarcoMotorField
                        label="Sustentou a cabeça com aproximadamente"
                        meses={data.neuropsicomotor?.sustentouCabeca?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.sustentouCabeca?.naoRealiza ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('sustentouCabeca', 'meses', v)}
                        onNaoRealizaChange={(v) => updateMarcoNeuropsicomotor('sustentouCabeca', 'naoRealiza', v)}
                    />
                    <MarcoMotorField
                        label="Rolou com aproximadamente"
                        meses={data.neuropsicomotor?.rolou?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.rolou?.naoRealiza ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('rolou', 'meses', v)}
                        onNaoRealizaChange={(v) => updateMarcoNeuropsicomotor('rolou', 'naoRealiza', v)}
                    />
                    <MarcoMotorField
                        label="Sentou com aproximadamente"
                        meses={data.neuropsicomotor?.sentou?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.sentou?.naoRealiza ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('sentou', 'meses', v)}
                        onNaoRealizaChange={(v) => updateMarcoNeuropsicomotor('sentou', 'naoRealiza', v)}
                    />
                    <MarcoMotorField
                        label="Engatinhou com aproximadamente"
                        meses={data.neuropsicomotor?.engatinhou?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.engatinhou?.naoRealiza ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('engatinhou', 'meses', v)}
                        onNaoRealizaChange={(v) => updateMarcoNeuropsicomotor('engatinhou', 'naoRealiza', v)}
                    />
                    <MarcoMotorField
                        label="Andou com apoio com aproximadamente"
                        meses={data.neuropsicomotor?.andouComApoio?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.andouComApoio?.naoRealiza ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('andouComApoio', 'meses', v)}
                        onNaoRealizaChange={(v) => updateMarcoNeuropsicomotor('andouComApoio', 'naoRealiza', v)}
                    />
                    <MarcoMotorField
                        label="Andou sem apoio com aproximadamente"
                        meses={data.neuropsicomotor?.andouSemApoio?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.andouSemApoio?.naoRealiza ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('andouSemApoio', 'meses', v)}
                        onNaoRealizaChange={(v) => updateMarcoNeuropsicomotor('andouSemApoio', 'naoRealiza', v)}
                    />
                    <MarcoMotorField
                        label="Correu com aproximadamente"
                        meses={data.neuropsicomotor?.correu?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.correu?.naoRealiza ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('correu', 'meses', v)}
                        onNaoRealizaChange={(v) => updateMarcoNeuropsicomotor('correu', 'naoRealiza', v)}
                    />
                    <MarcoMotorField
                        label="Andou de motoca com aproximadamente"
                        meses={data.neuropsicomotor?.andouDeMotoca?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.andouDeMotoca?.naoRealiza ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('andouDeMotoca', 'meses', v)}
                        onNaoRealizaChange={(v) => updateMarcoNeuropsicomotor('andouDeMotoca', 'naoRealiza', v)}
                    />
                    <MarcoMotorField
                        label="Andou de bicicleta com aproximadamente"
                        meses={data.neuropsicomotor?.andouDeBicicleta?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.andouDeBicicleta?.naoRealiza ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('andouDeBicicleta', 'meses', v)}
                        onNaoRealizaChange={(v) => updateMarcoNeuropsicomotor('andouDeBicicleta', 'naoRealiza', v)}
                    />
                    <MarcoMotorField
                        label="Subiu escadas sozinho com aproximadamente"
                        meses={data.neuropsicomotor?.subiuEscadasSozinho?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.subiuEscadasSozinho?.naoRealiza ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('subiuEscadasSozinho', 'meses', v)}
                        onNaoRealizaChange={(v) => updateMarcoNeuropsicomotor('subiuEscadasSozinho', 'naoRealiza', v)}
                    />
                </div>

                <AutoExpandTextarea
                    label="Desenvolvimento da motricidade fina"
                    description="(Pega e manuseia peças pequenas, talheres, itens de uso diário, etc)"
                    placeholder="Sua resposta"
                    value={data.neuropsicomotor?.motricidadeFina ?? ''}
                    onChange={(value) => updateNeuropsicomotor('motricidadeFina', value)}
                />
            </div>

            {/* 12. Desenvolvimento da Fala e da Linguagem */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">12. Desenvolvimento da Fala e da Linguagem</h3>
                
                <div className="space-y-1">
                    <MarcoFalaField
                        label="Balbuciou com aproximadamente"
                        meses={data.falaLinguagem?.balbuciou?.meses ?? ''}
                        nao={data.falaLinguagem?.balbuciou?.nao ?? false}
                        onMesesChange={(v) => updateMarcoFala('balbuciou', 'meses', v)}
                        onNaoChange={(v) => updateMarcoFala('balbuciou', 'nao', v)}
                    />
                    <MarcoFalaField
                        label="Primeiras palavras com aproximadamente"
                        meses={data.falaLinguagem?.primeirasPalavras?.meses ?? ''}
                        nao={data.falaLinguagem?.primeirasPalavras?.nao ?? false}
                        onMesesChange={(v) => updateMarcoFala('primeirasPalavras', 'meses', v)}
                        onNaoChange={(v) => updateMarcoFala('primeirasPalavras', 'nao', v)}
                    />
                    <MarcoFalaField
                        label="Primeiras frases com aproximadamente"
                        meses={data.falaLinguagem?.primeirasFrases?.meses ?? ''}
                        nao={data.falaLinguagem?.primeirasFrases?.nao ?? false}
                        onMesesChange={(v) => updateMarcoFala('primeirasFrases', 'meses', v)}
                        onNaoChange={(v) => updateMarcoFala('primeirasFrases', 'nao', v)}
                    />
                    <MarcoFalaField
                        label="Apontou para fazer pedidos com aproximadamente"
                        meses={data.falaLinguagem?.apontouParaFazerPedidos?.meses ?? ''}
                        nao={data.falaLinguagem?.apontouParaFazerPedidos?.nao ?? false}
                        onMesesChange={(v) => updateMarcoFala('apontouParaFazerPedidos', 'meses', v)}
                        onNaoChange={(v) => updateMarcoFala('apontouParaFazerPedidos', 'nao', v)}
                    />
                </div>

                <SimNaoField
                    label="Faz uso de gestos para se comunicar?"
                    value={data.falaLinguagem?.fazUsoDeGestos ?? null}
                    onChange={(v) => updateFalaLinguagem('fazUsoDeGestos', v)}
                />
                {data.falaLinguagem?.fazUsoDeGestos === 'sim' && (
                    <InputField
                        label="Se sim, quais?"
                        placeholder="Descreva os gestos utilizados"
                        value={data.falaLinguagem?.fazUsoDeGestosQuais ?? ''}
                        onChange={(e) => updateFalaLinguagem('fazUsoDeGestosQuais', e.target.value)}
                    />
                )}

                {/* Audição */}
                <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Audição (percepção do responsável)</h4>
                    <div className="flex items-center gap-6 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="audicao"
                                checked={data.falaLinguagem?.audicao === 'boa'}
                                onChange={() => updateFalaLinguagem('audicao', 'boa')}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Boa</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="audicao"
                                checked={data.falaLinguagem?.audicao === 'ruim'}
                                onChange={() => updateFalaLinguagem('audicao', 'ruim')}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Ruim</span>
                        </label>
                    </div>

                    <SimNaoField
                        label="Teve otite de repetição?"
                        value={data.falaLinguagem?.teveOtiteDeRepeticao ?? null}
                        onChange={(v) => updateFalaLinguagem('teveOtiteDeRepeticao', v)}
                    />
                    {data.falaLinguagem?.teveOtiteDeRepeticao === 'sim' && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <InputField
                                label="Quantas vezes?"
                                placeholder="Ex: 5"
                                value={data.falaLinguagem?.otiteVezes ?? ''}
                                onChange={(e) => updateFalaLinguagem('otiteVezes', e.target.value)}
                            />
                            <InputField
                                label="Por um período de quantos meses?"
                                placeholder="Ex: 12"
                                value={data.falaLinguagem?.otitePeriodoMeses ?? ''}
                                onChange={(e) => updateFalaLinguagem('otitePeriodoMeses', e.target.value)}
                            />
                        </div>
                    )}
                    <SimNaoField
                        label="Faz ou fez uso de tubo de ventilação?"
                        value={data.falaLinguagem?.fazOuFezUsoTuboVentilacao ?? null}
                        onChange={(v) => updateFalaLinguagem('fazOuFezUsoTuboVentilacao', v)}
                    />
                </div>

                {/* Hábitos Orais */}
                <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Hábitos orais</h4>
                    
                    <SimNaoField
                        label="Faz ou fez uso de algum objeto oral? (chupeta, paninho e/ou dedo)"
                        value={data.falaLinguagem?.fazOuFezUsoObjetoOral ?? null}
                        onChange={(v) => updateFalaLinguagem('fazOuFezUsoObjetoOral', v)}
                    />
                    {data.falaLinguagem?.fazOuFezUsoObjetoOral === 'sim' && (
                        <InputField
                            label="Se sim, especifique (manhã, tarde e/ou noite)"
                            placeholder="Descreva"
                            value={data.falaLinguagem?.objetoOralEspecificar ?? ''}
                            onChange={(e) => updateFalaLinguagem('objetoOralEspecificar', e.target.value)}
                        />
                    )}
                    
                    <SimNaoField
                        label="Usa mamadeira?"
                        value={data.falaLinguagem?.usaMamadeira ?? null}
                        onChange={(v) => updateFalaLinguagem('usaMamadeira', v)}
                    />
                    {data.falaLinguagem?.usaMamadeira === 'sim' && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <InputField
                                label="Há quantos anos/meses?"
                                placeholder="Ex: 2 anos"
                                value={data.falaLinguagem?.mamadeiraHa ?? ''}
                                onChange={(e) => updateFalaLinguagem('mamadeiraHa', e.target.value)}
                            />
                            <InputField
                                label="Quantas vezes ao dia?"
                                placeholder="Ex: 3"
                                value={data.falaLinguagem?.mamadeiraVezesAoDia ?? ''}
                                onChange={(e) => updateFalaLinguagem('mamadeiraVezesAoDia', e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Comunicação Atual */}
                <div className="pt-4 border-t">
                    <AutoExpandTextarea
                        label="Comunicação atual"
                        placeholder="Descreva como é a comunicação atual da criança"
                        value={data.falaLinguagem?.comunicacaoAtual ?? ''}
                        onChange={(value) => updateFalaLinguagem('comunicacaoAtual', value)}
                    />
                </div>
            </div>
        </div>
    );
}
