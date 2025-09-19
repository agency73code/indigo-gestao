"use client";

import { useState } from "react";
import DadosPessoaisStep from "./DadosPessoaisStep";
import type { Terapeuta } from "../../types/cadastros.types";
import { isValidCPF, onlyDigits } from "@/common/utils/mask";
import { Button } from "@/ui/button";

export default function TerapeutaWizard() {
  const [data, setData] = useState<Partial<Terapeuta>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // === chamado pelo step a cada digitação ===
  const handleUpdate = (field: string, value: any) => {
    setData((d) => ({ ...d, [field]: value }));

    // ✅ validação de CPF: atualiza errors.cpf quando o CPF muda
    if (field === "cpf") {
      const ok = isValidCPF(value);
      setErrors((e) => ({ ...e, cpf: ok ? "" : "CPF inválido" }));
    }

    // (aqui você pode validar outros campos se quiser)
  };

  // === valida tudo deste step antes de avançar ===
  const validatePersonal = () => {
    const next: Record<string, string> = {};

    if (!data.nome || (data.nome?.trim().split(/\s+/).length ?? 0) < 2) {
      next.nome = "Digite nome e sobrenome";
    }
    if (!data.cpf || !isValidCPF(data.cpf)) {
      next.cpf = "CPF inválido";
    }
    if (!data.email) next.email = "E-mail obrigatório";
    if (!data.celular) next.celular = "Celular obrigatório";
    if (!data.dataNascimento) next.dataNascimento = "Data obrigatória";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validatePersonal()) return; // ❌ bloqueia avanço

    // ✅ payload limpo pra API: somente dígitos no CPF/telefones
    const payload = {
      ...data,
      cpf: onlyDigits(data.cpf || ""),
      celular: onlyDigits(data.celular || ""),
      telefone: onlyDigits(data.telefone || ""),
    };

    // TODO: aqui você chama sua API ou vai para o próximo step
    console.log("payload pronto:", payload);
  };

  const cpfInvalido = !!errors.cpf;

  return (
    <div className="space-y-4">
      <DadosPessoaisStep data={data} errors={errors} onUpdate={handleUpdate} />

      {/* UX: desabilita Próximo se CPF inválido */}
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={cpfInvalido}>
          Próximo
        </Button>
      </div>
    </div>
  );
}