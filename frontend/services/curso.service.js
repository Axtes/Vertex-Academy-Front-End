import { API_URL } from "/frontend/config/api.js";
import { obterToken } from "/frontend/services/token.storage.js";

export async function listarCursos(page = 0) {

    const response = await fetch(
        `${API_URL}/cursos/listagem?page=${page}&size=3`,
        {
            headers: {
                Authorization: `Bearer ${obterToken()}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Erro ao listar cursos.");
    }

    return await response.json();
}