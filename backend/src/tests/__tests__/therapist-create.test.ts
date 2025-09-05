import { describe, test, expect, beforeEach, afterAll  } from 'vitest'
import request from 'supertest'
import app from "../../server.js";
import { prisma } from '../../config/database.js'



describe('POST /api/terapeutas/cadastrar', () => {
    beforeEach(async () => {
        await prisma.terapeuta_endereco.deleteMany();
        await prisma.terapeuta_area_atuacao.deleteMany();
        await prisma.terapeuta_cargo.deleteMany();
        await prisma.documentos_terapeuta.deleteMany();
        await prisma.terapeuta.deleteMany();
        await prisma.endereco.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('deve criar um terapeuta com endereços área e cargo', async () => {
        const requestBody = {
            // Dados pessoais básicos
            nome: 'Kaio Muzzo',
            cpf: '50323487831',
            data_nascimento: '1985-05-15',
            telefone: '11985982268',
            celular: '11999887766',
            foto_perfil: 'https://exemplo.com/foto.jpg',
            email: 'kaio.rmdourado1@gmail.com',
            email_indigo: 'kaio@indigo.com',
            
            // Dados do veículo
            possui_veiculo: 'sim',
            placa_veiculo: 'ABC1234',
            modelo_veiculo: 'Honda Civic',
            
            // Dados bancários
            banco: 'Banco do Brasil',
            agencia: '1234',
            conta: '56789-0',
            chave_pix: 'joao@exemplo.com',
            
            // Dados da empresa (opcional)
            cnpj_empresa: '12345678000195',
            
            // Dados administrativos
            data_entrada: '2025-08-30',
            perfil_acesso: 'terapeuta',
            
            // Endereços
            enderecos: [
                {
                    cep: '04883110',
                    logradouro: 'Rua das Flores',
                    numero: '123',
                    bairro: 'Centro',
                    cidade: 'São Paulo',
                    uf: 'SP',
                    complemento: 'Apto 45',
                    tipo_endereco_id: 1,
                    principal: 1
                }
            ],
            
            // Áreas de atuação
            areas_atuacao: 7,
            
            // Cargos
            cargos: [
                {
                    cargo_id: 1,
                    numero_conselho: 'CRP 12345',
                    data_entrada: '2025-08-30'
                }
            ]
        };

        const response = await request(app)
            .post('/api/terapeutas/cadastrar')
            .send(requestBody)
            .expect(201);

            // console.log('STATUS', response.status);
            // console.log('BODY', response.body);
            // expect(response.status).toBe(201);

        expect(response.body.message).toBe('Terapeuta cadastrado com sucesso!');
    })
})