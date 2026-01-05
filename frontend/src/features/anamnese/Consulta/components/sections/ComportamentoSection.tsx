import type { AnamneseDetalhe } from '../../types/anamnese-consulta.types';
import { formatSimNao } from './section-utils';
import ReadOnlyField from '../ReadOnlyField';

interface ComportamentoSectionProps {
    data: AnamneseDetalhe;
}

export function ComportamentoSection({ data }: ComportamentoSectionProps) {
    const comp = data.comportamento;

    return (
        <div className="space-y-6">
            {/* 19. Estereotipias, Tiques, Rituais e Rotinas */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">19. Estereotipias, Tiques, Rituais e Rotinas</h4>
                <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField label="Balança as mãos ao lado do corpo ou na frente ao rosto" value={formatSimNao(comp.estereotipiasRituais.balancaMaosLadoCorpoOuFrente)} />
                    <ReadOnlyField label="Balança o corpo para frente e para trás" value={formatSimNao(comp.estereotipiasRituais.balancaCorpoFrenteParaTras)} />
                    <ReadOnlyField label="Pula ou gira em torno de si" value={formatSimNao(comp.estereotipiasRituais.pulaOuGiraEmTornoDeSi)} />
                    <ReadOnlyField label="Repete sons sem função comunicativa" value={formatSimNao(comp.estereotipiasRituais.repeteSonsSemFuncaoComunicativa)} />
                    <ReadOnlyField label="Repete movimentos de modo contínuo" value={formatSimNao(comp.estereotipiasRituais.repeteMovimentosContinuos)} />
                    <ReadOnlyField label="Explora o ambiente lambendo, tocando excessivamente" value={formatSimNao(comp.estereotipiasRituais.exploraAmbienteLambendoTocando)} />
                    <ReadOnlyField label="Procura observar objetos com o canto do olho" value={formatSimNao(comp.estereotipiasRituais.procuraObservarObjetosCantoOlho)} />
                    <ReadOnlyField label="Organiza objetos lado a lado ou empilha itens" value={formatSimNao(comp.estereotipiasRituais.organizaObjetosLadoALado)} />
                    <ReadOnlyField label="Realiza tarefas sempre na mesma ordem" value={formatSimNao(comp.estereotipiasRituais.realizaTarefasSempreMesmaOrdem)} />
                    <ReadOnlyField label="Apresenta rituais diários para cumprir tarefas" value={formatSimNao(comp.estereotipiasRituais.apresentaRituaisDiarios)} />
                </div>
                {comp.estereotipiasRituais.observacoesTopografias && (
                    <div className="mt-3">
                        <ReadOnlyField label="Observações e descrição das topografias mais relevantes" value={comp.estereotipiasRituais.observacoesTopografias} />
                    </div>
                )}
            </div>

            {/* 20. Problemas de Comportamento */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">20. Problemas de Comportamento</h4>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <ReadOnlyField label="Apresenta comportamentos auto lesivos" value={formatSimNao(comp.problemasComportamento.apresentaComportamentosAutoLesivos)} />
                        {comp.problemasComportamento.autoLesivosQuais && (
                            <ReadOnlyField label="Quais" value={comp.problemasComportamento.autoLesivosQuais} />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ReadOnlyField label="Apresenta comportamentos heteroagressivos" value={formatSimNao(comp.problemasComportamento.apresentaComportamentosHeteroagressivos)} />
                        {comp.problemasComportamento.heteroagressivosQuais && (
                            <ReadOnlyField label="Quais" value={comp.problemasComportamento.heteroagressivosQuais} />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ReadOnlyField label="Apresenta destruição de propriedade" value={formatSimNao(comp.problemasComportamento.apresentaDestruicaoPropriedade)} />
                        {comp.problemasComportamento.destruicaoDescrever && (
                            <ReadOnlyField label="Descrever" value={comp.problemasComportamento.destruicaoDescrever} />
                        )}
                    </div>
                    <ReadOnlyField label="Necessita ou já necessitou de contenção física" value={formatSimNao(comp.problemasComportamento.necessitouContencaoMecanica)} />
                </div>
                {comp.problemasComportamento.observacoesTopografias && (
                    <div className="mt-3">
                        <ReadOnlyField label="Observações e descrição das topografias mais relevantes" value={comp.problemasComportamento.observacoesTopografias} />
                    </div>
                )}
            </div>
        </div>
    );
}
