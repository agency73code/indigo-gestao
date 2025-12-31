import type { AnamneseDetalhe } from '../../types/anamnese-consulta.types';
import { formatSimNao } from './section-utils';
import ReadOnlyField from '../ReadOnlyField';

interface SocialAcademicoSectionProps {
    data: AnamneseDetalhe;
}

export function SocialAcademicoSection({ data }: SocialAcademicoSectionProps) {
    const social = data.socialAcademico;
    const interacao = social.interacaoSocial;
    const escola = social.vidaEscolar;

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">17. Desenvolvimento Social (Relações Interpessoais e Brincar)</h4>
                <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField label="Brinca com outras crianças" value={formatSimNao(interacao?.brincaComOutrasCriancas)} />
                    <ReadOnlyField label="Mantém contato visual" value={formatSimNao(interacao?.mantemContatoVisual)} />
                    <ReadOnlyField label="Responde ao chamar" value={formatSimNao(interacao?.respondeAoChamar)} />
                    <ReadOnlyField label="Compartilha interesses" value={formatSimNao(interacao?.compartilhaInteresses)} />
                </div>
                <div className="mt-3">
                    <ReadOnlyField label="Tipo de brincadeira" value={interacao?.tipoBrincadeira} />
                </div>
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
