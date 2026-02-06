export const onlyDigits = (v?: string | null) => (v ?? '').replace(/\D/g, "");

export function toTitleCaseSimple(name: string) {
  return name
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, ' '); // Normaliza espaços múltiplos para um único espaço
}

export function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 9);
  const e = d.slice(9, 11);
  let out = a;
  if (b) out += "." + b;
  if (c) out += "." + c;
  if (e) out += "-" + e;
  return out;
}

// ✅ esta é a que valida de verdade (use a sua, mas exporte com esse nome):
export function isValidCPF(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  const calc = (base: string, fator: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += +base[i] * (fator - i);
    const mod = (soma * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  const dv1 = calc(cpf.slice(0, 9), 10);
  const dv2 = calc(cpf.slice(0, 10), 11);
  return dv1 === +cpf[9] && dv2 === +cpf[10];
}

export function maskBRPhone(value?: string | null) {
  const d = onlyDigits(value).slice(0, 11);
  if (!d) return '';

  if (d.length <= 10) {
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 6);
    const p3 = d.slice(6, 10);
    let out = "";
    if (p1) out = `(${p1}`;
    if (p1.length === 2) out += ") ";
    if (p2) out += p2;
    if (p3) out += "-" + p3;
    return out;
  } else {
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 7);
    const p3 = d.slice(7, 11);
    let out = "";
    if (p1) out = `(${p1}`;
    if (p1.length === 2) out += ") ";
    if (p2) out += p2;
    if (p3) out += "-" + p3;
    return out;
  }
}

export function maskPlate(v: string) {
  const raw = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const base = raw.slice(0, 7); // placa tem 7 caracteres

  if (base.length <= 3) return base;

  // Se 4º char é dígito, assumimos Mercosul (AAA1A23 -> AAA-1A23)
  if (/\d/.test(base[3])) {
    const a = base.slice(0, 3);   // AAA
    const b = base.slice(3, 4);   // 1
    const c = base.slice(4, 5);   // A
    const d = base.slice(5, 7);   // 23
    return `${a}-${b}${c}${d}`;
  }

  // Caso contrário, padrão antigo (AAA1234 -> AAA-1234)
  const a = base.slice(0, 3);
  const b = base.slice(3, 7);
  return `${a}-${b}`;
}

// (opcional) Validador simples de placa BR (antiga ou Mercosul)
export function isValidPlateBR(v: string) {
  const s = v.toUpperCase();
  // AAA-1234
  const old = /^[A-Z]{3}-\d{4}$/;
  // AAA-1A23 (Mercosul)
  const mercosul = /^[A-Z]{3}-\d[A-Z]\d{2}$/;
  return old.test(s) || mercosul.test(s);
}

// Mantém letras (com acentos), espaço, ' e -; colapsa espaços; Title Case.
export function maskPersonName(v: string) {
  let s = v
    .replace(/[^\p{L}\s'-]/gu, "")   // só letras/acentos, espaços, ' e -
    .replace(/\s{2,}/g, " ")         // colapsa espaços repetidos
    .replace(/^\s+/, "");            // remove espaço inicial

  // Title Case (respeita acentos)
  s = s
    .toLowerCase()
    .replace(/(^|\s|[-'])[^\s]/gu, (m) => m.toUpperCase());

  return s;
}

// (opcional) se quiser inserir espaço ao detectar CamelCase digitado:
// "NatanGomes" -> "Natan Gomes" automaticamente
export function insertSpaceOnCamelCase(v: string) {
  return v.replace(/([a-zà-úç])([A-ZÀ-ÚÇ])/g, "$1 $2");
}

// --- BRL (R$) ---

/**
 * Aplica máscara de moeda BRL enquanto digita.
 * Ex.: '1' -> 'R$ 0,01', '1234' -> 'R$ 12,34'
 */
export function maskBRL(v: string) {
  const digits = String(v ?? "").replace(/\D/g, "");
  const number = Number(digits) / 100;
  return isNaN(number)
    ? "R$ 0,00"
    : number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Converte uma string mascarada 'R$ 1.234,56' para número 1234.56
 * (compatível com a maskBRL acima)
 */
export function parseBRLToNumber(v: string | null | undefined): number | null {
  if (!v) return null;
  const digits = String(v).replace(/\D/g, "");
  if (!digits) return null;
  return Number(digits) / 100;
}


// --- E-mail ---

/** normaliza: tira espaços das pontas e deixa minúsculo */
export function normalizeEmail(v: string) {
  return String(v ?? "").trim().toLowerCase();
}

/** validação pragmática de e-mail (sem RFC completa) */
export function isValidEmail(v: string) {
  const s = normalizeEmail(v);
  if (!s) return false;
  if (/\s/.test(s)) return false; // nada de espaços no meio

  // formato geral: algo@dominio.tld (tld >= 2)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(s)) return false;

  const [local, domain] = s.split("@");
  if (!local || !domain) return false;

  // proibições comuns
  if (local.startsWith(".") || local.endsWith(".")) return false;
  if (domain.includes("..")) return false;

  // cada label do domínio não pode começar/terminar com hífen
  return domain.split(".").every(lbl => lbl && !lbl.startsWith("-") && !lbl.endsWith("-"));
}

// --------- CNPJ ----------
export function maskCNPJ(v: string) {
  const d = String(v ?? "").replace(/\D/g, "").slice(0, 14);
  const a = d.slice(0, 2);
  const b = d.slice(2, 5);
  const c = d.slice(5, 8);
  const d4 = d.slice(8, 12);
  const e = d.slice(12, 14);
  let out = a;
  if (b) out += "." + b;
  if (c) out += "." + c;
  if (d4) out += "/" + d4;
  if (e) out += "-" + e;
  return out;
}

export function isValidCNPJ(value: string) {
  const cnpj = String(value ?? "").replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calc = (base: string) => {
    const pesos = base.length === 12
      ? [5,4,3,2,9,8,7,6,5,4,3,2]
      : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    const soma = base.split("").reduce((acc, n, i) => acc + Number(n) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const dv1 = calc(cnpj.slice(0, 12));
  const dv2 = calc(cnpj.slice(0, 12) + dv1);
  return dv1 === Number(cnpj[12]) && dv2 === Number(cnpj[13]);
}

// --------- CEP ----------
export function maskCEP(v: string) {
  const d = String(v ?? "").replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) {
    return d;
  }
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function isValidCEP(value: string) {
  const cep = String(value ?? "").replace(/\D/g, "");
  return cep.length === 8;
}

// --------- CURRENCY BRL ----------
export function maskCurrencyBR(v: string | number) {
  const value = String(v ?? "");
  
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, "");
  
  if (!digits) return "";
  
  // Converte para centavos e depois para reais
  const cents = parseInt(digits, 10);
  const reais = cents / 100;
  
  // Formata como moeda brasileira
  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function parseCurrencyBR(value: string): number {
  // Remove símbolos de moeda e converte para número
  const digits = String(value ?? "").replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(digits) || 0;
}

// --------- PIX ----------

/**
 * Máscara para chave Pix tipo UUID/Aleatória
 * Formato: 123e4567-e89b-12d3-a456-426614174000
 */
export function maskPixUUID(v: string) {
  const clean = String(v ?? "").replace(/[^a-fA-F0-9-]/g, "").toLowerCase();
  
  // Remove hífens existentes e limita a 32 caracteres
  const digits = clean.replace(/-/g, "").slice(0, 32);
  
  if (digits.length <= 8) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 8)}-${digits.slice(8)}`;
  if (digits.length <= 16) return `${digits.slice(0, 8)}-${digits.slice(8, 12)}-${digits.slice(12)}`;
  if (digits.length <= 20) return `${digits.slice(0, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}-${digits.slice(16)}`;
  
  return `${digits.slice(0, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}-${digits.slice(16, 20)}-${digits.slice(20)}`;
}

/**
 * Valida chave Pix tipo UUID v4
 */
export function isValidPixUUID(v: string): boolean {
  const uuid = String(v ?? "").toLowerCase().trim();
  // UUID v4: 8-4-4-4-12 caracteres hexadecimais
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida telefone BR (10 ou 11 dígitos)
 */
export function isValidPhoneBR(v: string): boolean {
  const digits = onlyDigits(v);
  // 10 dígitos (fixo) ou 11 dígitos (celular)
  if (digits.length !== 10 && digits.length !== 11) return false;
  
  // DDD válido (11-99)
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  
  // Para celular (11 dígitos), o terceiro dígito deve ser 9
  if (digits.length === 11 && digits[2] !== '9') return false;
  
  return true;
}

/**
 * Valida chave Pix baseada no tipo
 */
export function validatePixKey(type: string, value: string): { valid: boolean; message?: string } {
  const v = String(value ?? "").trim();
  
  if (!v) {
    return { valid: false, message: "Campo obrigatório" };
  }
  
  switch (type) {
    case 'email':
      return isValidEmail(v) 
        ? { valid: true } 
        : { valid: false, message: "E-mail inválido" };
    
    case 'telefone':
      return isValidPhoneBR(v)
        ? { valid: true }
        : { valid: false, message: "Telefone inválido" };
    
    case 'cpf':
      return isValidCPF(v)
        ? { valid: true }
        : { valid: false, message: "CPF inválido" };
    
    case 'cnpj':
      return isValidCNPJ(v)
        ? { valid: true }
        : { valid: false, message: "CNPJ inválido" };
    
    case 'aleatoria':
      return isValidPixUUID(v)
        ? { valid: true }
        : { valid: false, message: "Chave aleatória inválida" };
    
    default:
      return { valid: false, message: "Tipo de chave inválido" };
  }
}

/**
 * Aplica máscara na chave Pix baseada no tipo
 */
export function maskPixKey(type: string, value: string): string {
  const v = String(value ?? "");
  
  switch (type) {
    case 'email':
      return normalizeEmail(v);
    
    case 'telefone':
      return maskBRPhone(v);
    
    case 'cpf':
      return maskCPF(v);
    
    case 'cnpj':
      return maskCNPJ(v);
    
    case 'aleatoria':
      return maskPixUUID(v);
    
    default:
      return v;
  }
}
