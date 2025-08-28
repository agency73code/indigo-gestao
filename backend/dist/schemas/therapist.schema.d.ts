import z from 'zod';
export declare const therapistSchema: z.ZodObject<{
    nome: z.ZodString;
    cpf: z.ZodString;
    data_nascimento: z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>;
    telefone: z.ZodDefault<z.ZodString>;
    celular: z.ZodString;
    foto_perfil: z.ZodDefault<z.ZodString>;
    email: z.ZodString;
    email_indigo: z.ZodString;
    possui_veiculo: z.ZodEnum<{
        sim: "sim";
        nao: "nao";
    }>;
    placa_veiculo: z.ZodDefault<z.ZodString>;
    modelo_veiculo: z.ZodDefault<z.ZodString>;
    banco: z.ZodString;
    agencia: z.ZodString;
    conta: z.ZodString;
    chave_pix: z.ZodString;
    cep_endereco: z.ZodString;
    logradouro_endereco: z.ZodString;
    numero_endereco: z.ZodString;
    bairro_endereco: z.ZodString;
    cidade_endereco: z.ZodString;
    uf_endereco: z.ZodString;
    complemento_endereco: z.ZodDefault<z.ZodString>;
    cnpj_empresa: z.ZodDefault<z.ZodString>;
    cep_empresa: z.ZodDefault<z.ZodString>;
    logradouro_empresa: z.ZodDefault<z.ZodString>;
    numero_empresa: z.ZodDefault<z.ZodString>;
    bairro_empresa: z.ZodDefault<z.ZodString>;
    cidade_empresa: z.ZodDefault<z.ZodString>;
    uf_empresa: z.ZodDefault<z.ZodString>;
    complemento_empresa: z.ZodDefault<z.ZodString>;
    data_entrada: z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>;
    perfil_acesso: z.ZodString;
}, z.z.core.$strip>;
//# sourceMappingURL=therapist.schema.d.ts.map