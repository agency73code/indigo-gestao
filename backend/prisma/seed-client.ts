import { PrismaClient } from '@prisma/client'
import { fakerPT_BR as faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

function createPerson(type: string) {
  const gender = faker.person.sexType();
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName(gender);

  const fullName = `${firstName} ${lastName}`;
  const cpf = faker.helpers.replaceSymbols('###########');
  const email = faker.internet.email({
    firstName,
    lastName,
    provider: 'example.com',
  });

  return {
    id: faker.string.uuid(),
    fullName,
    cpf,
    email,
    phone: faker.phone.number(),
    birthDate: type === 'client'
      ? faker.date.birthdate({ min: 3, max: 12, mode: 'age' })
      : faker.date.birthdate({ min: 25, max: 49, mode: 'age' }),
    address: {
      cep: faker.location.zipCode('########'),
      rua: faker.location.streetAddress(),
      numero: faker.location.buildingNumber(),
      bairro: faker.helpers.arrayElement([
        'Centro',
        'Jardim Paulista',
        'Copacabana',
        'Santa Cecília',
        'Vila Madalena',
        'Boa Viagem',
      ]),
      cidade: faker.location.city(),
      uf: faker.location.state({ abbreviated: true }),
      complemento: faker.helpers.arrayElement([
        `Apto ${faker.number.int({ min: 1, max: 999 })}`,
        `Bloco ${faker.string.alpha({ casing: 'upper', length: 1 })}`,
        `Casa ${faker.number.int({ min: 1, max: 20 })}`,
        `Fundos`,
        `Sobrado ${faker.number.int({ min: 1, max: 5 })}`,
        '',
      ]),
    },
    gender,
  }
}

function createSchool() {
  const type = faker.helpers.arrayElement([
    'particular',
    'publica',
    'afastado',
    'clinica-escola',
  ]);

  let name = null;
  let phone = null;
  let email = null;

  let baseName = `Escola Estadual ${faker.person.lastName()}`

  baseName =
  type === 'publica'
    ? `Escola Estadual ${faker.person.lastName()}`
    : type === 'clinica-escola'
    ? `Clínica Escola ${faker.company.name()}`
    : `Colégio ${faker.person.lastName()} ${faker.helpers.arrayElement([
      'Junior',
      'Master',
      'Novo Saber',
      'Premium',
      'Objetivo',
    ])}`;
  
  name = baseName;
  phone = faker.phone.number();
  email = faker.internet.email({
    firstName: name.split(' ')[1] || name,
    lastName: 'educacao',
    provider: 'edu.br',
  });

  const contact = createPerson('contact');

  return {
    type,
    name,
    phone,
    email,

    address: {
      cep: faker.location.zipCode('########'),
      rua: faker.location.streetAddress(),
      numero: faker.location.buildingNumber(),
      bairro: faker.helpers.arrayElement([
        'Centro',
        'Jardim Paulista',
        'Copacabana',
        'Santa Cecília',
        'Vila Madalena',
        'Boa Viagem',
      ]),
      cidade: faker.location.city(),
      uf: faker.location.state({ abbreviated: true }),
      complemento: faker.helpers.arrayElement([
        `Apto ${faker.number.int({ min: 1, max: 999 })}`,
        `Bloco ${faker.string.alpha({ casing: 'upper', length: 1 })}`,
        `Casa ${faker.number.int({ min: 1, max: 20 })}`,
        `Fundos`,
        `Sobrado ${faker.number.int({ min: 1, max: 5 })}`,
        '',
      ]),
    },

    contacts: {
      name: contact.fullName,
      phone: contact.phone,
      email: contact.email,
      role: faker.person.jobTitle(),
    }
  }
}

async function seedCliente(i: number, senha: string) {
  try {      
    const client = createPerson('client');
    const responsible = createPerson('responsible');

    const dataEntrada = faker.date.between({ from: '2023-01-01', to: new Date() });
    const dataSaida = faker.helpers.maybe(
      () => dataEntrada,
      { probability: 0.1 },
    );
    const status = dataSaida ? 'inativo' : 'ativo';
    const relacao = responsible.gender === 'female' ? 'mae' : 'pai'
    const escolaridade = faker.helpers.arrayElement([
      'Ensino Fundamental Incompleto',
      'Ensino Fundamental Completo',
      'Ensino Médio Incompleto',
      'Ensino Médio Completo',
      'Ensino Superior Incompleto',
      'Ensino Superior Completo',
      'Pós-graduação',
      'Mestrado',
      'Doutorado',
    ]);

    const sistemaPagamento = faker.helpers.arrayElement(['reembolso', 'liminar', 'particular']);

    let prazoReembolso = null;
    let numeroProcesso = null;
    let nomeAdvogado = null;
    let telefoneAdvogado1 = null;
    const telefoneAdvogado2 = null;
    const telefoneAdvogado3 = null;
    let emailAdvogado1 = null;
    const emailAdvogado2 = null;
    const emailAdvogado3 = null;
    let houveNegociacao = null;
    let valorAcordado = null;

    if (sistemaPagamento === 'reembolso') {
      prazoReembolso = faker.number.int({ min: 5, max: 30 }).toString();
    } else if (sistemaPagamento === 'liminar') {
      const attorney = createPerson('attorney');
      numeroProcesso = faker.helpers.replaceSymbols('#######-##.####.#.##.####');
      nomeAdvogado = attorney.fullName;
      telefoneAdvogado1 = attorney.phone;
      emailAdvogado1 = attorney.email;
    } else {
      houveNegociacao = faker.helpers.arrayElement(['sim', 'nao']);
      valorAcordado = houveNegociacao === 'sim' ? faker.finance.amount({ min: 500, max: 5000, dec: 2 }) : null;
    }

    const school = createSchool();

    const endereco = await prisma.endereco.create({
      data: responsible.address,
    });

    await prisma.cliente.create({
      data: {
        nome: client.fullName,
        cpf: responsible.cpf,
        dataNascimento: client.birthDate,
        emailContato: responsible.email,
        dataEntrada,
        dataSaida,
        status,
        perfil_acesso: 'user',
        senha,

        cuidadores: {
          create: {
            relacao,
            descricaoRelacao: null,
            nome: responsible.fullName,
            cpf: responsible.cpf,
            profissao: faker.person.jobTitle(),
            escolaridade,
            telefone: responsible.phone,
            email: responsible.email,
            
            endereco: {
              connect: { id: endereco.id }
            },
          },
        },

        enderecos: {
          create: {
            residenciaDe: relacao,
            outroResidencia: null,
            endereco: {
              connect: { id: endereco.id },
            },
          },
        },

        dadosPagamento: {
          create: {
            nomeTitular: responsible.fullName,
            numeroCarteirinha: faker.string.alphanumeric({ length: 10 }).toUpperCase(),
            telefone1: responsible.phone,
            telefone2: null,
            telefone3: null,
            email1: responsible.email,
            email2: null,
            email3: null,
            sistemaPagamento: sistemaPagamento,
            prazoReembolso: prazoReembolso ?? null,
            numeroProcesso: numeroProcesso ?? null,
            nomeAdvogado: nomeAdvogado ?? null,
            telefoneAdvogado1: telefoneAdvogado1 ?? null,
            telefoneAdvogado2: telefoneAdvogado2 ?? null,
            telefoneAdvogado3: telefoneAdvogado3 ?? null,
            emailAdvogado1: emailAdvogado1 ?? null,
            emailAdvogado2: emailAdvogado2 ?? null,
            emailAdvogado3: emailAdvogado3 ?? null,
            houveNegociacao: houveNegociacao ?? null,
            valorAcordado: valorAcordado ?? null,
          },
        },

        dadosEscola: {
          create: {
            tipoEscola: school.type,
            nome: school.name,
            telefone: school.phone,
            email: school.email,
            endereco: {
              connectOrCreate: {
                where: {
                  unique_endereco: {
                    cep: school.address.cep,
                    rua: school.address.rua,
                    numero: school.address.numero,
                    bairro: school.address.bairro,
                    cidade: school.address.cidade,
                    uf: school.address.uf,
                    complemento: school.address.complemento,
                  },
                },
                create: {
                  cep: school.address.cep,
                  rua: school.address.rua,
                  numero: school.address.numero,
                  bairro: school.address.bairro,
                  cidade: school.address.cidade,
                  uf: school.address.uf,
                  complemento: school.address.complemento,
                },
              },
            },

            contatos: {
              create: {
                nome: school.contacts.name,
                telefone: school.contacts.phone,
                email: school.contacts.email,
                funcao: school.contacts.role,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Erro ao criar registro ${i + 1}:`, error.message);
    } else {
      console.error(`❌ Erro ao criar registro ${i + 1}:`, error);
    }
  }
}

async function main() {
  const senha = await bcrypt.hash('Senha123', 10);
  const quantidade = 100;
  const concurrency = 10;

  const batch = [];

  for (let i = 0; i < quantidade; i++) {
    batch.push(seedCliente(i, senha));

    if (batch.length >= concurrency) {
      await Promise.all(batch);
      batch.length = 0;
      console.log(`✅ ${i + 1} clientes processados`);
    }
  }

  if (batch.length > 0) {
    await Promise.all(batch);
  }

  console.log(`🚀 Seed finalizado com ${quantidade} clientes`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })