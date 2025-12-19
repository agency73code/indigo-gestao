import AutoExpandTextarea from '../ui/AutoExpandTextarea';
import type { AnamneseComportamento, SimNao } from '../../types/anamnese.types';

interface ComportamentoStepProps {
    data: Partial<AnamneseComportamento>;
    onChange: (data: Partial<AnamneseComportamento>) => void;
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
            <span className="text-sm text-foreground flex-1">{label}</span>
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

export default function ComportamentoStep({ data, onChange }: ComportamentoStepProps) {
    // Helpers para atualizar dados aninhados
    const updateEstereotipiasRituais = (field: string, value: unknown) => {
        onChange({
            ...data,
            estereotipiasRituais: {
                balancaMaosLadoCorpoOuFrente: data.estereotipiasRituais?.balancaMaosLadoCorpoOuFrente ?? null,
                balancaCorpoFrenteParaTras: data.estereotipiasRituais?.balancaCorpoFrenteParaTras ?? null,
                pulaOuGiraEmTornoDeSi: data.estereotipiasRituais?.pulaOuGiraEmTornoDeSi ?? null,
                repeteSonsSemFuncaoComunicativa: data.estereotipiasRituais?.repeteSonsSemFuncaoComunicativa ?? null,
                repeteMovimentosContinuos: data.estereotipiasRituais?.repeteMovimentosContinuos ?? null,
                exploraAmbienteLambendoTocando: data.estereotipiasRituais?.exploraAmbienteLambendoTocando ?? null,
                procuraObservarObjetosCantoOlho: data.estereotipiasRituais?.procuraObservarObjetosCantoOlho ?? null,
                organizaObjetosLadoALado: data.estereotipiasRituais?.organizaObjetosLadoALado ?? null,
                realizaTarefasSempreMesmaOrdem: data.estereotipiasRituais?.realizaTarefasSempreMesmaOrdem ?? null,
                apresentaRituaisDiarios: data.estereotipiasRituais?.apresentaRituaisDiarios ?? null,
                observacoesTopografias: data.estereotipiasRituais?.observacoesTopografias ?? '',
                ...data.estereotipiasRituais,
                [field]: value,
            },
        });
    };

    const updateProblemasComportamento = (field: string, value: unknown) => {
        onChange({
            ...data,
            problemasComportamento: {
                apresentaComportamentosAutoLesivos: data.problemasComportamento?.apresentaComportamentosAutoLesivos ?? null,
                autoLesivosQuais: data.problemasComportamento?.autoLesivosQuais ?? '',
                apresentaComportamentosHeteroagressivos: data.problemasComportamento?.apresentaComportamentosHeteroagressivos ?? null,
                heteroagressivosQuais: data.problemasComportamento?.heteroagressivosQuais ?? '',
                apresentaDestruicaoPropriedade: data.problemasComportamento?.apresentaDestruicaoPropriedade ?? null,
                destruicaoDescrever: data.problemasComportamento?.destruicaoDescrever ?? '',
                necessitouContencaoMecanica: data.problemasComportamento?.necessitouContencaoMecanica ?? null,
                observacoesTopografias: data.problemasComportamento?.observacoesTopografias ?? '',
                ...data.problemasComportamento,
                [field]: value,
            },
        });
    };

    return (
        <div className="space-y-4">
            {/* 19. Estereotipias, Tiques, Rituais e Rotinas */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">19. Estereotipias, Tiques, Rituais e Rotinas</h3>
                
                <div className="space-y-1">
                    <SimNaoField
                        label="Balança as mãos ao lado do corpo ou na frente ao rosto."
                        value={data.estereotipiasRituais?.balancaMaosLadoCorpoOuFrente ?? null}
                        onChange={(v) => updateEstereotipiasRituais('balancaMaosLadoCorpoOuFrente', v)}
                    />
                    <SimNaoField
                        label="Balança o corpo para frente e para trás."
                        value={data.estereotipiasRituais?.balancaCorpoFrenteParaTras ?? null}
                        onChange={(v) => updateEstereotipiasRituais('balancaCorpoFrenteParaTras', v)}
                    />
                    <SimNaoField
                        label="Pula ou gira em torno de si."
                        value={data.estereotipiasRituais?.pulaOuGiraEmTornoDeSi ?? null}
                        onChange={(v) => updateEstereotipiasRituais('pulaOuGiraEmTornoDeSi', v)}
                    />
                    <SimNaoField
                        label="Repete sons sem função comunicativa."
                        value={data.estereotipiasRituais?.repeteSonsSemFuncaoComunicativa ?? null}
                        onChange={(v) => updateEstereotipiasRituais('repeteSonsSemFuncaoComunicativa', v)}
                    />
                    <SimNaoField
                        label="Repete movimentos de modo contínuo, quando excitado ou ocioso."
                        value={data.estereotipiasRituais?.repeteMovimentosContinuos ?? null}
                        onChange={(v) => updateEstereotipiasRituais('repeteMovimentosContinuos', v)}
                    />
                    <SimNaoField
                        label="Explora o ambiente lambendo, tocando de modo excessivo."
                        value={data.estereotipiasRituais?.exploraAmbienteLambendoTocando ?? null}
                        onChange={(v) => updateEstereotipiasRituais('exploraAmbienteLambendoTocando', v)}
                    />
                    <SimNaoField
                        label="Procura observar objetos com o canto do olho, pisca em excesso."
                        value={data.estereotipiasRituais?.procuraObservarObjetosCantoOlho ?? null}
                        onChange={(v) => updateEstereotipiasRituais('procuraObservarObjetosCantoOlho', v)}
                    />
                    <SimNaoField
                        label="Organiza objetos lado a lado ou empilha itens."
                        value={data.estereotipiasRituais?.organizaObjetosLadoALado ?? null}
                        onChange={(v) => updateEstereotipiasRituais('organizaObjetosLadoALado', v)}
                    />
                    <SimNaoField
                        label="Realiza tarefas sempre na mesma ordem."
                        value={data.estereotipiasRituais?.realizaTarefasSempreMesmaOrdem ?? null}
                        onChange={(v) => updateEstereotipiasRituais('realizaTarefasSempreMesmaOrdem', v)}
                    />
                    <SimNaoField
                        label="Apresenta rituais diários para cumprir tarefas."
                        value={data.estereotipiasRituais?.apresentaRituaisDiarios ?? null}
                        onChange={(v) => updateEstereotipiasRituais('apresentaRituaisDiarios', v)}
                    />
                </div>

                <AutoExpandTextarea
                    label="Observações e descrição das topografias mais relevantes"
                    placeholder="Sua resposta"
                    value={data.estereotipiasRituais?.observacoesTopografias ?? ''}
                    onChange={(value) => updateEstereotipiasRituais('observacoesTopografias', value)}
                />
            </div>

            {/* 20. Problemas de Comportamento */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">20. Problemas de Comportamento</h3>
                
                {/* Comportamentos Auto Lesivos */}
                <div className="space-y-2">
                    <SimNaoField
                        label="Apresenta comportamentos auto lesivos (ex: bate a cabeça, fere a pele ou outra parte do corpo gerando ferimentos fechados ou abertos)."
                        value={data.problemasComportamento?.apresentaComportamentosAutoLesivos ?? null}
                        onChange={(v) => updateProblemasComportamento('apresentaComportamentosAutoLesivos', v)}
                    />
                    {data.problemasComportamento?.apresentaComportamentosAutoLesivos === 'sim' && (
                        <AutoExpandTextarea
                            label="Se sim, quais?"
                            placeholder="Descreva os comportamentos"
                            value={data.problemasComportamento?.autoLesivosQuais ?? ''}
                            onChange={(value) => updateProblemasComportamento('autoLesivosQuais', value)}
                        />
                    )}
                </div>

                {/* Comportamentos Heteroagressivos */}
                <div className="space-y-2">
                    <SimNaoField
                        label="Apresenta comportamentos heteroagressivos (ex: bater no outro com tapas, socos, chutes, beliscar, dar cabeçada)."
                        value={data.problemasComportamento?.apresentaComportamentosHeteroagressivos ?? null}
                        onChange={(v) => updateProblemasComportamento('apresentaComportamentosHeteroagressivos', v)}
                    />
                    {data.problemasComportamento?.apresentaComportamentosHeteroagressivos === 'sim' && (
                        <AutoExpandTextarea
                            label="Se sim, quais?"
                            placeholder="Descreva os comportamentos"
                            value={data.problemasComportamento?.heteroagressivosQuais ?? ''}
                            onChange={(value) => updateProblemasComportamento('heteroagressivosQuais', value)}
                        />
                    )}
                </div>

                {/* Destruição de Propriedade */}
                <div className="space-y-2">
                    <SimNaoField
                        label="Apresenta destruição de propriedade (quebra objetos da casa, dos colegas ou dele próprio)?"
                        value={data.problemasComportamento?.apresentaDestruicaoPropriedade ?? null}
                        onChange={(v) => updateProblemasComportamento('apresentaDestruicaoPropriedade', v)}
                    />
                    {data.problemasComportamento?.apresentaDestruicaoPropriedade === 'sim' && (
                        <AutoExpandTextarea
                            label="Se sim, descreva."
                            placeholder="Descreva os comportamentos"
                            value={data.problemasComportamento?.destruicaoDescrever ?? ''}
                            onChange={(value) => updateProblemasComportamento('destruicaoDescrever', value)}
                        />
                    )}
                </div>

                {/* Contenção Mecânica */}
                <SimNaoField
                    label="Necessita ou já necessitou de contenção mecânica."
                    value={data.problemasComportamento?.necessitouContencaoMecanica ?? null}
                    onChange={(v) => updateProblemasComportamento('necessitouContencaoMecanica', v)}
                />

                <AutoExpandTextarea
                    label="Observações e descrição das topografias mais relevantes"
                    placeholder="Sua resposta"
                    value={data.problemasComportamento?.observacoesTopografias ?? ''}
                    onChange={(value) => updateProblemasComportamento('observacoesTopografias', value)}
                />
            </div>
        </div>
    );
}
