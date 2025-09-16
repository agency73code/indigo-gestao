import { PrismaClient,
    terapeuta_atividade,
    cliente_status,
    escola_tipo_escola,
    cliente_responsavel_parentesco
} from '@prisma/client';
import { faker } from '@faker-js/faker/locale/pt_BR';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { cnpj, cpf } from 'cpf-cnpj-validator';

const prisma = new PrismaClient();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const DELAY_MS = Number('1000');
const BATCHES = Number(5);

async function seedOnce() {
    const TIPO_ENDERECO_MAP = {
        residencial: 1,
        institucional: 2,
        empresarial: 3,
    } as const;

    const AREA_MAP = {
        'Fonoaudiologia': 1,
        'Psicomotricidade': 2,
        'Fisioterapia': 3,
        'Terapia Ocupacional': 4,
        'Psicopedagogia': 5,
        'Educador Físico': 6,
        'Terapia ABA': 7,
        'Musicoterapia': 8,
        'Pedagogia': 9,
        'Neuropsicologia': 10,
    } as const;

    const CARGO_MAP = {
        'Acompanhante Terapeutico': 1,
        'Coordenador ABA': 2,
        'Supervisor ABA': 3,
        'Mediador de Conflitos': 4,
        'Coordenador Executivo': 5,
        'Professor UniIndigo': 6,
        'Terapeuta clinico': 7,
        'Terapeuta Supervisor': 8,
        'Gerente': 9,
    } as const;

    const ESTADO_TO_UF: Record<string, string> = {
    'Acre':'AC',
    'Alagoas':'AL',
    'Amapá':'AP',
    'Amazonas':'AM',
    'Bahia':'BA',
    'Ceará':'CE',
    'Distrito Federal':'DF',
    'Espírito Santo':'ES',
    'Goiás':'GO',
    'Maranhão':'MA',
    'Mato Grosso':'MT',
    'Mato Grosso do Sul':'MS',
    'Minas Gerais':'MG','Pará':'PA',
    'Paraíba':'PB',
    'Paraná':'PR',
    'Pernambuco':'PE',
    'Piauí':'PI',
    'Rio de Janeiro':'RJ',
    'Rio Grande do Norte':'RN',
    'Rio Grande do Sul':'RS',
    'Rondônia':'RO',
    'Roraima':'RR',
    'Santa Catarina':'SC',
    'São Paulo':'SP',
    'Sergipe':'SE',
    'Tocantins':'TO'
    };

    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    const oneMonthsAgo = new Date();
    oneMonthsAgo.setMonth(now.getMonth() - 1);

    const areas  = Object.keys(AREA_MAP);
    const cargos = Object.keys(CARGO_MAP);

    const senhaHash = await bcrypt.hash('Senha123', 10);

    /* Escolas */
    const escolas = await Promise.all(
        Array.from({ length: 3 }).map(async () => {
            const cidade = faker.location.state();
            const uf = ESTADO_TO_UF[cidade] ?? 'SP';
            const end = await prisma.endereco.create({
                data: {
                    cep: faker.location.zipCode('########'),
                    logradouro: faker.location.street(),
                    numero: faker.number.int({ min: 1, max: 3999 }).toString(),
                    bairro: faker.word.sample({ length: { min: 6, max: 14 } }),
                    cidade,
                    uf,
                    complemento: faker.helpers.maybe(() => faker.lorem.words(), { probability: 0.3 })
                }
            });

            const escola = await prisma.escola.create({
                data: {
                    tipo_escola: faker.helpers.arrayElement(Object.values(escola_tipo_escola)),
                    nome: `Escola ${faker.company.name()}`,
                    telefone: faker.string.numeric(11),
                    email: faker.internet.email()
                }
            });

            await prisma.escola_endereco.create({
                data: {
                    escola_id: escola.id,
                    endereco_id: end.id,
                    tipo_endereco_id: TIPO_ENDERECO_MAP.institucional,
                    principal: 0
                }
            });

            return escola;
        })
    );

    /* Terapeuta */
    await Promise.all(
        Array.from({ length: 10 }).map(async () => {
            const id = uuid();
            const cidade = faker.location.state();
            const uf = ESTADO_TO_UF[cidade] ?? 'SP';
            const end = await prisma.endereco.create({
                data: {
                    cep: faker.location.zipCode('########'),
                    logradouro: faker.location.street(),
                    numero: faker.number.int({ min: 1, max: 3999 }).toString(),
                    bairro: faker.word.sample({ length: { min: 6, max: 14 } }),
                    cidade,
                    uf,
                    complemento: faker.helpers.maybe(() => faker.lorem.words(), { probability: 0.3 })
                }
            });

            const possuiVeiculo = faker.helpers.arrayElement(['sim', 'nao'] as const);
            const placaVeiculo = possuiVeiculo === 'sim'
                ? faker.string.alpha({ length: 3, casing: 'upper' }) + faker.string.numeric(4)
                : null;
            const modeloVeiculo = possuiVeiculo === 'sim'
                ? faker.vehicle.vehicle()
                : null;

            const cnpj_empresa = faker.helpers.maybe(() => cnpj.generate().replace(/\D/g, ""), { probability: 0.8 }) ?? null;
            const razao_social = cnpj_empresa ? faker.company.name() : null;

            const pos_graduacao = faker.helpers.maybe(() => faker.person.jobArea(), { probability: 0.3 }) ?? null;
            const pos_grad_instituicao = pos_graduacao ? faker.company.name() : null;
            const ano_pos_graduacao = pos_graduacao ? faker.date.past({ years: 10 }).getFullYear().toString() : null;

            const qtd = faker.number.int({ min: 1, max: 3 });
            const areasSelecionadas = faker.helpers
                .arrayElements(areas, qtd)
                .map(areaNome => {
                    const cargoNome = faker.helpers.arrayElement(cargos);
                    return { areaNome, cargoNome };
                });
            const perfil_acesso = areasSelecionadas.some(p => p.cargoNome === 'Gerente')
                ? 'gerente'
                : 'terapeuta';

            const data_saida = faker.helpers.maybe(() => faker.date.between({ from: oneMonthsAgo, to: now }), { probability: 0.1 });
            const atividade = data_saida ? terapeuta_atividade['inativo'] : terapeuta_atividade['ativo']; 

            const terapeuta = await prisma.terapeuta.create({
                data: {
                    id,
                    nome: faker.person.fullName(),
                    cpf: cpf.generate(),
                    data_nascimento: faker.date.birthdate({ min: 23, max: 50, mode: 'age' }),
                    telefone: faker.helpers.maybe(() => faker.string.numeric(11), { probability: 0.5 }),
                    celular: faker.string.numeric(11),
                    foto_perfil: null,
                    email: faker.internet.email(),
                    email_indigo: `${faker.internet.email().split('@')[0]}${faker.number.int({ min: 1, max: 19 })}@indigo.com`,
                    possui_veiculo: possuiVeiculo,
                    placa_veiculo: placaVeiculo,
                    modelo_veiculo: modeloVeiculo,
                    banco: faker.company.name(),
                    agencia: faker.string.numeric(4),
                    conta: faker.string.numeric(6),
                    chave_pix: faker.internet.email(),
                    cnpj_empresa,
                    razao_social,
                    graduacao: faker.person.jobTitle(),
                    grad_instituicao: faker.company.name(),
                    ano_formatura: faker.date.past({ years: 20 }).getFullYear().toString(),
                    pos_graduacao,
                    pos_grad_instituicao,
                    ano_pos_graduacao,
                    cursos: faker.helpers.maybe(() => faker.lorem.sentences(2), { probability: 0.4 }) ?? null,
                    data_entrada: faker.date.between({ from: threeMonthsAgo, to: now }),
                    data_saida,
                    perfil_acesso,
                    atividade,
                    senha: senhaHash,
                }
            });

            const enderecosData: {
                terapeuta_id: string; 
                endereco_id: number; 
                tipo_endereco_id: number; 
                principal: number 
            }[] = [
                {
                    terapeuta_id: terapeuta.id,
                    endereco_id: end.id,
                    tipo_endereco_id: TIPO_ENDERECO_MAP.residencial,
                    principal: 1
                },
            ];

            if (terapeuta.cnpj_empresa) {
                enderecosData.push({
                    terapeuta_id: terapeuta.id,
                    endereco_id: end.id,
                    tipo_endereco_id: TIPO_ENDERECO_MAP.empresarial,
                    principal: 0
                });
            }

            await prisma.terapeuta_endereco.createMany({
                data: enderecosData,
            });

            for (const { areaNome, cargoNome } of areasSelecionadas) {
                const areaId = AREA_MAP[areaNome as keyof typeof AREA_MAP];
                const cargoId = CARGO_MAP[cargoNome as keyof typeof CARGO_MAP];

                if (!areaId || !cargoId) continue;
                
                await prisma.terapeuta_area_atuacao.create({
                    data: {
                        terapeuta_id: terapeuta.id,
                        area_atuacao_id: areaId,
                    },
                });

                await prisma.terapeuta_cargo.createMany({
                data: areasSelecionadas.map(({ cargoNome }) => ({
                    terapeuta_id: terapeuta.id,
                    cargo_id: CARGO_MAP[cargoNome as keyof typeof CARGO_MAP],
                    numero_conselho: faker.string.alphanumeric(6).toUpperCase(),
                    data_entrada: terapeuta.data_entrada,
                    data_saida: faker.helpers.maybe(() => faker.date.past({ years: 1 }), { probability: 0.1 }),
                })),
                skipDuplicates: true,
                });
            }
        })
    );

    /* Clientes */
    await Promise.all(
        Array.from({ length: 10 }).map(async () => {
            const id = uuid();
            const cidade = faker.location.state();
            const uf = ESTADO_TO_UF[cidade] ?? 'SP';

            const end = await prisma.endereco.create({
                data: {
                    cep: faker.location.zipCode('########'),
                    logradouro: faker.location.street(),
                    numero: faker.number.int({ min: 1, max: 3999 }).toString(),
                    bairro: faker.word.sample({ length: { min: 6, max: 14 } }),
                    cidade,
                    uf,
                    complemento: faker.helpers.maybe(() => faker.lorem.words(), { probability: 0.3 })
                }
            });

            const data_saida = faker.helpers.maybe(() => faker.date.between({ from: oneMonthsAgo, to: now }), { probability: 0.1 });
            const status = data_saida ? cliente_status['inativo'] : cliente_status['ativo']; 
            const cliente = await prisma.cliente.create({
                data: {
                    id,
                    nome: faker.person.fullName(),
                    data_nascimento: faker.date.birthdate({ min: 1, max: 125, mode: 'age' }),
                    email_contato: faker.internet.email(),
                    data_entrada: faker.date.between({ from: threeMonthsAgo, to: now }),
                    data_saida,
                    status,
                    perfil_acesso: 'cliente',
                    senha: senhaHash
                }
            });

            await prisma.cliente_endereco.create({
                data: {
                cliente_id: cliente.id,
                endereco_id: end.id,
                tipo_endereco_id: TIPO_ENDERECO_MAP.residencial,
                principal: 1
                }
            });

            const escola = faker.helpers.arrayElement(escolas);
            await prisma.cliente_escola.create({ data: { cliente_id: id, escola_id: escola.id } });

            const qtdResponsaveis = faker.number.int({ min: 1, max: 3 });
            for (let i = 0; i < qtdResponsaveis; i++) {

                const responsavel = await prisma.responsaveis.create({
                    data: {
                    nome: faker.person.fullName(),
                    cpf: cpf.generate(),
                    telefone: faker.helpers.maybe(() => faker.string.numeric(11), { probability: 0.5 }),
                    email: faker.internet.email(),
                    },
                });

                await prisma.cliente_responsavel.create({
                    data: {
                    cliente_id: id,
                    responsaveis_id: responsavel.id,
                    parentesco: i === 0
                        ? "mae"
                        : faker.helpers.arrayElement(Object.values(cliente_responsavel_parentesco)),
                    prioridade: i === 0 ? 1 : 0,
                    }
                });
            }
        })
    );
}

async function main() {
    for (let i = 0; i < BATCHES; i++) {
        console.log(`\n[seed] iniciando lote ${i + 1}/${BATCHES}...`);
        try {
            await seedOnce();
            console.log(`[seed] Lote ${i + 1} concluido.`);
        } catch (err) {
            console.error(`[seed] Erro no lote ${i + 1}:`, err);
        }

        if (i < BATCHES - 1) {
            console.log(`[seed] Aguardando ${DELAY_MS}ms antes do próximo lote...`);
            await sleep(DELAY_MS);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('[seed] Prisma desconectado.');
    });