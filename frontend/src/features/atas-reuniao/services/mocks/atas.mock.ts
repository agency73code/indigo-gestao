import { format, subDays } from 'date-fns';
import type {
    AtaReuniao,
    AtaListFilters,
    AtaListResponse,
    CreateAtaInput,
    UpdateAtaInput,
    TerapeutaOption,
    ClienteOption,
    CabecalhoAta,
    Participante,
} from '../../types';
import {
    FINALIDADE_REUNIAO,
    MODALIDADE_REUNIAO,
    TIPO_PARTICIPANTE,
} from '../../types';

// ============================================
// MOCK DATA - TERAPEUTAS
// ============================================

export const mockTerapeutas: TerapeutaOption[] = [
    {
        id: 'ter-001',
        nome: 'Dra. Ana Paula Silva',
        especialidade: 'Fonoaudiologia',
        cargo: 'Terapeuta Sênior',
        conselho: 'CRFa',
        registroConselho: '12345-SP',
    },
    {
        id: 'ter-002',
        nome: 'Dr. Carlos Eduardo Santos',
        especialidade: 'Terapia Ocupacional',
        cargo: 'Coordenador',
        conselho: 'CREFITO',
        registroConselho: '98765-3/TO',
    },
    {
        id: 'ter-003',
        nome: 'Dra. Marina Costa',
        especialidade: 'Psicologia',
        cargo: 'Terapeuta',
        conselho: 'CRP',
        registroConselho: '06/54321',
    },
    {
        id: 'ter-004',
        nome: 'Dr. Roberto Ferreira',
        especialidade: 'Fisioterapia',
        cargo: 'Terapeuta',
        conselho: 'CREFITO',
        registroConselho: '45678-3/F',
    },
    {
        id: 'ter-005',
        nome: 'Dra. Juliana Mendes',
        especialidade: 'Musicoterapia',
        cargo: 'Terapeuta',
        conselho: 'MT',
        registroConselho: 'MT-1234',
    },
];

// ============================================
// MOCK DATA - CLIENTES
// ============================================

export const mockClientes: ClienteOption[] = [
    { id: 'cli-001', nome: 'Miguel Oliveira' },
    { id: 'cli-002', nome: 'Sofia Pereira' },
    { id: 'cli-003', nome: 'Arthur Santos' },
    { id: 'cli-004', nome: 'Helena Costa' },
    { id: 'cli-005', nome: 'Theo Rodrigues' },
];

// ============================================
// MOCK DATA - ATAS
// ============================================

let mockAtas: AtaReuniao[] = [
    {
        id: 'ata-001',
        cabecalho: {
            terapeutaId: 'ter-001',
            terapeutaNome: 'Dra. Ana Paula Silva',
            conselhoNumero: '12345-SP',
            conselhoTipo: 'CRFa',
            profissao: 'Fonoaudióloga',
            cargo: 'Terapeuta Sênior',
        },
        data: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        horarioInicio: '14:00',
        horarioFim: '15:10',
        finalidade: FINALIDADE_REUNIAO.ORIENTACAO_PARENTAL,
        modalidade: MODALIDADE_REUNIAO.PRESENCIAL,
        participantes: [
            {
                id: 'part-001',
                tipo: TIPO_PARTICIPANTE.FAMILIA,
                nome: 'Maria Oliveira',
                descricao: 'Mãe',
            },
            {
                id: 'part-002',
                tipo: TIPO_PARTICIPANTE.FAMILIA,
                nome: 'José Oliveira',
                descricao: 'Pai',
            },
        ],
        conteudo: `<h2>Reunião de Orientação Parental - Miguel Oliveira</h2>

<h3>1. Abertura e Contextualização</h3>
<p>A reunião teve início às 14h00 com a presença dos pais do paciente Miguel Oliveira: Sra. Maria Oliveira (mãe) e Sr. José Oliveira (pai). A terapeuta Dra. Ana Paula Silva iniciou agradecendo a presença de ambos e reforçando a importância do envolvimento familiar no processo terapêutico.</p>

<p>Foi explicado que o objetivo principal desta reunião é apresentar a evolução de Miguel nos últimos três meses de atendimento fonoaudiológico, discutir as estratégias que estão sendo utilizadas em sessão e orientar os pais sobre como podem auxiliar no desenvolvimento da linguagem em ambiente domiciliar.</p>

<h3>2. Apresentação da Evolução Terapêutica</h3>
<p>A terapeuta apresentou os seguintes avanços observados nas sessões:</p>

<p><strong>Linguagem Receptiva:</strong></p>
<ul>
<li>Miguel demonstra compreensão adequada de comandos simples e de duas etapas</li>
<li>Identifica corretamente objetos, cores e formas quando solicitado</li>
<li>Consegue seguir instruções em contexto de brincadeira dirigida</li>
<li>Houve melhora significativa na atenção auditiva durante as atividades</li>
</ul>

<p><strong>Linguagem Expressiva:</strong></p>
<ul>
<li>Vocabulário expressivo aumentou de aproximadamente 50 para 120 palavras</li>
<li>Iniciou combinação de duas palavras (ex: "qué água", "mamãe olha")</li>
<li>Utiliza gestos comunicativos de forma mais consistente</li>
<li>Ainda apresenta dificuldade em sons fricativos (/s/, /f/, /v/)</li>
</ul>

<p><strong>Aspectos Pragmáticos:</strong></p>
<ul>
<li>Mantém contato visual por períodos mais prolongados</li>
<li>Demonstra intenção comunicativa através de gestos e vocalizações</li>
<li>Está começando a alternar turnos em brincadeiras simples</li>
</ul>

<h3>3. Estratégias Utilizadas em Sessão</h3>
<p>Foram explicadas as principais técnicas utilizadas durante os atendimentos:</p>

<ul>
<li><strong>Modelagem:</strong> A terapeuta oferece o modelo correto de fala sem exigir repetição imediata</li>
<li><strong>Expansão:</strong> Quando Miguel diz "bola", a terapeuta expande para "bola azul" ou "quero bola"</li>
<li><strong>Sabotagem comunicativa:</strong> Criar situações que motivem Miguel a se comunicar</li>
<li><strong>Reforço positivo:</strong> Elogios e incentivos a cada tentativa de comunicação</li>
</ul>

<h3>4. Orientações para os Pais</h3>
<p>A terapeuta orientou os pais sobre estratégias para aplicar em casa:</p>

<p><strong>Durante as refeições:</strong></p>
<ul>
<li>Nomear os alimentos antes de oferecer: "Olha o arroz! Quer arroz?"</li>
<li>Esperar alguns segundos para que Miguel tente pedir antes de dar o que ele quer</li>
<li>Comemorar quando ele tentar falar, mesmo que não seja perfeito</li>
</ul>

<p><strong>Durante o banho:</strong></p>
<ul>
<li>Cantar músicas infantis que tenham repetição</li>
<li>Nomear partes do corpo: "Vamos lavar o pé! Cadê o pé?"</li>
<li>Usar brinquedos de banho para criar oportunidades de comunicação</li>
</ul>

<p><strong>Durante brincadeiras:</strong></p>
<ul>
<li>Brincar de esconde-esconde verbalizando "achou!"</li>
<li>Ler livros com figuras grandes e coloridas, apontando e nomeando</li>
<li>Evitar antecipar as necessidades de Miguel - dar tempo para ele se expressar</li>
</ul>

<h3>5. Dúvidas dos Pais</h3>
<p>A Sra. Maria perguntou sobre o uso de telas (tablet e televisão). A terapeuta orientou que o tempo de tela deve ser limitado a no máximo 1 hora por dia, preferencialmente com conteúdo educativo e sempre com a presença de um adulto para mediar e interagir.</p>

<p>O Sr. José questionou sobre a expectativa de desenvolvimento. A terapeuta explicou que cada criança tem seu ritmo, mas que com a frequência atual de atendimento (2x por semana) e o envolvimento da família, a expectativa é de evolução contínua e consistente.</p>

<h3>6. Próximos Passos</h3>
<ul>
<li>Manter frequência de 2 sessões semanais (terças e quintas às 14h)</li>
<li>Aplicar as estratégias orientadas em casa diariamente</li>
<li>Pais irão registrar em um caderno novas palavras que Miguel falar</li>
<li>Próxima reunião de orientação parental agendada para daqui a 2 meses</li>
<li>Reavaliação formal será realizada em 6 meses</li>
</ul>

<h3>7. Encerramento</h3>
<p>A reunião foi encerrada às 15h10. Os pais demonstraram-se engajados e motivados a aplicar as orientações. A terapeuta se colocou à disposição para dúvidas que surgirem entre as sessões através do canal de comunicação da clínica.</p>

<p>Sem mais assuntos a tratar, a reunião foi dada por encerrada.</p>`,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 2).toISOString(),
        atualizadoEm: subDays(new Date(), 2).toISOString(),
    },
    {
        id: 'ata-002',
        cabecalho: {
            terapeutaId: 'ter-002',
            terapeutaNome: 'Dr. Carlos Eduardo Santos',
            conselhoNumero: '98765-3/TO',
            conselhoTipo: 'CREFITO',
            profissao: 'Terapeuta Ocupacional',
            cargo: 'Coordenador',
        },
        data: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
        horarioInicio: '10:30',
        horarioFim: '11:45',
        finalidade: FINALIDADE_REUNIAO.REUNIAO_EQUIPE,
        modalidade: MODALIDADE_REUNIAO.ONLINE,
        participantes: [
            {
                id: 'part-003',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
                nome: 'Dra. Ana Paula Silva',
                terapeutaId: 'ter-001',
                especialidade: 'Fonoaudiologia',
                cargo: 'Terapeuta Sênior',
            },
            {
                id: 'part-004',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
                nome: 'Dra. Marina Costa',
                terapeutaId: 'ter-003',
                especialidade: 'Psicologia',
                cargo: 'Terapeuta',
            },
        ],
        conteudo: `<h2>Reunião de Equipe Multidisciplinar - Caso Sofia Pereira</h2>

<h3>1. Abertura</h3>
<p>Reunião realizada por videoconferência com início às 10h30. Presentes: Dr. Carlos Eduardo Santos (Terapeuta Ocupacional - coordenador da reunião), Dra. Ana Paula Silva (Fonoaudióloga) e Dra. Marina Costa (Psicóloga).</p>

<p>Pauta: Discussão do caso da paciente Sofia Pereira, 6 anos, diagnóstico de Transtorno do Espectro Autista (TEA) nível 1, em atendimento na clínica há 8 meses.</p>

<h3>2. Relato da Terapia Ocupacional (Dr. Carlos)</h3>
<p>O Dr. Carlos iniciou apresentando a evolução de Sofia nos atendimentos de TO:</p>

<p><strong>Áreas trabalhadas:</strong></p>
<ul>
<li>Integração sensorial: Sofia apresentava hipersensibilidade tátil significativa. Após trabalho específico, já aceita diferentes texturas nas mãos e tolera melhor etiquetas de roupas</li>
<li>Motricidade fina: Evolução no uso de tesoura, preensão do lápis e atividades de encaixe</li>
<li>Atividades de Vida Diária (AVDs): Consegue vestir-se com supervisão mínima e está aprendendo a abotoar</li>
<li>Autorregulação: Utiliza estratégias sensoriais (massinha, bola antiestresse) quando está ansiosa</li>
</ul>

<p><strong>Pontos de atenção:</strong></p>
<ul>
<li>Ainda apresenta dificuldade com alimentação - seletividade alimentar importante</li>
<li>Resistência a atividades que envolvam sujar as mãos (tinta, areia)</li>
</ul>

<h3>3. Relato da Fonoaudiologia (Dra. Ana Paula)</h3>
<p>A Dra. Ana Paula apresentou o panorama dos atendimentos fonoaudiológicos:</p>

<p><strong>Evolução observada:</strong></p>
<ul>
<li>Linguagem expressiva: Sofia aumentou significativamente seu vocabulário funcional</li>
<li>Construção frasal: Já formula frases de 4-5 palavras com estrutura adequada</li>
<li>Pragmática: Melhora na iniciativa de comunicação e manutenção de tópico</li>
<li>Narrativa: Consegue recontar histórias simples com apoio visual</li>
</ul>

<p><strong>Desafios identificados:</strong></p>
<ul>
<li>Dificuldade em compreender linguagem figurada e expressões idiomáticas</li>
<li>Interpretação literal de instruções</li>
<li>Necessidade de trabalho em habilidades conversacionais (turnos, tópicos)</li>
</ul>

<h3>4. Relato da Psicologia (Dra. Marina)</h3>
<p>A Dra. Marina compartilhou suas observações e intervenções:</p>

<p><strong>Aspectos emocionais e comportamentais:</strong></p>
<ul>
<li>Sofia demonstra boa vinculação com a terapeuta e com a rotina de sessões</li>
<li>Apresentou redução significativa de comportamentos de birra - de 3-4 episódios por sessão para esporádicos</li>
<li>Está desenvolvendo melhor reconhecimento de emoções básicas em si e nos outros</li>
<li>Utiliza o quadro de rotina visual como apoio para transições</li>
</ul>

<p><strong>Pontos de atenção:</strong></p>
<ul>
<li>Ansiedade em situações novas ou imprevistos na rotina</li>
<li>Dificuldade em lidar com frustração quando perde em jogos</li>
<li>Interação com pares ainda limitada - prefere brincar sozinha ou com adultos</li>
</ul>

<h3>5. Discussão Interdisciplinar</h3>
<p>A equipe discutiu pontos de integração entre as áreas:</p>

<p><strong>Integração TO + Fono:</strong></p>
<ul>
<li>Dr. Carlos sugeriu trabalhar a questão da seletividade alimentar em conjunto, já que envolve tanto aspectos sensoriais quanto de linguagem (nomear alimentos, expandir vocabulário relacionado)</li>
<li>Acordado que sessões conjuntas mensais podem ser benéficas</li>
</ul>

<p><strong>Integração Fono + Psico:</strong></p>
<ul>
<li>Dra. Ana Paula e Dra. Marina concordaram em alinhar o trabalho de habilidades sociais</li>
<li>Uso de histórias sociais será implementado em ambas as terapias</li>
</ul>

<p><strong>Integração TO + Psico:</strong></p>
<ul>
<li>Estratégias de autorregulação serão padronizadas entre as duas abordagens</li>
<li>Kit sensorial será o mesmo utilizado em TO e Psicologia</li>
</ul>

<h3>6. Metas para o Próximo Trimestre</h3>
<ul>
<li><strong>TO:</strong> Ampliar tolerância a texturas na alimentação; independência no uso do banheiro</li>
<li><strong>Fono:</strong> Desenvolvimento de narrativa oral; compreensão de linguagem não-literal</li>
<li><strong>Psico:</strong> Habilidades sociais com pares; manejo de frustração</li>
<li><strong>Interdisciplinar:</strong> Realizar 1 sessão conjunta por mês; elaborar relatório integrado para a família</li>
</ul>

<h3>7. Encaminhamentos</h3>
<ul>
<li>Agendar reunião com a família para apresentar a evolução e alinhar expectativas - responsável: Dr. Carlos</li>
<li>Elaborar relatório integrado das três áreas - prazo: 15 dias</li>
<li>Entrar em contato com a escola para verificar necessidade de reunião - responsável: Dra. Marina</li>
<li>Próxima reunião de equipe: daqui a 30 dias</li>
</ul>

<h3>8. Encerramento</h3>
<p>A reunião foi encerrada às 11h45. Todos os profissionais se comprometeram com os encaminhamentos definidos.</p>`,
        clienteId: 'cli-002',
        clienteNome: 'Sofia Pereira',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 5).toISOString(),
        atualizadoEm: subDays(new Date(), 5).toISOString(),
    },
    {
        id: 'ata-003',
        cabecalho: {
            terapeutaId: 'ter-003',
            terapeutaNome: 'Dra. Marina Costa',
            conselhoNumero: '06/54321',
            conselhoTipo: 'CRP',
            profissao: 'Psicóloga',
            cargo: 'Terapeuta',
        },
        data: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        horarioInicio: '15:00',
        horarioFim: '16:30',
        finalidade: FINALIDADE_REUNIAO.REUNIAO_ESCOLA,
        modalidade: MODALIDADE_REUNIAO.PRESENCIAL,
        participantes: [
            {
                id: 'part-005',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO,
                nome: 'Profa. Lucia Ferreira',
                descricao: 'Coordenadora Pedagógica',
            },
            {
                id: 'part-006',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO,
                nome: 'Profa. Sandra Lima',
                descricao: 'Professora Regente',
            },
            {
                id: 'part-007',
                tipo: TIPO_PARTICIPANTE.FAMILIA,
                nome: 'Carla Santos',
                descricao: 'Mãe',
            },
        ],
        conteudo: `<h2>Reunião Escola-Clínica-Família - Arthur Santos</h2>

<h3>1. Abertura e Apresentações</h3>
<p>Reunião realizada na Escola Municipal João Paulo II, às 15h00. Presentes: Profa. Lucia Ferreira (Coordenadora Pedagógica), Profa. Sandra Lima (Professora Regente do 2º ano), Sra. Carla Santos (mãe do Arthur) e Dra. Marina Costa (Psicóloga da clínica).</p>

<p>A coordenadora Lucia agradeceu a presença de todos e explicou que o objetivo da reunião é alinhar estratégias para melhor acompanhamento do Arthur no ambiente escolar, considerando seu diagnóstico de TDAH (Transtorno do Déficit de Atenção e Hiperatividade).</p>

<h3>2. Contextualização do Caso pela Clínica</h3>
<p>A Dra. Marina apresentou um panorama geral sobre Arthur:</p>

<p><strong>Perfil do aluno:</strong></p>
<ul>
<li>Arthur, 7 anos, diagnóstico de TDAH tipo combinado, realizado há 1 ano</li>
<li>Em acompanhamento psicológico na clínica há 8 meses</li>
<li>Faz uso de medicação (Ritalina 10mg) prescrita pelo neuropediatra, com boa resposta</li>
<li>Apresenta inteligência dentro da média, com potencial criativo destacado</li>
</ul>

<p><strong>Características comportamentais:</strong></p>
<ul>
<li>Dificuldade em manter atenção em atividades que não são de seu interesse</li>
<li>Impulsividade - tende a responder antes de ouvir a pergunta completa</li>
<li>Inquietação motora - dificuldade em permanecer sentado por longos períodos</li>
<li>Boa interação social, porém às vezes interrompe os colegas</li>
</ul>

<p><strong>Pontos fortes:</strong></p>
<ul>
<li>Muito criativo e imaginativo</li>
<li>Excelente memória visual</li>
<li>Interesse genuíno em aprender quando o assunto o motiva</li>
<li>Empático e prestativo com os colegas</li>
</ul>

<h3>3. Relato da Escola</h3>
<p>A Profa. Sandra, professora regente, compartilhou suas observações:</p>

<p><strong>Em sala de aula:</strong></p>
<ul>
<li>Arthur tem dificuldade em acompanhar atividades que exigem concentração prolongada</li>
<li>Frequentemente levanta da cadeira e circula pela sala</li>
<li>Perde materiais com frequência (lápis, borracha, cadernos)</li>
<li>Não consegue copiar do quadro na mesma velocidade que os colegas</li>
<li>Nas provas, deixa questões em branco por distração ou por não ler completamente</li>
</ul>

<p><strong>Aspectos positivos observados:</strong></p>
<ul>
<li>Participa ativamente de discussões em grupo</li>
<li>Demonstra conhecimento quando questionado oralmente</li>
<li>É querido pelos colegas e não apresenta problemas de relacionamento</li>
<li>Muito bom em atividades práticas e artísticas</li>
</ul>

<h3>4. Relato da Família</h3>
<p>A Sra. Carla relatou a rotina em casa:</p>
<ul>
<li>Arthur toma a medicação pela manhã, antes de ir para a escola</li>
<li>O efeito da medicação dura até aproximadamente 16h</li>
<li>Fazer lição de casa é um desafio diário - precisa de supervisão constante</li>
<li>À noite está mais agitado (quando o efeito da medicação passa)</li>
<li>A família tem trabalhado rotina e organização conforme orientação da clínica</li>
</ul>

<h3>5. Estratégias e Adaptações Propostas</h3>
<p>Após discussão conjunta, foram definidas as seguintes estratégias:</p>

<p><strong>Organização do ambiente:</strong></p>
<ul>
<li>Arthur deve sentar na primeira fileira, próximo à professora</li>
<li>Evitar que sente perto da janela ou da porta (reduzir distrações)</li>
<li>Permitir que tenha um objeto manipulável silencioso (fidget) para auxiliar na concentração</li>
</ul>

<p><strong>Adaptações pedagógicas:</strong></p>
<ul>
<li>Fragmentar atividades longas em partes menores</li>
<li>Dar instruções curtas e claras, uma de cada vez</li>
<li>Verificar se Arthur compreendeu antes de iniciar a atividade</li>
<li>Permitir pequenas pausas para movimento durante aulas longas</li>
<li>Utilizar apoio visual sempre que possível</li>
</ul>

<p><strong>Avaliações:</strong></p>
<ul>
<li>Tempo estendido (50% a mais) para provas</li>
<li>Possibilidade de realizar provas em sala separada, com menos estímulos</li>
<li>Leitura das questões pelo professor, quando necessário</li>
<li>Valorizar avaliações orais e trabalhos práticos</li>
</ul>

<p><strong>Comunicação escola-família-clínica:</strong></p>
<ul>
<li>Agenda será utilizada diariamente para comunicação</li>
<li>Professora sinalizará na agenda comportamentos importantes (positivos e negativos)</li>
<li>Reuniões trimestrais entre escola e clínica</li>
<li>Canal direto entre coordenação e clínica para situações urgentes</li>
</ul>

<h3>6. Encaminhamentos</h3>
<ul>
<li>Escola elaborará PEI (Plano Educacional Individualizado) - prazo: 15 dias</li>
<li>Clínica enviará relatório formal com as orientações discutidas - prazo: 7 dias</li>
<li>Família autorizará troca de informações entre escola e clínica (termo de autorização)</li>
<li>Próxima reunião de acompanhamento: final do bimestre</li>
</ul>

<h3>7. Encerramento</h3>
<p>A reunião foi encerrada às 16h30. Todos os participantes demonstraram-se comprometidos com as estratégias definidas. A coordenadora Lucia agradeceu a parceria e reforçou a importância do trabalho conjunto para o sucesso escolar de Arthur.</p>`,
        clienteId: 'cli-003',
        clienteNome: 'Arthur Santos',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 7).toISOString(),
        atualizadoEm: subDays(new Date(), 7).toISOString(),
    },
    {
        id: 'ata-004',
        cabecalho: {
            terapeutaId: 'ter-001',
            terapeutaNome: 'Dra. Ana Paula Silva',
            conselhoNumero: '12345-SP',
            conselhoTipo: 'CRFa',
            profissao: 'Fonoaudióloga',
            cargo: 'Terapeuta Sênior',
        },
        data: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        horarioInicio: '09:00',
        horarioFim: '10:15',
        finalidade: FINALIDADE_REUNIAO.SUPERVISAO_TERAPEUTA,
        modalidade: MODALIDADE_REUNIAO.ONLINE,
        participantes: [
            {
                id: 'part-008',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
                nome: 'Dra. Juliana Mendes',
                terapeutaId: 'ter-005',
                especialidade: 'Musicoterapia',
                cargo: 'Terapeuta',
            },
        ],
        conteudo: `<h2>Supervisão Clínica - Integração Musicoterapia e Fonoaudiologia</h2>

<h3>1. Abertura</h3>
<p>Sessão de supervisão realizada por videoconferência, com início às 09h00. Supervisora: Dra. Ana Paula Silva (Fonoaudióloga Sênior). Supervisionanda: Dra. Juliana Mendes (Musicoterapeuta).</p>

<p>Objetivo da supervisão: Orientar sobre estratégias de integração entre musicoterapia e estimulação de linguagem, visando potencializar os resultados terapêuticos em pacientes com atraso de linguagem.</p>

<h3>2. Caso Clínico Apresentado</h3>
<p>A Dra. Juliana apresentou o caso de Lucas, 4 anos, com diagnóstico de atraso global do desenvolvimento, em atendimento de musicoterapia há 3 meses:</p>

<p><strong>Perfil do paciente:</strong></p>
<ul>
<li>Linguagem expressiva muito reduzida - aproximadamente 10 palavras funcionais</li>
<li>Boa compreensão de comandos simples</li>
<li>Interesse significativo por música e instrumentos</li>
<li>Imita ritmos e melodias com facilidade</li>
<li>Dificuldade em manter atenção em atividades não-musicais</li>
</ul>

<p><strong>Dúvidas da supervisionanda:</strong></p>
<ul>
<li>Como utilizar a música para estimular a produção de fala?</li>
<li>Quais técnicas fonoaudiológicas podem ser incorporadas na musicoterapia?</li>
<li>Como estruturar sessões que trabalhem linguagem através da música?</li>
</ul>

<h3>3. Fundamentação Teórica</h3>
<p>A Dra. Ana Paula apresentou conceitos importantes sobre a relação entre música e linguagem:</p>

<p><strong>Processamento cerebral:</strong></p>
<ul>
<li>Música e linguagem compartilham áreas cerebrais de processamento</li>
<li>O ritmo musical facilita a organização temporal da fala</li>
<li>A melodia auxilia na prosódia e entonação</li>
<li>Canções repetitivas criam previsibilidade, facilitando a antecipação e produção verbal</li>
</ul>

<p><strong>Referências recomendadas:</strong></p>
<ul>
<li>Patel, A. D. - "Music, Language, and the Brain"</li>
<li>Koelsch, S. - Estudos sobre processamento musical e linguístico</li>
<li>Thaut, M. H. - Neurologic Music Therapy</li>
</ul>

<h3>4. Estratégias e Técnicas Orientadas</h3>

<p><strong>4.1 Canções de Preenchimento</strong></p>
<p>Usar músicas conhecidas deixando espaços para a criança completar:</p>
<ul>
<li>"Parabéns pra você, nesta data querida, muitas felicidades, muitos anos de ____" (vida)</li>
<li>"O sapo não lava o pé, não lava porque não ____" (quer)</li>
<li>Começar com palavras finais de frase (mais fáceis) e progredir para palavras no meio</li>
</ul>

<p><strong>4.2 Canções com Nomeação</strong></p>
<ul>
<li>Criar melodias simples para nomear objetos, cores, partes do corpo</li>
<li>Exemplo: "Esta é a bola, bola, bola... bola azul, bola azul"</li>
<li>Usar instrumentos como apoio visual e tátil durante a nomeação</li>
</ul>

<p><strong>4.3 Uso do Ritmo</strong></p>
<ul>
<li>Marcar sílabas com batidas de tambor ou palmas</li>
<li>Usar o ritmo para segmentar palavras: "MA-MÃE" (duas batidas)</li>
<li>Progressivamente aumentar a complexidade: "BO-LA-A-ZUL" (quatro batidas)</li>
</ul>

<p><strong>4.4 Onomatopeias Musicais</strong></p>
<ul>
<li>Começar com sons mais fáceis: "muu" (vaca), "au-au" (cachorro), "piu-piu" (passarinho)</li>
<li>Criar canções que incorporem esses sons</li>
<li>Sons de instrumentos: "bum" (tambor), "plim" (sino)</li>
</ul>

<p><strong>4.5 Comandos Cantados</strong></p>
<ul>
<li>Transformar instruções em pequenas melodias</li>
<li>"Vamos guardar, vamos guardar, o brinquedo no lugar"</li>
<li>Facilita compreensão e adesão da criança</li>
</ul>

<h3>5. Estrutura de Sessão Sugerida</h3>
<p>A supervisora sugeriu uma estrutura para as sessões:</p>

<ol>
<li><strong>Canção de chegada (5 min):</strong> Sempre a mesma música, criando rotina e trabalhando cumprimentos</li>
<li><strong>Aquecimento vocal/musical (5 min):</strong> Vocalizações, sons onomatopeicos</li>
<li><strong>Atividade principal (20 min):</strong> Canções de nomeação, preenchimento ou narrativa musical</li>
<li><strong>Atividade livre com instrumentos (10 min):</strong> Seguir o interesse da criança, expandindo vocabulário</li>
<li><strong>Canção de despedida (5 min):</strong> Encerramento previsível</li>
</ol>

<h3>6. Materiais Recomendados</h3>
<ul>
<li>Instrumentos variados: tambor, chocalho, sino, xilofone, pandeiro</li>
<li>Livros musicais com sons</li>
<li>Fantoches para canções de nomeação</li>
<li>Cartões com imagens para associar às músicas</li>
<li>Aplicativos de música infantil para uso complementar</li>
</ul>

<h3>7. Discussão e Combinados</h3>
<ul>
<li>Dra. Juliana aplicará as estratégias nas próximas sessões com Lucas</li>
<li>Registrará em vídeo (com autorização) trechos de sessões para discussão na próxima supervisão</li>
<li>Fará leitura dos artigos recomendados</li>
<li>Próxima supervisão: em 15 dias, para acompanhamento da aplicação das técnicas</li>
</ul>

<h3>8. Encerramento</h3>
<p>A sessão de supervisão foi encerrada às 10h15. A Dra. Juliana demonstrou-se motivada e com clareza sobre as estratégias a serem implementadas. A supervisora se colocou à disposição para dúvidas que surgirem durante a aplicação das técnicas.</p>`,
        status: 'rascunho',
        criadoEm: subDays(new Date(), 1).toISOString(),
        atualizadoEm: subDays(new Date(), 1).toISOString(),
    },
    {
        id: 'ata-005',
        cabecalho: {
            terapeutaId: 'ter-004',
            terapeutaNome: 'Dr. Roberto Ferreira',
            conselhoNumero: '45678-3/F',
            conselhoTipo: 'CREFITO',
            profissao: 'Fisioterapeuta',
            cargo: 'Terapeuta',
        },
        data: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
        horarioInicio: '11:00',
        horarioFim: '11:45',
        finalidade: FINALIDADE_REUNIAO.OUTROS,
        finalidadeOutros: 'Reunião com plano de saúde para liberação de sessões',
        modalidade: MODALIDADE_REUNIAO.ONLINE,
        participantes: [
            {
                id: 'part-009',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO,
                nome: 'Dr. Marcos Almeida',
                descricao: 'Auditor Médico - Unimed',
            },
        ],
        conteudo: `<h2>Reunião com Operadora de Saúde - Solicitação de Ampliação de Sessões</h2>

<h3>1. Abertura</h3>
<p>Reunião realizada por videoconferência às 11h00. Participantes: Dr. Roberto Ferreira (Fisioterapeuta responsável pelo caso) e Dr. Marcos Almeida (Auditor Médico da Unimed).</p>

<p>Objetivo: Solicitar ampliação do número de sessões de fisioterapia autorizadas para a paciente Helena Costa, atualmente com 20 sessões autorizadas, das quais 18 já foram utilizadas.</p>

<h3>2. Apresentação do Caso</h3>
<p>O Dr. Roberto apresentou o caso detalhadamente:</p>

<p><strong>Identificação:</strong></p>
<ul>
<li>Paciente: Helena Costa, 5 anos</li>
<li>Diagnóstico: Paralisia Cerebral Diplégica Espástica (CID G80.1)</li>
<li>Em acompanhamento fisioterapêutico na clínica há 6 meses</li>
<li>Frequência atual: 2 sessões semanais</li>
</ul>

<p><strong>Histórico clínico:</strong></p>
<ul>
<li>Nascida prematura (28 semanas), com peso de 980g</li>
<li>Hemorragia intraventricular grau II no período neonatal</li>
<li>Atraso motor identificado aos 8 meses de idade</li>
<li>Realizou aplicação de toxina botulínica em membros inferiores há 4 meses</li>
<li>Faz uso de órteses AFO bilateralmente</li>
</ul>

<h3>3. Evolução Clínica Apresentada</h3>
<p>O fisioterapeuta apresentou a evolução documentada ao longo das 18 sessões realizadas:</p>

<p><strong>Ganhos funcionais observados:</strong></p>
<ul>
<li>GMFM (Gross Motor Function Measure): aumento de 12 pontos no escore total</li>
<li>Dimensão D (em pé): evolução de 38% para 52%</li>
<li>Dimensão E (andar, correr, pular): evolução de 22% para 35%</li>
<li>Passou de marcha com andador para marcha com apoio unilateral (uma mão)</li>
<li>Consegue subir escadas com apoio bilateral no corrimão</li>
<li>Tempo de permanência em pé sem apoio: de 5 segundos para 25 segundos</li>
</ul>

<p><strong>Aspectos que ainda necessitam intervenção:</strong></p>
<ul>
<li>Espasticidade residual em adutores e flexores plantares</li>
<li>Marcha independente ainda não atingida</li>
<li>Desequilíbrio em superfícies instáveis</li>
<li>Necessidade de fortalecimento de core e membros inferiores</li>
</ul>

<h3>4. Justificativa Clínica para Ampliação</h3>
<p>O Dr. Roberto apresentou a justificativa técnica:</p>

<ul>
<li>Paciente em janela de oportunidade neuroplástica importante (idade crítica)</li>
<li>Resposta positiva à intervenção fisioterapêutica documentada objetivamente</li>
<li>Meta de marcha independente com potencial real de ser atingida</li>
<li>Redução de frequência neste momento pode comprometer os ganhos obtidos</li>
<li>Literatura científica respalda continuidade do tratamento intensivo em PC</li>
</ul>

<p><strong>Plano terapêutico proposto:</strong></p>
<ul>
<li>Manter frequência de 2x por semana por mais 3 meses (24 sessões adicionais)</li>
<li>Foco em treino de marcha independente e equilíbrio</li>
<li>Fortalecimento funcional de membros inferiores</li>
<li>Treino de atividades funcionais (sentar, levantar, subir/descer escadas)</li>
<li>Reavaliação com GMFM após 12 semanas</li>
</ul>

<h3>5. Documentação Apresentada</h3>
<p>Foram enviados ao auditor os seguintes documentos:</p>
<ul>
<li>Relatório de evolução fisioterapêutica detalhado</li>
<li>Gráficos comparativos do GMFM inicial e atual</li>
<li>Fotos e vídeos (com autorização) demonstrando a evolução funcional</li>
<li>Plano terapêutico para os próximos 3 meses</li>
<li>Relatório do neuropediatra reforçando a indicação de continuidade</li>
<li>Artigos científicos de referência sobre tratamento de PC</li>
</ul>

<h3>6. Questionamentos do Auditor</h3>
<p>O Dr. Marcos Almeida fez as seguintes perguntas:</p>

<p><strong>Pergunta 1:</strong> "Qual a expectativa realista de ganhos com as sessões adicionais?"</p>
<p><strong>Resposta:</strong> Expectativa de atingir marcha independente em ambientes controlados e aumentar o tempo de marcha com apoio unilateral para distâncias maiores. Ganho esperado de 10-15 pontos no GMFM.</p>

<p><strong>Pergunta 2:</strong> "A frequência poderia ser reduzida para 1x por semana?"</p>
<p><strong>Resposta:</strong> Não recomendado neste momento. A literatura indica que tratamento intensivo em fase de aquisição de marcos motores é mais efetivo. Redução poderia levar à regressão dos ganhos.</p>

<p><strong>Pergunta 3:</strong> "Existe previsão de alta da fisioterapia?"</p>
<p><strong>Resposta:</strong> Após atingir marcha independente funcional, a frequência poderá ser reduzida gradualmente. Estimativa de alta para acompanhamento apenas em 12-18 meses, caso evolução se mantenha positiva.</p>

<h3>7. Decisão do Auditor</h3>
<p>Após análise da documentação e discussão do caso, o Dr. Marcos comunicou:</p>

<ul>
<li><strong>Parecer:</strong> FAVORÁVEL à ampliação solicitada</li>
<li><strong>Sessões autorizadas:</strong> 24 sessões adicionais</li>
<li><strong>Frequência autorizada:</strong> 2 sessões semanais</li>
<li><strong>Prazo:</strong> 3 meses a partir da data de autorização</li>
<li><strong>Condição:</strong> Envio de novo relatório de evolução após 12 semanas</li>
</ul>

<h3>8. Encaminhamentos</h3>
<ul>
<li>Clínica receberá a autorização formal em até 48 horas úteis</li>
<li>Fisioterapeuta enviará relatório de evolução em 12 semanas</li>
<li>Nova solicitação de ampliação, se necessária, deverá ser feita com 10 dias de antecedência do término das sessões</li>
</ul>

<h3>9. Encerramento</h3>
<p>A reunião foi encerrada às 11h45. O Dr. Roberto agradeceu a disponibilidade do auditor e a análise criteriosa do caso. Comunicará o resultado à família da paciente.</p>`,
        clienteId: 'cli-004',
        clienteNome: 'Helena Costa',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 10).toISOString(),
        atualizadoEm: subDays(new Date(), 10).toISOString(),
    },
    // ============================================
    // MAIS ATAS PARA MIGUEL OLIVEIRA (cli-001)
    // ============================================
    {
        id: 'ata-006',
        cabecalho: {
            terapeutaId: 'ter-001',
            terapeutaNome: 'Dra. Ana Paula Silva',
            conselhoNumero: '12345-SP',
            conselhoTipo: 'CRFa',
            profissao: 'Fonoaudióloga',
            cargo: 'Terapeuta Sênior',
        },
        data: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
        horarioInicio: '10:00',
        horarioFim: '11:00',
        finalidade: FINALIDADE_REUNIAO.REUNIAO_EQUIPE,
        modalidade: MODALIDADE_REUNIAO.ONLINE,
        participantes: [
            {
                id: 'part-006-1',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
                nome: 'Dra. Ana Paula Silva',
                terapeutaId: 'ter-001',
                especialidade: 'Fonoaudiologia',
            },
            {
                id: 'part-006-2',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
                nome: 'Dr. Carlos Eduardo Santos',
                terapeutaId: 'ter-002',
                especialidade: 'Terapia Ocupacional',
            },
        ],
        conteudo: `<h2>Discussão de Caso Clínico - Miguel Oliveira</h2>
<p>Reunião para alinhamento terapêutico entre Fonoaudiologia e Terapia Ocupacional.</p>

<h3>1. Pontos Discutidos</h3>
<ul>
<li>Integração de estratégias de comunicação nas atividades de vida diária</li>
<li>Coordenação de objetivos terapêuticos entre as áreas</li>
<li>Ajuste de frequência de sessões</li>
</ul>

<h3>2. Encaminhamentos</h3>
<ul>
<li>Sessões conjuntas mensais para atividades integradas</li>
<li>Compartilhamento de materiais adaptados</li>
</ul>`,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 15).toISOString(),
        atualizadoEm: subDays(new Date(), 15).toISOString(),
    },
    {
        id: 'ata-007',
        cabecalho: {
            terapeutaId: 'ter-002',
            terapeutaNome: 'Dr. Carlos Eduardo Santos',
            conselhoNumero: '98765-3/TO',
            conselhoTipo: 'CREFITO',
            profissao: 'Terapeuta Ocupacional',
            cargo: 'Coordenador',
        },
        data: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
        horarioInicio: '09:00',
        horarioFim: '10:30',
        finalidade: FINALIDADE_REUNIAO.ORIENTACAO_PARENTAL,
        modalidade: MODALIDADE_REUNIAO.PRESENCIAL,
        participantes: [
            {
                id: 'part-007-1',
                tipo: TIPO_PARTICIPANTE.FAMILIA,
                nome: 'Maria Oliveira',
                descricao: 'Mãe',
            },
        ],
        conteudo: `<h2>Orientação sobre Adaptações Ambientais</h2>
<p>Orientação para adaptação do ambiente doméstico para favorecer a autonomia de Miguel.</p>

<h3>1. Adaptações Recomendadas</h3>
<ul>
<li>Organização do quarto com mobiliário na altura adequada</li>
<li>Identificação visual de espaços e objetos</li>
<li>Rotina visual com pictogramas</li>
</ul>`,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 25).toISOString(),
        atualizadoEm: subDays(new Date(), 25).toISOString(),
    },
    {
        id: 'ata-008',
        cabecalho: {
            terapeutaId: 'ter-003',
            terapeutaNome: 'Dra. Marina Costa',
            conselhoNumero: '06/54321',
            conselhoTipo: 'CRP',
            profissao: 'Psicóloga',
            cargo: 'Terapeuta',
        },
        data: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        horarioInicio: '14:00',
        horarioFim: '15:00',
        finalidade: FINALIDADE_REUNIAO.REUNIAO_ESCOLA,
        modalidade: MODALIDADE_REUNIAO.ONLINE,
        participantes: [
            {
                id: 'part-008-1',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO,
                nome: 'Profa. Carla Lima',
                descricao: 'Professora regente',
            },
            {
                id: 'part-008-2',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO,
                nome: 'Tatiana Souza',
                descricao: 'Coordenadora Pedagógica',
            },
        ],
        conteudo: `<h2>Alinhamento com Escola - Miguel Oliveira</h2>
<p>Reunião para discutir estratégias de manejo comportamental no ambiente escolar.</p>

<h3>1. Dificuldades Relatadas pela Escola</h3>
<ul>
<li>Transições entre atividades</li>
<li>Interação com pares no recreio</li>
<li>Foco em atividades de escrita</li>
</ul>

<h3>2. Estratégias Propostas</h3>
<ul>
<li>Antecipação verbal e visual das transições</li>
<li>Mediação de brincadeiras estruturadas</li>
<li>Adaptação de atividades escritas</li>
</ul>`,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 30).toISOString(),
        atualizadoEm: subDays(new Date(), 30).toISOString(),
    },
    {
        id: 'ata-009',
        cabecalho: {
            terapeutaId: 'ter-001',
            terapeutaNome: 'Dra. Ana Paula Silva',
            conselhoNumero: '12345-SP',
            conselhoTipo: 'CRFa',
            profissao: 'Fonoaudióloga',
            cargo: 'Terapeuta Sênior',
        },
        data: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
        horarioInicio: '11:00',
        horarioFim: '12:00',
        finalidade: FINALIDADE_REUNIAO.OUTROS,
        finalidadeOutros: 'Devolutiva de Reavaliação',
        modalidade: MODALIDADE_REUNIAO.PRESENCIAL,
        participantes: [
            {
                id: 'part-009-1',
                tipo: TIPO_PARTICIPANTE.FAMILIA,
                nome: 'Maria Oliveira',
                descricao: 'Mãe',
            },
            {
                id: 'part-009-2',
                tipo: TIPO_PARTICIPANTE.FAMILIA,
                nome: 'José Oliveira',
                descricao: 'Pai',
            },
        ],
        conteudo: `<h2>Devolutiva de Reavaliação Fonoaudiológica</h2>
<p>Apresentação dos resultados da reavaliação semestral de Miguel.</p>

<h3>1. Resultados</h3>
<ul>
<li>Vocabulário expressivo: aumento de 50 para 120 palavras</li>
<li>Compreensão de comandos: melhora significativa</li>
<li>Produção de frases: iniciando combinações de 2 palavras</li>
</ul>

<h3>2. Próximos Passos</h3>
<ul>
<li>Foco em expansão frasal</li>
<li>Trabalho com sons fricativos</li>
<li>Manutenção da frequência de 2x por semana</li>
</ul>`,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 40).toISOString(),
        atualizadoEm: subDays(new Date(), 40).toISOString(),
    },
    {
        id: 'ata-010',
        cabecalho: {
            terapeutaId: 'ter-002',
            terapeutaNome: 'Dr. Carlos Eduardo Santos',
            conselhoNumero: '98765-3/TO',
            conselhoTipo: 'CREFITO',
            profissao: 'Terapeuta Ocupacional',
            cargo: 'Coordenador',
        },
        data: format(subDays(new Date(), 50), 'yyyy-MM-dd'),
        horarioInicio: '16:00',
        horarioFim: '17:00',
        finalidade: FINALIDADE_REUNIAO.OUTROS,
        finalidadeOutros: 'Reunião de Planejamento Terapêutico',
        modalidade: MODALIDADE_REUNIAO.ONLINE,
        participantes: [
            {
                id: 'part-010-1',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
                nome: 'Dra. Ana Paula Silva',
                terapeutaId: 'ter-001',
                especialidade: 'Fonoaudiologia',
            },
            {
                id: 'part-010-2',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
                nome: 'Dra. Marina Costa',
                terapeutaId: 'ter-003',
                especialidade: 'Psicologia',
            },
        ],
        conteudo: `<h2>Planejamento Terapêutico Integrado - Miguel Oliveira</h2>
<p>Reunião da equipe multidisciplinar para planejamento semestral.</p>

<h3>1. Objetivos Compartilhados</h3>
<ul>
<li>Aumentar autonomia nas AVDs</li>
<li>Expandir repertório comunicativo</li>
<li>Melhorar regulação emocional</li>
</ul>

<h3>2. Cronograma de Ações</h3>
<ul>
<li>Reavaliações semestrais coordenadas</li>
<li>Reunião mensal de equipe</li>
<li>Orientação parental trimestral conjunta</li>
</ul>`,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        status: 'rascunho',
        criadoEm: subDays(new Date(), 50).toISOString(),
        atualizadoEm: subDays(new Date(), 50).toISOString(),
    },
    {
        id: 'ata-011',
        cabecalho: {
            terapeutaId: 'ter-003',
            terapeutaNome: 'Dra. Marina Costa',
            conselhoNumero: '06/54321',
            conselhoTipo: 'CRP',
            profissao: 'Psicóloga',
            cargo: 'Terapeuta',
        },
        data: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
        horarioInicio: '08:30',
        horarioFim: '09:30',
        finalidade: FINALIDADE_REUNIAO.ORIENTACAO_PARENTAL,
        modalidade: MODALIDADE_REUNIAO.PRESENCIAL,
        participantes: [
            {
                id: 'part-011-1',
                tipo: TIPO_PARTICIPANTE.FAMILIA,
                nome: 'Maria Oliveira',
                descricao: 'Mãe',
            },
        ],
        conteudo: `<h2>Orientação sobre Manejo Comportamental</h2>
<p>Orientação individual com a mãe sobre estratégias de manejo em casa.</p>

<h3>1. Temas Abordados</h3>
<ul>
<li>Rotina estruturada e previsibilidade</li>
<li>Estratégias de antecipação</li>
<li>Manejo de crises de birra</li>
<li>Reforço positivo de comportamentos adequados</li>
</ul>`,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 5).toISOString(),
        atualizadoEm: subDays(new Date(), 5).toISOString(),
    },
];

let nextAtaId = 12;

// ============================================
// HELPER - SIMULAR LATÊNCIA
// ============================================

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// MOCK CRUD FUNCTIONS
// ============================================

export async function listAtasMock(filters?: AtaListFilters): Promise<AtaListResponse> {
    await delay(400);

    let filtered = [...mockAtas];

    // Filtro por texto (busca em nome do cliente, conteúdo, participantes)
    if (filters?.q) {
        const q = filters.q.toLowerCase();
        filtered = filtered.filter(
            (ata) =>
                ata.clienteNome?.toLowerCase().includes(q) ||
                ata.conteudo.toLowerCase().includes(q) ||
                ata.participantes.some((p: Participante) => p.nome.toLowerCase().includes(q))
        );
    }

    // Filtro por finalidade
    if (filters?.finalidade && filters.finalidade !== 'all') {
        filtered = filtered.filter((ata) => ata.finalidade === filters.finalidade);
    }

    // Filtro por data início
    if (filters?.dataInicio) {
        filtered = filtered.filter((ata) => ata.data >= filters.dataInicio!);
    }

    // Filtro por data fim
    if (filters?.dataFim) {
        filtered = filtered.filter((ata) => ata.data <= filters.dataFim!);
    }

    // Filtro por cliente
    if (filters?.clienteId) {
        filtered = filtered.filter((ata) => ata.clienteId === filters.clienteId);
    }

    // Ordenar por data
    const orderBy = filters?.orderBy ?? 'recent';
    if (orderBy === 'recent') {
        filtered.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    } else {
        filtered.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    }

    // Paginação
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
        items,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
    };
}

export async function getAtaByIdMock(id: string): Promise<AtaReuniao | null> {
    await delay(200);
    return mockAtas.find((ata) => ata.id === id) ?? null;
}

export async function createAtaMock(input: CreateAtaInput): Promise<AtaReuniao> {
    await delay(400);

    const now = new Date().toISOString();
    const newAta: AtaReuniao = {
        id: `ata-${String(nextAtaId++).padStart(3, '0')}`,
        ...input.formData,
        cabecalho: input.cabecalho,
        status: 'rascunho',
        criadoEm: now,
        atualizadoEm: now,
    };

    mockAtas.unshift(newAta);
    return newAta;
}

export async function updateAtaMock(id: string, input: UpdateAtaInput): Promise<AtaReuniao | null> {
    await delay(300);

    const index = mockAtas.findIndex((ata) => ata.id === id);
    if (index === -1) return null;

    const updated: AtaReuniao = {
        ...mockAtas[index],
        ...input.formData,
        atualizadoEm: new Date().toISOString(),
    };

    mockAtas[index] = updated;
    return updated;
}

export async function deleteAtaMock(id: string): Promise<boolean> {
    await delay(300);

    const index = mockAtas.findIndex((ata) => ata.id === id);
    if (index === -1) return false;

    mockAtas.splice(index, 1);
    return true;
}

export async function finalizarAtaMock(id: string): Promise<AtaReuniao | null> {
    await delay(300);

    const index = mockAtas.findIndex((ata) => ata.id === id);
    if (index === -1) return null;

    mockAtas[index] = {
        ...mockAtas[index],
        status: 'finalizada',
        atualizadoEm: new Date().toISOString(),
    };

    return mockAtas[index];
}

export async function generateSummaryMock(id: string): Promise<string> {
    await delay(1500); // Simula tempo de processamento da IA

    const ata = mockAtas.find((a) => a.id === id);
    if (!ata) throw new Error('Ata não encontrada');

    // Extrai informações relevantes da ata para gerar um resumo contextualizado
    const finalidadeTexto = ata.finalidade === 'outros' ? ata.finalidadeOutros : ata.finalidade;
    
    // Gera resumo curto baseado no tipo de reunião
    let resumoContextualizado = '';
    
    switch (ata.finalidade) {
        case 'orientacao_parental':
            resumoContextualizado = `RESUMO DA REUNIÃO

Reunião de orientação parental realizada com a família${ata.clienteNome ? ` do paciente ${ata.clienteNome}` : ''}.

Principais pontos abordados:
- Apresentação da evolução terapêutica e conquistas recentes
- Orientações sobre estratégias de estimulação para aplicação em ambiente domiciliar
- Esclarecimento de dúvidas sobre o processo terapêutico
- Alinhamento de expectativas e definição de metas de curto prazo

Encaminhamentos:
- Família orientada a aplicar as estratégias discutidas durante a rotina diária
- Manter registro de observações para compartilhar nas próximas sessões
- Próxima reunião de acompanhamento agendada para 30 dias`;
            break;
            
        case 'reuniao_equipe':
            resumoContextualizado = `RESUMO DA REUNIÃO

Reunião de equipe multidisciplinar para discussão de casos e alinhamento de condutas.

${ata.clienteNome ? `Caso discutido: ${ata.clienteNome}\n\n` : ''}Principais pontos abordados:
- Revisão da evolução do paciente nas diferentes áreas de atendimento
- Análise de pontos de convergência entre as abordagens terapêuticas
- Definição de estratégias integradas e metas compartilhadas
- Planejamento de ações conjuntas para o próximo período

Encaminhamentos:
- Elaborar relatório integrado para apresentação à família
- Atualizar plano terapêutico individual com as metas definidas
- Manter comunicação entre a equipe para acompanhamento do caso`;
            break;
            
        case 'reuniao_escola':
            resumoContextualizado = `RESUMO DA REUNIÃO

Reunião com a escola para alinhamento de estratégias pedagógicas e terapêuticas${ata.clienteNome ? ` referente ao aluno ${ata.clienteNome}` : ''}.

Principais pontos abordados:
- Apresentação do perfil clínico e necessidades específicas do aluno
- Discussão sobre adaptações curriculares e metodológicas necessárias
- Definição de estratégias de apoio em sala de aula
- Estabelecimento de canal de comunicação entre escola e clínica

Adaptações acordadas:
- Tempo estendido para avaliações
- Uso de apoio visual em atividades pedagógicas
- Mediação em atividades em grupo quando necessário

Encaminhamentos:
- Escola implementará as adaptações sugeridas
- Relatórios de acompanhamento serão trocados trimestralmente
- Próxima reunião de alinhamento agendada para o próximo bimestre`;
            break;
            
        case 'supervisao_terapeuta':
            resumoContextualizado = `RESUMO DA SUPERVISÃO

Sessão de supervisão clínica conduzida por ${ata.cabecalho.terapeutaNome}.

Principais pontos abordados:
- Discussão técnica de casos clínicos em atendimento
- Revisão de fundamentação teórica e literatura pertinente
- Orientações sobre técnicas e estratégias de intervenção
- Análise de desafios encontrados e possíveis soluções

Orientações fornecidas:
- Aplicação de técnicas específicas discutidas nas próximas sessões
- Atenção aos pontos de evolução e possíveis barreiras identificadas
- Documentação detalhada do progresso para acompanhamento

Encaminhamentos:
- Supervisionando aplicará as estratégias orientadas
- Trazer feedback e evolução dos casos na próxima supervisão`;
            break;
            
        default:
            resumoContextualizado = `RESUMO DA REUNIÃO

Reunião realizada com finalidade: ${finalidadeTexto}${ata.clienteNome ? `, referente ao paciente ${ata.clienteNome}` : ''}.

Participantes: ${ata.participantes.map((p: Participante) => p.nome).join(', ')}.

Principais pontos abordados:
- Análise da situação atual e evolução do caso
- Definição de estratégias e próximos passos
- Alinhamento entre os envolvidos sobre condutas a serem adotadas

Encaminhamentos:
- Implementar ações acordadas conforme discussão
- Manter comunicação entre as partes para acompanhamento
- Agendar próxima reunião conforme necessidade identificada`;
    }

    const resumo = resumoContextualizado.trim();

    // Atualiza a ata com o resumo
    const index = mockAtas.findIndex((a) => a.id === id);
    if (index !== -1) {
        mockAtas[index] = {
            ...mockAtas[index],
            resumoIA: resumo,
            atualizadoEm: new Date().toISOString(),
        };
    }

    return resumo;
}

// ============================================
// MOCK - BUSCAR TERAPEUTAS
// ============================================

export async function listTerapeutasMock(): Promise<TerapeutaOption[]> {
    await delay(200);
    return mockTerapeutas;
}

// ============================================
// MOCK - BUSCAR CLIENTES
// ============================================

export async function listClientesMock(): Promise<ClienteOption[]> {
    await delay(200);
    return mockClientes;
}

// ============================================
// MOCK - BUSCAR DADOS DO TERAPEUTA LOGADO
// ============================================

export async function getTerapeutaLogadoMock(userId: string): Promise<CabecalhoAta> {
    await delay(150);
    
    // Simula buscar dados completos do terapeuta logado
    const terapeuta = mockTerapeutas.find((t) => t.id === userId);
    
    if (terapeuta) {
        return {
            terapeutaId: terapeuta.id,
            terapeutaNome: terapeuta.nome,
            conselhoNumero: terapeuta.registroConselho,
            conselhoTipo: terapeuta.conselho,
            profissao: terapeuta.especialidade,
            cargo: terapeuta.cargo,
        };
    }

    // Fallback para terapeuta padrão (para desenvolvimento)
    return {
        terapeutaId: 'ter-001',
        terapeutaNome: 'Dra. Ana Paula Silva',
        conselhoNumero: '12345-SP',
        conselhoTipo: 'CRFa',
        profissao: 'Fonoaudióloga',
        cargo: 'Terapeuta Sênior',
    };
}
