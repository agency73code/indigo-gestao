// import { sendWelcomeEmail } from '../../utils/mail.util.js'
// import { describe, expect, test, beforeAll } from 'vitest';
// import express from 'express';
// import request from 'supertest';
// import app from '../../server.js';

// beforeAll(() => {
//   app.use(express.json());
//   app.post('/__test__/send-welcome', async (req, res) => {
//     const { to, name, token } = req.body;
//     await sendWelcomeEmail({ to, name, token });
//     res.sendStatus(200);
//   });
// });

// describe('sendWelcomeEmail (teste simples)', () => {
//   test('envia email de boas-vindas', async () => {
//     const to = 'kaio.rmdourado@gmail.com'; // <-- troque para o destinatário
//     const name = 'Teste Indigo';
//     const token = 'test-' + Date.now();

//     const res = await request(app)
//       .post('/__test__/send-welcome')
//       .send({ to, name, token });

//     expect(res.status).toBe(200);
//   }, { timeout: 30000 });
// });