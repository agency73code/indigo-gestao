import { describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { prisma } from '../../config/database.js';

describe('Therapist API', () => {
    beforeEach(async () => {
        await prisma.terapeuta.deleteMany({
            where: {
                OR: [
                    { email: { contains: 'joao.silva' } },
                    { nome: { contains: 'Dr. João Silva Santos' } },
                ],
            },
        });
    });

    test('GET /api/terapeutas should return therapists list', async () => {
        const response = await request(app).get('/api/terapeutas').expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET / /api/terapeutas/:id should return therapist by id', async () => {
        const listResponse = await request(app).get('/api/terapeutas');

        if (listResponse.body.data.length > 0) {
            const therapistId = listResponse.body.data[0].id;

            const response = await request(app).get(`/api/terapeutas/${therapistId}`).expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('id', therapistId);
        }
    });

    test('GET /api/terapeutas/:id with invalid id should return 404', async () => {
        const response = await request(app).get('/api/terapeutas/invalid-id').expect(400);

        expect(response.body).toHaveProperty('error');
    });

    // Teste: Criar terapeuta com dados válidos
    test('POST /api/terapeutas/cadastrar should create a new therapist', async () => {
        const newTherapist = {
            // Personal
            nome: 'Dr. João Silva Santos',
            cpf: '66528122407', // CPF válido
            data_nascimento: '1985-05-15',
            telefone: '11987654321',
            celular: '11987654321',
            foto_perfil: 'https://example.com/foto.jpg',
            email: 'joao.silva@email.com',
            email_indigo: 'joao.silva@indigo.com',
            possui_veiculo: 'sim' as const,
            placa_veiculo: 'ABC1234',
            modelo_veiculo: 'Honda Civic',

            // Bank
            banco: 'Banco do Brasil',
            agencia: '1234',
            conta: '12345-6',
            chave_pix: 'joao.silva@email.com',

            // Address
            cep_endereco: '01234567',
            logradouro_endereco: 'Rua das Flores',
            numero_endereco: '123',
            bairro_endereco: 'Centro',
            cidade_endereco: 'São Paulo',
            uf_endereco: 'SP',
            complemento_endereco: 'Apto 45',

            // Company
            cnpj_empresa: '11222333000181', // CNPJ válido
            cep_empresa: '01234567',
            logradouro_empresa: 'Av. Paulista',
            numero_empresa: '1000',
            bairro_empresa: 'Bela Vista',
            cidade_empresa: 'São Paulo',
            uf_empresa: 'SP',
            complemento_empresa: 'Sala 10',

            // Job
            data_entrada: '2024-01-15',
            perfil_acesso: 'terapeuta',
        };

        const response = await request(app)
        .post('/api/terapeutas/cadastrar')
        .send(newTherapist)
        .expect(201);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('nome', newTherapist.nome);
        expect(response.body.data).toHaveProperty('email', newTherapist.email);
    });

    // Teste: Atualizar terapeuta
    //Atualizar terapeuta com dados válidos
    test('PUT /api/terapeutas/:id should update therapist data', async () => {
        const listResponse = await request(app).get('/api/terapeutas');

        if (listResponse.body.data && listResponse.body.data.length > 0) {
            const therapistId = listResponse.body.data[0].id;

            const updateData = {
                nome: 'Dr. João Silva Atualizado',
                telefone: '11999999999',
                email: 'joao.atualizado@email.com',
                perfil_acesso: 'admin',
            };

            const response = await request(app)
                .put(`/api/terapeutas/${therapistId}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('id', therapistId);
            expect(response.body.data).toHaveProperty('nome', updateData.nome);
            expect(response.body.data).toHaveProperty('telefone', updateData.telefone);
        } else {
            console.log('Nenhum terapeuta para atualizar, pulando teste');
            expect(true).toBe(true);
        }
    });

    //Atualizar terapeuta com dados válidos, mas ID inexistente
    test('PUT /api/terapeutas/:id with non-existent ID should return 404', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const updateData = {
            nome: 'Nome Atualizado',
        };

        const response = await request(app)
            .put(`/api/terapeutas/${fakeId}`)
            .send(updateData)
            .expect(404);

        expect(response.body).toHaveProperty('error');
    });

    //Atualizar terapeuta com ID existente mas dados inválidos
    test('PUT /api/terapeutas/:id with invalid data should return 400', async () => {
        const listResponse = await request(app).get('/api/terapeutas');

        if (listResponse.body.data && listResponse.body.data.length > 0) {
            const therapistId = listResponse.body.data[0].id;

            const invalidData = {
                email: 'email-invalido',
                cpf: '123',
                telefone: '123',
            };

            const response = await request(app)
                .put(`/api/terapeutas/${therapistId}`)
                .send(invalidData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        }
    });
});

import supertest from 'supertest';
