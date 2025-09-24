import { useMemo } from 'react';
import type { Patient } from '../types/consultas.types';
import type { Cliente } from '../../cadastros/types/cadastros.types';

/**
 * Hook que simula a busca de dados completos do cliente
 * Reutiliza os tipos/schemas de validação dos cadastros
 * 
 * @param patient - Dados básicos do paciente da listagem
 * @returns Dados completos do cliente seguindo o schema do cadastro
 */
export function useClienteData(patient: Patient | null): Partial<Cliente> | null {
    return useMemo(() => {
        if (!patient) return null;

        // Simular dados expandidos do cliente baseado no tipo Cliente dos cadastros
        // Em produção, isso viria de uma API que retorna dados completos
        const clienteData: Partial<Cliente> = {
            id: patient.id,
            nome: patient.nome,
            dataNascimento: patient.pessoa?.dataNascimento || '',
            // Mock para cuidadores (substitui os campos de pai/mãe)
            cuidadores: [
                {
                    relacao: 'mae',
                    nome: 'Maria Silva Santos',
                    cpf: '123.456.789-00',
                    telefone: '(11) 99999-8888',
                    email: 'mae@email.com',
                    profissao: 'Enfermeira',
                    escolaridade: 'Superior'
                },
                {
                    relacao: 'pai',
                    nome: 'João Santos Silva',
                    cpf: '987.654.321-00',
                    telefone: '(11) 99999-7777',
                    email: 'pai@email.com',
                    profissao: 'Engenheiro',
                    escolaridade: 'Superior'
                }
            ],
            emailContato: patient.email || 'cliente@email.com',
            dataEntrada: '2024-01-15', // Mock
            dataSaida: '', // Mock
            
            // Endereços - reutilizando estrutura do cadastro
            enderecos: patient.endereco ? [{
                cep: patient.endereco.cep || '01234-567',
                logradouro: patient.endereco.logradouro || 'Rua das Flores, 123',
                numero: patient.endereco.numero || '123',
                complemento: patient.endereco.complemento || 'Apto 45',
                bairro: patient.endereco.bairro || 'Centro',
                cidade: patient.endereco.cidade || 'São Paulo',
                uf: patient.endereco.uf || 'SP',
            }] : [],
            maisDeUmEndereco: 'nao',
            
            // Dados pagamento - estrutura completa do cadastro
            dadosPagamento: {
                nomeTitular: patient.nome,
                numeroCarteirinha: '123456789012', // Mock
                telefone1: patient.telefone || '(11) 99999-1234',
                mostrarTelefone2: true, // Mock - demonstrar funcionalidade
                telefone2: '(11) 98888-5678', // Mock
                mostrarTelefone3: false,
                telefone3: '',
                email1: patient.email || 'cliente@email.com',
                mostrarEmail2: true, // Mock - demonstrar funcionalidade
                email2: 'cliente.secundario@email.com', // Mock
                mostrarEmail3: false,
                email3: '',
                sistemaPagamento: 'particular' as const, // Mock - poderia ser qualquer um
                
                // Campos específicos para demonstração
                prazoReembolso: '', // Não usado para particular
                numeroProcesso: '', // Não usado para particular
                nomeAdvogado: '', // Não usado para particular
                telefoneAdvogado1: '',
                mostrarTelefoneAdvogado2: false,
                telefoneAdvogado2: '',
                mostrarTelefoneAdvogado3: false,
                telefoneAdvogado3: '',
                emailAdvogado1: '',
                mostrarEmailAdvogado2: false,
                emailAdvogado2: '',
                mostrarEmailAdvogado3: false,
                emailAdvogado3: '',
                houveNegociacao: 'sim', // Mock - demonstrar condicional
                valorSessao: 'R$ 150,00', // Mock
            },
            
            // Dados escola - estrutura completa do cadastro
            dadosEscola: {
                tipoEscola: 'particular' as const,
                nome: 'Colégio Exemplo de Ensino', // Mock
                telefone: '(11) 3333-4444', // Mock
                email: 'contato@colegioexemplo.edu.br', // Mock
                endereco: {
                    cep: '04567-890', // Mock
                    logradouro: 'Av. da Educação, 500', // Mock
                    numero: '500', // Mock
                    complemento: 'Bloco A', // Mock
                    bairro: 'Vila Escolar', // Mock
                    cidade: 'São Paulo', // Mock
                    uf: 'SP', // Mock
                },
            },
        };

        return clienteData;
    }, [patient]);
}

/**
 * Hook que simula dados de cliente com sistema de pagamento "liminar"
 * para demonstrar todos os campos condicionais
 */
export function useClienteDataLiminar(patient: Patient | null): Partial<Cliente> | null {
    const baseData = useClienteData(patient);
    
    return useMemo(() => {
        if (!baseData) return null;
        
        return {
            ...baseData,
            maisDeUmPai: 'sim', // Demonstrar seção condicional
            nomePai2: 'Carlos Roberto Silva', // Mock
            cpfPai2: '555.444.333-22', // Mock
            telefonePai2: '(11) 97777-6666', // Mock
            dadosPagamento: {
                ...baseData.dadosPagamento!,
                sistemaPagamento: 'liminar' as const,
                // Campos específicos para Liminar
                numeroProcesso: '1234567-89.2024.8.26.0001', // Mock
                nomeAdvogado: 'Dr. Eduardo Advocacia Silva', // Mock
                telefoneAdvogado1: '(11) 94444-5555',
                mostrarTelefoneAdvogado2: true,
                telefoneAdvogado2: '(11) 93333-2222',
                mostrarTelefoneAdvogado3: false,
                telefoneAdvogado3: '',
                emailAdvogado1: 'eduardo@advocaciasilva.com.br',
                mostrarEmailAdvogado2: true,
                emailAdvogado2: 'contato@advocaciasilva.com.br',
                mostrarEmailAdvogado3: false,
                emailAdvogado3: '',
                houveNegociacao: 'nao', // Não usado para liminar
                valorSessao: '', // Não usado para liminar
            },
        };
    }, [baseData]);
}
