import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const CLIENTE_ID = 'e82862f2-946e-420b-97d0-65e899da2ffc';
  const TERAPEUTA_ID = '0514a446-791e-457f-9c02-21adae44f4e8';

  // 🔊 Programa de Fonoaudiologia
  const fonoOcp = await prisma.ocp.create({
    data: {
      cliente_id: CLIENTE_ID,         // <-- troca aqui
      terapeuta_id: TERAPEUTA_ID,     // <-- troca aqui
      nome_programa: 'Aprimoramento da linguagem oral',
      data_inicio: new Date('2025-12-05T00:00:00.000Z'),
      data_fim: new Date('2026-06-05T00:00:00.000Z'),
      area: 'fonoaudiologia',

      objetivo_programa: 'Ampliação da compreensão e expressão oral em situações do cotidiano.',
      objetivo_descricao:
        'Promover o desenvolvimento da linguagem oral de Ana, ampliando compreensão de instruções simples e produção de frases claras e funcionais em casa, escola e atendimentos.',
      criterio_aprendizagem:
        'Responder adequadamente a pelo menos 80% das instruções simples e perguntas concretas, e produzir frases completas em 70% das oportunidades em 3 sessões consecutivas.',
      objetivo_curto:
        'Seguir instruções simples em uma etapa e responder perguntas concretas com palavras isoladas ou frases curtas (2–3 palavras), com pistas visuais e verbais.',
      descricao_aplicacao:
        'Sessões semanais de fonoaudiologia utilizando figuras, jogos simbólicos, livros ilustrados e modelagem de linguagem, com registro sistemático das respostas.',
      observacao_geral:
        'Família orientada a usar linguagem clara, dar tempo de resposta e estimular que a criança complete as frases, evitando falar por ela.',
      desempenho_atual:
        null,

      estimulo_ocp: {
        create: [
          {
            status: true,
            nome: 'Compreensão de instruções simples em uma etapa',
            descricao:
              'Trabalho com comandos simples do cotidiano (ex.: pegar, guardar, apontar), usando apoio visual e gestual.',
            estimulo: {
              create: {
                nome: 'Compreensão de instruções simples',
                descricao: 'Compreensão de comandos simples de 1 etapa em contexto lúdico e funcional.',
              },
            },
          },
          {
            status: true,
            nome: 'Respostas a perguntas concretas sobre figuras',
            descricao:
              'Responder quem, o que e onde a partir de figuras e cenas simples, com pistas graduadas do terapeuta.',
            estimulo: {
              create: {
                nome: 'Perguntas concretas sobre figuras',
                descricao: 'Respostas verbais a perguntas concretas baseadas em figuras.',
              },
            },
          },
          {
            status: true,
            nome: 'Construção de frases simples a partir de figuras',
            descricao:
              'Produção de frases com sujeito, verbo e complemento usando imagens como apoio.',
            estimulo: {
              create: {
                nome: 'Construção de frases simples',
                descricao: 'Construção de frases simples a partir de estímulos visuais.',
              },
            },
          },
          {
            status: true,
            nome: 'Relato breve de rotina diária',
            descricao:
              'Relatar partes da rotina (ex.: manhã, escola, brincadeiras) com apoio de perguntas guiadas.',
            estimulo: {
              create: {
                nome: 'Relato breve de rotina diária',
                descricao: 'Relato de rotina diária com apoio de perguntas e figuras.',
              },
            },
          },
        ],
      },
    },
  });

  console.log('Fono OCP criado:', fonoOcp.id);

  // 🧩 Programa de Terapia Ocupacional
  const toOcp = await prisma.ocp.create({
    data: {
      cliente_id: CLIENTE_ID,           // <-- troca aqui
      terapeuta_id: TERAPEUTA_ID,       // <-- troca aqui
      nome_programa: 'Autonomia nas rotinas de autocuidado em casa',
      data_inicio: new Date('2025-12-05T00:00:00.000Z'),
      data_fim: new Date('2026-06-05T00:00:00.000Z'),
      area: 'terapia-ocupacional',

      objetivo_programa:
        'Aumentar a independência da criança nas rotinas de higiene, vestuário e organização de pertences.',
      objetivo_descricao:
        'Favorecer a autonomia funcional em atividades de vida diária, reduzindo a necessidade de ajuda física e verbal intensa dos adultos.',
      criterio_aprendizagem:
        null,
      objetivo_curto:
        null,
      descricao_aplicacao:
        null,
      observacao_geral:
        'Responsáveis orientados a oferecer pistas graduadas e evitar assumir a tarefa no lugar da criança diante de pequenas resistências.',
      desempenho_atual:
        'Apresenta dificuldade para iniciar tarefas sozinho, esquece etapas importantes e precisa de ajuda para concluir rotinas básicas.',

      estimulo_ocp: {
        create: [
          {
            status: true,
            nome: 'Higiene pessoal (rotina da manhã)',
            descricao:
              'Sequência de lavar o rosto, escovar os dentes e pentear o cabelo com apoio visual.',
            estimulo: {
              create: {
                nome: 'Higiene pessoal – rotina da manhã',
                descricao: 'Rotina de higiene matinal com quadro visual.',
              },
            },
          },
          {
            status: true,
            nome: 'Vestuário – preparação de roupas para o dia seguinte',
            descricao:
              'Escolha e separação de roupas com checklist ilustrado para o dia seguinte.',
            estimulo: {
              create: {
                nome: 'Preparação de roupas para o dia seguinte',
                descricao: 'Preparar roupas do dia seguinte com apoio visual.',
              },
            },
          },
          {
            status: true,
            nome: 'Organização de materiais pessoais',
            descricao:
              'Guardar materiais escolares e brinquedos em locais combinados ao final do dia.',
            estimulo: {
              create: {
                nome: 'Organização de materiais pessoais',
                descricao: 'Organização básica de mochila e brinquedos.',
              },
            },
          },
          {
            status: true,
            nome: 'Início de tarefa de autocuidado após lembrete simples',
            descricao:
              'Iniciar rotina combinada (ex.: higiene) após um lembrete curto, sem repetição do comando.',
            estimulo: {
              create: {
                nome: 'Início de tarefas de autocuidado',
                descricao: 'Início de tarefas de autocuidado após lembrete único.',
              },
            },
          },
        ],
      },
    },
  });

  console.log('TO OCP criado:', toOcp.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
