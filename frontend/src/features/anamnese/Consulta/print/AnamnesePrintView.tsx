/**
 * Componente de visualização de impressão da Anamnese
 * Layout limpo estilo Google Forms para exportação em PDF
 */

import { forwardRef } from 'react';
import indigoLogo from '@/assets/logos/indigo.svg';
import type { AnamneseDetalhe, MarcoDesenvolvimento } from '../types/anamnese-consulta.types';
import type { SimNao } from '../../Cadastro/types/anamnese.types';

// Dados da clínica para o rodapé
const CLINIC_INFO = {
    name: 'Clínica Instituto Índigo',
    address: 'Av Vital Brasil, 305, Butantã, CJ 905-909',
    cep: 'CEP 05503-001',
    phone: '+55 11 96973-2227',
    email: 'clinica.indigo@gmail.com',
    instagram: '@inst.indigo',
};

// Mapa de relações para exibição
const PARENTESCO_LABELS: Record<string, string> = {
    'mae': 'Mãe',
    'pai': 'Pai',
    'avo': 'Avó/Avô',
    'tio': 'Tia/Tio',
    'responsavel': 'Responsável legal',
    'tutor': 'Tutor(a)',
    'outro': 'Outro',
};

interface AnamnesePrintViewProps {
    anamnese: AnamneseDetalhe;
}

// Formatadores
const formatDate = (date: string) => {
    if (!date) return 'Não informado';
    try {
        return new Date(date).toLocaleDateString('pt-BR');
    } catch {
        return date;
    }
};

const formatSimNao = (value: SimNao | null | undefined): string => {
    if (!value) return 'Não informado';
    return value === 'sim' ? 'Sim' : 'Não';
};

const formatSimNaoComAjuda = (value: string | null | undefined): string => {
    if (!value) return 'Não informado';
    const map: Record<string, string> = {
        'sim': 'Sim',
        'com_ajuda': 'Sim, com ajuda',
        'nao': 'Não',
    };
    return map[value] || value;
};

const formatMarcoDesenvolvimento = (marco: MarcoDesenvolvimento): string => {
    if (!marco) return 'Não informado';
    if (marco.status === 'naoRealiza') return 'Não realiza';
    if (marco.status === 'naoSoubeInformar') return 'Não soube informar';
    if (marco.meses) return `${marco.meses} meses`;
    return 'Não informado';
};

const formatDesfralde = (item: { anos: string; meses: string; utilizaFralda: boolean }) => {
    if (item.utilizaFralda) return 'Utiliza fralda';
    const anos = item.anos ? `${item.anos} ano${item.anos !== '1' ? 's' : ''}` : '';
    const meses = item.meses ? `${item.meses} ${item.meses === '1' ? 'mês' : 'meses'}` : '';
    if (!anos && !meses) return 'Não informado';
    return [anos, meses].filter(Boolean).join(' e ');
};

const formatParentesco = (value: string, descricao?: string): string => {
    if (value === 'outro' && descricao) return descricao;
    return PARENTESCO_LABELS[value] || value || 'Não informado';
};

// Componentes de layout
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
        <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: 'var(--primary)', 
            borderBottom: '2px solid var(--primary)', 
            paddingBottom: '8px', 
            marginBottom: '16px' 
        }}>
            {title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {children}
        </div>
    </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-4 page-break-inside-avoid">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
        <div className="pl-2 border-l-2 border-gray-200">
            {children}
        </div>
    </div>
);

const Field = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <div className="flex py-1">
        <span className="text-sm text-gray-600 min-w-[200px]">{label}:</span>
        <span className="text-sm text-gray-900 flex-1">{value || 'Não informado'}</span>
    </div>
);

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
        {children}
    </div>
);

const TextBlock = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <div className="py-2">
        <span className="text-sm font-medium text-gray-700 block mb-1">{label}:</span>
        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
            {value || 'Não informado'}
        </p>
    </div>
);

const ListSection = ({ title, items, renderItem }: { 
    title: string; 
    items: any[]; 
    renderItem: (item: any, index: number) => React.ReactNode;
}) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="mb-3">
            <span className="text-sm font-medium text-gray-700 block mb-2">{title}:</span>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={item.id || index} className="bg-gray-50 p-3 rounded border text-sm">
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AnamnesePrintView = forwardRef<HTMLDivElement, AnamnesePrintViewProps>(
    ({ anamnese }, ref) => {
        const formattedDate = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const cab = anamnese.cabecalho;
        const qd = anamnese.queixaDiagnostico;
        const cf = anamnese.contextoFamiliarRotina;
        const dev = anamnese.desenvolvimentoInicial;
        const avd = anamnese.atividadesVidaDiaria;
        const sa = anamnese.socialAcademico;
        const comp = anamnese.comportamento;
        const fin = anamnese.finalizacao;

        return (
            <div ref={ref} className="bg-white text-gray-900 p-8 max-w-4xl mx-auto print:max-w-none print:p-4">
                {/* ===== CABEÇALHO ===== */}
                <div style={{ 
                    paddingBottom: '16px', 
                    marginBottom: '16px' 
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        paddingBottom: '12px',
                        marginBottom: '12px',
                        borderBottom: '1px solid #2c3e50'
                    }}>
                        <img 
                            src={indigoLogo} 
                            alt="Logo Índigo" 
                            style={{ height: '50px', width: 'auto', marginRight: '16px' }}
                        />
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: '400', color: '#2c3e50'}}>
                                Anamnese
                            </div>
                            <div style={{ fontSize: '14px', color: '#4b5563' }}>
                                Cliente: <strong>{cab.clienteNome}</strong> • {cab.idade}
                            </div>
                        </div>
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '13px'
                    }}>
                        <div>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '1px' }}>
                                Profissional Responsável
                            </div>
                            <div style={{ fontWeight: '500' }}>{cab.profissionalNome}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '1px' }}>
                                Data da Entrevista
                            </div>
                            <div style={{ fontWeight: '500' }}>{formatDate(cab.dataEntrevista)}</div>
                        </div>
                        <div style={{ textAlign: 'right', color: '#6b7280' }}>
                            Gerado em {formattedDate}
                        </div>
                    </div>
                </div>

                {/* ===== 1. IDENTIFICAÇÃO ===== */}
                <Section title="Identificação">
                    <FieldGrid>
                        <Field label="Data de Nascimento" value={formatDate(cab.dataNascimento)} />
                        <Field label="Idade" value={cab.idade} />
                        <Field label="Informante" value={cab.informante} />
                        <Field label="Parentesco" value={formatParentesco(cab.parentesco, cab.parentescoDescricao)} />
                    </FieldGrid>
                    <Field label="Quem indicou" value={cab.quemIndicou} />
                    
                    {cab.cuidadores && cab.cuidadores.length > 0 && (
                        <ListSection
                            title="Cuidadores"
                            items={cab.cuidadores}
                            renderItem={(cuidador) => (
                                <div className="grid grid-cols-2 gap-2">
                                    <span><strong>Nome:</strong> {cuidador.nome}</span>
                                    <span><strong>Relação:</strong> {formatParentesco(cuidador.relacao, cuidador.descricaoRelacao)}</span>
                                    {cuidador.telefone && <span><strong>Telefone:</strong> {cuidador.telefone}</span>}
                                    {cuidador.email && <span><strong>E-mail:</strong> {cuidador.email}</span>}
                                    {cuidador.profissao && <span><strong>Profissão:</strong> {cuidador.profissao}</span>}
                                    {cuidador.escolaridade && <span><strong>Escolaridade:</strong> {cuidador.escolaridade}</span>}
                                </div>
                            )}
                        />
                    )}
                </Section>

                {/* ===== 2. QUEIXA E DIAGNÓSTICO ===== */}
                <Section title="Queixa e Diagnóstico">
                    <TextBlock label="1. Queixa Principal Atual" value={qd.queixaPrincipal} />
                    <TextBlock label="2. Diagnóstico Prévio" value={qd.diagnosticoPrevio} />
                    <TextBlock label="3. Há Suspeita de Outra Condição Associada?" value={qd.suspeitaCondicaoAssociada} />
                    
                    <ListSection
                        title="4. Médicos Consultados até o Momento"
                        items={qd.especialidadesConsultadas}
                        renderItem={(item) => (
                            <div className="grid grid-cols-2 gap-2">
                                <span><strong>Especialidade:</strong> {item.especialidade}</span>
                                <span><strong>Profissional:</strong> {item.nome}</span>
                                <span><strong>Data:</strong> {formatDate(item.data)}</span>
                                <span><strong>Ainda consulta:</strong> {item.ativo ? 'Sim' : 'Não'}</span>
                                {item.observacao && <span className="col-span-2"><strong>Obs:</strong> {item.observacao}</span>}
                            </div>
                        )}
                    />

                    <ListSection
                        title="5. Medicamentos em Uso"
                        items={qd.medicamentosEmUso}
                        renderItem={(item) => (
                            <div className="grid grid-cols-2 gap-2">
                                <span><strong>Medicamento:</strong> {item.nome}</span>
                                <span><strong>Dosagem:</strong> {item.dosagem}</span>
                                <span><strong>Início:</strong> {formatDate(item.dataInicio)}</span>
                                <span><strong>Motivo:</strong> {item.motivo}</span>
                            </div>
                        )}
                    />

                    <ListSection
                        title="6. Exames Prévios"
                        items={qd.examesPrevios}
                        renderItem={(item) => (
                            <div className="grid grid-cols-2 gap-2">
                                <span><strong>Exame:</strong> {item.nome}</span>
                                <span><strong>Data:</strong> {formatDate(item.data)}</span>
                                <span className="col-span-2"><strong>Resultado:</strong> {item.resultado}</span>
                            </div>
                        )}
                    />

                    <ListSection
                        title="7. Terapias curso ou já realizadas"
                        items={qd.terapiasPrevias}
                        renderItem={(item) => (
                            <div className="grid grid-cols-2 gap-2">
                                <span><strong>Profissional:</strong> {item.profissional}</span>
                                <span><strong>Especialidade/Abordagem:</strong> {item.especialidadeAbordagem}</span>
                                <span><strong>Tempo de Intervenção:</strong> {item.tempoIntervencao}</span>
                                <span><strong>Ainda realiza:</strong> {item.ativo ? 'Sim' : 'Não'}</span>
                                {item.observacao && <span className="col-span-2"><strong>Obs:</strong> {item.observacao}</span>}
                            </div>
                        )}
                    />
                </Section>

                {/* ===== 3. CONTEXTO FAMILIAR E ROTINA ===== */}
                <Section title="Contexto Familiar e Rotina">
                    <ListSection
                        title="8. Histórico Familiar"
                        items={cf.historicoFamiliar || []}
                        renderItem={(item) => (
                            <div className="grid grid-cols-2 gap-2">
                                <span><strong>Parentesco:</strong> {item.parentesco}</span>
                                <span><strong>Condição:</strong> {item.condicao}</span>
                                {item.observacao && <span className="col-span-2"><strong>Obs:</strong> {item.observacao}</span>}
                            </div>
                        )}
                    />

                    <ListSection
                        title="9. Rotina Diária"
                        items={cf.rotinaDiaria || []}
                        renderItem={(item) => (
                            <div className="grid grid-cols-2 gap-2">
                                <span><strong>Horário:</strong> {item.horario}</span>
                                <span><strong>Atividade:</strong> {item.atividade}</span>
                                <span><strong>Responsável:</strong> {item.responsavel}</span>
                                {item.frequencia && <span><strong>Frequência:</strong> {item.frequencia}</span>}
                                {item.observacao && <span className="col-span-2"><strong>Obs:</strong> {item.observacao}</span>}
                            </div>
                        )}
                    />
                </Section>

                {/* ===== 4. DESENVOLVIMENTO INICIAL ===== */}
                <Section title="Desenvolvimento Inicial">
                    <SubSection title="10. Gestação e Parto">
                        <FieldGrid>
                            <Field label="Tipo de Parto" value={dev.gestacaoParto.tipoParto} />
                            <Field label="Semanas" value={dev.gestacaoParto.semanas ? `${dev.gestacaoParto.semanas} semanas` : undefined} />
                            <Field label="APGAR 1º min" value={dev.gestacaoParto.apgar1min?.toString() ?? undefined} />
                            <Field label="APGAR 5º min" value={dev.gestacaoParto.apgar5min?.toString() ?? undefined} />
                        </FieldGrid>
                        <TextBlock label="Intercorrências" value={dev.gestacaoParto.intercorrencias} />
                    </SubSection>

                    <SubSection title="11. Desenvolvimento Neuropsicomotor">
                        <FieldGrid>
                            <Field label="Sustentou a cabeça" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.sustentouCabeca)} />
                            <Field label="Rolou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.rolou)} />
                            <Field label="Sentou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.sentou)} />
                            <Field label="Engatinhou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.engatinhou)} />
                            <Field label="Andou com apoio" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouComApoio)} />
                            <Field label="Andou sem apoio" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouSemApoio)} />
                            <Field label="Correu" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.correu)} />
                            <Field label="Andou de motoca" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouDeMotoca)} />
                            <Field label="Andou de bicicleta" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouDeBicicleta)} />
                            <Field label="Subiu escadas sozinho" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.subiuEscadasSozinho)} />
                        </FieldGrid>
                        <TextBlock label="Motricidade Fina" value={dev.neuropsicomotor.motricidadeFina} />
                    </SubSection>

                    <SubSection title="12. Desenvolvimento da Fala e da Linguagem">
                        <FieldGrid>
                            <Field label="Balbuciou" value={formatMarcoDesenvolvimento(dev.falaLinguagem.balbuciou)} />
                            <Field label="Primeiras palavras" value={formatMarcoDesenvolvimento(dev.falaLinguagem.primeirasPalavras)} />
                            <Field label="Primeiras frases" value={formatMarcoDesenvolvimento(dev.falaLinguagem.primeirasFrases)} />
                            <Field label="Apontou para fazer pedidos" value={formatMarcoDesenvolvimento(dev.falaLinguagem.apontouParaFazerPedidos)} />
                        </FieldGrid>
                        <FieldGrid >
                            <Field label="Faz uso de gestos" value={formatSimNao(dev.falaLinguagem.fazUsoDeGestos)} />
                        </FieldGrid>
                        {dev.falaLinguagem.fazUsoDeGestos === 'sim' && (
                            <Field label="Quais gestos" value={dev.falaLinguagem.fazUsoDeGestosQuais} />
                        )}
                        <TextBlock label="Comunicação Atual" value={dev.falaLinguagem.comunicacaoAtual} />
                        <FieldGrid>
                            <Field label="Audição (percepção do responsável)" value={dev.falaLinguagem.audicao === 'boa' ? 'Boa' : dev.falaLinguagem.audicao === 'ruim' ? 'Ruim' : dev.falaLinguagem.audicao} />
                            <Field label="Teve otite de repetição" value={formatSimNao(dev.falaLinguagem.teveOtiteDeRepeticao)} />
                        </FieldGrid>
                        {dev.falaLinguagem.teveOtiteDeRepeticao === 'sim' && (
                            <Field label="Detalhes da otite" value={dev.falaLinguagem.otiteDetalhes} />
                        )}
                        <Field label="Faz ou fez uso de tubo de ventilação" value={formatSimNao(dev.falaLinguagem.fazOuFezUsoTuboVentilacao)} />
                        {dev.falaLinguagem.fazOuFezUsoTuboVentilacao === 'sim' && dev.falaLinguagem.tuboVentilacaoObservacao && (
                            <Field label="Observação do tubo de ventilação" value={dev.falaLinguagem.tuboVentilacaoObservacao} />
                        )}
                        
                        <div className="mt-2 pt-2 border-t">
                            <span className="text-sm font-medium text-gray-700">Hábitos Orais:</span>
                        </div>
                        <Field label="Uso de objeto oral (chupeta, paninho, dedo)" value={formatSimNao(dev.falaLinguagem.fazOuFezUsoObjetoOral)} />
                        {dev.falaLinguagem.fazOuFezUsoObjetoOral === 'sim' && (
                            <Field label="Especificação" value={dev.falaLinguagem.objetoOralEspecificar} />
                        )}
                        <Field label="Usa mamadeira" value={formatSimNao(dev.falaLinguagem.usaMamadeira)} />
                        {dev.falaLinguagem.usaMamadeira === 'sim' && (
                            <Field label="Detalhes da mamadeira" value={dev.falaLinguagem.mamadeiraDetalhes} />
                        )}
                    </SubSection>
                </Section>

                {/* ===== 5. ATIVIDADES DE VIDA DIÁRIA ===== */}
                <Section title="Atividades de Vida Diária">
                    <SubSection title="13. Desfralde">
                        <FieldGrid>
                            <Field label="Desfralde diurno (urina)" value={formatDesfralde(avd.desfralde.desfraldeDiurnoUrina)} />
                            <Field label="Desfralde noturno (urina)" value={formatDesfralde(avd.desfralde.desfraldeNoturnoUrina)} />
                            <Field label="Desfralde (fezes)" value={formatDesfralde(avd.desfralde.desfraldeFezes)} />
                        </FieldGrid>
                        <FieldGrid>
                            <Field label="Se limpa sozinho ao urinar" value={formatSimNao(avd.desfralde.seLimpaSozinhoUrinar)} />
                            <Field label="Se limpa sozinho ao defecar" value={formatSimNao(avd.desfralde.seLimpaSozinhoDefecar)} />
                            <Field label="Lava as mãos após uso do banheiro" value={formatSimNao(avd.desfralde.lavaAsMaosAposUsoBanheiro)} />
                            <Field label="Apresenta alteração de hábito intestinal" value={formatSimNao(avd.desfralde.apresentaAlteracaoHabitoIntestinal)} />
                        </FieldGrid>
                        {avd.desfralde.observacoes && <TextBlock label="Observações" value={avd.desfralde.observacoes} />}
                    </SubSection>

                    <SubSection title="14. Sono">
                        <FieldGrid>
                            <Field label="Horas de sono à noite" value={avd.sono.dormemMediaHorasNoite ? `${avd.sono.dormemMediaHorasNoite} horas` : undefined} />
                            <Field label="Horas de sono de dia" value={avd.sono.dormemMediaHorasDia ? `${avd.sono.dormemMediaHorasDia} horas` : undefined} />
                            <Field label="Período do sono diurno" value={avd.sono.periodoSonoDia === 'manha' ? 'Manhã' : avd.sono.periodoSonoDia === 'tarde' ? 'Tarde' : undefined} />
                        </FieldGrid>
                        <FieldGrid>
                            <Field label="Dificuldade para iniciar o sono" value={formatSimNao(avd.sono.temDificuldadeIniciarSono)} />
                            <Field label="Acorda de madrugada" value={formatSimNao(avd.sono.acordaDeMadrugada)} />
                            <Field label="Dorme na própria cama" value={formatSimNao(avd.sono.dormeNaPropriaCama)} />
                            <Field label="Dorme no próprio quarto" value={formatSimNao(avd.sono.dormeNoProprioQuarto)} />
                            <Field label="Apresenta sono agitado" value={formatSimNao(avd.sono.apresentaSonoAgitado)} />
                            <Field label="É sonâmbulo" value={formatSimNao(avd.sono.eSonambulo)} />
                        </FieldGrid>
                        {avd.sono.observacoes && <TextBlock label="Observações" value={avd.sono.observacoes} />}
                    </SubSection>

                    <SubSection title="15. Hábitos Diários de Higiene">
                        <FieldGrid>
                            <Field label="Toma banho e lava o corpo todo" value={formatSimNaoComAjuda(avd.habitosHigiene.tomaBanhoLavaCorpoTodo)} />
                            <Field label="Seca o corpo todo" value={formatSimNaoComAjuda(avd.habitosHigiene.secaCorpoTodo)} />
                            <Field label="Retira todas as peças de roupa" value={formatSimNaoComAjuda(avd.habitosHigiene.retiraTodasPecasRoupa)} />
                            <Field label="Coloca todas as peças de roupa" value={formatSimNaoComAjuda(avd.habitosHigiene.colocaTodasPecasRoupa)} />
                            <Field label="Põe calçados sem cadarço" value={formatSimNaoComAjuda(avd.habitosHigiene.poeCalcadosSemCadarco)} />
                            <Field label="Põe calçados com cadarço" value={formatSimNaoComAjuda(avd.habitosHigiene.poeCalcadosComCadarco)} />
                            <Field label="Escova os dentes" value={formatSimNaoComAjuda(avd.habitosHigiene.escovaOsDentes)} />
                            <Field label="Penteia o cabelo" value={formatSimNaoComAjuda(avd.habitosHigiene.penteiaOCabelo)} />
                        </FieldGrid>
                        {avd.habitosHigiene.observacoes && <TextBlock label="Observações" value={avd.habitosHigiene.observacoes} />}
                    </SubSection>

                    <SubSection title="16. Alimentação">
                        <FieldGrid>
                            <Field label="Apresenta queixa de alimentação" value={formatSimNao(avd.alimentacao.apresentaQueixaAlimentacao)} />
                            <Field label="Se alimenta sozinho" value={formatSimNao(avd.alimentacao.seAlimentaSozinho)} />
                            <Field label="É seletivo quanto a alimentos" value={formatSimNao(avd.alimentacao.eSeletivoQuantoAlimentos)} />
                            <Field label="Passa o dia inteiro sem comer" value={formatSimNao(avd.alimentacao.passaDiaInteiroSemComer)} />
                            <Field label="Apresenta rituais para se alimentar" value={formatSimNao(avd.alimentacao.apresentaRituaisParaAlimentar)} />
                            <Field label="Está abaixo ou acima do peso" value={formatSimNao(avd.alimentacao.estaAbaixoOuAcimaPeso)} />
                        </FieldGrid>
                        {avd.alimentacao.estaAbaixoOuAcimaPeso === 'sim' && avd.alimentacao.estaAbaixoOuAcimaPesoDescricao && (
                            <Field label="Peso/Altura e acompanhamento" value={avd.alimentacao.estaAbaixoOuAcimaPesoDescricao} />
                        )}
                        <FieldGrid>
                            <Field label="Tem histórico de anemia" value={formatSimNao(avd.alimentacao.temHistoricoAnemia)} />
                        </FieldGrid>
                        {avd.alimentacao.temHistoricoAnemia === 'sim' && avd.alimentacao.temHistoricoAnemiaDescricao && (
                            <Field label="Histórico de anemia - desde quando" value={avd.alimentacao.temHistoricoAnemiaDescricao} />
                        )}
                        <FieldGrid>
                            <Field label="Rotina alimentar é problema para a família" value={formatSimNao(avd.alimentacao.rotinaAlimentarEProblemaFamilia)} />
                        </FieldGrid>
                        {avd.alimentacao.rotinaAlimentarEProblemaFamilia === 'sim' && avd.alimentacao.rotinaAlimentarEProblemaFamiliaDescricao && (
                            <Field label="Maiores dificuldades" value={avd.alimentacao.rotinaAlimentarEProblemaFamiliaDescricao} />
                        )}
                        {avd.alimentacao.observacoes && <TextBlock label="Observações" value={avd.alimentacao.observacoes} />}
                    </SubSection>
                </Section>

                {/* ===== 6. SOCIAL E ACADÊMICO ===== */}
                <Section title="Social e Acadêmico">
                    <SubSection title="17. Desenvolvimento Social (Relações Interpessoais e Brincar)">
                        <FieldGrid>
                            <Field label="Possui amigos da mesma idade no ambiente escolar" value={formatSimNao(sa.desenvolvimentoSocial?.possuiAmigosMesmaIdadeEscola)} />
                            <Field label="Possui amigos da mesma idade fora do ambiente escolar" value={formatSimNao(sa.desenvolvimentoSocial?.possuiAmigosMesmaIdadeForaEscola)} />
                            <Field label="Faz uso funcional de brinquedos" value={formatSimNao(sa.desenvolvimentoSocial?.fazUsoFuncionalBrinquedos)} />
                            <Field label="Brinca próximo aos colegas em ambiente compartilhado" value={formatSimNao(sa.desenvolvimentoSocial?.brincaProximoAosColegas)} />
                            <Field label="Brinca de maneira conjunta com os colegas" value={formatSimNao(sa.desenvolvimentoSocial?.brincaConjuntaComColegas)} />
                            <Field label="Procura os colegas espontaneamente" value={formatSimNao(sa.desenvolvimentoSocial?.procuraColegasEspontaneamente)} />
                            <Field label="Se verbal/vocal inicia conversação" value={formatSimNao(sa.desenvolvimentoSocial?.seVerbalIniciaConversa)} />
                            <Field label="Se verbal/vocal, responde perguntas simples" value={formatSimNao(sa.desenvolvimentoSocial?.seVerbalRespondePerguntasSimples)} />
                            <Field label="Faz pedidos quando necessário" value={formatSimNao(sa.desenvolvimentoSocial?.fazPedidosQuandoNecessario)} />
                            <Field label="Estabelece contato visual com adultos" value={formatSimNao(sa.desenvolvimentoSocial?.estabeleceContatoVisualAdultos)} />
                            <Field label="Estabelece contato visual com crianças" value={formatSimNao(sa.desenvolvimentoSocial?.estabeleceContatoVisualCriancas)} />
                        </FieldGrid>
                        {sa.desenvolvimentoSocial?.observacoes && (
                            <TextBlock label="Observações" value={sa.desenvolvimentoSocial.observacoes} />
                        )}
                    </SubSection>

                    <SubSection title="18. Desenvolvimento Acadêmico">
                        {/* Dados da escola */}
                        <Field label="Escola" value={sa.desenvolvimentoAcademico?.escola} />
                        <Field label="Ano/Série" value={sa.desenvolvimentoAcademico?.ano?.toString()} />
                        <Field label="Período" value={sa.desenvolvimentoAcademico?.periodo} />
                        <Field label="Direção" value={sa.desenvolvimentoAcademico?.direcao} />
                        <Field label="Coordenação" value={sa.desenvolvimentoAcademico?.coordenacao} />
                        <FieldGrid>
                            <Field label="Professora Principal" value={sa.desenvolvimentoAcademico?.professoraPrincipal} />
                            <Field label="Professora Assistente" value={sa.desenvolvimentoAcademico?.professoraAssistente} />
                        </FieldGrid>

                        {/* Campos Sim/Não */}
                        <FieldGrid>
                            <Field label="Frequenta escola regular" value={formatSimNao(sa.desenvolvimentoAcademico?.frequentaEscolaRegular)} />
                            <Field label="Frequenta escola especial" value={formatSimNao(sa.desenvolvimentoAcademico?.frequentaEscolaEspecial)} />
                            <Field label="Acompanha a turma (demandas pedagógicas)" value={formatSimNao(sa.desenvolvimentoAcademico?.acompanhaTurmaDemandasPedagogicas)} />
                            <Field label="Segue regras e rotinas de sala" value={formatSimNao(sa.desenvolvimentoAcademico?.segueRegrasRotinaSalaAula)} />
                            <Field label="Necessita apoio de AT" value={formatSimNao(sa.desenvolvimentoAcademico?.necessitaApoioAT)} />
                            <Field label="Necessita adaptação de materiais" value={formatSimNao(sa.desenvolvimentoAcademico?.necessitaAdaptacaoMateriais)} />
                            <Field label="Necessita adaptação curricular" value={formatSimNao(sa.desenvolvimentoAcademico?.necessitaAdaptacaoCurricular)} />
                            <Field label="Houve reprovação/retenção" value={formatSimNao(sa.desenvolvimentoAcademico?.houveReprovacaoRetencao)} />
                            <Field label="Escola possui equipe de inclusão" value={formatSimNao(sa.desenvolvimentoAcademico?.escolaPossuiEquipeInclusao)} />
                            <Field label="Indicativo de deficiência intelectual" value={formatSimNao(sa.desenvolvimentoAcademico?.haIndicativoDeficienciaIntelectual)} />
                            <Field label="Escola apresenta queixa comportamental" value={formatSimNao(sa.desenvolvimentoAcademico?.escolaApresentaQueixaComportamental)} />
                        </FieldGrid>

                        {/* Campos descritivos */}
                        {sa.desenvolvimentoAcademico?.adaptacaoEscolar && (
                            <TextBlock label="Adaptação Escolar" value={sa.desenvolvimentoAcademico.adaptacaoEscolar} />
                        )}
                        {sa.desenvolvimentoAcademico?.dificuldadesEscolares && (
                            <TextBlock label="Dificuldades Escolares" value={sa.desenvolvimentoAcademico.dificuldadesEscolares} />
                        )}
                        {sa.desenvolvimentoAcademico?.relacionamentoComColegas && (
                            <TextBlock label="Relacionamento com Colegas" value={sa.desenvolvimentoAcademico.relacionamentoComColegas} />
                        )}
                        {sa.desenvolvimentoAcademico?.observacoes && (
                            <TextBlock label="Observações" value={sa.desenvolvimentoAcademico.observacoes} />
                        )}
                    </SubSection>
                </Section>

                {/* ===== 7. COMPORTAMENTO ===== */}
                <Section title="Comportamento">
                    <SubSection title="19. Estereotipias, Tiques, Rituais e Rotinas">
                        <FieldGrid>
                            <Field label="Balança as mãos ao lado do corpo ou à frente" value={formatSimNao(comp.estereotipiasRituais.balancaMaosLadoCorpoOuFrente)} />
                            <Field label="Balança o corpo de frente para trás" value={formatSimNao(comp.estereotipiasRituais.balancaCorpoFrenteParaTras)} />
                            <Field label="Pula ou gira em torno de si" value={formatSimNao(comp.estereotipiasRituais.pulaOuGiraEmTornoDeSi)} />
                            <Field label="Repete sons sem função comunicativa" value={formatSimNao(comp.estereotipiasRituais.repeteSonsSemFuncaoComunicativa)} />
                            <Field label="Repete movimentos contínuos" value={formatSimNao(comp.estereotipiasRituais.repeteMovimentosContinuos)} />
                            <Field label="Explora ambiente lambendo/tocando" value={formatSimNao(comp.estereotipiasRituais.exploraAmbienteLambendoTocando)} />
                            <Field label="Observa objetos pelo canto do olho" value={formatSimNao(comp.estereotipiasRituais.procuraObservarObjetosCantoOlho)} />
                            <Field label="Organiza objetos lado a lado" value={formatSimNao(comp.estereotipiasRituais.organizaObjetosLadoALado)} />
                            <Field label="Realiza tarefas sempre na mesma ordem" value={formatSimNao(comp.estereotipiasRituais.realizaTarefasSempreMesmaOrdem)} />
                            <Field label="Apresenta rituais diários" value={formatSimNao(comp.estereotipiasRituais.apresentaRituaisDiarios)} />
                        </FieldGrid>
                        {comp.estereotipiasRituais.observacoesTopografias && (
                            <TextBlock label="Observações sobre topografias" value={comp.estereotipiasRituais.observacoesTopografias} />
                        )}
                    </SubSection>

                    <SubSection title="20. Problemas de Comportamento">
                        <FieldGrid>
                            <Field label="Apresenta comportamentos auto-lesivos" value={formatSimNao(comp.problemasComportamento.apresentaComportamentosAutoLesivos)} />
                            {comp.problemasComportamento.apresentaComportamentosAutoLesivos === 'sim' && (
                                <Field label="Quais auto-lesivos" value={comp.problemasComportamento.autoLesivosQuais} />
                            )}
                        </FieldGrid>
                        <FieldGrid>
                            <Field label="Apresenta comportamentos heteroagressivos" value={formatSimNao(comp.problemasComportamento.apresentaComportamentosHeteroagressivos)} />
                            {comp.problemasComportamento.apresentaComportamentosHeteroagressivos === 'sim' && (
                                <Field label="Quais heteroagressivos" value={comp.problemasComportamento.heteroagressivosQuais} />
                            )}
                        </FieldGrid>
                        <FieldGrid>
                            <Field label="Apresenta destruição de propriedade" value={formatSimNao(comp.problemasComportamento.apresentaDestruicaoPropriedade)} />
                            {comp.problemasComportamento.apresentaDestruicaoPropriedade === 'sim' && (
                                <Field label="Descrever destruição" value={comp.problemasComportamento.destruicaoDescrever} />
                            )}
                        </FieldGrid>
                        <Field label="Necessitou contenção mecânica" value={formatSimNao(comp.problemasComportamento.necessitouContencaoMecanica)} />
                        {comp.problemasComportamento.observacoesTopografias && (
                            <TextBlock label="Observações sobre topografias" value={comp.problemasComportamento.observacoesTopografias} />
                        )}
                    </SubSection>
                </Section>

                {/* ===== 8. FINALIZAÇÃO ===== */}
                <Section title="Finalização">
                    <TextBlock label="21. Outras informações que o informante julgue relevantes" value={fin.outrasInformacoesRelevantes} />
                    <TextBlock label="22. Observações e/ou impressões do terapeuta" value={fin.observacoesImpressoesTerapeuta} />
                    <TextBlock label="23. Expectativas da Família" value={fin.expectativasFamilia} />
                </Section>

                {/* ===== CAMPO DE ASSINATURA ===== */}
                <div className="mt-12 pt-8 mb-16 page-break-inside-avoid">
                    <div className="grid grid-cols-2 gap-16">
                        {/* Assinatura do Responsável/Informante */}
                        <div className="flex flex-col items-center">
                            <div className="w-full border-b border-gray-400 mb-2" style={{ height: '60px' }}></div>
                            <span className="text-sm text-gray-600 text-center">
                                Assinatura do Responsável/Informante
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                {cab.informante || 'Nome do responsável'}
                            </span>
                        </div>

                        {/* Assinatura do Profissional */}
                        <div className="flex flex-col items-center">
                            <div className="w-full border-b border-gray-400 mb-2" style={{ height: '60px' }}></div>
                            <span className="text-sm text-gray-600 text-center">
                                Assinatura do Profissional
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                {cab.profissionalNome}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ===== RODAPÉ ===== */}
                <footer className="border-t-2 border-primary pt-4 mt-8 text-center text-xs text-gray-600">
                    <p className="font-semibold text-sm mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                        {CLINIC_INFO.name}
                    </p>
                    <p>{CLINIC_INFO.address} • {CLINIC_INFO.cep}</p>
                    <p>Contato: {CLINIC_INFO.phone} • {CLINIC_INFO.email}</p>
                    <p>Instagram: {CLINIC_INFO.instagram}</p>
                </footer>
            </div>
        );
    }
);

AnamnesePrintView.displayName = 'AnamnesePrintView';

export default AnamnesePrintView;
