/**
 * Componente de visualização de impressão do Prontuário Psicológico
 */

import { forwardRef } from 'react';
import indigoLogo from '@/assets/logos/indigo.svg';
import type { ProntuarioPsicologico, EvolucaoTerapeutica } from '../types';

// Dados da clínica para o rodapé (mesmo da anamnese)
const CLINIC_INFO = {
    name: 'Clínica Instituto Índigo',
    address: 'Av Vital Brasil, 305, Butantã, CJ 905-909',
    cep: 'CEP 05503-001',
    phone: '+55 11 96973-2227',
    email: 'clinica.indigo@gmail.com',
    instagram: '@inst.indigo',
};

interface ProntuarioPrintViewProps {
    prontuario: ProntuarioPsicologico;
}

// Formatadores
const formatDate = (date: string | undefined) => {
    if (!date) return 'Não informado';
    try {
        return new Date(date).toLocaleDateString('pt-BR');
    } catch {
        return date;
    }
};

// Componentes de layout (mesmo padrão da anamnese)
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

// Componente de Evolução para impressão
const EvolucaoItem = ({ evolucao }: { evolucao: EvolucaoTerapeutica }) => (
    <div className="mb-4 page-break-inside-avoid">
        <div className="bg-gray-50 p-4 rounded border">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-sm font-semibold text-primary">
                        Sessão Nº {evolucao.numeroSessao}
                    </span>
                    <span className="text-sm text-gray-500 ml-4">
                        {formatDate(evolucao.dataEvolucao)}
                    </span>
                </div>
            </div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {evolucao.descricaoSessao}
            </div>
            {evolucao.arquivos && evolucao.arquivos.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                    <span className="text-xs text-gray-500 font-medium">
                        Arquivos anexados: {evolucao.arquivos.filter(a => !a.removed).length}
                    </span>
                </div>
            )}
        </div>
    </div>
);

export const ProntuarioPrintView = forwardRef<HTMLDivElement, ProntuarioPrintViewProps>(
    ({ prontuario }, ref) => {
        const formattedDate = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const cliente = prontuario.cliente;
        const terapeuta = prontuario.terapeuta;
        const infoEduc = prontuario.informacoesEducacionais;
        const avDemanda = prontuario.avaliacaoDemanda;
        const nucleoFam = prontuario.nucleoFamiliar || [];
        const evolucoes = prontuario.evolucoes || [];

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
                                Prontuário Psicológico
                            </div>
                            <div style={{ fontSize: '14px', color: '#4b5563' }}>
                                Cliente: <strong>{cliente?.nome}</strong> • {cliente?.idade}
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
                            <div style={{ fontWeight: '500' }}>
                                {terapeuta?.nome}
                                {terapeuta?.crp && ` - CRP ${terapeuta.crp}`}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '1px' }}>
                                Status do Prontuário
                            </div>
                            <div style={{ fontWeight: '500' }}>
                                {prontuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', color: '#6b7280' }}>
                            Gerado em {formattedDate}
                        </div>
                    </div>
                </div>

                {/* ===== 1. IDENTIFICAÇÃO DO CLIENTE ===== */}
                <Section title="Identificação do Cliente">
                    <FieldGrid>
                        <Field label="Nome Completo" value={cliente?.nome} />
                        <Field label="Data de Nascimento" value={formatDate(cliente?.dataNascimento)} />
                        <Field label="Idade" value={cliente?.idade} />
                        <Field label="Gênero" value={cliente?.genero} />
                    </FieldGrid>
                    <Field label="Endereço" value={cliente?.enderecoCompleto} />
                    <FieldGrid>
                        <Field label="Telefone Residencial" value={cliente?.telefoneResidencial} />
                        <Field label="Celular" value={cliente?.celular} />
                    </FieldGrid>
                    <Field label="E-mail" value={cliente?.email} />
                </Section>

                {/* ===== 2. INFORMAÇÕES EDUCACIONAIS ===== */}
                <Section title="Informações Educacionais">
                    <FieldGrid>
                        <Field label="Nível de Escolaridade" value={infoEduc?.nivelEscolaridade} />
                        <Field label="Instituição de Formação" value={infoEduc?.instituicaoFormacao} />
                        <Field label="Profissão/Ocupação" value={infoEduc?.profissaoOcupacao} />
                    </FieldGrid>
                    {infoEduc?.observacoes && (
                        <TextBlock label="Observações" value={infoEduc.observacoes} />
                    )}
                </Section>

                {/* ===== 3. NÚCLEO FAMILIAR ===== */}
                <Section title="Núcleo Familiar">
                    {nucleoFam.length > 0 ? (
                        <ListSection
                            title="Membros do Núcleo Familiar"
                            items={nucleoFam}
                            renderItem={(membro) => (
                                <div className="grid grid-cols-2 gap-2">
                                    <span><strong>Nome:</strong> {membro.nome}</span>
                                    <span><strong>Parentesco:</strong> {membro.parentesco}</span>
                                    {membro.idade && <span><strong>Idade:</strong> {membro.idade}</span>}
                                    {membro.ocupacao && <span><strong>Ocupação:</strong> {membro.ocupacao}</span>}
                                </div>
                            )}
                        />
                    ) : (
                        <p className="text-sm text-gray-500">Nenhum membro registrado.</p>
                    )}
                    {prontuario.observacoesNucleoFamiliar && (
                        <TextBlock label="Observações" value={prontuario.observacoesNucleoFamiliar} />
                    )}
                </Section>

                {/* ===== 4. AVALIAÇÃO DA DEMANDA ===== */}
                <Section title="Avaliação da Demanda">
                    <Field label="Encaminhado por" value={avDemanda?.encaminhadoPor} />
                    <Field label="Atendimentos Anteriores" value={avDemanda?.atendimentosAnteriores} />
                    <TextBlock label="Motivo da Busca pelo Atendimento" value={avDemanda?.motivoBuscaAtendimento} />
                    {avDemanda?.observacoes && (
                        <TextBlock label="Observações" value={avDemanda.observacoes} />
                    )}
                    
                    {/* Terapias Prévias */}
                    {avDemanda?.terapiasPrevias && avDemanda.terapiasPrevias.length > 0 && (
                        <ListSection
                            title="Terapias Prévias e/ou em Andamento"
                            items={avDemanda.terapiasPrevias}
                            renderItem={(terapia) => (
                                <div className="grid grid-cols-2 gap-2">
                                    <span><strong>Profissional:</strong> {terapia.profissional}</span>
                                    <span><strong>Especialidade/Abordagem:</strong> {terapia.especialidadeAbordagem}</span>
                                    <span><strong>Tempo de Intervenção:</strong> {terapia.tempoIntervencao}</span>
                                    <span><strong>Status:</strong> {terapia.ativo ? 'Ativo' : 'Finalizado'}</span>
                                    {terapia.observacao && (
                                        <span className="col-span-2"><strong>Obs:</strong> {terapia.observacao}</span>
                                    )}
                                </div>
                            )}
                        />
                    )}
                </Section>

                {/* ===== 5. OBJETIVOS DE TRABALHO ===== */}
                <Section title="Objetivos de Trabalho">
                    <TextBlock label="Objetivos Terapêuticos" value={prontuario.objetivosTrabalho} />
                </Section>

                {/* ===== 6. AVALIAÇÃO DO ATENDIMENTO ===== */}
                {prontuario.avaliacaoAtendimento && (
                    <Section title="Avaliação do Atendimento">
                        <TextBlock label="Avaliação" value={prontuario.avaliacaoAtendimento} />
                    </Section>
                )}

                {/* ===== 7. EVOLUÇÕES TERAPÊUTICAS ===== */}
                <Section title={`Evoluções Terapêuticas (${evolucoes.length} ${evolucoes.length === 1 ? 'sessão' : 'sessões'})`}>
                    {evolucoes.length > 0 ? (
                        <div className="space-y-3">
                            {evolucoes
                                .sort((a, b) => a.numeroSessao - b.numeroSessao)
                                .map((evolucao) => (
                                    <EvolucaoItem 
                                        key={evolucao.id} 
                                        evolucao={evolucao} 
                                    />
                                ))
                            }
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Nenhuma evolução registrada.</p>
                    )}
                </Section>

                {/* ===== CAMPO DE ASSINATURA ===== */}
                <div className="mt-12 pt-8 mb-16 page-break-inside-avoid">
                    <div className="grid grid-cols-2 gap-16">
                        {/* Assinatura do Responsável/Cliente */}
                        <div className="flex flex-col items-center">
                            <div className="w-full border-b border-gray-400 mb-2" style={{ height: '60px' }}></div>
                            <span className="text-sm text-gray-600 text-center">
                                Assinatura do Cliente/Responsável
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                {cliente?.nome || 'Nome do cliente'}
                            </span>
                        </div>

                        {/* Assinatura do Profissional */}
                        <div className="flex flex-col items-center">
                            <div className="w-full border-b border-gray-400 mb-2" style={{ height: '60px' }}></div>
                            <span className="text-sm text-gray-600 text-center">
                                Assinatura do Profissional
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                {terapeuta?.nome}
                                {terapeuta?.crp && ` - CRP ${terapeuta.crp}`}
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

ProntuarioPrintView.displayName = 'ProntuarioPrintView';

export default ProntuarioPrintView;
