export interface CepData {
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
}

export async function fetchCep(cep: string): Promise<CepData> {
    const sanitizedCep = cep.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${sanitizedCep}/json/`);

    if (!response.ok) throw new Error('Erro ao consultar CEP');

    const data = await response.json();
    if (data.erro) throw new Error('CEP inválido');

    return {
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        uf: data.uf || '',
    };
}