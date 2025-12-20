import type { AnamneseDetalhe } from '../types/anamnese-consulta.types';

/**
 * Mock de anamnese detalhada para desenvolvimento
 */
export const mockAnamneseDetalhe: Record<string, AnamneseDetalhe> = {
    '1': {
        id: '1',
        cabecalho: {
            dataEntrevista: '2025-11-20',
            clienteId: 'c1',
            clienteNome: 'Alessandro Braga',
            clienteAvatarUrl: undefined,
            dataNascimento: '2017-05-15',
            idade: '7 anos',
            informante: 'Caio Oliveira',
            parentesco: 'Pai',
            quemIndicou: 'Dr. Roberto Mendes - Neuropediatra',
            profissionalId: 'p1',
            profissionalNome: 'Dra. Maria Silva',
        },
        queixaDiagnostico: {
            queixaPrincipal: 'Dificuldade de comunicação e interação social. A criança apresenta atraso na fala e prefere brincar sozinha.',
            diagnosticoPrevio: 'TEA - Transtorno do Espectro Autista (CID F84.0) - Nível 1 de suporte',
            especialidadesConsultadas: [
                { id: '1', especialidade: 'Neurologista', nome: 'Dr. Roberto Mendes', data: '2024-03-15', observacao: 'Diagnóstico inicial', ativo: true },
                { id: '2', especialidade: 'Fonoaudiólogo', nome: 'Dra. Ana Costa', data: '2024-04-20', observacao: 'Acompanhamento mensal', ativo: true },
                { id: '3', especialidade: 'Psicólogo', nome: 'Dr. Carlos Lima', data: '2024-05-10', observacao: 'Terapia comportamental', ativo: true },
            ],
            medicamentosEmUso: [
                { id: '1', nome: 'Risperidona', dosagem: '0,5mg', dataInicio: '2024-06-01', motivo: 'Regulação comportamental' },
            ],
            examesPrevios: [
                { id: '1', nome: 'EEG', data: '2024-02-10', resultado: 'Sem alterações significativas' },
                { id: '2', nome: 'Audiometria', data: '2024-03-05', resultado: 'Audição normal bilateral' },
            ],
            terapiasPrevias: [
                { id: '1', profissional: 'Dra. Juliana Santos', especialidadeAbordagem: 'Fonoaudiologia - PECS', tempoIntervencao: '6 meses', ativo: true },
                { id: '2', profissional: 'Dr. Pedro Alves', especialidadeAbordagem: 'Terapia Ocupacional - Integração Sensorial', tempoIntervencao: '8 meses', ativo: true },
            ],
        },
        contextoFamiliarRotina: {
            historicoFamiliar: [
                { id: '1', parentesco: 'Primo paterno', condicao: 'TDAH', observacao: 'Diagnosticado aos 8 anos' },
                { id: '2', parentesco: 'Tio materno', condicao: 'Dislexia', observacao: undefined },
            ],
            rotinaDiaria: [
                { id: '1', horario: '07:00', atividade: 'Acordar e higiene', responsavel: 'Mãe', observacao: undefined },
                { id: '2', horario: '07:30', atividade: 'Café da manhã', responsavel: 'Mãe', observacao: 'Seletivo com alimentos' },
                { id: '3', horario: '08:00', atividade: 'Ida para escola', responsavel: 'Pai', observacao: undefined },
                { id: '4', horario: '12:00', atividade: 'Retorno da escola e almoço', responsavel: 'Mãe', observacao: undefined },
                { id: '5', horario: '14:00', atividade: 'Terapias', responsavel: 'Mãe', observacao: '3x por semana' },
                { id: '6', horario: '19:00', atividade: 'Jantar', responsavel: 'Família', observacao: undefined },
                { id: '7', horario: '20:30', atividade: 'Rotina do sono', responsavel: 'Mãe', observacao: undefined },
            ],
            cuidadoresPrincipais: 'Mãe (período integral) e pai (noite e finais de semana)',
            tempoTela: '2 horas por dia, principalmente tablet com jogos educativos',
        },
        desenvolvimentoInicial: {
            gestacaoParto: {
                tipoParto: 'Cesárea',
                semanas: '38',
                apgar1min: '8',
                apgar5min: '9',
                intercorrencias: 'Nenhuma intercorrência durante gestação ou parto',
            },
            neuropsicomotor: {
                sustentouCabeca: { meses: '3', status: 'realizado' },
                rolou: { meses: '5', status: 'realizado' },
                sentou: { meses: '7', status: 'realizado' },
                engatinhou: { meses: '9', status: 'realizado' },
                andouComApoio: { meses: '11', status: 'realizado' },
                andouSemApoio: { meses: '14', status: 'realizado' },
                correu: { meses: '20', status: 'realizado' },
                andouDeMotoca: { meses: '24', status: 'realizado' },
                andouDeBicicleta: { meses: '', status: 'naoRealiza' },
                subiuEscadasSozinho: { meses: '24', status: 'realizado' },
                motricidadeFina: 'Apresenta dificuldade com atividades que exigem coordenação fina, como recortar e desenhar dentro das linhas.',
            },
            falaLinguagem: {
                balbuciou: { meses: '8', status: 'realizado' },
                primeirasPalavras: { meses: '18', status: 'realizado' },
                primeirasFrases: { meses: '36', status: 'realizado' },
                apontouParaFazerPedidos: { meses: '24', status: 'realizado' },
                fazUsoDeGestos: 'sim',
                fazUsoDeGestosQuais: 'Aponta para objetos e usa gestos para se comunicar quando não consegue verbalizar',
                audicao: 'boa',
                teveOtiteDeRepeticao: 'nao',
                otiteDetalhes: '',
                fazOuFezUsoTuboVentilacao: 'nao',
                fazOuFezUsoObjetoOral: 'sim',
                objetoOralEspecificar: 'Chupeta até os 3 anos',
                usaMamadeira: 'nao',
                mamadeiraDetalhes: '',
                comunicacaoAtual: 'Utiliza frases curtas de 3-4 palavras. Ecolalia presente mas funcional. Compreensão melhor que expressão.',
            },
        },
        atividadesVidaDiaria: {
            alimentacao: {
                amamentacao: 'Amamentação exclusiva até 6 meses, complementar até 1 ano',
                introducaoAlimentar: 'BLW parcial, aceitou bem legumes e frutas',
                alimentacaoAtual: 'Alimentação restrita, prefere alimentos secos e crocantes',
                restricoesAlimentares: 'Nenhuma alergia conhecida',
                seletividadeAlimentar: 'Alta seletividade - não aceita alimentos misturados ou com texturas cremosas',
                usaTalheres: 'com_ajuda',
                comeAlone: 'sim',
            },
            higiene: {
                desfralde: 'Completo aos 3 anos e 6 meses',
                controlaEsfincterDiurno: 'sim',
                controlaEsfincterNoturno: 'sim',
                tomaBANHOSozinho: 'com_ajuda',
                escovaD: 'com_ajuda',
            },
            vestuario: {
                vesteSozinho: 'com_ajuda',
                calcaSapatos: 'sim',
                abotoaSozinho: 'nao',
                preferenciasRoupas: 'Prefere roupas de algodão, sem etiquetas, evita jeans e tecidos ásperos',
            },
            sono: {
                dormeOnde: 'Quarto próprio',
                horarioDormir: '20:30',
                horarioAcordar: '06:30',
                qualidadeSono: 'Regular',
                dificuldadesParaDormir: 'Precisa de rotina consistente para adormecer - mesma sequência de atividades',
                acordaDuranteNoite: 'nao',
                pesadelos: 'nao',
            },
        },
        socialAcademico: {
            interacaoSocial: {
                brincaComOutrasCriancas: 'sim',
                tipoBrincadeira: 'Prefere brincadeiras paralelas, pouca interação direta',
                mantemContatoVisual: 'sim',
                respondeAoChamar: 'sim',
                compartilhaInteresses: 'nao',
                compreendeSentimentos: 'nao',
            },
            vidaEscolar: {
                frequentaEscola: 'sim',
                nomeEscola: 'Escola Montessori Alegria',
                serie: '1º ano do Ensino Fundamental',
                periodo: 'Matutino',
                temAcompanhante: 'sim',
                adaptacaoEscolar: 'Adaptação gradual ao longo de 2 meses',
                dificuldadesEscolares: 'Dificuldade em atividades em grupo e mudanças de rotina',
                relacionamentoComColegas: 'Interage pouco, mas tem 1-2 colegas com quem brinca',
            },
        },
        comportamento: {
            aspectosComportamentais: 'Criança calma na maior parte do tempo. Apresenta dificuldade com transições e mudanças de rotina. Crises de birra quando frustrado.',
            interessesRestritos: 'Interesse intenso por dinossauros e trens. Conhece muitos detalhes e fatos sobre o tema.',
            estereotipias: 'Movimento de flapping com as mãos quando muito animado ou ansioso. Balanceio do corpo ocasional.',
            sensibilidadesSensoriais: 'Hipersensibilidade auditiva (não gosta de ambientes barulhentos). Busca estímulos proprioceptivos (abraços apertados).',
            autoRegulacao: 'Dificuldade em autorregular emoções. Utiliza estratégias de coping ensinadas nas terapias.',
        },
        finalizacao: {
            expectativasFamilia: 'Melhora na comunicação e interação social. Maior independência nas AVDs. Inclusão escolar bem sucedida.',
            informacoesAdicionais: 'Família muito engajada no tratamento. Irmã mais velha auxilia bastante nas atividades.',
            observacoesFinais: 'Criança com bom prognóstico considerando suporte familiar e acesso a terapias especializadas.',
        },
        status: 'ATIVO',
        createdAt: '2025-11-20T10:00:00Z',
        updatedAt: '2025-11-20T10:00:00Z',
    },
};

/**
 * Retorna mock de anamnese por ID
 */
export function getMockAnamneseById(id: string): AnamneseDetalhe | null {
    return mockAnamneseDetalhe[id] ?? null;
}
