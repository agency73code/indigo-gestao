import fetch from "node-fetch";

/**
 * Teste manual para encerramento de vínculo de supervisão.
 * Simula uma requisição POST ao endpoint /api/links/endSupervisionLink.
 */
async function run() {
    const payload = {
        id: 1,
        endDate: "2025-12-20",
    };

    console.log("🚀 Enviando requisição POST /api/links/endSupervisionLink...");
    const response = await fetch("http://localhost:3000/api/links/endSupervisionLink", {
        method: "POST",
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

run().catch((err) => console.error("❌ Erro ao testar encerramento:", err));
