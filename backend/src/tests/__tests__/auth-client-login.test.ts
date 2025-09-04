import { v4 as uuidv4 } from "uuid";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { prisma } from "../../config/database.js";
import { hashPassword } from "../../utils/hash.util.js";
import { loginUserByAccessInformation } from "../../features/auth/auth.repository.js";

const cpf = '50323487831';
const email = 'kaio.rmdourado@gmail.com'
const clientId = uuidv4();

beforeAll(async () => {
    await prisma.cliente.create({
        data: {
            id: clientId,
            nome: 'cliente Teste',
            data_nascimento: new Date('2000-01-01'),
            email_contato: email,
            data_entrada: new Date(),
            perfil_acesso: 'cliente',
            senha: await hashPassword('senhaSegura'),
            cliente_responsavel: {
                create: {
                    parentesco: 'responsavel_legal',
                    responsaveis: {
                        create: {
                            nome: 'Responsável Teste',
                            cpf,
                        },
                    },
                },
            } ,
        },
    });
});

afterAll(async () => {
    await prisma.cliente_responsavel.deleteMany({ where: { cliente_id: clientId } });
    await prisma.responsaveis.deleteMany({ where: { cpf } });
    await prisma.cliente.deleteMany({ where: { id: clientId } });
    await prisma.$disconnect();
});

describe('loginUserByAccessInformation - cliente', () => {
    test('retorna cliente pelo email de contato', async () => {
        const user = await loginUserByAccessInformation(email, 'cliente');
        expect(user).not.toBeNull();
        expect(user?.email).toBe(email);
    });

    test('retorna cliente pelo CPF do responsável', async () => {
        const user = await loginUserByAccessInformation(cpf, 'cliente');
        expect(user).not.toBeNull();
        expect(user?.email).toBe(email);
    });
});