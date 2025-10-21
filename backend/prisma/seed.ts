import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.area_atuacao.createMany({
        data: [
            { nome: 'Fonoaudiologia' },
            { nome: 'Psicomotricidade' },
            { nome: 'Fisioterapia' },
            { nome: 'Terapia Ocupacional' },
            { nome: 'Psicopedagogia' },
            { nome: 'Educador Físico' },
            { nome: 'Terapia ABA' },
            { nome: 'Musicoterapia' },
            { nome: 'Pedagogia' },
            { nome: 'Neuropsicologia' },
            { nome: 'Nutrição' }
        ],
        skipDuplicates: true,
    })

    await prisma.cargo.createMany({
        data: [
            { nome: 'Acompanhante Terapeutico' },
            { nome: 'Coordenador ABA' },
            { nome: 'Supervisor ABA' },
            { nome: 'Mediador de Conflitos' },
            { nome: 'Coordenador Executivo' },
            { nome: 'Professor UniIndigo' },
            { nome: 'Terapeuta Clínico' },
            { nome: 'Terapeuta Supervisor' },
            { nome: 'Gerente' },
        ],
        skipDuplicates: true,
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })