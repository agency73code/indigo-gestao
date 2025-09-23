import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
    const quantidade = 200; // defina aqui quantos registros quer criar
    for (let i = 0; i < quantidade; i++) {
        await prisma.cliente.create({
            data: {
            id: faker.string.uuid(),
            nome: faker.person.fullName(),
            data_nascimento: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
            email_contato: faker.internet.email(),
            data_entrada: faker.date.recent({ days: 30 }),
            perfil_acesso: 'user', // valor fixo só para atender constraint
            },
        })
    }

    console.log(`Seed executado com sucesso (${quantidade} registros)`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })