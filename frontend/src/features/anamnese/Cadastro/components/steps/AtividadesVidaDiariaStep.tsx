import { Checkbox } from '@/components/ui/checkbox';
import { InputField } from '@/ui/input-field';
import AutoExpandTextarea from '../../ui/AutoExpandTextarea';
import NumberSpinner from '../../ui/NumberSpinner';
import type { AnamneseAtividadesVidaDiaria, SimNao, SimNaoComAjuda } from '../../types/anamnese.types';

interface AtividadesVidaDiariaStepProps {
    data: Partial<AnamneseAtividadesVidaDiaria>;
    onChange: (data: Partial<AnamneseAtividadesVidaDiaria>) => void;
}

// Componente auxiliar para campo Sim/Não
function SimNaoField({ 
    label, 
    value, 
    onChange,
    required = true 
}: { 
    label: string; 
    value: SimNao; 
    onChange: (value: SimNao) => void;
    required?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-foreground flex-1">{label} {required && <span className="text-red-500">*</span>}</span>
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

// Componente para campo Sim/Não/Com ajuda
function SimNaoComAjudaField({ 
    label, 
    value, 
    onChange 
}: { 
    label: string; 
    value: SimNaoComAjuda; 
    onChange: (value: SimNaoComAjuda) => void;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-foreground flex-1">{label} <span className="text-red-500">*</span></span>
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
                        checked={value === 'com_ajuda'}
                        onChange={() => onChange('com_ajuda')}
                        className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">Com ajuda</span>
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

// Componente para campo de desfralde
function DesfraldeField({
    label,
    anos,
    meses,
    utilizaFralda,
    onAnosChange,
    onMesesChange,
    onUtilizaFraldaChange,
}: {
    label: string;
    anos: string;
    meses: string;
    utilizaFralda: boolean;
    onAnosChange: (value: string) => void;
    onMesesChange: (value: string) => void;
    onUtilizaFraldaChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-foreground flex-1">{label} <span className="text-red-500">*</span></span>
            <div className="flex items-center gap-2 shrink-0">
                <NumberSpinner
                    value={anos}
                    onChange={onAnosChange}
                    disabled={utilizaFralda}
                    placeholder="0"
                    suffix="anos"
                    min={0}
                    max={18}
                />
                <NumberSpinner
                    value={meses}
                    onChange={onMesesChange}
                    disabled={utilizaFralda}
                    placeholder="0"
                    suffix="meses."
                    min={0}
                    max={11}
                />
            </div>
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0">
                <Checkbox
                    checked={utilizaFralda}
                    onCheckedChange={(checked) => onUtilizaFraldaChange(checked === true)}
                />
                <span className="text-sm text-muted-foreground">Utiliza fralda</span>
            </label>
        </div>
    );
}

export default function AtividadesVidaDiariaStep({ data, onChange }: AtividadesVidaDiariaStepProps) {
    // Helpers para atualizar dados aninhados
    const updateDesfralde = (field: string, value: unknown) => {
        const defaultDesfralde = { anos: '', meses: '', utilizaFralda: false };
        onChange({
            ...data,
            desfralde: {
                desfraldeDiurnoUrina: data.desfralde?.desfraldeDiurnoUrina ?? defaultDesfralde,
                desfraldeNoturnoUrina: data.desfralde?.desfraldeNoturnoUrina ?? defaultDesfralde,
                desfraldeFezes: data.desfralde?.desfraldeFezes ?? defaultDesfralde,
                seLimpaSozinhoUrinar: data.desfralde?.seLimpaSozinhoUrinar ?? null,
                seLimpaSozinhoDefecar: data.desfralde?.seLimpaSozinhoDefecar ?? null,
                lavaAsMaosAposUsoBanheiro: data.desfralde?.lavaAsMaosAposUsoBanheiro ?? null,
                apresentaAlteracaoHabitoIntestinal: data.desfralde?.apresentaAlteracaoHabitoIntestinal ?? null,
                observacoes: data.desfralde?.observacoes ?? '',
                ...data.desfralde,
                [field]: value,
            },
        });
    };

    const updateDesfraldeItem = (item: string, field: 'anos' | 'meses' | 'utilizaFralda', value: string | boolean) => {
        const currentItem = data.desfralde?.[item as keyof typeof data.desfralde] as { anos: string; meses: string; utilizaFralda: boolean } | undefined;
        updateDesfralde(item, {
            anos: currentItem?.anos ?? '',
            meses: currentItem?.meses ?? '',
            utilizaFralda: currentItem?.utilizaFralda ?? false,
            [field]: value,
        });
    };

    const updateSono = (field: string, value: unknown) => {
        onChange({
            ...data,
            sono: {
                dormemMediaHorasNoite: data.sono?.dormemMediaHorasNoite ?? '',
                dormemMediaHorasDia: data.sono?.dormemMediaHorasDia ?? '',
                periodoSonoDia: data.sono?.periodoSonoDia ?? null,
                temDificuldadeIniciarSono: data.sono?.temDificuldadeIniciarSono ?? null,
                acordaDeMadrugada: data.sono?.acordaDeMadrugada ?? null,
                dormeNaPropriaCama: data.sono?.dormeNaPropriaCama ?? null,
                dormeNoProprioQuarto: data.sono?.dormeNoProprioQuarto ?? null,
                apresentaSonoAgitado: data.sono?.apresentaSonoAgitado ?? null,
                eSonambulo: data.sono?.eSonambulo ?? null,
                observacoes: data.sono?.observacoes ?? '',
                ...data.sono,
                [field]: value,
            },
        });
    };

    const updateHabitosHigiene = (field: string, value: unknown) => {
        onChange({
            ...data,
            habitosHigiene: {
                tomaBanhoLavaCorpoTodo: data.habitosHigiene?.tomaBanhoLavaCorpoTodo ?? null,
                secaCorpoTodo: data.habitosHigiene?.secaCorpoTodo ?? null,
                retiraTodasPecasRoupa: data.habitosHigiene?.retiraTodasPecasRoupa ?? null,
                colocaTodasPecasRoupa: data.habitosHigiene?.colocaTodasPecasRoupa ?? null,
                poeCalcadosSemCadarco: data.habitosHigiene?.poeCalcadosSemCadarco ?? null,
                poeCalcadosComCadarco: data.habitosHigiene?.poeCalcadosComCadarco ?? null,
                escovaOsDentes: data.habitosHigiene?.escovaOsDentes ?? null,
                penteiaOCabelo: data.habitosHigiene?.penteiaOCabelo ?? null,
                observacoes: data.habitosHigiene?.observacoes ?? '',
                ...data.habitosHigiene,
                [field]: value,
            },
        });
    };

    const updateAlimentacao = (field: string, value: unknown) => {
        onChange({
            ...data,
            alimentacao: {
                apresentaQueixaAlimentacao: data.alimentacao?.apresentaQueixaAlimentacao ?? null,
                seAlimentaSozinho: data.alimentacao?.seAlimentaSozinho ?? null,
                eSeletivoQuantoAlimentos: data.alimentacao?.eSeletivoQuantoAlimentos ?? null,
                passaDiaInteiroSemComer: data.alimentacao?.passaDiaInteiroSemComer ?? null,
                apresentaRituaisParaAlimentar: data.alimentacao?.apresentaRituaisParaAlimentar ?? null,
                estaAbaixoOuAcimaPeso: data.alimentacao?.estaAbaixoOuAcimaPeso ?? null,
                estaAbaixoOuAcimaPesoDescricao: data.alimentacao?.estaAbaixoOuAcimaPesoDescricao ?? '',
                temHistoricoAnemia: data.alimentacao?.temHistoricoAnemia ?? null,
                temHistoricoAnemiaDescricao: data.alimentacao?.temHistoricoAnemiaDescricao ?? '',
                rotinaAlimentarEProblemaFamilia: data.alimentacao?.rotinaAlimentarEProblemaFamilia ?? null,
                rotinaAlimentarEProblemaFamiliaDescricao: data.alimentacao?.rotinaAlimentarEProblemaFamiliaDescricao ?? '',
                observacoes: data.alimentacao?.observacoes ?? '',
                ...data.alimentacao,
                [field]: value,
            },
        });
    };

    return (
        <div className="space-y-4">
            {/* 13. Desfralde */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">13. Desfralde <span className="text-red-500">*</span></h3>
                
                <div className="space-y-1">
                    <DesfraldeField
                        label="Desfralde para urina (diurno) realizado com"
                        anos={data.desfralde?.desfraldeDiurnoUrina?.anos ?? ''}
                        meses={data.desfralde?.desfraldeDiurnoUrina?.meses ?? ''}
                        utilizaFralda={data.desfralde?.desfraldeDiurnoUrina?.utilizaFralda ?? false}
                        onAnosChange={(v) => updateDesfraldeItem('desfraldeDiurnoUrina', 'anos', v)}
                        onMesesChange={(v) => updateDesfraldeItem('desfraldeDiurnoUrina', 'meses', v)}
                        onUtilizaFraldaChange={(v) => updateDesfraldeItem('desfraldeDiurnoUrina', 'utilizaFralda', v)}
                    />
                    <DesfraldeField
                        label="Desfralde para urina (noturno) realizado com"
                        anos={data.desfralde?.desfraldeNoturnoUrina?.anos ?? ''}
                        meses={data.desfralde?.desfraldeNoturnoUrina?.meses ?? ''}
                        utilizaFralda={data.desfralde?.desfraldeNoturnoUrina?.utilizaFralda ?? false}
                        onAnosChange={(v) => updateDesfraldeItem('desfraldeNoturnoUrina', 'anos', v)}
                        onMesesChange={(v) => updateDesfraldeItem('desfraldeNoturnoUrina', 'meses', v)}
                        onUtilizaFraldaChange={(v) => updateDesfraldeItem('desfraldeNoturnoUrina', 'utilizaFralda', v)}
                    />
                    <DesfraldeField
                        label="Desfralde para fezes realizado com"
                        anos={data.desfralde?.desfraldeFezes?.anos ?? ''}
                        meses={data.desfralde?.desfraldeFezes?.meses ?? ''}
                        utilizaFralda={data.desfralde?.desfraldeFezes?.utilizaFralda ?? false}
                        onAnosChange={(v) => updateDesfraldeItem('desfraldeFezes', 'anos', v)}
                        onMesesChange={(v) => updateDesfraldeItem('desfraldeFezes', 'meses', v)}
                        onUtilizaFraldaChange={(v) => updateDesfraldeItem('desfraldeFezes', 'utilizaFralda', v)}
                    />
                </div>

                <div className="space-y-1 pt-2">
                    <SimNaoField
                        label="Se limpa sozinho quando usa o vaso para urinar."
                        value={data.desfralde?.seLimpaSozinhoUrinar ?? null}
                        onChange={(v) => updateDesfralde('seLimpaSozinhoUrinar', v)}
                    />
                    <SimNaoField
                        label="Se limpa sozinho quando usa o vaso para defecar."
                        value={data.desfralde?.seLimpaSozinhoDefecar ?? null}
                        onChange={(v) => updateDesfralde('seLimpaSozinhoDefecar', v)}
                    />
                    <SimNaoField
                        label="Lava as mãos após o uso do banheiro."
                        value={data.desfralde?.lavaAsMaosAposUsoBanheiro ?? null}
                        onChange={(v) => updateDesfralde('lavaAsMaosAposUsoBanheiro', v)}
                    />
                    <SimNaoField
                        label="Apresenta alguma alteração no hábito intestinal (diarreia, constipação, etc)."
                        value={data.desfralde?.apresentaAlteracaoHabitoIntestinal ?? null}
                        onChange={(v) => updateDesfralde('apresentaAlteracaoHabitoIntestinal', v)}
                    />
                </div>

                <AutoExpandTextarea
                    label="Observações"
                    placeholder="Sua resposta"
                    value={data.desfralde?.observacoes ?? ''}
                    onChange={(value) => updateDesfralde('observacoes', value)}
                />
            </div>

            {/* 14. Sono */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">14. Sono <span className="text-red-500">*</span></h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm whitespace-nowrap">Dorme em média <span className="text-red-500">*</span></span>
                        <NumberSpinner
                            value={data.sono?.dormemMediaHorasNoite ?? ''}
                            onChange={(v) => updateSono('dormemMediaHorasNoite', v)}
                            placeholder="0"
                            suffix="horas por noite."
                            min={0}
                            max={24}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm whitespace-nowrap">Dorme em média</span>
                        <NumberSpinner
                            value={data.sono?.dormemMediaHorasDia ?? ''}
                            onChange={(v) => updateSono('dormemMediaHorasDia', v)}
                            placeholder="0"
                            suffix="horas durante o dia."
                            min={0}
                            max={24}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm">Período: <span className="text-red-500">*</span></span>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="periodoSonoDia"
                            checked={data.sono?.periodoSonoDia === 'manha'}
                            onChange={() => updateSono('periodoSonoDia', 'manha')}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Manhã</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="periodoSonoDia"
                            checked={data.sono?.periodoSonoDia === 'tarde'}
                            onChange={() => updateSono('periodoSonoDia', 'tarde')}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Tarde</span>
                    </label>
                </div>

                <div className="space-y-1">
                    <SimNaoField
                        label="Tem dificuldade para iniciar o sono."
                        value={data.sono?.temDificuldadeIniciarSono ?? null}
                        onChange={(v) => updateSono('temDificuldadeIniciarSono', v)}
                    />
                    <SimNaoField
                        label="Acorda de madrugada."
                        value={data.sono?.acordaDeMadrugada ?? null}
                        onChange={(v) => updateSono('acordaDeMadrugada', v)}
                    />
                    <SimNaoField
                        label="Dorme na própria cama."
                        value={data.sono?.dormeNaPropriaCama ?? null}
                        onChange={(v) => updateSono('dormeNaPropriaCama', v)}
                    />
                    <SimNaoField
                        label="Dorme no próprio quarto."
                        value={data.sono?.dormeNoProprioQuarto ?? null}
                        onChange={(v) => updateSono('dormeNoProprioQuarto', v)}
                    />
                    <SimNaoField
                        label="Apresenta sono agitado, se move muito na cama."
                        value={data.sono?.apresentaSonoAgitado ?? null}
                        onChange={(v) => updateSono('apresentaSonoAgitado', v)}
                    />
                    <SimNaoField
                        label="É sonâmbulo."
                        value={data.sono?.eSonambulo ?? null}
                        onChange={(v) => updateSono('eSonambulo', v)}
                    />
                </div>

                <AutoExpandTextarea
                    label="Observações"
                    placeholder="Sua resposta"
                    value={data.sono?.observacoes ?? ''}
                    onChange={(value) => updateSono('observacoes', value)}
                />
            </div>

            {/* 15. Hábitos Diários de Higiene */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">15. Hábitos Diários de Higiene <span className="text-red-500">*</span></h3>
                
                <div className="space-y-1">
                    <SimNaoComAjudaField
                        label="Toma banho e lava o corpo todo."
                        value={data.habitosHigiene?.tomaBanhoLavaCorpoTodo ?? null}
                        onChange={(v) => updateHabitosHigiene('tomaBanhoLavaCorpoTodo', v)}
                    />
                    <SimNaoComAjudaField
                        label="Seca o corpo todo."
                        value={data.habitosHigiene?.secaCorpoTodo ?? null}
                        onChange={(v) => updateHabitosHigiene('secaCorpoTodo', v)}
                    />
                    <SimNaoComAjudaField
                        label="Retira todas as peças de roupa."
                        value={data.habitosHigiene?.retiraTodasPecasRoupa ?? null}
                        onChange={(v) => updateHabitosHigiene('retiraTodasPecasRoupa', v)}
                    />
                    <SimNaoComAjudaField
                        label="Coloca todas as peças de roupa."
                        value={data.habitosHigiene?.colocaTodasPecasRoupa ?? null}
                        onChange={(v) => updateHabitosHigiene('colocaTodasPecasRoupa', v)}
                    />
                    <SimNaoComAjudaField
                        label="Põe calçados sem cadarço."
                        value={data.habitosHigiene?.poeCalcadosSemCadarco ?? null}
                        onChange={(v) => updateHabitosHigiene('poeCalcadosSemCadarco', v)}
                    />
                    <SimNaoComAjudaField
                        label="Põe calçados com cadarço."
                        value={data.habitosHigiene?.poeCalcadosComCadarco ?? null}
                        onChange={(v) => updateHabitosHigiene('poeCalcadosComCadarco', v)}
                    />
                    <SimNaoComAjudaField
                        label="Escova os dentes."
                        value={data.habitosHigiene?.escovaOsDentes ?? null}
                        onChange={(v) => updateHabitosHigiene('escovaOsDentes', v)}
                    />
                    <SimNaoComAjudaField
                        label="Penteia o cabelo."
                        value={data.habitosHigiene?.penteiaOCabelo ?? null}
                        onChange={(v) => updateHabitosHigiene('penteiaOCabelo', v)}
                    />
                </div>

                <AutoExpandTextarea
                    label="Observações"
                    placeholder="Descreva qual o tipo de ajuda"
                    value={data.habitosHigiene?.observacoes ?? ''}
                    onChange={(value) => updateHabitosHigiene('observacoes', value)}
                />
            </div>

            {/* 16. Alimentação */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">16. Alimentação <span className="text-red-500">*</span></h3>
                
                <div className="space-y-1">
                    <SimNaoField
                        label="Apresenta alguma queixa quanto a alimentação?"
                        value={data.alimentacao?.apresentaQueixaAlimentacao ?? null}
                        onChange={(v) => updateAlimentacao('apresentaQueixaAlimentacao', v)}
                    />
                    <SimNaoField
                        label="Se alimenta sozinho."
                        value={data.alimentacao?.seAlimentaSozinho ?? null}
                        onChange={(v) => updateAlimentacao('seAlimentaSozinho', v)}
                    />
                    <SimNaoField
                        label="É seletivo quanto aos alimentos ingeridos."
                        value={data.alimentacao?.eSeletivoQuantoAlimentos ?? null}
                        onChange={(v) => updateAlimentacao('eSeletivoQuantoAlimentos', v)}
                    />
                    <SimNaoField
                        label="Passa um dia inteiro ou longos períodos sem comer."
                        value={data.alimentacao?.passaDiaInteiroSemComer ?? null}
                        onChange={(v) => updateAlimentacao('passaDiaInteiroSemComer', v)}
                    />
                    <SimNaoField
                        label="Apresenta rituais para se alimentar."
                        value={data.alimentacao?.apresentaRituaisParaAlimentar ?? null}
                        onChange={(v) => updateAlimentacao('apresentaRituaisParaAlimentar', v)}
                    />
                    <SimNaoField
                        label="Está abaixo ou acima do peso indicado para a idade."
                        value={data.alimentacao?.estaAbaixoOuAcimaPeso ?? null}
                        onChange={(v) => updateAlimentacao('estaAbaixoOuAcimaPeso', v)}
                    />
                    {data.alimentacao?.estaAbaixoOuAcimaPeso === 'sim' && (
                        <InputField
                            label="Descreva - se possível qual o peso e altura da criança e se faz acompanhamento"
                            placeholder="Ex: Peso 18kg, altura 1,10m. Faz acompanhamento com nutricionista."
                            value={data.alimentacao?.estaAbaixoOuAcimaPesoDescricao ?? ''}
                            onChange={(e) => updateAlimentacao('estaAbaixoOuAcimaPesoDescricao', e.target.value)}
                        />
                    )}
                    <SimNaoField
                        label="Tem histórico de anemia."
                        value={data.alimentacao?.temHistoricoAnemia ?? null}
                        onChange={(v) => updateAlimentacao('temHistoricoAnemia', v)}
                    />
                    {data.alimentacao?.temHistoricoAnemia === 'sim' && (
                        <InputField
                            label="Descreva - desde quando"
                            placeholder="Ex: Desde os 2 anos de idade, faz suplementação."
                            value={data.alimentacao?.temHistoricoAnemiaDescricao ?? ''}
                            onChange={(e) => updateAlimentacao('temHistoricoAnemiaDescricao', e.target.value)}
                        />
                    )}
                    <SimNaoField
                        label="A rotina alimentar atual é um problema para a família."
                        value={data.alimentacao?.rotinaAlimentarEProblemaFamilia ?? null}
                        onChange={(v) => updateAlimentacao('rotinaAlimentarEProblemaFamilia', v)}
                    />
                    {data.alimentacao?.rotinaAlimentarEProblemaFamilia === 'sim' && (
                        <InputField
                            label="Descreva as maiores dificuldades"
                            placeholder="Ex: Recusa alimentar frequente, hora das refeições é muito estressante."
                            value={data.alimentacao?.rotinaAlimentarEProblemaFamiliaDescricao ?? ''}
                            onChange={(e) => updateAlimentacao('rotinaAlimentarEProblemaFamiliaDescricao', e.target.value)}
                        />
                    )}
                </div>

                <AutoExpandTextarea
                    label="Observações"
                    placeholder="Ex: Como a seletividade se manifesta? Há dificuldades da família com a rotina alimentar? Descreva comportamentos específicos..."
                    value={data.alimentacao?.observacoes ?? ''}
                    onChange={(value) => updateAlimentacao('observacoes', value)}
                />
            </div>
        </div>
    );
}
