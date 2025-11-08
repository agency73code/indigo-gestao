import { faker } from '@faker-js/faker/locale/pt_BR';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function createPerson() {
  const gender = faker.person.sexType();
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName(gender);

  const fullName = `${firstName} ${lastName}`;
  const cpf = faker.helpers.replaceSymbols('###########') + faker.number.int({ min: 1, max: 9 });
  const email = faker.internet.email({
    firstName,
    lastName,
    provider: 'example.com',
  }).replace('@', `.${faker.string.alphanumeric(4)}@`);

  const emailIndigo = faker.internet.email({
    firstName,
    lastName,
    provider: 'indigogestao.com',
  }).replace('@', `.${faker.string.alphanumeric(4)}@`);

  return {
    id: faker.string.uuid(),
    fullName,
    cpf,
    email,
    emailIndigo,
    cellphone: faker.phone.number().replace(/\D/g, ''),
    phone: faker.phone.number().replace(/\D/g, ''),
    birthDate: faker.date.birthdate({ min: 25, max: 49, mode: 'age' }),
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

function createCorp() {
  return {
    cnpj: faker.helpers.replaceSymbols('##############'),
    razao_social: `${faker.company.name()} ${faker.helpers.arrayElement(['LTDA', 'ME', 'EIRELI', 'S.A.'])}`,
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
  }
}

async function seedTherapist(i: number, senha: string) {
  try {
    const therapist = createPerson();

    const possui_veiculo = faker.datatype.boolean();
    let placa_veiculo = null;
    let modelo_veiculo = null;
    if (possui_veiculo) {
      placa_veiculo = faker.helpers.replaceSymbols('???#?##').toUpperCase();
      modelo_veiculo = `${faker.vehicle.manufacturer()} ${faker.vehicle.model()}`;
    }

    const banco = faker.helpers.arrayElement(['001', '033', '104', '237', '341', '260', '077', '655']);

    const data_entrada = faker.date.between({ from: '2023-01-01', to: new Date() });
    const data_saida = faker.helpers.maybe(
      () => data_entrada,
      { probability: 0.1 },
    );
    const atividade = data_saida ? false : true;

    const cargo_id = faker.number.int({ min: 1, max: 9 });

    const perfis: Record<number, string> = {
      1: 'acompanhante terapeutico',
      2: 'coordenador aba',
      3: 'supervisor aba',
      4: 'mediador de conflitos',
      5: 'coordenador executivo',
      6: 'professor uniindigo',
      7: 'terapeuta clinico',
      8: 'terapeuta supervisor',
      9: 'gerente',
    };

    const perfil_acesso = perfis[cargo_id];

    let pessoa_juridica = undefined;

    if (cargo_id !== 1) {
      const corp = createCorp();
      pessoa_juridica = {
        create: {
          cnpj: corp.cnpj,
          razao_social: corp.razao_social,
          endereco: {
            create: {
              cep: corp.address.cep,
              rua: corp.address.rua,
              numero: corp.address.numero,
              bairro: corp.address.bairro,
              cidade: corp.address.cidade,
              uf: corp.address.uf,
              complemento: corp.address.complemento,
            },
          },
        },
      }
    }

    await prisma.terapeuta.create({
      data: {
        nome: therapist.fullName,
        email: therapist.email,
        email_indigo: therapist.emailIndigo,
        celular: therapist.cellphone,
        telefone: therapist.phone,
        cpf: therapist.cpf,
        data_nascimento: therapist.birthDate,
        possui_veiculo,
        placa_veiculo,
        modelo_veiculo,
        banco,
        agencia: faker.helpers.replaceSymbols('#####'),
        conta: faker.helpers.replaceSymbols('#########'),
        chave_pix: therapist.cpf,
        pix_tipo: 'cpf',
        valor_hora: faker.finance.amount({ min: 120, max: 600, dec: 2 }),
        professor_uni: false,
        
        endereco: {
          create: {
            cep: therapist.address.cep,
            rua: therapist.address.rua,
            numero: therapist.address.numero,
            bairro: therapist.address.bairro,
            cidade: therapist.address.cidade,
            uf: therapist.address.uf,
            complemento: therapist.address.complemento,
          },
        },

        data_entrada,
        data_saida,
        atividade,
        perfil_acesso,
        senha,
        token_redefinicao: null,
        validade_token: null,
    
        registro_profissional: {
          create: {
            area_atuacao_id: faker.number.int({ min: 1, max: 11 }),
            cargo_id,
            numero_conselho: `${faker.number.int({ min: 1000, max: 999999 })}/${therapist.address.uf}`,
          },
        },
    
        formacao: {
          create: {
            graduacao: faker.helpers.arrayElement(['Psicologia', 'Fonoaudiologia', 'Terapia Ocupacional', 'Educação Física', 'Pedagogia', 'Medicina', 'Enfermagem', 'Fisioterapia', 'Serviço Social', 'Neuropsicologia']),
            instituicao_graduacao: `${faker.company.name()} Universidade`,
            ano_formatura: faker.number.int({ min: 2005, max: 2024 }),
            participacao_congressos: faker.helpers.maybe(
              () => `Participou do ${faker.word.sample()} ${faker.number.int({ min: 2015, max: 2023 })}`,
              { probability: 0.4 },
            ),
            publicacoes_descricao: faker.helpers.maybe(
              () => `Autor do artigo "${faker.word.sample()} e suas implicações clínicas"`,
              { probability: 0.2 },
            ),
          }
        },

        pessoa_juridica,
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
    batch.push(seedTherapist(i, senha));

    if (batch.length >= concurrency) {
      await Promise.all(batch);
      batch.length = 0;
      console.log(`✅ ${i + 1} terapeutas processados`);
    }
  }

  if (batch.length > 0) {
    await Promise.all(batch);
  }

  console.log(`🚀 Seed finalizado com ${quantidade} terapeutas`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });