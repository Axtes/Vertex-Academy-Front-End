import { API_URL } from "/frontend/config/api.js";
import { obterToken } from "/frontend/services/token.storage.js";

export async function buscarDadosAluno() {

    const response = await fetch(`${API_URL}/aluno/me`, {
        headers: {
            Authorization: `Bearer ${obterToken()}`
        }
    });

    if (!response.ok) {
        throw new Error("Erro ao carregar usuário.");
    }

    return await response.json();
}