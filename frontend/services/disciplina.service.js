import { API_URL } from "/frontend/config/api.js";
import { obterToken } from "/frontend/services/token.storage.js";

export async function cadastrarDisciplinaApi(dadosDisciplina) {
    const response = await fetch(`${API_URL}/admin/cadastrar-disciplina`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify(dadosDisciplina)
    });

    if (!response.ok) {
        throw new Error("Erro ao cadastrar a disciplina.");
    }
    return await response.json();
}