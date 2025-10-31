// scripts/tests/links/test-create-supervision.js
import { createSupervisionLink } from '../../../src/features/links/supervision-link/actions/create.js';

// Simula ambiente Node puro — sem framework HTTP.
async function run() {
  console.log('🧪 [TESTE] Iniciando teste de criação de vínculo de supervisão');

  // Payload de exemplo
  const payload = {
    supervisorId: 'b80b95cf-6c48-4a61-ba6b-bfcc512ae51d',
    clinicianId: 'b80b95cf-6c48-4a61-ba6b-bfcc512ae51d',
    areaId: 1,
    startDate: new Date('2025-01-10'),
    endDate: null,
    hierarchyLevel: 1,
    supervisionScope: 'direto',
    notes: 'Vínculo de teste criado via script.',
  };

  console.log('📤 Enviando payload ao service:');
  console.dir(payload, { depth: null });

  try {
    const result = await createSupervisionLink(payload);

    console.log('\n✅ [SUCESSO] Vínculo criado com sucesso!');
    console.log('📦 Retorno normalizado:');
    console.dir(result, { depth: null });
  } catch (error) {
    console.error('\n❌ [ERRO] Falha ao criar vínculo de supervisão:');
    console.error(error.message || error);
  } finally {
    console.log('\n🔚 [FIM DO TESTE] Execução finalizada.');
  }
}

run();
