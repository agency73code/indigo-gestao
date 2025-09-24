import { useMemo } from 'react';
import type { Therapist } from '../types/consultas.types';
import type { Terapeuta } from '../../cadastros/types/cadastros.types';

/**
 * Hook que simula a busca de dados completos do terapeuta
 * Reutiliza os tipos/schemas de validação dos cadastros
 * 
 * @param therapist - Dados básicos do terapeuta da listagem
 * @returns Dados completos do terapeuta seguindo o schema do cadastro
 */
export function useTerapeutaData(therapist: Therapist | null): Partial<Terapeuta> | null {
    return useMemo(() => {
        if (!therapist) return null;

        // Simular dados expandidos do terapeuta baseado no tipo Terapeuta dos cadastros
        // Em produção, isso viria de uma API que retorna dados completos
        const terapeutaData: Partial<Terapeuta> = {
            id: therapist.id,
            
            // Dados pessoais - Seção 1 (DadosPessoaisStep)
            nome: therapist.nome,
            email: therapist.email || 'terapeuta@indigo.com.br',
            emailIndigo: `${therapist.nome.toLowerCase().replace(' ', '.')}@indigo.com.br`, // Mock
            telefone: therapist.telefone || '(11) 99999-1234',
            celular: '(11) 98888-5678', // Mock
            cpf: therapist.pessoa?.cpf || '123.456.789-00',
            dataNascimento: therapist.pessoa?.dataNascimento || '1985-03-15',
            possuiVeiculo: 'sim', // Mock - demonstrar funcionalidade condicional
            placaVeiculo: 'ABC-1234', // Mock
            modeloVeiculo: 'Honda Civic', // Mock

            // Dados bancários - Seção 1 (DadosPessoaisStep)
            banco: 'Banco do Brasil', // Mock
            agencia: '1234', // Mock
            conta: '56789-0', // Mock
            chavePix: therapist.email || 'terapeuta@indigo.com.br', // Mock

            // Endereço pessoal - Seção 2 (EnderecoStep)
            endereco: {
                cep: therapist.endereco?.cep || '01234-567',
                rua: therapist.endereco?.logradouro || 'Rua das Flores, 123',
                numero: therapist.endereco?.numero || '123',
                complemento: therapist.endereco?.complemento || 'Apto 45',
                bairro: therapist.endereco?.bairro || 'Centro',
                cidade: therapist.endereco?.cidade || 'São Paulo',
                estado: therapist.endereco?.uf || 'SP',
            },

            // Dados profissionais - Seção 3 (DadosProfissionaisStep)
            dadosProfissionais: [
                {
                    areaAtuacao: 'Psicologia Clínica', // Mock
                    cargo: 'Psicólogo', // Mock
                    numeroConselho: therapist.registroConselho || 'CRP 12345-SP',
                }
            ],
            // numeroConvenio: '123456789', // Mock - property doesn't exist in Terapeuta type
            // dataEntrada: '2024-01-15', // Mock - property doesn't exist in Terapeuta type
            // dataSaida: '', // Mock - property doesn't exist in Terapeuta type
            // crp: therapist.registroConselho || 'CRP 12345-SP', // Mock - property doesn't exist
            // especialidades: therapist.profissional?.especialidades || ['Terapia Cognitivo-Comportamental'], // Mock - property doesn't exist
            dataInicio: '2024-01-15', // Mock
            dataFim: '', // Mock
            // valorConsulta: therapist.profissional?.valorConsulta?.toString() || '150.00', // Mock - property doesn't exist
            // formasAtendimento: therapist.profissional?.formasAtendimento || ['Presencial', 'Online'], // Mock - property doesn't exist

            // Formação - Seção 4 (FormacaoStep)
            formacao: {
                graduacao: 'Graduação em Psicologia', // Mock
                instituicaoGraduacao: 'Universidade de São Paulo', // Mock
                anoFormatura: '2008', // Mock
                posGraduacoes: [{ // Mock - array de pós-graduações
                    tipo: 'stricto' as const,
                    curso: 'Mestrado em Psicologia Clínica',
                    instituicao: 'PUC-SP',
                    conclusao: '2011',
                    comprovanteUrl: null
                }],
                participacaoCongressosDescricao: 'Participação em diversos congressos de psicologia', // Mock
                publicacoesLivrosDescricao: 'Autor do livro "Terapia Cognitivo-Comportamental"' // Mock
            },

            // Arquivos - Seção 5 (ArquivosStep)
            arquivos: {
                fotoPerfil: therapist.avatarUrl || 'https://exemplo.com/foto.jpg', // Mock
                diplomaGraduacao: 'diploma_graduacao.pdf', // Mock
                diplomaPosGraduacao: 'diploma_pos_graduacao.pdf', // Mock
                registroCRP: 'registro_crp.pdf', // Mock
                comprovanteEndereco: 'comprovante_endereco.pdf', // Mock
            },

            // Dados CNPJ (opcional) - demonstrar seção condicional
            cnpj: {
                numero: therapist.cnpj || '12.345.678/0001-90', // Mock
                razaoSocial: 'Clínica de Psicologia LTDA', // Mock
                nomeFantasia: 'Clínica Bem Estar', // Mock
                endereco: {
                    cep: '01234-567', // Mock
                    rua: 'Av. Empresarial, 500', // Mock
                    numero: '500', // Mock
                    complemento: 'Sala 101', // Mock
                    bairro: 'Centro Empresarial', // Mock
                    cidade: 'São Paulo', // Mock
                    estado: 'SP', // Mock
                },
            },
        };

        return terapeutaData;
    }, [therapist]);
}

/**
 * Hook que simula dados de terapeuta sem CNPJ e sem veículo
 * para demonstrar campos condicionais
 */
export function useTerapeutaDataMinimo(therapist: Therapist | null): Partial<Terapeuta> | null {
    const baseData = useTerapeutaData(therapist);
    
    return useMemo(() => {
        if (!baseData) return null;
        
        return {
            ...baseData,
            possuiVeiculo: 'nao', // Demonstrar seção condicional
            placaVeiculo: '', // Não exibido quando possuiVeiculo = 'nao'
            modeloVeiculo: '', // Não exibido quando possuiVeiculo = 'nao'
            formacao: {
                ...baseData.formacao!,
                posGraduacao: '', // Demonstrar sem pós-graduação
                instituicaoPosGraduacao: '',
                anoPosGraduacao: '',
            },
            cnpj: undefined, // Demonstrar sem CNPJ
        };
    }, [baseData]);
}
