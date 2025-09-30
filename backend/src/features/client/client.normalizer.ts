import * as ClientType from './client.types.js';

export async function normalizeList(db: ClientType.DBClientQueryPage[]) {
    return db.map((c) => {
        const fotoPerfil = c.arquivos.find((a) => a.tipo === 'fotoPerfil');
        const cuidador = c.cuidadores[0];
        const primeiroEndereco = c.enderecos?.[0]?.endereco;

        return {
            id: c.id,
            nome: c.nome ?? '',
            email: c.emailContato ?? '',
            telefone: cuidador?.telefone ?? '',
            responsavel: cuidador?.nome ?? '',
            status: c.status ?? '',
            avatarUrl: fotoPerfil?.arquivo_id 
                ? `/api/arquivos/view/${fotoPerfil.arquivo_id}` 
                : '',
            pessoa: {
                cpf: cuidador?.cpf ?? '',
                dataNascimento: c.dataNascimento 
                    ? c.dataNascimento.toISOString() 
                    : null,
                genero: '',
                observacoes: '',
            },
            endereco: primeiroEndereco
                ? {
                    cep: primeiroEndereco.cep ?? '',
                    logradouro: primeiroEndereco.rua ?? '',
                    numero: primeiroEndereco.numero ?? '',
                    complemento: primeiroEndereco.complemento,
                    bairro: primeiroEndereco.bairro ?? '',
                    cidade: primeiroEndereco.cidade ?? '',
                    uf: primeiroEndereco.uf ?? '',
                }
                : undefined,
            arquivos: c.arquivos.map((a) => ({
                nome: a.tipo,
                tipo: a.mime_type,
                tamanho: Number(a.tamanho ?? 0),
                data: a.data_upload ? a.data_upload.toISOString() : null,
            })),
        };
    });
}