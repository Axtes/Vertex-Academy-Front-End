import { API_URL } from "/frontend/config/api.js";
import { obterToken } from "/frontend/services/token.storage.js";

export async function cadastrarProfessorApi(dadosProfessor) {
    const response = await fetch(`${API_URL}/admin/cadastrar-professor`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify(dadosProfessor)
    });

    if (!response.ok) {
        throw new Error("Erro ao promover usuário a professor. Verifique o ID.");
    }
    return await response.json();
}