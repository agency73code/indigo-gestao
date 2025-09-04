export interface ClientCreateData {
    nome: string;
    data_nascimento: string | Date;
    email_contato: string;
    data_entrada: string | Date;   
    perfil_acesso: string;
}