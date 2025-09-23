import { faker } from '@faker-js/faker/locale/pt_BR';
import bcrypt from 'bcrypt';
import { cpf } from 'cpf-cnpj-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('Senha123', 10);

  // Exemplo de cargos possíveis
  const areasSelecionadas = [
    { cargoNome: faker.helpers.arrayElement(['Gerente', 'Terapeuta']) },
  ];

  const perfil_acesso = areasSelecionadas.some(p => p.cargoNome === 'Gerente')
    ? 'gerente'
    : 'terapeuta';

  await prisma.terapeuta.create({
    data: {
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      email_indigo: faker.internet.email({ provider: 'indigo.com' }),
      celular: faker.phone.number({ style: 'national' }),
      telefone: faker.phone.number({ style: 'national' }),
      cpf: cpf.generate(),
      data_nascimento: faker.date.birthdate({ min: 25, max: 50, mode: 'age' }),
      possui_veiculo: faker.datatype.boolean(),
      placa_veiculo: faker.vehicle.vrm(),
      modelo_veiculo: faker.vehicle.model(),
      banco: faker.company.name(),
      agencia: faker.finance.accountNumber(4),
      conta: faker.finance.accountNumber(6),
      chave_pix: faker.internet.email(),
      valor_hora: faker.finance.amount({ min: 200, max: 500, dec: 2 }),
      professor_uni: faker.datatype.boolean(),
      data_entrada: faker.date.past({ years: 5 }),
      perfil_acesso,
      atividade: true,
      senha: senhaHash,
    },
  });

  console.log('Seed executado com sucesso');
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
