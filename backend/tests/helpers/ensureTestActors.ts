import { prisma } from '../../src/config/database.js';

const TEST_CLIENT_ID = '11111111-1111-4111-8111-111111111111';
const TEST_THERAPIST_ID = '22222222-2222-4222-8222-222222222222';

export async function ensureTestClientAndTherapist() {
  const cliente = await prisma.cliente.upsert({
    where: { id: TEST_CLIENT_ID },
    update: {},
    create: {
      id: TEST_CLIENT_ID,
      nome: 'Cliente Teste',
      cpf: null,
      emailContato: null,
      perfil_acesso: 'CLIENTE',
    },
  });

  const terapeuta = await prisma.terapeuta.upsert({
    where: { id: TEST_THERAPIST_ID },
    update: {},
    create: {
      id: TEST_THERAPIST_ID,

      nome: 'Terapeuta Teste',

      email: 'terapeuta.teste@test.saude',
      email_indigo: 'terapeuta.teste@indigo.saude',
      celular: '11999999999',
      cpf: '00000000000',

      data_nascimento: new Date('1990-01-01'),
      data_entrada: new Date('2024-01-01'),

      perfil_acesso: 'TERAPEUTA',

      atividade: true,
    },
  });

  return { cliente, terapeuta };
}