import request from "supertest";
import express from "express";
import therapistRouter from "../routes/therapist.router.js";
const app = express();
app.use(express.json());
app.use('/terapeutas', therapistRouter);
async function runTest() {
    const response = await request(app)
        .post("/terapeutas/cadastrar")
        .send({
        nome: "João Silva",
        cpf: "50323487831",
        data_nascimento: new Date("1990-01-01"),
        telefone: "11112223331",
        celular: "11985982268",
        email: "natantatan2000@gmail.com",
        email_indigo: "joao@indigo.com",
        possui_veiculo: "sim",
        placa_veiculo: "ABC1234",
        modelo_veiculo: "Gol",
        banco: "Banco Exemplo",
        agencia: "0001",
        conta: "12345-6",
        chave_pix: "joao@email.com",
        cep_endereco: "12345678",
        logradouro_endereco: "Rua Teste",
        numero_endereco: "100",
        bairro_endereco: "Centro",
        cidade_endereco: "Cidade X",
        uf_endereco: "SP",
        data_entrada: new Date("2025-08-27"),
        perfil_acesso: "admin",
    });
    console.log("Response:", response.body);
    console.log("Status code:", response.status);
    console.log("Body:", response.text);
}
// Espera que o script mandar uma mensagem e depois encerra
(async () => {
    await runTest();
})();
//# sourceMappingURL=testTherapistRouter.js.map