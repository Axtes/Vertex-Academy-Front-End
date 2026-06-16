import { API_URL } from "/frontend/config/api.js";
import { obterToken } from "/frontend/services/token.storage.js";

export async function realizarInscricao(cursoId) {

    const response = await fetch(`${API_URL}/inscricao`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${obterToken()}`
        },
        body: JSON.stringify({ cursoId })
    });

    if (!response.ok) {
        const erro = await response.text();
        throw new Error(erro || "Erro ao realizar inscrição.");
    }

    return true;
}