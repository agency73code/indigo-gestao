/**
 * Lista de bancos brasileiros com código e nome
 * Fonte: Banco Central do Brasil (BACEN)
 */

export interface Bank {
    code: string;
    name: string;
}

export const BRAZILIAN_BANKS: Bank[] = [
    { code: '001', name: 'Banco do Brasil' },
    { code: '033', name: 'Santander' },
    { code: '104', name: 'Caixa Econômica Federal' },
    { code: '237', name: 'Bradesco' },
    { code: '341', name: 'Itaú Unibanco' },
    { code: '077', name: 'Banco Inter' },
    { code: '212', name: 'Banco Original' },
    { code: '260', name: 'Nu Pagamentos (Nubank)' },
    { code: '290', name: 'Pagseguro Internet (PagBank)' },
    { code: '323', name: 'Mercado Pago' },
    { code: '336', name: 'Banco C6' },
    { code: '380', name: 'PicPay' },
    { code: '389', name: 'Banco Mercantil do Brasil' },
    { code: '422', name: 'Banco Safra' },
    { code: '041', name: 'Banrisul' },
    { code: '070', name: 'BRB - Banco de Brasília' },
    { code: '136', name: 'Unicred' },
    { code: '197', name: 'Stone Pagamentos' },
    { code: '208', name: 'BTG Pactual' },
    { code: '213', name: 'Arbi' },
    { code: '218', name: 'BS2' },
    { code: '246', name: 'ABC Brasil' },
    { code: '318', name: 'BMG' },
    { code: '335', name: 'Banco Digio' },
    { code: '623', name: 'Banco Pan' },
    { code: '633', name: 'Banco Rendimento' },
    { code: '655', name: 'Neon Pagamentos' },
    { code: '707', name: 'Daycoval' },
    { code: '735', name: 'Neon Pagamentos (Votorantim)' },
    { code: '739', name: 'Banco Cetelem' },
    { code: '743', name: 'Banco Semear' },
    { code: '745', name: 'Citibank' },
    { code: '748', name: 'Sicredi' },
    { code: '756', name: 'Bancoob (Sicoob)' },
];

/**
 * Retorna o nome do banco a partir do código
 */
export function getBankNameByCode(code: string): string | null {
    const bank = BRAZILIAN_BANKS.find(b => b.code === code);
    return bank ? bank.name : null;
}

/**
 * Formata a exibição do banco para o Combobox
 * Exemplo: "Banco do Brasil (001)"
 */
export function formatBankLabel(bank: Bank): string {
    return `${bank.name} (${bank.code})`;
}
