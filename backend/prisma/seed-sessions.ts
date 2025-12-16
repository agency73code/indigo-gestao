import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const MIN_SESSOES_POR_PROGRAMA = 5;
const MAX_SESSOES_POR_PROGRAMA = 10;

const MIN_TRIALS_POR_SESSAO = 10;
const MAX_TRIALS_POR_SESSAO = 20;

const CHANCE_OBSERVACAO_SESSAO = 0.75; // porcentagem que define quantas sessoes vao ter observação 0.75 = 75%

const RESULTADOS_POSSIVEIS = [
  "independent",
  "prompted",
  "error",
] as const;

const OBSERVACOES_BASE = [
  "Sessão realizada conforme planejamento para {cliente}.",
  "{cliente} apresentou bom engajamento durante a sessão.",
  "Sessão com foco em evolução gradual para {cliente}.",
  "Atividades executadas com adaptação às necessidades de {cliente}.",
  "Sessão produtiva, respeitando os limites de {cliente}.",
  "{cliente} respondeu bem aos estímulos propostos.",
  "Sessão com observações clínicas relevantes para {cliente}.",
  "Atendimento realizado com acompanhamento contínuo de {cliente}.",
];


const prisma = new PrismaClient();

export async function seedSessions() {
    const ocps = await prisma.ocp.findMany({
        where: { 
            status: 'ativado',
            area: { not: 'musicoterapia' },
        },
        include: {
            estimulo_ocp: true,
            cliente: true,
        },
    });

    for (const ocp of ocps) {
        if (ocp.estimulo_ocp.length === 0) continue;

        const totalSessions = faker.number.int({
            min: MIN_SESSOES_POR_PROGRAMA,
            max: MAX_SESSOES_POR_PROGRAMA,
        });

        for (let i = 0; i < totalSessions; i++) {
            const observation =
                Math.random() < CHANCE_OBSERVACAO_SESSAO
                    ? faker.helpers
                        .arrayElement(OBSERVACOES_BASE)
                        .replace('{cliente}', ocp.cliente.nome!)
                    : null

            const session = await prisma.sessao.create({
                data: {
                    ocp_id: ocp.id,
                    cliente_id: ocp.cliente_id,
                    terapeuta_id: ocp.terapeuta_id,
                    area: ocp.area,
                    observacoes_sessao: observation,
                },
            });

            await createTrials(session.id, ocp.estimulo_ocp, ocp.area)
        }
    }
}

async function createTrials(sessionId: number, stimulusOcp: { id: number }[], area: string) {
    const totalTrials = faker.number.int({
        min: MIN_TRIALS_POR_SESSAO,
        max: MAX_TRIALS_POR_SESSAO,
    });

    let order = 1;

    let sessionContext = {};

    if (area === 'fisioterapia') {
        const usedLoad = Math.random() < 0.5;
        const hadDiscomfort = Math.random() < 0.4;
        const hadCompensation = Math.random() < 0.3;

        sessionContext = {
        duracao_minutos: faker.number.int({ min: 15, max: 30 }),
        utilizou_carga: usedLoad,
        valor_carga: usedLoad
            ? faker.number.float({ min: 1, max: 10, fractionDigits: 1 })
            : null,
        teve_desconforto: hadDiscomfort,
        descricao_desconforto: hadDiscomfort
            ? faker.lorem.sentence()
            : null,
        teve_compensacao: hadCompensation,
        descricao_compensacao: hadCompensation
            ? faker.lorem.words(2)
            : null,
        };
    }

    if (area === 'terapia-ocupacional') {
        if (Math.random() < 0.6) {
            sessionContext = {
                duracao_minutos: faker.number.int({ min: 20, max: 40 }),
            };
        }
    }

    for (let i = 0; i < totalTrials; i++) {
        const stimulus = faker.helpers.arrayElement(stimulusOcp);
        const result = faker.helpers.arrayElement(RESULTADOS_POSSIVEIS);

        await prisma.sessao_trial.create({
            data: {
                sessao_id: sessionId,
                estimulos_ocp_id: stimulus.id,
                ordem: order++,
                resultado: result,
                ...sessionContext, // 👈 REPETIDO EM TODOS
            },
        });
    }
}

seedSessions()
  .then(() => {
    console.log("✅ Seed de sessões finalizado")
  })
  .catch((err) => {
    console.error("❌ Erro ao rodar seed de sessões", err)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })