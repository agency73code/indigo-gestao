import { InputField } from '@/ui/input-field';
import AutoExpandTextarea from '../../ui/AutoExpandTextarea';
import NumberSpinner from '../../ui/NumberSpinner';
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

// Componente para marco motor com meses + checkbox "Não realiza" + checkbox "Não soube informar"
function MarcoMotorField({
    label,
    meses,
    naoRealiza,
    naoSoubeInformar,
    onMesesChange,
    onOptionChange,
}: {
    label: string;
    meses: string;
    naoRealiza: boolean;
    naoSoubeInformar: boolean;
    onMesesChange: (value: string) => void;
    onOptionChange: (naoRealiza: boolean, naoSoubeInformar: boolean) => void;
}) {
    const handleNaoRealizaClick = () => {
        const newValue = !naoRealiza;
        onOptionChange(newValue, newValue ? false : naoSoubeInformar);
    };

    const handleNaoSoubeInformarClick = () => {
        const newValue = !naoSoubeInformar;
        onOptionChange(newValue ? false : naoRealiza, newValue);
    };

    return (
        <div className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-foreground flex-1">{label} <span className="text-red-500">*</span></span>
            <NumberSpinner
                value={meses}
                onChange={(v) => {
                    onMesesChange(v);
                    onOptionChange(false, false);
                }}
                disabled={naoRealiza || naoSoubeInformar}
                placeholder="0"
                suffix="meses."
                min={0}
                max={120}
            />
            <button
                type="button"
                onClick={handleNaoRealizaClick}
                className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    naoRealiza 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300 hover:border-gray-400'
                }`}>
                    {naoRealiza && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
                <span className="text-sm text-muted-foreground">Não realiza</span>
            </button>
            <button
                type="button"
                onClick={handleNaoSoubeInformarClick}
                className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    naoSoubeInformar 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300 hover:border-gray-400'
                }`}>
                    {naoSoubeInformar && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
                <span className="text-sm text-muted-foreground">Não soube informar</span>
            </button>
        </div>
    );
}

// Componente para marco de fala com meses + checkbox "Não" + checkbox "Não soube informar"
function MarcoFalaField({
    label,
    meses,
    nao,
    naoSoubeInformar,
    onMesesChange,
    onOptionChange,
}: {
    label: string;
    meses: string;
    nao: boolean;
    naoSoubeInformar: boolean;
    onMesesChange: (value: string) => void;
    onOptionChange: (nao: boolean, naoSoubeInformar: boolean) => void;
}) {
    const handleNaoClick = () => {
        const newValue = !nao;
        onOptionChange(newValue, newValue ? false : naoSoubeInformar);
    };

    const handleNaoSoubeInformarClick = () => {
        const newValue = !naoSoubeInformar;
        onOptionChange(newValue ? false : nao, newValue);
    };

    return (
        <div className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-foreground flex-1">{label} <span className="text-red-500">*</span></span>
            <NumberSpinner
                value={meses}
                onChange={(v) => {
                    onMesesChange(v);
                    onOptionChange(false, false);
                }}
                disabled={nao || naoSoubeInformar}
                placeholder="0"
                suffix="meses."
                min={0}
                max={120}
            />
            <button
                type="button"
                onClick={handleNaoClick}
                className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    nao 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300 hover:border-gray-400'
                }`}>
                    {nao && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
                <span className="text-sm text-muted-foreground">Não realiza</span>
            </button>
            <button
                type="button"
                onClick={handleNaoSoubeInformarClick}
                className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    naoSoubeInformar 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300 hover:border-gray-400'
                }`}>
                    {naoSoubeInformar && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
                <span className="text-sm text-muted-foreground">Não soube informar</span>
            </button>
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
                semanas: data.gestacaoParto?.semanas ?? null,
                apgar1min: data.gestacaoParto?.apgar1min ?? null,
                apgar5min: data.gestacaoParto?.apgar5min ?? null,
                intercorrencias: data.gestacaoParto?.intercorrencias ?? '',
                [field]: value,
            },
        });
    };

    const updateNeuropsicomotor = (field: string, value: unknown) => {
        const defaultMarco = { meses: '', naoRealiza: false, naoSoubeInformar: false };
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
        const defaultMarcoFala = { meses: '', nao: false, naoSoubeInformar: false };
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
                otiteVezes: data.falaLinguagem?.otiteVezes ?? null,
                otitePeriodoMeses: data.falaLinguagem?.otitePeriodoMeses ?? null,
                otiteFrequencia: data.falaLinguagem?.otiteFrequencia ?? '',
                fazOuFezUsoTuboVentilacao: data.falaLinguagem?.fazOuFezUsoTuboVentilacao ?? null,
                tuboVentilacaoObservacao: data.falaLinguagem?.tuboVentilacaoObservacao ?? '',
                fazOuFezUsoObjetoOral: data.falaLinguagem?.fazOuFezUsoObjetoOral ?? null,
                objetoOralEspecificar: data.falaLinguagem?.objetoOralEspecificar ?? '',
                usaMamadeira: data.falaLinguagem?.usaMamadeira ?? null,
                mamadeiraHa: data.falaLinguagem?.mamadeiraHa ?? '',
                mamadeiraVezesAoDia: data.falaLinguagem?.mamadeiraVezesAoDia ?? null,
                comunicacaoAtual: data.falaLinguagem?.comunicacaoAtual ?? '',
                ...data.falaLinguagem,
                [field]: value,
            },
        });
    };

    const updateMarcoNeuropsicomotor = (marco: string, value: string) => {
        const currentMarco = data.neuropsicomotor?.[marco as keyof typeof data.neuropsicomotor] as { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean } | undefined;
        updateNeuropsicomotor(marco, {
            meses: value,
            naoRealiza: currentMarco?.naoRealiza ?? false,
            naoSoubeInformar: currentMarco?.naoSoubeInformar ?? false,
        });
    };

    const updateMarcoNeuropsicomotorOptions = (marco: string, naoRealiza: boolean, naoSoubeInformar: boolean) => {
        const currentMarco = data.neuropsicomotor?.[marco as keyof typeof data.neuropsicomotor] as { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean } | undefined;
        updateNeuropsicomotor(marco, {
            meses: currentMarco?.meses ?? '',
            naoRealiza,
            naoSoubeInformar,
        });
    };

    const updateMarcoFala = (marco: string, value: string) => {
        const currentMarco = data.falaLinguagem?.[marco as keyof typeof data.falaLinguagem] as { meses: string; nao: boolean; naoSoubeInformar: boolean } | undefined;
        updateFalaLinguagem(marco, {
            meses: value,
            nao: currentMarco?.nao ?? false,
            naoSoubeInformar: currentMarco?.naoSoubeInformar ?? false,
        });
    };

    const updateMarcoFalaOptions = (marco: string, nao: boolean, naoSoubeInformar: boolean) => {
        const currentMarco = data.falaLinguagem?.[marco as keyof typeof data.falaLinguagem] as { meses: string; nao: boolean; naoSoubeInformar: boolean } | undefined;
        updateFalaLinguagem(marco, {
            meses: currentMarco?.meses ?? '',
            nao,
            naoSoubeInformar,
        });
    };

    return (
        <div className="space-y-4">
            {/* 10. Gestação e Parto */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">10. Gestação e Parto <span className="text-red-500">*</span></h3>
                
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                        label="Semanas *"
                        placeholder="Ex: 38"
                        type="number"
                        value={data.gestacaoParto?.semanas ?? ''}
                        onChange={(e) => updateGestacaoParto('semanas', e.target.value ? Number(e.target.value) : null)}
                    />
                    <InputField
                        label="Apgar 1º minuto *"
                        placeholder="Ex: 9"
                        type="number"
                        value={data.gestacaoParto?.apgar1min ?? ''}
                        onChange={(e) => updateGestacaoParto('apgar1min', e.target.value ? Number(e.target.value) : null)}
                    />
                    <InputField
                        label="Apgar 5º minuto *"
                        placeholder="Ex: 10"
                        type="number"
                        value={data.gestacaoParto?.apgar5min ?? ''}
                        onChange={(e) => updateGestacaoParto('apgar5min', e.target.value ? Number(e.target.value) : null)}
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
                <h3 className="text-sm font-medium">11. Desenvolvimento Neuropsicomotor <span className="text-red-500">*</span></h3>
                
                <div className="space-y-1">
                    <MarcoMotorField
                        label="Sustentou a cabeça com aproximadamente"
                        meses={data.neuropsicomotor?.sustentouCabeca?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.sustentouCabeca?.naoRealiza ?? false}
                        naoSoubeInformar={data.neuropsicomotor?.sustentouCabeca?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('sustentouCabeca', v)}
                        onOptionChange={(nr, nsi) => updateMarcoNeuropsicomotorOptions('sustentouCabeca', nr, nsi)}
                    />
                    <MarcoMotorField
                        label="Rolou com aproximadamente"
                        meses={data.neuropsicomotor?.rolou?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.rolou?.naoRealiza ?? false}
                        naoSoubeInformar={data.neuropsicomotor?.rolou?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('rolou', v)}
                        onOptionChange={(nr, nsi) => updateMarcoNeuropsicomotorOptions('rolou', nr, nsi)}
                    />
                    <MarcoMotorField
                        label="Sentou com aproximadamente"
                        meses={data.neuropsicomotor?.sentou?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.sentou?.naoRealiza ?? false}
                        naoSoubeInformar={data.neuropsicomotor?.sentou?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('sentou', v)}
                        onOptionChange={(nr, nsi) => updateMarcoNeuropsicomotorOptions('sentou', nr, nsi)}
                    />
                    <MarcoMotorField
                        label="Engatinhou com aproximadamente"
                        meses={data.neuropsicomotor?.engatinhou?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.engatinhou?.naoRealiza ?? false}
                        naoSoubeInformar={data.neuropsicomotor?.engatinhou?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('engatinhou', v)}
                        onOptionChange={(nr, nsi) => updateMarcoNeuropsicomotorOptions('engatinhou', nr, nsi)}
                    />
                    <MarcoMotorField
                        label="Andou com apoio com aproximadamente"
                        meses={data.neuropsicomotor?.andouComApoio?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.andouComApoio?.naoRealiza ?? false}
                        naoSoubeInformar={data.neuropsicomotor?.andouComApoio?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('andouComApoio', v)}
                        onOptionChange={(nr, nsi) => updateMarcoNeuropsicomotorOptions('andouComApoio', nr, nsi)}
                    />
                    <MarcoMotorField
                        label="Andou sem apoio com aproximadamente"
                        meses={data.neuropsicomotor?.andouSemApoio?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.andouSemApoio?.naoRealiza ?? false}
                        naoSoubeInformar={data.neuropsicomotor?.andouSemApoio?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('andouSemApoio', v)}
                        onOptionChange={(nr, nsi) => updateMarcoNeuropsicomotorOptions('andouSemApoio', nr, nsi)}
                    />
                    <MarcoMotorField
                        label="Correu com aproximadamente"
                        meses={data.neuropsicomotor?.correu?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.correu?.naoRealiza ?? false}
                        naoSoubeInformar={data.neuropsicomotor?.correu?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('correu', v)}
                        onOptionChange={(nr, nsi) => updateMarcoNeuropsicomotorOptions('correu', nr, nsi)}
                    />
                    <MarcoMotorField
                        label="Andou de motoca com aproximadamente"
                        meses={data.neuropsicomotor?.andouDeMotoca?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.andouDeMotoca?.naoRealiza ?? false}
                        naoSoubeInformar={data.neuropsicomotor?.andouDeMotoca?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('andouDeMotoca', v)}
                        onOptionChange={(nr, nsi) => updateMarcoNeuropsicomotorOptions('andouDeMotoca', nr, nsi)}
                    />
                    <MarcoMotorField
                        label="Andou de bicicleta com aproximadamente"
                        meses={data.neuropsicomotor?.andouDeBicicleta?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.andouDeBicicleta?.naoRealiza ?? false}
                        naoSoubeInformar={data.neuropsicomotor?.andouDeBicicleta?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('andouDeBicicleta', v)}
                        onOptionChange={(nr, nsi) => updateMarcoNeuropsicomotorOptions('andouDeBicicleta', nr, nsi)}
                    />
                    <MarcoMotorField
                        label="Subiu escadas sozinho com aproximadamente"
                        meses={data.neuropsicomotor?.subiuEscadasSozinho?.meses ?? ''}
                        naoRealiza={data.neuropsicomotor?.subiuEscadasSozinho?.naoRealiza ?? false}
                        naoSoubeInformar={data.neuropsicomotor?.subiuEscadasSozinho?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoNeuropsicomotor('subiuEscadasSozinho', v)}
                        onOptionChange={(nr, nsi) => updateMarcoNeuropsicomotorOptions('subiuEscadasSozinho', nr, nsi)}
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
                <h3 className="text-sm font-medium">12. Desenvolvimento da Fala e da Linguagem <span className="text-red-500">*</span></h3>
                
                <div className="space-y-1">
                    <MarcoFalaField
                        label="Balbuciou com aproximadamente"
                        meses={data.falaLinguagem?.balbuciou?.meses ?? ''}
                        nao={data.falaLinguagem?.balbuciou?.nao ?? false}
                        naoSoubeInformar={data.falaLinguagem?.balbuciou?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoFala('balbuciou', v)}
                        onOptionChange={(n, nsi) => updateMarcoFalaOptions('balbuciou', n, nsi)}
                    />
                    <MarcoFalaField
                        label="Primeiras palavras com aproximadamente"
                        meses={data.falaLinguagem?.primeirasPalavras?.meses ?? ''}
                        nao={data.falaLinguagem?.primeirasPalavras?.nao ?? false}
                        naoSoubeInformar={data.falaLinguagem?.primeirasPalavras?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoFala('primeirasPalavras', v)}
                        onOptionChange={(n, nsi) => updateMarcoFalaOptions('primeirasPalavras', n, nsi)}
                    />
                    <MarcoFalaField
                        label="Primeiras frases com aproximadamente"
                        meses={data.falaLinguagem?.primeirasFrases?.meses ?? ''}
                        nao={data.falaLinguagem?.primeirasFrases?.nao ?? false}
                        naoSoubeInformar={data.falaLinguagem?.primeirasFrases?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoFala('primeirasFrases', v)}
                        onOptionChange={(n, nsi) => updateMarcoFalaOptions('primeirasFrases', n, nsi)}
                    />
                    <MarcoFalaField
                        label="Apontou para fazer pedidos com aproximadamente"
                        meses={data.falaLinguagem?.apontouParaFazerPedidos?.meses ?? ''}
                        nao={data.falaLinguagem?.apontouParaFazerPedidos?.nao ?? false}
                        naoSoubeInformar={data.falaLinguagem?.apontouParaFazerPedidos?.naoSoubeInformar ?? false}
                        onMesesChange={(v) => updateMarcoFala('apontouParaFazerPedidos', v)}
                        onOptionChange={(n, nsi) => updateMarcoFalaOptions('apontouParaFazerPedidos', n, nsi)}
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

                {/* Comunicação Atual - movido para depois de Faz uso de gestos */}
                <div className="pt-4 border-t">
                    <AutoExpandTextarea
                        label="Comunicação atual"
                        placeholder="Descreva como é a comunicação atual da criança"
                        value={data.falaLinguagem?.comunicacaoAtual ?? ''}
                        onChange={(value) => updateFalaLinguagem('comunicacaoAtual', value)}
                    />
                </div>

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
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <InputField
                                label="Quantas vezes?"
                                placeholder="Ex: 5"
                                type="number"
                                value={data.falaLinguagem?.otiteVezes ?? ''}
                                onChange={(e) => updateFalaLinguagem('otiteVezes', e.target.value ? Number(e.target.value) : null)}
                            />
                            <InputField
                                label="Por um período de quantos meses?"
                                placeholder="Ex: 12"
                                type="number"
                                value={data.falaLinguagem?.otitePeriodoMeses ?? ''}
                                onChange={(e) => updateFalaLinguagem('otitePeriodoMeses', e.target.value ? Number(e.target.value) : null)}
                            />
                            <InputField
                                label="Frequência"
                                placeholder="Ex: Mensal"
                                value={data.falaLinguagem?.otiteFrequencia ?? ''}
                                onChange={(e) => updateFalaLinguagem('otiteFrequencia', e.target.value)}
                            />
                        </div>
                    )}
                    <SimNaoField
                        label="Faz ou fez uso de tubo de ventilação?"
                        value={data.falaLinguagem?.fazOuFezUsoTuboVentilacao ?? null}
                        onChange={(v) => updateFalaLinguagem('fazOuFezUsoTuboVentilacao', v)}
                    />
                    {data.falaLinguagem?.fazOuFezUsoTuboVentilacao === 'sim' && (
                        <InputField
                            label="Se sim, descreva"
                            placeholder="Descreva o uso do tubo de ventilação"
                            value={data.falaLinguagem?.tuboVentilacaoObservacao ?? ''}
                            onChange={(e) => updateFalaLinguagem('tuboVentilacaoObservacao', e.target.value)}
                        />
                    )}
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
                                type="number"
                                value={data.falaLinguagem?.mamadeiraVezesAoDia ?? ''}
                                onChange={(e) => updateFalaLinguagem('mamadeiraVezesAoDia', e.target.value ? Number(e.target.value) : null)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
