import type { Prisma } from "@prisma/client";
import type { PrismaTransactionClient } from "../../../types/prisma.types.js";
import type { AddressData, AddressPayload, CaretakerPayload, ClientAddressPayload, ClientUpdatePayload, PaymentDataPayload, SchoolDataPayload } from "../client.types.js";
import { AppError } from "../../../errors/AppError.js";

function buildAddressData(address: AddressPayload): AddressData {
    return {
        cep: address.cep,
        rua: address.logradouro,
        numero: address.numero,
        bairro: address.bairro,
        cidade: address.cidade,
        uf: address.uf,
        complemento: address.complemento ?? '',
    }
}

export async function updateClientData(
    tx: PrismaTransactionClient,
    clientId: string,
    payload: ClientUpdatePayload,
    addressClientId: number,
    address: ClientAddressPayload
): Promise<void> {
    await tx.cliente.update({
        where: { id: clientId },
        data: {
            nome: payload.nome,
            emailContato: payload.emailContato,
            cpf: payload.cpf,
            dataNascimento: payload.dataNascimento,
            dataEntrada: payload.dataEntrada,
            dataSaida: payload.dataSaida,
            enderecos: {
                update: {
                    where: { id: addressClientId },
                    data: {
                        residenciaDe: address.residenciaDe,
                        outroResidencia: address.outroResidencia,
                        endereco: {
                            update: {
                                data: buildAddressData(address),
                            },
                        },
                    },
                },
            },
        },
    });
}

export async function updateCaretakers(
    tx: PrismaTransactionClient,
    clientId: string,
    cuidadores: CaretakerPayload[]
): Promise<void> {
    for (const c of cuidadores) {
        if (c.remove) {
            await deleteCaretaker(tx, clientId, c);
            continue;
        }

        if (!c.id) {
            await createCaretaker(tx, clientId, c);
        } else {
            await updateCaretaker(tx, c);
        }
    }
}

async function deleteCaretaker(
    tx: PrismaTransactionClient,
    clientId: string,
    caretaker: CaretakerPayload,
): Promise<void> {
    if (caretaker.id !== undefined) {
        await tx.cuidador.delete({ where: { id: caretaker.id } });
    } else {
        await tx.cuidador.delete({
            where: {
                unique_cuidador: {
                    clienteId: clientId,
                    cpf: caretaker.cpf
                }
            },
        });
    }
}

async function createCaretaker(
    tx: PrismaTransactionClient,
    clientId: string,
    caretaker: CaretakerPayload,
): Promise<void> {
    const data: Prisma.cuidadorCreateInput = {
        cliente: { connect: { id: clientId } },
        relacao: caretaker.relacao,
        descricaoRelacao: caretaker.descricaoRelacao,
        dataNascimento: caretaker.dataNascimento,
        nome: caretaker.nome,
        cpf: caretaker.cpf,
        profissao: caretaker.profissao,
        escolaridade: caretaker.escolaridade,
        telefone: caretaker.telefone,
        email: caretaker.email,
        endereco: {
            create: buildAddressData(caretaker.endereco),
        }
    };

    await tx.cuidador.create({ data });
}

async function updateCaretaker(
    tx: PrismaTransactionClient,
    caretaker: CaretakerPayload
): Promise<void> {
    if (!caretaker.id) {
        throw new AppError(
            'CARETAKER_ID_REQUIRED',
            'ID do cuidador é obrigatório para atualização.',
            400
        );
    }

    const AddressData = buildAddressData(caretaker.endereco);

    await tx.cuidador.update({
        where: { id: caretaker.id },
        data: {
            relacao: caretaker.relacao,
            descricaoRelacao: caretaker.descricaoRelacao,
            dataNascimento: caretaker.dataNascimento,
            nome: caretaker.nome,
            cpf: caretaker.cpf,
            profissao: caretaker.profissao,
            escolaridade: caretaker.escolaridade,
            telefone: caretaker.telefone,
            email: caretaker.email,
            endereco: {
                upsert: {
                    create: AddressData,
                    update: AddressData,
                },
            },
        },
    });
}

export async function updatePaymentData(
    tx: PrismaTransactionClient,
    clientId: string,
    dadosPagamento: PaymentDataPayload
): Promise<void> {
    await tx.dados_pagamento.update({
        where: { clienteId: clientId },
        data: {
            nomeTitular: dadosPagamento.nomeTitular,
            numeroCarteirinha: dadosPagamento.numeroCarteirinha,
            telefone1: dadosPagamento.telefone1,
            telefone2: dadosPagamento.telefone2,
            telefone3: dadosPagamento.telefone3,
            email1: dadosPagamento.email1,
            email2: dadosPagamento.email2,
            email3: dadosPagamento.email3,
            sistemaPagamento: dadosPagamento.sistemaPagamento,
            prazoReembolso: dadosPagamento.prazoReembolso,
            numeroProcesso: dadosPagamento.numeroProcesso,
            nomeAdvogado: dadosPagamento.nomeAdvogado,
            telefoneAdvogado1: dadosPagamento.telefoneAdvogado1,
            telefoneAdvogado2: dadosPagamento.telefoneAdvogado2,
            telefoneAdvogado3: dadosPagamento.telefoneAdvogado3,
            emailAdvogado1: dadosPagamento.emailAdvogado1,
            emailAdvogado2: dadosPagamento.emailAdvogado2,
            emailAdvogado3: dadosPagamento.emailAdvogado3,
            houveNegociacao: dadosPagamento.houveNegociacao,
            valorAcordado: dadosPagamento.valorAcordado,
        },
    });
}

export async function updateSchoolData(
    tx: PrismaTransactionClient,
    clientId: string,
    dadosEscola: SchoolDataPayload,
): Promise<void> {
    const addressData = buildAddressData(dadosEscola.endereco);

    await tx.dados_escola.update({
        where: { clienteId: clientId },
        data: {
            tipoEscola: dadosEscola.tipoEscola,
            nome: dadosEscola.nome,
            telefone: dadosEscola.telefone,
            email: dadosEscola.email,
            endereco: {
                upsert: {
                    create: addressData,
                    update: addressData,
                },
            },
            contatos: {
                deleteMany: {},
                createMany: {
                    data: dadosEscola.contatos.map((c) => ({
                        nome: c.nome,
                        telefone: c.telefone,
                        email: c.email,
                        funcao: c.funcao,
                    })),
                },
            },
        },
    });
}
