import type { AnamneseDetalhe, DesfraldeTempo } from '../../types/anamnese-consulta.types';
import { formatSimNao, formatSimNaoComAjuda } from './section-utils';
import ReadOnlyField from '../ReadOnlyField';

interface VidaDiariaSectionProps {
    data: AnamneseDetalhe;
}

// Helper para formatar desfralde
function formatDesfralde(item: DesfraldeTempo) {
    if (item.utilizaFralda) return 'Utiliza fralda';
    const anos = item.anos ? `${item.anos} ano${item.anos !== '1' ? 's' : ''}` : '';
    const meses = item.meses ? `${item.meses} ${item.meses === '1' ? 'mês' : 'meses'}` : '';
    if (!anos && !meses) return 'Não informado';
    return [anos, meses].filter(Boolean).join(' e ');
}

export function VidaDiariaSection({ data }: VidaDiariaSectionProps) {
    const avd = data.atividadesVidaDiaria;

    return (
        <div className="space-y-6">
            {/* 13. Desfralde */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">13. Desfralde</h4>
                <div className="space-y-3">
                    <ReadOnlyField label="Desfralde para urina (diurno) realizado com" value={formatDesfralde(avd.desfralde.desfraldeDiurnoUrina)} />
                    <ReadOnlyField label="Desfralde para urina (noturno) realizado com" value={formatDesfralde(avd.desfralde.desfraldeNoturnoUrina)} />
                    <ReadOnlyField label="Desfralde para fezes realizado com" value={formatDesfralde(avd.desfralde.desfraldeFezes)} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <ReadOnlyField label="Se limpa sozinho para urinar" value={formatSimNao(avd.desfralde.seLimpaSozinhoUrinar)} />
                    <ReadOnlyField label="Se limpa sozinho para defecar" value={formatSimNao(avd.desfralde.seLimpaSozinhoDefecar)} />
                    <ReadOnlyField label="Lava as mãos após uso do banheiro" value={formatSimNao(avd.desfralde.lavaAsMaosAposUsoBanheiro)} />
                    <ReadOnlyField label="Alteração no hábito intestinal" value={formatSimNao(avd.desfralde.apresentaAlteracaoHabitoIntestinal)} />
                </div>
                {avd.desfralde.observacoes && (
                    <div className="mt-3">
                        <ReadOnlyField label="Observações" value={avd.desfralde.observacoes} />
                    </div>
                )}
            </div>

            {/* 14. Sono */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">14. Sono</h4>
                <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField label="Horas de sono por noite" value={avd.sono.dormemMediaHorasNoite ? `${avd.sono.dormemMediaHorasNoite} horas` : 'Não informado'} />
                    <ReadOnlyField label="Horas de sono durante o dia" value={avd.sono.dormemMediaHorasDia ? `${avd.sono.dormemMediaHorasDia} horas` : 'Não dorme durante o dia'} />
                    <ReadOnlyField label="Período do sono durante o dia" value={avd.sono.periodoSonoDia === 'manha' ? 'Manhã' : avd.sono.periodoSonoDia === 'tarde' ? 'Tarde' : 'Não informado'} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <ReadOnlyField label="Dificuldade para iniciar o sono" value={formatSimNao(avd.sono.temDificuldadeIniciarSono)} />
                    <ReadOnlyField label="Acorda de madrugada" value={formatSimNao(avd.sono.acordaDeMadrugada)} />
                    <ReadOnlyField label="Dorme na própria cama" value={formatSimNao(avd.sono.dormeNaPropriaCama)} />
                    <ReadOnlyField label="Dorme no próprio quarto" value={formatSimNao(avd.sono.dormeNoProprioQuarto)} />
                    <ReadOnlyField label="Apresenta sono agitado" value={formatSimNao(avd.sono.apresentaSonoAgitado)} />
                    <ReadOnlyField label="É sonâmbulo" value={formatSimNao(avd.sono.eSonambulo)} />
                </div>
                {avd.sono.observacoes && (
                    <div className="mt-3">
                        <ReadOnlyField label="Observações" value={avd.sono.observacoes} />
                    </div>
                )}
            </div>

            {/* 15. Hábitos Diários de Higiene */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">15. Hábitos Diários de Higiene</h4>
                <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField label="Toma banho e lava o corpo todo" value={formatSimNaoComAjuda(avd.habitosHigiene.tomaBanhoLavaCorpoTodo)} />
                    <ReadOnlyField label="Seca o corpo todo" value={formatSimNaoComAjuda(avd.habitosHigiene.secaCorpoTodo)} />
                    <ReadOnlyField label="Retira todas as peças de roupa" value={formatSimNaoComAjuda(avd.habitosHigiene.retiraTodasPecasRoupa)} />
                    <ReadOnlyField label="Coloca todas as peças de roupa" value={formatSimNaoComAjuda(avd.habitosHigiene.colocaTodasPecasRoupa)} />
                    <ReadOnlyField label="Põe calçados sem cadarço" value={formatSimNaoComAjuda(avd.habitosHigiene.poeCalcadosSemCadarco)} />
                    <ReadOnlyField label="Põe calçados com cadarço" value={formatSimNaoComAjuda(avd.habitosHigiene.poeCalcadosComCadarco)} />
                    <ReadOnlyField label="Escova os dentes" value={formatSimNaoComAjuda(avd.habitosHigiene.escovaOsDentes)} />
                    <ReadOnlyField label="Penteia o cabelo" value={formatSimNaoComAjuda(avd.habitosHigiene.penteiaOCabelo)} />
                </div>
                {avd.habitosHigiene.observacoes && (
                    <div className="mt-3">
                        <ReadOnlyField label="Observações" value={avd.habitosHigiene.observacoes} />
                    </div>
                )}
            </div>

            {/* 16. Alimentação */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">16. Alimentação</h4>
                <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField label="Apresenta queixa quanto a alimentação" value={formatSimNao(avd.alimentacao.apresentaQueixaAlimentacao)} />
                    <ReadOnlyField label="Se alimenta sozinho" value={formatSimNao(avd.alimentacao.seAlimentaSozinho)} />
                    <ReadOnlyField label="É seletivo quanto aos alimentos" value={formatSimNao(avd.alimentacao.eSeletivoQuantoAlimentos)} />
                    <ReadOnlyField label="Passa longos períodos sem comer" value={formatSimNao(avd.alimentacao.passaDiaInteiroSemComer)} />
                    <ReadOnlyField label="Apresenta rituais para se alimentar" value={formatSimNao(avd.alimentacao.apresentaRituaisParaAlimentar)} />
                    <ReadOnlyField label="Está abaixo ou acima do peso" value={formatSimNao(avd.alimentacao.estaAbaixoOuAcimaPeso)} />
                </div>
                {avd.alimentacao.estaAbaixoOuAcimaPeso === 'sim' && avd.alimentacao.estaAbaixoOuAcimaPesoDescricao && (
                    <div className="mt-3">
                        <ReadOnlyField label="Peso/Altura e acompanhamento" value={avd.alimentacao.estaAbaixoOuAcimaPesoDescricao} />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <ReadOnlyField label="Tem histórico de anemia" value={formatSimNao(avd.alimentacao.temHistoricoAnemia)} />
                </div>
                {avd.alimentacao.temHistoricoAnemia === 'sim' && avd.alimentacao.temHistoricoAnemiaDescricao && (
                    <div className="mt-3">
                        <ReadOnlyField label="Histórico de anemia - desde quando" value={avd.alimentacao.temHistoricoAnemiaDescricao} />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <ReadOnlyField label="Rotina alimentar é problema para a família" value={formatSimNao(avd.alimentacao.rotinaAlimentarEProblemaFamilia)} />
                </div>
                {avd.alimentacao.rotinaAlimentarEProblemaFamilia === 'sim' && avd.alimentacao.rotinaAlimentarEProblemaFamiliaDescricao && (
                    <div className="mt-3">
                        <ReadOnlyField label="Maiores dificuldades" value={avd.alimentacao.rotinaAlimentarEProblemaFamiliaDescricao} />
                    </div>
                )}
                {avd.alimentacao.observacoes && (
                    <div className="mt-3">
                        <ReadOnlyField label="Observações" value={avd.alimentacao.observacoes} />
                    </div>
                )}
            </div>
        </div>
    );
}
