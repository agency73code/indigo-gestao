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
            status: c.status === 'ativo' ? 'ATIVO' : 'INATIVO',
            avatarUrl: fotoPerfil?.arquivo_id
                ? `/api/arquivos/${encodeURIComponent(fotoPerfil.arquivo_id)}/view`
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

function sanitizeEnderecoKey(value: string | null | undefined) {
  return value ?? '';
}

export function mapEnderecoToUniqueKey(endereco: {
  cep: string | null | undefined;
  logradouro: string | null | undefined;
  numero: string | null | undefined;
  bairro: string | null | undefined;
  cidade: string | null | undefined;
  uf: string | null | undefined;
  complemento: string | null | undefined;
}) {
  return {
    cep: sanitizeEnderecoKey(endereco.cep),
    rua: sanitizeEnderecoKey(endereco.logradouro),
    numero: sanitizeEnderecoKey(endereco.numero),
    bairro: sanitizeEnderecoKey(endereco.bairro),
    cidade: sanitizeEnderecoKey(endereco.cidade),
    uf: sanitizeEnderecoKey(endereco.uf),
    complemento: sanitizeEnderecoKey(endereco.complemento),
  };
}