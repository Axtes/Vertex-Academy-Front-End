import { API_URL } from "../../../../../../../../../../frontend/config/api.js";

export async function login(login, senha) { 

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            login, 
            senha  
        })
    });

    if (!response.ok) {
        throw new Error("Login inválido");
    }

    return await response.json();
}

export async function cadastrar(usuario) {

    const response = await fetch(`${API_URL}/auth/cadastrar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    });

    if (!response.ok) {
        const erro = await response.text();
        throw new Error(erro || "Erro ao cadastrar usuário");
    }

    return await response.json();
}