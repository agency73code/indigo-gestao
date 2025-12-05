import { faker } from '@faker-js/faker/locale/pt_BR';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ACCESS_LEVELS: Record<string, number> = {
    'acompanhante terapeutico': 1,
    'terapeuta clinico': 2,
    'mediador de conflitos': 2,
    'professor uniindigo': 2,
    'coordenador aba': 3,
    'terapeuta supervisor': 4,
    'supervisor aba': 4,
    gerente: 5,
    'coordenador executivo': 6,
};

interface VinculoInput {
    terapeuta_id: string;
    cliente_id: string;
    data_inicio: Date;
    papel: 'responsible' | 'co';
    status: 'active' | 'inactive';
}

async function seedLinks(batchIndex: number, quantidade: number) {
    const terapeutas = await prisma.terapeuta.findMany({
        select: { id: true, perfil_acesso: true },
    });
    const clientes = await prisma.cliente.findMany({
        select: { id: true },
    });

    if (!terapeutas.length || !clientes.length) {
        console.log('⚠️ Nenhum terapeuta ou cliente encontrado no banco.');
        return;
    }

    const combinacoes = new Set<string>();
    const vinculos: VinculoInput[] = [];

    while (vinculos.length < quantidade) {
        const terapeuta = faker.helpers.arrayElement(terapeutas);
        const cliente = faker.helpers.arrayElement(clientes);

        const key = `${terapeuta.id}|${cliente.id}`;
        if (combinacoes.has(key)) continue; // evita duplicar vínculos

        combinacoes.add(key);

        const nivel = ACCESS_LEVELS[terapeuta.perfil_acesso] ?? 1;
        const papel = nivel >= 4 ? 'responsible' : 'co';

        vinculos.push({
            terapeuta_id: terapeuta.id,
            cliente_id: cliente.id,
            data_inicio: faker.date.past({ years: 2 }),
            papel,
            status: 'active',
        });
    }

    await prisma.terapeuta_cliente.createMany({
        data: vinculos,
        skipDuplicates: true,
    });

    console.log(`✅ Batch ${batchIndex + 1}: ${vinculos.length} vínculos criados.`);
}

async function main() {
    const total = 100;
    const concurrency = 10;
    const batchSize = Math.ceil(total / concurrency);

    const batches = Array.from({ length: concurrency }).map((_, i) => seedLinks(i, batchSize));

    await Promise.all(batches);

    console.log(`🚀 Seed finalizado com ${total} vínculos únicos.`);
}

main()
    .then(async () => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
