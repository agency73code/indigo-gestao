import { describe, test, expect, afterAll } from 'vitest';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import app from '../../server.js';
import { prisma } from '../../config/database.js';

// Variáveis para auxiliar na limpeza dos dados criados
let clienteId: string;
let responsavelCpf: string;
let enderecoClienteId: number;
let escolaId: number;
let enderecoEscolaId: number;
let pagamentoId: number;

// afterAll(async () => {
//   if (pagamentoId) {
//     await prisma.pagamentos.deleteMany({ where: { id: pagamentoId } });
//   }
//   if (clienteId) {
//     await prisma.cliente_responsavel.deleteMany({ where: { cliente_id: clienteId } });
//     await prisma.cliente_escola.deleteMany({ where: { cliente_id: clienteId } });
//     await prisma.cliente_endereco.deleteMany({ where: { cliente_id: clienteId } });
//     await prisma.pagamentos.deleteMany({ where: { cliente_id: clienteId } });
//     await prisma.cliente.deleteMany({ where: { id: clienteId } });
//   }
//   if (responsavelCpf) {
//     await prisma.responsaveis.deleteMany({ where: { cpf: responsavelCpf } });
//   }
//   if (escolaId) {
//     await prisma.escola_endereco.deleteMany({ where: { escola_id: escolaId } });
//     await prisma.escola.deleteMany({ where: { id: escolaId } });
//   }
//   if (enderecoClienteId) {
//     await prisma.endereco.deleteMany({ where: { id: enderecoClienteId } });
//   }
//   if (enderecoEscolaId) {
//     await prisma.endereco.deleteMany({ where: { id: enderecoEscolaId } });
//   }
//   await prisma.$disconnect();
// });

describe('POST /api/clientes', () => {
  test('deve criar um cliente com endereços, escolas, responsáveis e pagamentos', async () => {
    const emailCliente = `cliente.${uuidv4()}@example.com`;
    const emailEscola = `escola.${uuidv4()}@example.com`;
    responsavelCpf = `${Math.floor(Math.random() * 9_000_000_0000 + 1_000_000_0000)}`;

    const payload = {
      nome: 'Cliente Teste',
      data_nascimento: '2015-01-01',
      email_contato: emailCliente,
      data_entrada: '2024-01-01',
      perfil_acesso: 'cliente',
      enderecos: [
        {
          cep: '01234567',
          logradouro: 'Rua das Acácias',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          uf: 'SP',
          complemento: 'Apto 1',
          tipo_endereco_id: 1,
          principal: 1,
        },
      ],
      escolas: [
        {
          tipo_escola: 'particular',
          nome: 'Escola Teste',
          telefone: '11999999999',
          email: emailEscola,
          enderecos: [
            {
              cep: '76543210',
              logradouro: 'Av Escola',
              numero: '100',
              bairro: 'Bairro Escola',
              cidade: 'São Paulo',
              uf: 'SP',
              tipo_endereco_id: 2,
              principal: 1,
            },
          ],
        },
      ],
      responsaveis: [
        {
          nome: 'Responsável Teste',
          cpf: responsavelCpf,
          telefone: '11988888888',
          email: `resp.${uuidv4()}@example.com`,
          parentesco: 'mae',
        },
      ],
      pagamentos: [
        {
          nome: 'Plano Teste',
          numero_carteirinha: 'ABC123',
          tipo_sistema: 'particular',
          valor_sessao: 100.0,
        },
      ],
    };

    const response = await request(app)
      .post('/api/clientes')
      .send(payload)
      .expect(201);

    expect(response.status).toBe(201);

    const cliente = await prisma.cliente.findUnique({
      where: { email_contato: emailCliente },
      include: {
        cliente_endereco: true,
        cliente_escola: true,
        cliente_responsavel: true,
        pagamentos: true,
      },
    });

    expect(cliente).not.toBeNull();
    clienteId = cliente!.id;

    // verifica endereços
    expect(cliente!.cliente_endereco.length).toBeGreaterThan(0);
    enderecoClienteId = cliente!.cliente_endereco[0]!.endereco_id;

    // verifica escolas
    expect(cliente!.cliente_escola.length).toBeGreaterThan(0);
    escolaId = cliente!.cliente_escola[0]!.escola_id;
    const escola = await prisma.escola.findUnique({
      where: { id: escolaId },
      include: { escola_endereco: true },
    });
    expect(escola).not.toBeNull();
    enderecoEscolaId = escola!.escola_endereco[0]!.endereco_id;

    // verifica responsáveis
    expect(cliente!.cliente_responsavel.length).toBeGreaterThan(0);

    // verifica pagamentos
    expect(cliente!.pagamentos.length).toBeGreaterThan(0);
    pagamentoId = cliente!.pagamentos[0]!.id;
  });
});