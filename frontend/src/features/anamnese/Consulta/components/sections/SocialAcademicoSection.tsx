import type { AnamneseDetalhe } from '../../types/anamnese-consulta.types';
import { formatSimNao } from './section-utils';
import ReadOnlyField from '../ReadOnlyField';

interface SocialAcademicoSectionProps {
    data: AnamneseDetalhe;
}

export function SocialAcademicoSection({ data }: SocialAcademicoSectionProps) {
    const social = data.socialAcademico;
    const desenvolvimentoSocial = social.desenvolvimentoSocial;
    const escola = social.vidaEscolar;

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">17. Desenvolvimento Social (Relações Interpessoais e Brincar)</h4>
                <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField label="Possui amigos da mesma idade no ambiente escolar" value={formatSimNao(desenvolvimentoSocial?.possuiAmigosMesmaIdadeEscola)} />
                    <ReadOnlyField label="Possui amigos da mesma idade fora do ambiente escolar" value={formatSimNao(desenvolvimentoSocial?.possuiAmigosMesmaIdadeForaEscola)} />
                    <ReadOnlyField label="Faz uso funcional de brinquedos" value={formatSimNao(desenvolvimentoSocial?.fazUsoFuncionalBrinquedos)} />
                    <ReadOnlyField label="Brinca próximo aos colegas em ambiente compartilhado" value={formatSimNao(desenvolvimentoSocial?.brincaProximoAosColegas)} />
                    <ReadOnlyField label="Brinca de maneira conjunta com os colegas, faz trocas de turno" value={formatSimNao(desenvolvimentoSocial?.brincaConjuntaComColegas)} />
                    <ReadOnlyField label="Procura os colegas espontaneamente, para iniciar interação" value={formatSimNao(desenvolvimentoSocial?.procuraColegasEspontaneamente)} />
                    <ReadOnlyField label="Se verbal/vocal inicia conversação" value={formatSimNao(desenvolvimentoSocial?.seVerbalIniciaConversa)} />
                    <ReadOnlyField label="Se verbal/vocal, responde perguntas simples" value={formatSimNao(desenvolvimentoSocial?.seVerbalRespondePerguntasSimples)} />
                    <ReadOnlyField label="Faz pedidos aos colegas ou adultos, quando necessário" value={formatSimNao(desenvolvimentoSocial?.fazPedidosQuandoNecessario)} />
                    <ReadOnlyField label="Estabelece contato visual com os adultos, durante interação" value={formatSimNao(desenvolvimentoSocial?.estabeleceContatoVisualAdultos)} />
                    <ReadOnlyField label="Estabelece contato visual com as crianças, durante interação" value={formatSimNao(desenvolvimentoSocial?.estabeleceContatoVisualCriancas)} />
                </div>
                {desenvolvimentoSocial?.observacoes && (
                    <div className="mt-3">
                        <ReadOnlyField label="Observações" value={desenvolvimentoSocial.observacoes} />
                    </div>
                )}
            </div>

            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">18. Desenvolvimento Acadêmico</h4>
                
                {/* Dados da escola */}
                <div className="space-y-3">
                    <ReadOnlyField label="Escola" value={escola?.escola} />
                    <div className="grid grid-cols-2 gap-3">
                        <ReadOnlyField label="Ano/Série" value={escola?.ano?.toString()} />
                        <ReadOnlyField label="Período" value={escola?.periodo} />
                    </div>
                    <ReadOnlyField label="Direção" value={escola?.direcao} />
                    <ReadOnlyField label="Coordenação" value={escola?.coordenacao} />
                    <div className="grid grid-cols-2 gap-3">
                        <ReadOnlyField label="Professora Principal" value={escola?.professoraPrincipal} />
                        <ReadOnlyField label="Professora Assistente" value={escola?.professoraAssistente} />
                    </div>
                </div>

                {/* Campos Sim/Não */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                    <ReadOnlyField label="Frequenta escola regular" value={formatSimNao(escola?.frequentaEscolaRegular)} />
                    <ReadOnlyField label="Frequenta escola especial" value={formatSimNao(escola?.frequentaEscolaEspecial)} />
                    <ReadOnlyField label="Acompanha a turma (demandas pedagógicas)" value={formatSimNao(escola?.acompanhaTurmaDemandasPedagogicas)} />
                    <ReadOnlyField label="Segue regras e rotinas de sala" value={formatSimNao(escola?.segueRegrasRotinaSalaAula)} />
                    <ReadOnlyField label="Necessita apoio de AT" value={formatSimNao(escola?.necessitaApoioAT)} />
                    <ReadOnlyField label="Necessita adaptação de materiais" value={formatSimNao(escola?.necessitaAdaptacaoMateriais)} />
                    <ReadOnlyField label="Necessita adaptação curricular" value={formatSimNao(escola?.necessitaAdaptacaoCurricular)} />
                    <ReadOnlyField label="Houve reprovação/retenção" value={formatSimNao(escola?.houveReprovacaoRetencao)} />
                    <ReadOnlyField label="Escola possui equipe de inclusão" value={formatSimNao(escola?.escolaPossuiEquipeInclusao)} />
                    <ReadOnlyField label="Indicativo de deficiência intelectual" value={formatSimNao(escola?.haIndicativoDeficienciaIntelectual)} />
                    <ReadOnlyField label="Escola apresenta queixa comportamental" value={formatSimNao(escola?.escolaApresentaQueixaComportamental)} />
                </div>

                {/* Campos descritivos */}
                <div className="space-y-3 mt-4 pt-4 border-t">
                    {escola?.adaptacaoEscolar && (
                        <ReadOnlyField label="Adaptação Escolar" value={escola.adaptacaoEscolar} />
                    )}
                    {escola?.dificuldadesEscolares && (
                        <ReadOnlyField label="Dificuldades Escolares" value={escola.dificuldadesEscolares} />
                    )}
                    {escola?.relacionamentoComColegas && (
                        <ReadOnlyField label="Relacionamento com Colegas" value={escola.relacionamentoComColegas} />
                    )}
                    {escola?.observacoes && (
                        <ReadOnlyField label="Observações" value={escola.observacoes} />
                    )}
                </div>
            </div>
        </div>
    );
}
