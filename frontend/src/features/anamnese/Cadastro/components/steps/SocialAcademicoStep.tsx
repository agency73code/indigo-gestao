import { InputField } from '@/ui/input-field';
import AutoExpandTextarea from '../../ui/AutoExpandTextarea';
import type { AnamneseSocialAcademico, SimNao } from '../../types/anamnese.types';

interface SocialAcademicoStepProps {
    data: Partial<AnamneseSocialAcademico>;
    onChange: (data: Partial<AnamneseSocialAcademico>) => void;
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

export default function SocialAcademicoStep({ data, onChange }: SocialAcademicoStepProps) {
    // Helpers para atualizar dados aninhados
    const updateDesenvolvimentoSocial = (field: string, value: unknown) => {
        onChange({
            ...data,
            desenvolvimentoSocial: {
                possuiAmigosMesmaIdadeEscola: data.desenvolvimentoSocial?.possuiAmigosMesmaIdadeEscola ?? null,
                possuiAmigosMesmaIdadeForaEscola: data.desenvolvimentoSocial?.possuiAmigosMesmaIdadeForaEscola ?? null,
                fazUsoFuncionalBrinquedos: data.desenvolvimentoSocial?.fazUsoFuncionalBrinquedos ?? null,
                brincaProximoAosColegas: data.desenvolvimentoSocial?.brincaProximoAosColegas ?? null,
                brincaConjuntaComColegas: data.desenvolvimentoSocial?.brincaConjuntaComColegas ?? null,
                procuraColegasEspontaneamente: data.desenvolvimentoSocial?.procuraColegasEspontaneamente ?? null,
                seVerbalIniciaConversa: data.desenvolvimentoSocial?.seVerbalIniciaConversa ?? null,
                seVerbalRespondePerguntasSimples: data.desenvolvimentoSocial?.seVerbalRespondePerguntasSimples ?? null,
                fazPedidosQuandoNecessario: data.desenvolvimentoSocial?.fazPedidosQuandoNecessario ?? null,
                estabeleceContatoVisualAdultos: data.desenvolvimentoSocial?.estabeleceContatoVisualAdultos ?? null,
                estabeleceContatoVisualCriancas: data.desenvolvimentoSocial?.estabeleceContatoVisualCriancas ?? null,
                observacoes: data.desenvolvimentoSocial?.observacoes ?? '',
                ...data.desenvolvimentoSocial,
                [field]: value,
            },
        });
    };

    const updateDesenvolvimentoAcademico = (field: string, value: unknown) => {
        onChange({
            ...data,
            desenvolvimentoAcademico: {
                escola: data.desenvolvimentoAcademico?.escola ?? '',
                ano: data.desenvolvimentoAcademico?.ano ?? '',
                periodo: data.desenvolvimentoAcademico?.periodo ?? '',
                direcao: data.desenvolvimentoAcademico?.direcao ?? '',
                coordenacao: data.desenvolvimentoAcademico?.coordenacao ?? '',
                professoraPrincipal: data.desenvolvimentoAcademico?.professoraPrincipal ?? '',
                professoraAssistente: data.desenvolvimentoAcademico?.professoraAssistente ?? '',
                frequentaEscolaRegular: data.desenvolvimentoAcademico?.frequentaEscolaRegular ?? null,
                frequentaEscolaEspecial: data.desenvolvimentoAcademico?.frequentaEscolaEspecial ?? null,
                acompanhaTurmaDemandasPedagogicas: data.desenvolvimentoAcademico?.acompanhaTurmaDemandasPedagogicas ?? null,
                segueRegrasRotinaSalaAula: data.desenvolvimentoAcademico?.segueRegrasRotinaSalaAula ?? null,
                necessitaApoioAT: data.desenvolvimentoAcademico?.necessitaApoioAT ?? null,
                necessitaAdaptacaoMateriais: data.desenvolvimentoAcademico?.necessitaAdaptacaoMateriais ?? null,
                necessitaAdaptacaoCurricular: data.desenvolvimentoAcademico?.necessitaAdaptacaoCurricular ?? null,
                houveReprovacaoRetencao: data.desenvolvimentoAcademico?.houveReprovacaoRetencao ?? null,
                escolaPossuiEquipeInclusao: data.desenvolvimentoAcademico?.escolaPossuiEquipeInclusao ?? null,
                haIndicativoDeficienciaIntelectual: data.desenvolvimentoAcademico?.haIndicativoDeficienciaIntelectual ?? null,
                escolaApresentaQueixaComportamental: data.desenvolvimentoAcademico?.escolaApresentaQueixaComportamental ?? null,
                adaptacaoEscolar: data.desenvolvimentoAcademico?.adaptacaoEscolar ?? '',
                dificuldadesEscolares: data.desenvolvimentoAcademico?.dificuldadesEscolares ?? '',
                relacionamentoComColegas: data.desenvolvimentoAcademico?.relacionamentoComColegas ?? '',
                observacoes: data.desenvolvimentoAcademico?.observacoes ?? '',
                ...data.desenvolvimentoAcademico,
                [field]: value,
            },
        });
    };

    return (
        <div className="space-y-4">
            {/* 17. Desenvolvimento Social */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">17. Desenvolvimento Social (Relações Interpessoais e Brincar) <span className="text-red-500">*</span></h3>
                
                <div className="space-y-1">
                    <SimNaoField
                        label="Possui amigos da mesma idade no ambiente escolar, quando aplicável."
                        value={data.desenvolvimentoSocial?.possuiAmigosMesmaIdadeEscola ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('possuiAmigosMesmaIdadeEscola', v)}
                    />
                    <SimNaoField
                        label="Possui amigos da mesma idade fora do ambiente escolar."
                        value={data.desenvolvimentoSocial?.possuiAmigosMesmaIdadeForaEscola ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('possuiAmigosMesmaIdadeForaEscola', v)}
                    />
                    <SimNaoField
                        label="Faz uso funcional de brinquedos."
                        value={data.desenvolvimentoSocial?.fazUsoFuncionalBrinquedos ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('fazUsoFuncionalBrinquedos', v)}
                    />
                    <SimNaoField
                        label="Brinca próximo aos colegas em ambiente compartilhado."
                        value={data.desenvolvimentoSocial?.brincaProximoAosColegas ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('brincaProximoAosColegas', v)}
                    />
                    <SimNaoField
                        label="Brinca de maneira conjunta com os colegas, faz trocas de turno."
                        value={data.desenvolvimentoSocial?.brincaConjuntaComColegas ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('brincaConjuntaComColegas', v)}
                    />
                    <SimNaoField
                        label="Procura os colegas espontaneamente, para iniciar interação."
                        value={data.desenvolvimentoSocial?.procuraColegasEspontaneamente ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('procuraColegasEspontaneamente', v)}
                    />
                    <SimNaoField
                        label="Se verbal/vocal inicia conversação?"
                        value={data.desenvolvimentoSocial?.seVerbalIniciaConversa ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('seVerbalIniciaConversa', v)}
                    />
                    <SimNaoField
                        label="Se verbal/vocal, responde perguntas simples?"
                        value={data.desenvolvimentoSocial?.seVerbalRespondePerguntasSimples ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('seVerbalRespondePerguntasSimples', v)}
                    />
                    <SimNaoField
                        label="Faz pedidos aos colegas ou adultos, quando necessário."
                        value={data.desenvolvimentoSocial?.fazPedidosQuandoNecessario ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('fazPedidosQuandoNecessario', v)}
                    />
                    <SimNaoField
                        label="Estabelece contato visual com os adultos, durante interação."
                        value={data.desenvolvimentoSocial?.estabeleceContatoVisualAdultos ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('estabeleceContatoVisualAdultos', v)}
                    />
                    <SimNaoField
                        label="Estabelece contato visual com as crianças, durante interação."
                        value={data.desenvolvimentoSocial?.estabeleceContatoVisualCriancas ?? null}
                        onChange={(v) => updateDesenvolvimentoSocial('estabeleceContatoVisualCriancas', v)}
                    />
                </div>

                <AutoExpandTextarea
                    label="Observações"
                    placeholder="Ex: Como os pais percebem as dificuldades de relacionamento social? Em quais situações ocorrem? Como a criança reage em grupos?"
                    value={data.desenvolvimentoSocial?.observacoes ?? ''}
                    onChange={(value) => updateDesenvolvimentoSocial('observacoes', value)}
                />
            </div>

            {/* 18. Desenvolvimento Acadêmico */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">18. Desenvolvimento Acadêmico <span className="text-red-500">*</span></h3>
                
                {/* Dados da Escola */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <InputField
                            label="Escola"
                            placeholder="Nome da escola"
                            value={data.desenvolvimentoAcademico?.escola ?? ''}
                            onChange={(e) => updateDesenvolvimentoAcademico('escola', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Ano"
                            placeholder="Ex: 2024"
                            value={data.desenvolvimentoAcademico?.ano ?? ''}
                            onChange={(e) => updateDesenvolvimentoAcademico('ano', e.target.value)}
                        />
                        <InputField
                            label="Período"
                            placeholder="Ex: Manhã"
                            value={data.desenvolvimentoAcademico?.periodo ?? ''}
                            onChange={(e) => updateDesenvolvimentoAcademico('periodo', e.target.value)}
                        />
                    </div>
                </div>

                <InputField
                    label="Direção"
                    placeholder="Nome do(a) diretor(a)"
                    value={data.desenvolvimentoAcademico?.direcao ?? ''}
                    onChange={(e) => updateDesenvolvimentoAcademico('direcao', e.target.value)}
                />

                <InputField
                    label="Coordenação"
                    placeholder="Nome do(a) coordenador(a)"
                    value={data.desenvolvimentoAcademico?.coordenacao ?? ''}
                    onChange={(e) => updateDesenvolvimentoAcademico('coordenacao', e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Professora principal"
                        placeholder="Nome da professora principal"
                        value={data.desenvolvimentoAcademico?.professoraPrincipal ?? ''}
                        onChange={(e) => updateDesenvolvimentoAcademico('professoraPrincipal', e.target.value)}
                    />
                    <InputField
                        label="Professora assistente"
                        placeholder="Nome da professora assistente"
                        value={data.desenvolvimentoAcademico?.professoraAssistente ?? ''}
                        onChange={(e) => updateDesenvolvimentoAcademico('professoraAssistente', e.target.value)}
                    />
                </div>

                <div className="space-y-1 pt-4 border-t">
                    <SimNaoField
                        label="Frequenta escola regular."
                        value={data.desenvolvimentoAcademico?.frequentaEscolaRegular ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('frequentaEscolaRegular', v)}
                    />
                    <SimNaoField
                        label="Frequenta escola especial (seja no contraturno ou não)."
                        value={data.desenvolvimentoAcademico?.frequentaEscolaEspecial ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('frequentaEscolaEspecial', v)}
                    />
                    <SimNaoField
                        label="Acompanha a turma em relação as demandas pedagógicas."
                        value={data.desenvolvimentoAcademico?.acompanhaTurmaDemandasPedagogicas ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('acompanhaTurmaDemandasPedagogicas', v)}
                    />
                    <SimNaoField
                        label="Segue regras e rotinas de sala de aula."
                        value={data.desenvolvimentoAcademico?.segueRegrasRotinaSalaAula ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('segueRegrasRotinaSalaAula', v)}
                    />
                    <SimNaoField
                        label="Necessita de apoio de AT no período escolar."
                        value={data.desenvolvimentoAcademico?.necessitaApoioAT ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('necessitaApoioAT', v)}
                    />
                    <SimNaoField
                        label="Necessita de adaptação de materiais."
                        value={data.desenvolvimentoAcademico?.necessitaAdaptacaoMateriais ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('necessitaAdaptacaoMateriais', v)}
                    />
                    <SimNaoField
                        label="Necessita de adaptação curricular."
                        value={data.desenvolvimentoAcademico?.necessitaAdaptacaoCurricular ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('necessitaAdaptacaoCurricular', v)}
                    />
                    <SimNaoField
                        label="Houve reprovação/retenção em algum ano até o momento."
                        value={data.desenvolvimentoAcademico?.houveReprovacaoRetencao ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('houveReprovacaoRetencao', v)}
                    />
                    <SimNaoField
                        label="A escola possui equipe especializada sobre inclusão."
                        value={data.desenvolvimentoAcademico?.escolaPossuiEquipeInclusao ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('escolaPossuiEquipeInclusao', v)}
                    />
                    <SimNaoField
                        label="Há indicativo de deficiência intelectual associada (previamente avaliada)."
                        value={data.desenvolvimentoAcademico?.haIndicativoDeficienciaIntelectual ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('haIndicativoDeficienciaIntelectual', v)}
                    />
                    <SimNaoField
                        label="Escola apresenta queixa quanto a questões comportamentais."
                        value={data.desenvolvimentoAcademico?.escolaApresentaQueixaComportamental ?? null}
                        onChange={(v) => updateDesenvolvimentoAcademico('escolaApresentaQueixaComportamental', v)}
                    />
                </div>

                {/* Campos descritivos */}
                <div className="space-y-4 pt-4 border-t">
                    <AutoExpandTextarea
                        label="Adaptação Escolar"
                        placeholder="Descreva como foi/está sendo a adaptação escolar da criança"
                        value={data.desenvolvimentoAcademico?.adaptacaoEscolar ?? ''}
                        onChange={(value) => updateDesenvolvimentoAcademico('adaptacaoEscolar', value)}
                    />
                    
                    <AutoExpandTextarea
                        label="Dificuldades Escolares"
                        placeholder="Descreva as principais dificuldades escolares observadas"
                        value={data.desenvolvimentoAcademico?.dificuldadesEscolares ?? ''}
                        onChange={(value) => updateDesenvolvimentoAcademico('dificuldadesEscolares', value)}
                    />
                    
                    <AutoExpandTextarea
                        label="Relacionamento com Colegas"
                        placeholder="Descreva como é o relacionamento da criança com os colegas"
                        value={data.desenvolvimentoAcademico?.relacionamentoComColegas ?? ''}
                        onChange={(value) => updateDesenvolvimentoAcademico('relacionamentoComColegas', value)}
                    />
                </div>

                <AutoExpandTextarea
                    label="Observações"
                    placeholder="Ex: Quais são as dificuldades pedagógicas observadas? Como se manifestam em sala de aula? Há áreas de maior desafio (leitura, escrita, matemática)?"
                    value={data.desenvolvimentoAcademico?.observacoes ?? ''}
                    onChange={(value) => updateDesenvolvimentoAcademico('observacoes', value)}
                />
            </div>
        </div>
    );
}
