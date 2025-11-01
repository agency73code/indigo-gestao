import fetch from "node-fetch";

/**
 * Teste manual para atualização de vínculo de supervisão.
 * Simula uma requisição PATCH ao endpoint /api/links/updateSupervisionLink
 */
async function run() {
    const payload = {
        id: 1,
        hierarchyLevel: 1,
        supervisionScope: "team",
        endDate: null,
        notes: "Atualização reabertura",
        status: "teste",
    };

    console.log("🚀 Enviando requisição PATCH /api/links/updateSupervisionLink...");
    const response = await fetch("http://localhost:3000/api/links/updateSupervisionLink", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const text = await response.text();
    try {
        const json = JSON.parse(text);
        console.log("🔍 Resposta JSON:", json);
    } catch {
        console.log("⚠️ Resposta não-JSON:", text);
    }

    console.log("✅ Status:", response.status);
}

run().catch((err) => console.error("❌ Erro ao testar atualização:", err));
