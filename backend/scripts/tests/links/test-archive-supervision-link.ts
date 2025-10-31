import fetch from "node-fetch";

/**
 * Teste manual para arquivar vínculo de supervisão.
 */
async function run() {
    const payload = { id: 1 };

    console.log("🚀 Enviando requisição POST /api/links/archiveSupervisionLink...");
    const response = await fetch("http://localhost:3000/api/links/archiveSupervisionLink", {
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

run().catch((err) => console.error("❌ Erro ao testar arquivamento:", err));