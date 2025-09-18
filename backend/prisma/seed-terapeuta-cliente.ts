import { faker } from '@faker-js/faker/locale/pt_BR';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
    const terapeutas = await prisma.terapeuta.findMany({ select: { id: true } })
    const clientes = await prisma.cliente.findMany({ select: { id: true } })

    if (!terapeutas.length || !clientes.length) {
        console.log('⚠️ Nenhum terapeuta ou cliente encontrado no banco.')
        return
    }

    const vinculos = Array.from({ length: 70 }).map(() => ({
        terapeuta_id: faker.helpers.arrayElement(terapeutas).id,
        cliente_id: faker.helpers.arrayElement(clientes).id,
    }))

    await prisma.terapeuta_cliente.createMany({
        data: vinculos,
        skipDuplicates: true,
    })

    console.log('✅ 70 vínculos terapeuta_cliente criados com sucesso!')
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e)
        prisma.$disconnect()
        process.exit(1)
    })