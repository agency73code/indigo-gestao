import type { AnamneseDetalhe } from '../../types/anamnese-consulta.types';
import { formatMarcoDesenvolvimento, formatSimNao } from './section-utils';
import ReadOnlyField from '../ReadOnlyField';

interface DesenvolvimentoSectionProps {
    data: AnamneseDetalhe;
}

export function DesenvolvimentoSection({ data }: DesenvolvimentoSectionProps) {
    const dev = data.desenvolvimentoInicial;

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">10. Gestação e Parto</h4>
                <div className="grid grid-cols-2 gap-4">
                    <ReadOnlyField label="Tipo de Parto" value={dev.gestacaoParto.tipoParto} />
                    <ReadOnlyField label="Semanas" value={dev.gestacaoParto.semanas?.toString() ?? 'Não informado'} />
                    <ReadOnlyField label="APGAR 1min" value={dev.gestacaoParto.apgar1min?.toString() ?? 'Não informado'} />
                    <ReadOnlyField label="APGAR 5min" value={dev.gestacaoParto.apgar5min?.toString() ?? 'Não informado'} />
                </div>
                <div className="mt-4">
                    <ReadOnlyField label="Intercorrências" value={dev.gestacaoParto.intercorrencias} />
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">11. Desenvolvimento Neuropsicomotor</h4>
                <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField label="Sustentou cabeça" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.sustentouCabeca)} />
                    <ReadOnlyField label="Rolou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.rolou)} />
                    <ReadOnlyField label="Sentou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.sentou)} />
                    <ReadOnlyField label="Engatinhou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.engatinhou)} />
                    <ReadOnlyField label="Andou com apoio" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouComApoio)} />
                    <ReadOnlyField label="Andou sem apoio" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouSemApoio)} />
                    <ReadOnlyField label="Correu" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.correu)} />
                    <ReadOnlyField label="Andou de motoca" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouDeMotoca)} />
                    <ReadOnlyField label="Andou de bicicleta" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouDeBicicleta)} />
                    <ReadOnlyField label="Subiu escadas sozinho" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.subiuEscadasSozinho)} />
                </div>
                <div className="mt-4">
                    <ReadOnlyField label="Motricidade Fina" value={dev.neuropsicomotor.motricidadeFina} />
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">12. Desenvolvimento da Fala e da Linguagem</h4>
                <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField label="Balbuciou" value={formatMarcoDesenvolvimento(dev.falaLinguagem.balbuciou)} />
                    <ReadOnlyField label="Primeiras palavras" value={formatMarcoDesenvolvimento(dev.falaLinguagem.primeirasPalavras)} />
                    <ReadOnlyField label="Primeiras frases" value={formatMarcoDesenvolvimento(dev.falaLinguagem.primeirasFrases)} />
                    <ReadOnlyField label="Apontou para pedir" value={formatMarcoDesenvolvimento(dev.falaLinguagem.apontouParaFazerPedidos)} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <ReadOnlyField label="Faz uso de gestos" value={formatSimNao(dev.falaLinguagem.fazUsoDeGestos)} />
                </div>
                {dev.falaLinguagem.fazUsoDeGestos === 'sim' && dev.falaLinguagem.fazUsoDeGestosQuais && (
                    <div className="mt-3">
                        <ReadOnlyField label="Quais gestos" value={dev.falaLinguagem.fazUsoDeGestosQuais} />
                    </div>
                )}

                <div className="mt-4">
                    <ReadOnlyField label="Comunicação Atual" value={dev.falaLinguagem.comunicacaoAtual} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                    <ReadOnlyField 
                        label="Audição (percepção do responsável)" 
                        value={dev.falaLinguagem.audicao === 'boa' ? 'Boa' : dev.falaLinguagem.audicao === 'ruim' ? 'Ruim' : dev.falaLinguagem.audicao} 
                    />
                    <ReadOnlyField label="Teve otite de repetição" value={formatSimNao(dev.falaLinguagem.teveOtiteDeRepeticao)} />
                </div>
                {dev.falaLinguagem.teveOtiteDeRepeticao === 'sim' && dev.falaLinguagem.otiteDetalhes && (
                    <div className="mt-3">
                        <ReadOnlyField label="Detalhes da otite (quantas vezes, período, frequência)" value={dev.falaLinguagem.otiteDetalhes} />
                    </div>
                )}
                <div className="mt-3">
                    <ReadOnlyField label="Faz ou fez uso de tubo de ventilação" value={formatSimNao(dev.falaLinguagem.fazOuFezUsoTuboVentilacao)} />
                </div>
                {dev.falaLinguagem.fazOuFezUsoTuboVentilacao === 'sim' && dev.falaLinguagem.tuboVentilacaoObservacao && (
                    <div className="mt-3">
                        <ReadOnlyField label="Observação do tubo de ventilação" value={dev.falaLinguagem.tuboVentilacaoObservacao} />
                    </div>
                )}

                {/* Hábitos orais */}
                <h5 className="text-sm font-medium text-muted-foreground mt-4 mb-3">Hábitos Orais</h5>
                <div className="space-y-3">
                    <ReadOnlyField label="Faz ou fez uso de objeto oral (chupeta, paninho, dedo)" value={formatSimNao(dev.falaLinguagem.fazOuFezUsoObjetoOral)} />
                    {dev.falaLinguagem.fazOuFezUsoObjetoOral === 'sim' && dev.falaLinguagem.objetoOralEspecificar && (
                        <ReadOnlyField label="Especificação (manhã, tarde e/ou noite)" value={dev.falaLinguagem.objetoOralEspecificar} />
                    )}
                    <ReadOnlyField label="Usa mamadeira" value={formatSimNao(dev.falaLinguagem.usaMamadeira)} />
                    {dev.falaLinguagem.usaMamadeira === 'sim' && dev.falaLinguagem.mamadeiraDetalhes && (
                        <ReadOnlyField label="Detalhes (há quantos anos/meses, quantas vezes ao dia)" value={dev.falaLinguagem.mamadeiraDetalhes} />
                    )}
                </div>
            </div>
        </div>
    );
}
