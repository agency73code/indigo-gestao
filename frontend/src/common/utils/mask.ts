export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function toTitleCaseSimple(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
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

export function maskBRPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
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
