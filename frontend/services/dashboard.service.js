import { API_URL } from "/frontend/config/api.js";
import { obterToken } from "/frontend/services/token.storage.js";

export async function buscarDadosUsuarioLogado() { 
    const response = await fetch(`${API_URL}/api/dashboard/me`, { 
        headers: {
            Authorization: `Bearer ${obterToken()}`
        }
    });

    if (!response.ok) {
        throw new Error("Erro ao carregar dados do usuário.");
    }

    return await response.json();
}