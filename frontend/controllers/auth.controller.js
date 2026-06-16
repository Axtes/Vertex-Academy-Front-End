import { login, cadastrar } from "/frontend/services/auth.service.js";
import { salvarToken } from "/frontend/services/token.storage.js";

document.addEventListener("DOMContentLoaded", () => {

    const btnLogin = document.getElementById("btnLogin");
    const btnCadastro = document.getElementById("btnCadastro");

    const formLogin = document.getElementById("formLogin");
    const formCadastro = document.getElementById("formCadastro");

    const mensagem = document.getElementById("mensagem");


    btnLogin.addEventListener("click", () => {
        console.log("clicou login");

        formLogin.style.display = "flex";
        formCadastro.style.display = "none";

        btnLogin.classList.add("active");
        btnCadastro.classList.remove("active");

        mensagem.innerHTML = "";
    });

    btnCadastro.addEventListener("click", () => {
        console.log("clicou cadastro");

        formCadastro.style.display = "flex";
        formLogin.style.display = "none";

        btnCadastro.classList.add("active");
        btnLogin.classList.remove("active");

        mensagem.innerHTML = "";
    });

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const loginValor = document.getElementById("login").value;
            const senhaValor = document.getElementById("senhaLogin").value;

            console.log("A enviar para o service -> Login:", loginValor, "Senha:", senhaValor);

            const resposta = await login(loginValor, senhaValor);

            if (resposta && resposta.token) {
                salvarToken(resposta.token);
                mensagem.style.color = "#10b981";
                mensagem.innerHTML = "Login realizado com sucesso!";

                setTimeout(() => {
                    window.location.href = "/frontend/pages/dashboard.html";
                }, 1000);
            } else {
                throw new Error("Token não recebido da API.");
            }

        } catch (erro) {
            mensagem.style.color = "#ef4444";
            mensagem.innerHTML = erro.message;
        }
    });


    document.querySelectorAll(".mostrarSenha").forEach(botao => {
        botao.addEventListener("click", (e) => {
            e.preventDefault(); 

            const container = botao.closest(".password-container");
            const input = container ? container.querySelector("input") : null;

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                botao.textContent = "👁";
            } else {
                input.type = "password";
                botao.textContent = "👁";
            }
        });
    });

    formCadastro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const senha = document.getElementById("senhaCadastro").value;
        const confirmar = document.getElementById("senhaConfirmar").value;

        if (senha !== confirmar) {
            mensagem.style.color = "#ef4444";
            mensagem.innerHTML = "As senhas não conferem!";
            return;
        }

        const usuario = {
            nome: document.getElementById("nome").value,
            cpf: document.getElementById("cpf").value,
            email: document.getElementById("email").value,
            senha: senha,
            dataNascimento: document.getElementById("dataNascimento").value,
            telefone: document.getElementById("telefone").value
        };

        try {
            await cadastrar(usuario);
            mensagem.style.color = "#10b981";
            mensagem.innerHTML = "Cadastro realizado com sucesso!";

            btnLogin.click();
            formCadastro.reset();

        } catch (erro) {
            mensagem.style.color = "#ef4444";
            mensagem.innerHTML = erro.message;
        }
    });

});