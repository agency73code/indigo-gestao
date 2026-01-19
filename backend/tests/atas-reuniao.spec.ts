import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { prisma } from '../src/config/database.js';
import { env } from '../src/config/env';
import jwt from 'jsonwebtoken';
import { ensureTestClientAndTherapist } from './helpers/ensureTestActors.js';
import {
    ata_finalidade_reuniao,
    ata_modalidade_reuniao,
    ata_participante_tipo,
    ata_status,
} from '@prisma/client';

vi.mock('../src/features/atas-reuniao/ata.service.js', async () => {
    const actual = await vi.importActual<
        typeof import('../src/features/atas-reuniao/ata.service.js')
    >('../src/features/atas-reuniao/ata.service.js');

    return {
        ...actual,
        gerarResumoCompleto: vi.fn().mockResolvedValue('Resumo completo gerado'),
        gerarResumoWhatsApp: vi.fn().mockResolvedValue('Resumo WhatsApp gerado'),
    };
});

import app from '../src/server';

const BASE_ENDPOINT = '/api/atas-reuniao';

const createdAtaIds: number[] = [];
let testTherapistId: string;
let testClientId: string;

function buildAuthToken(userId: string) {
    return jwt.sign({ sub: userId, perfil_acesso: 'terapeuta clinico' }, env.JWT_SECRET, {
        expiresIn: '1h',
    });
}

async function createOtherTherapist() {
    const otherId = '33333333-3333-4333-8333-333333333333';

    await prisma.terapeuta.upsert({
        where: { id: otherId },
        update: {},
        create: {
            id: otherId,
            nome: 'Outro Terapeuta',
            email: 'outro.terapeuta@test.saude',
            email_indigo: 'outro.terapeuta@indigo.saude',
            celular: '11988887777',
            cpf: '11111111111',
            data_nascimento: new Date('1991-02-02'),
            data_entrada: new Date('2024-02-02'),
            perfil_acesso: 'TERAPEUTA',
            atividade: true,
        },
    });

    return otherId;
}

async function createAtaRecord(therapistId: string) {
    const ata = await prisma.ata_reuniao.create({
        data: {
            terapeuta_id: therapistId,
            cliente_id: testClientId,
            data: new Date('2026-01-04'),
            horario_inicio: '09:00',
            horario_fim: '10:00',
            finalidade: ata_finalidade_reuniao.orientacao_parental,
            modalidade: ata_modalidade_reuniao.online,
            conteudo: 'Ata criada para testes automatizados.',
            status: ata_status.rascunho,
            cabecalho_terapeuta_id: therapistId,
            cabecalho_terapeuta_nome: 'Terapeuta Teste',
            cabecalho_conselho_numero: null,
            cabecalho_area_atuacao: null,
            cabecalho_cargo: null,
        },
    });

    createdAtaIds.push(ata.id);
    return ata;
}

const baseCreatePayload = (therapistId: string, clientId: string) => ({
    terapeuta_id: therapistId,
    cliente_id: clientId,
    data: '2026-01-04',
    horario_inicio: '08:00',
    horario_fim: '09:00',
    finalidade: ata_finalidade_reuniao.orientacao_parental,
    modalidade: ata_modalidade_reuniao.online,
    conteudo: 'Conteúdo de teste para criação de ata.',
    status: ata_status.rascunho,
    participantes: [
        {
            tipo: ata_participante_tipo.familia,
            nome: 'Responsável',
            descricao: 'Pai do paciente',
        },
    ],
    links: [
        {
            titulo: 'Link de teste',
            url: 'https://example.com',
        },
    ],
});

const baseResumoPayload = {
    conteudo: 'Conteúdo suficiente para gerar resumo da ata.',
    finalidade: ata_finalidade_reuniao.orientacao_parental,
    data: '2026-01-04',
    participantes: ['Responsável'],
    terapeuta: 'Terapeuta Teste',
    profissao: 'Terapeuta',
    cliente: 'Cliente Teste',
    horarioInicio: '08:00',
    horarioFim: '09:00',
    duracao: '60 min',
    conselho: 'CRP 123',
    links: [{ titulo: 'Manual', url: 'https://example.com' }],
};

beforeAll(async () => {
    const { cliente, terapeuta } = await ensureTestClientAndTherapist();
    testClientId = cliente.id;
    testTherapistId = terapeuta.id;
});

afterEach(async () => {
    if (createdAtaIds.length > 0) {
        await prisma.ata_reuniao.deleteMany({
            where: { id: { in: createdAtaIds } },
        });
        createdAtaIds.length = 0;
    }
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe(`POST ${BASE_ENDPOINT}/ai/summary`, () => {
    it('deve gerar resumo completo quando payload é válido', async () => {
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .post(`${BASE_ENDPOINT}/ai/summary`)
            .set('Authorization', `Bearer ${token}`)
            .send(baseResumoPayload);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ summary: 'Resumo completo gerado' });
    });

    it('deve falhar quando payload é inválido', async () => {
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .post(`${BASE_ENDPOINT}/ai/summary`)
            .set('Authorization', `Bearer ${token}`)
            .send({ ...baseResumoPayload, conteudo: 'curto' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                code: 'VALIDATION_ERROR',
            }),
        );
    });
});

describe(`POST ${BASE_ENDPOINT}/ai/whatsapp-summary`, () => {
    it('deve gerar resumo para WhatsApp quando payload é válido', async () => {
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .post(`${BASE_ENDPOINT}/ai/whatsapp-summary`)
            .set('Authorization', `Bearer ${token}`)
            .send(baseResumoPayload);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ summary: 'Resumo WhatsApp gerado' });
    });

    it('deve falhar quando payload é inválido', async () => {
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .post(`${BASE_ENDPOINT}/ai/whatsapp-summary`)
            .set('Authorization', `Bearer ${token}`)
            .send({ ...baseResumoPayload, conteudo: '' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                code: 'VALIDATION_ERROR',
            }),
        );
    });
});

describe(`GET ${BASE_ENDPOINT}/terapeutas`, () => {
    it('deve listar terapeutas ativos', async () => {
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .get(`${BASE_ENDPOINT}/terapeutas`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: testTherapistId }),
            ]),
        );
    });

    it('deve falhar quando não há autenticação', async () => {
        const res = await request(app).get(`${BASE_ENDPOINT}/terapeutas`);

        expect(res.status).toBe(401);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                message: 'Missing authentication token',
            }),
        );
    });
});

describe(`GET ${BASE_ENDPOINT}/terapeuta/:userId`, () => {
    it('deve retornar dados do terapeuta', async () => {
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .get(`${BASE_ENDPOINT}/terapeuta/${testTherapistId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                id: testTherapistId,
                nome: 'Terapeuta Teste',
            }),
        );
    });

    it('deve falhar quando não há autenticação', async () => {
        const res = await request(app).get(`${BASE_ENDPOINT}/terapeuta/${testTherapistId}`);

        expect(res.status).toBe(401);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                message: 'Missing authentication token',
            }),
        );
    });
});

describe(`GET ${BASE_ENDPOINT}`, () => {
    it('deve listar atas com sucesso', async () => {
        const token = buildAuthToken(testTherapistId);
        const ata = await createAtaRecord(testTherapistId);

        const res = await request(app)
            .get(BASE_ENDPOINT)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                total: expect.any(Number),
                items: expect.arrayContaining([
                    expect.objectContaining({ id: ata.id }),
                ]),
            }),
        );
    });

    it('deve falhar com filtro inválido', async () => {
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .get(`${BASE_ENDPOINT}?data_inicio=invalid-date`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(422);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                code: 'VALIDATION_ERROR',
            }),
        );
    });
});

describe(`GET ${BASE_ENDPOINT}/:id`, () => {
    it('deve retornar ata pelo id', async () => {
        const token = buildAuthToken(testTherapistId);
        const ata = await createAtaRecord(testTherapistId);

        const res = await request(app)
            .get(`${BASE_ENDPOINT}/${ata.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: true,
                data: expect.objectContaining({ id: ata.id }),
            }),
        );
    });

    it('deve falhar com id inválido', async () => {
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .get(`${BASE_ENDPOINT}/abc`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(422);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                code: 'VALIDATION_ERROR',
            }),
        );
    });
});

describe(`POST ${BASE_ENDPOINT}`, () => {
    it('deve criar uma ata com payload completo', async () => {
        const token = buildAuthToken(testTherapistId);
        const payload = baseCreatePayload(testTherapistId, testClientId);

        const res = await request(app)
            .post(BASE_ENDPOINT)
            .set('Authorization', `Bearer ${token}`)
            .field('payload', JSON.stringify(payload));

        expect(res.status).toBe(201);
        expect(res.body).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                terapeuta_id: testTherapistId,
                cliente_id: testClientId,
            }),
        );

        createdAtaIds.push(res.body.id);
    });

    it('deve falhar quando payload não é enviado', async () => {
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .post(BASE_ENDPOINT)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                message: 'Campo payload é obrigatório',
            }),
        );
    });
});

describe(`PATCH ${BASE_ENDPOINT}/:id`, () => {
    it('deve atualizar uma ata existente', async () => {
        const token = buildAuthToken(testTherapistId);
        const ata = await createAtaRecord(testTherapistId);

        const res = await request(app)
            .patch(`${BASE_ENDPOINT}/${ata.id}`)
            .set('Authorization', `Bearer ${token}`)
            .field('payload', JSON.stringify({ conteudo: 'Conteúdo atualizado.' }));

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                id: ata.id,
                conteudo: 'Conteúdo atualizado.',
            }),
        );
    });

    it('deve falhar quando payload não é enviado', async () => {
        const token = buildAuthToken(testTherapistId);
        const ata = await createAtaRecord(testTherapistId);

        const res = await request(app)
            .patch(`${BASE_ENDPOINT}/${ata.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                message: 'Campo payload é obrigatório',
            }),
        );
    });
});

describe(`DELETE ${BASE_ENDPOINT}/:id`, () => {
    it('deve apagar uma ata do terapeuta autenticado', async () => {
        const token = buildAuthToken(testTherapistId);
        const ata = await createAtaRecord(testTherapistId);

        const res = await request(app)
            .delete(`${BASE_ENDPOINT}/${ata.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
    });

    it('deve falhar quando o terapeuta não tem permissão', async () => {
        const otherTherapistId = await createOtherTherapist();
        const ata = await createAtaRecord(otherTherapistId);
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .delete(`${BASE_ENDPOINT}/${ata.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                message: 'Você não tem permissão para apagar esta ata',
            }),
        );
    });
});

describe(`POST ${BASE_ENDPOINT}/:id/finalizar`, () => {
    it('deve finalizar uma ata existente', async () => {
        const token = buildAuthToken(testTherapistId);
        const ata = await createAtaRecord(testTherapistId);

        const res = await request(app)
            .post(`${BASE_ENDPOINT}/${ata.id}/finalizar`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    id: ata.id,
                    status: ata_status.finalizada,
                }),
            }),
        );
    });

    it('deve falhar com id inválido', async () => {
        const token = buildAuthToken(testTherapistId);

        const res = await request(app)
            .post(`${BASE_ENDPOINT}/abc/finalizar`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(422);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                code: 'VALIDATION_ERROR',
            }),
        );
    });
});
