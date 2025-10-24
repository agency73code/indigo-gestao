# INSTRUÇÕES PARA TESTAR O MOCK

## 1. Verificar .env.local
O arquivo `.env.local` já foi criado com:
```
VITE_USE_MOCK=1
```

## 2. Reiniciar o servidor de desenvolvimento
Se o servidor estiver rodando, pare-o (Ctrl+C) e inicie novamente:
```bash
cd frontend
pnpm dev
```

## 3. Verificar logs no console do navegador
Ao acessar as páginas de Faturamento, você deverá ver logs como:
```
🔧 [HourEntry Service] VITE_USE_MOCK: 1
🔧 [HourEntry Service] USE_MOCK: true
```

## 4. Testar "Registrar Lançamento"
1. Acesse: /app/faturamento/registrar-lancamento
2. Preencha os campos:
   - Paciente: Escolha qualquer paciente da lista
   - Data: Escolha uma data no passado ou hoje
   - Horário: (opcional) ex: 14:00
   - Duração: Escolha 30, 60, 90 ou 120 min
   - Deslocamento: Marque ou deixe desmarcado
   - Observação: (opcional) texto livre

3. Clique em "Salvar rascunho" ou "Enviar"
   - Você verá logs no console:
     ```
     💾 [Form] Salvando rascunho: {...}
     ✨ [MOCK] create chamado com input: {...}
     📤 [MOCK] submit chamado com id: mock-101
     ```

4. Deve aparecer um toast de sucesso e um diálogo perguntando se quer:
   - "Lançar outro" (reseta o formulário)
   - "Ir para Minhas Horas" (navega para listagem)

## 5. Testar "Minhas Horas"
1. Acesse: /app/faturamento/minhas-horas
2. Você deverá ver 5 lançamentos mockados:
   - m-001: Raul Lima (Rascunho) - 60 min
   - m-002: Sheila Shanahan (Enviado) - 90 min com deslocamento
   - m-003: Sheila Shanahan (Aprovado) - 60 min
   - m-004: Ana Souza (Reprovado) - 120 min
   - m-005: Lucas Prado (Pago) - 30 min

3. Você verá log no console:
   ```
   📋 [MOCK] listMine chamado com query: {...}
   ```

## 6. Testar filtros
1. Em "Minhas Horas", teste os filtros:
   - Período: 7 dias / 30 dias / 90 dias / Personalizado
   - Paciente: Selecione um paciente específico
   - Status: Clique nos badges coloridos

2. A lista deve atualizar conforme os filtros
3. Você verá novos logs no console cada vez que filtrar

## 7. Testar edição
1. Clique em "Editar" num lançamento com status "Rascunho" ou "Enviado"
2. Faça alterações nos campos editáveis
3. Clique em "Salvar alterações"

## 8. Testar exclusão
1. Clique em "Excluir" num lançamento com status "Rascunho"
2. Confirme a exclusão
3. O lançamento deve desaparecer da lista

## Se algo não funcionar:
1. Verifique o console do navegador (F12) para ver os logs
2. Verifique se VITE_USE_MOCK está como "1"
3. Certifique-se de que reiniciou o servidor após criar o .env.local
4. Os logs vão ajudar a identificar onde está o problema
