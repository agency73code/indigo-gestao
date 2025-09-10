import type { Request, Response, NextFunction } from 'express';
import { normalizer } from '../features/therapist/therapist.normalizer.js';
import { createTherapistBase } from '../features/therapist/therapist.mapper.js';
import { prisma } from '../config/database.js';
import { sendWelcomeEmail } from '../utils/mail.util.js';

export async function getTherapistById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "ID inválido" });

        const therapist = await prisma.terapeuta.findUnique({
            where: { id },
            select: {
                id: true,
                nome: true,
                email: true,
                email_indigo: true,
                telefone: true,
                celular: true,
                cpf: true,
                data_nascimento: true,
                possui_veiculo: true,
                placa_veiculo: true,
                modelo_veiculo: true,
                banco: true,
                agencia: true,
                conta: true,
                chave_pix: true,
                cnpj_empresa: true,
                razao_social: true,
                graduacao: true,
                grad_instituicao: true,
                ano_formatura: true,
                pos_graduacao: true,
                pos_grad_instituicao: true,
                ano_pos_graduacao: true,
                cursos: true,
                data_entrada: true,
                data_saida: true,
                atividade: true,
                foto_perfil: true,
                documentos_terapeuta: {
                    select: {
                        tipo_documento: true,
                        caminho_arquivo: true,
                    },
                },
                terapeuta_area_atuacao: {
                    select: {
                        area_atuacao: {
                            select: { nome: true },
                        },
                    },
                },
                terapeuta_cargo: {
                    select: {
                        cargo: { select: { nome: true } },
                        numero_conselho: true,
                        data_entrada: true,
                        data_saida: true,
                    },
                },
                terapeuta_endereco: {
                    select: {
                        principal: true,
                        tipo_endereco: { select: { tipo: true } },
                        endereco: {
                            select: {
                                cep: true,
                                logradouro: true,
                                numero: true,
                                complemento: true,
                                bairro: true,
                                cidade: true,
                                uf: true,
                            },
                        },
                    },
                },
            },
        });

        if (!therapist) {
            return res.status(404).json({ success: false, message: 'Terapeuta não encontrado' });
        }

        const docMap = therapist.documentos_terapeuta.reduce(
            (acc: Record<string, string>, doc) => {
                acc[doc.tipo_documento] = doc.caminho_arquivo;
                return acc;
            },
            {},
        );

        const personalAddress = therapist.terapeuta_endereco.find(
            (e) => e.principal === 1 || e.tipo_endereco.tipo === 'residencial',
        );

        const companyAddress = therapist.terapeuta_endereco.find(
            (e) => e.tipo_endereco.tipo === 'empresarial',
        );

        const formatted = {
            id: therapist.id,
            nome: therapist.nome,
            email: therapist.email,
            emailIndigo: therapist.email_indigo,
            telefone: therapist.telefone ?? '',
            celular: therapist.celular,
            cpf: therapist.cpf,
            dataNascimento: therapist.data_nascimento.toISOString(),
            possuiVeiculo: therapist.possui_veiculo,
            placaVeiculo: therapist.placa_veiculo ?? undefined,
            modeloVeiculo: therapist.modelo_veiculo ?? undefined,
            banco: therapist.banco,
            agencia: therapist.agencia,
            conta: therapist.conta,
            chavePix: therapist.chave_pix ?? '',
            endereco: personalAddress
                ? {
                    cep: personalAddress.endereco.cep,
                    rua: personalAddress.endereco.logradouro,
                    numero: personalAddress.endereco.numero,
                    complemento: personalAddress.endereco.complemento ?? undefined,
                    bairro: personalAddress.endereco.bairro,
                    cidade: personalAddress.endereco.cidade,
                    estado: personalAddress.endereco.uf,
                }
                : undefined,
            dadosProfissionais: therapist.terapeuta_cargo.map((c) => ({
                areaAtuacao: therapist.terapeuta_area_atuacao[0]?.area_atuacao.nome ?? '',
                cargo: c.cargo.nome,
                numeroConselho: c.numero_conselho ?? undefined,
            })),
            numeroConvenio: undefined,
            dataEntrada: therapist.data_entrada.toISOString(),
            dataSaida: therapist.data_saida?.toISOString(),
            crp: therapist.terapeuta_cargo[0]?.numero_conselho ?? '',
            especialidades: therapist.terapeuta_area_atuacao.map(
                (a) => a.area_atuacao.nome,
            ),
            dataInicio:
                therapist.terapeuta_cargo[0]?.data_entrada?.toISOString() ?? '',
            dataFim: therapist.terapeuta_cargo[0]?.data_saida?.toISOString(),
            valorConsulta: '',
            formasAtendimento: [],
            formacao: {
                graduacao: therapist.graduacao ?? '',
                instituicaoGraduacao: therapist.grad_instituicao ?? '',
                anoFormatura: therapist.ano_formatura ?? '',
                posGraduacao: therapist.pos_graduacao ?? undefined,
                instituicaoPosGraduacao:
                    therapist.pos_grad_instituicao ?? undefined,
                anoPosGraduacao: therapist.ano_pos_graduacao ?? undefined,
                cursos: therapist.cursos ?? undefined,
            },
            arquivos: {
                fotoPerfil: therapist.foto_perfil ?? undefined,
                diplomaGraduacao: docMap['diploma_graduacao'] ?? undefined,
                diplomaPosGraduacao: docMap['diploma_pos_graduacao'] ?? undefined,
                registroCRP: docMap['registro_crp'] ?? undefined,
                comprovanteEndereco:
                    docMap['comprovante_endereco'] ?? undefined,
            },
            cnpj: therapist.cnpj_empresa
                ? {
                      numero: therapist.cnpj_empresa,
                      razaoSocial: therapist.razao_social ?? '',
                      nomeFantasia: therapist.razao_social ?? '',
                      endereco: companyAddress
                          ? {
                                cep: companyAddress.endereco.cep,
                                rua: companyAddress.endereco.logradouro,
                                numero: companyAddress.endereco.numero,
                                complemento:
                                    companyAddress.endereco.complemento ??
                                    undefined,
                                bairro: companyAddress.endereco.bairro,
                                cidade: companyAddress.endereco.cidade,
                                estado: companyAddress.endereco.uf,
                            }
                          : undefined,
                  }
                : undefined,
        };

        res.json({ success: true, data: formatted });
    } catch (error) {
        next(error);
    }
}

export async function listTherapists(req: Request, res: Response, next: NextFunction) {
    try {
        const therapist = await prisma.terapeuta.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                celular: true,
                foto_perfil: true,
                atividade: true,
                cnpj_empresa: true,
                terapeuta_area_atuacao: {
                    select: {
                        area_atuacao: {
                            select: { nome: true },
                        },
                    },
                },
                terapeuta_cargo: {
                    select: {
                        cargo: { select: { nome: true } },
                        numero_conselho: true,
                    },
                },
            },
        });

        const formatted = therapist.map((t) => ({
            id: t.id,
            nome: t.nome,
            email: t.email ?? undefined,
            telefone: t.telefone ?? t.celular ?? undefined,
            status: t.atividade === 'ativo' ? 'ATIVO' : 'INATIVO',
            especialidade: t.terapeuta_area_atuacao[0]?.area_atuacao.nome,
            conselho: t.terapeuta_cargo[0]?.numero_conselho ?? undefined,
            avatarUrl: t.foto_perfil ?? undefined,
            cnpj: t.cnpj_empresa ?? undefined,
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        next(error);
    }
}

export async function createTherapist(req: Request, res: Response, next: NextFunction) {
    try {
        const normalized = await normalizer(req.body);
        const therapist = await createTherapistBase(prisma, normalized);
        
        await sendWelcomeEmail({
            to: therapist.email,
            name: therapist.nome,
            token: therapist.token_redefinicao!,
        }).catch((error) => {
            console.error('Erro ao enviar email de boas-vindas:', error);
        });

        res.status(201).json({
            success: true,
            message: 'Terapeuta cadastrado com sucesso!'
        });
    } catch (error) {
        next(error);
    }
}
