import { login, cadastrar } from "/frontend/services/auth.service.js";
import { salvarToken } from "/frontend/services/token.storage.js";

document.addEventListener("DOMContentLoaded", () => {

    const btnLogin = document.getElementById("btnLogin");
    const btnCadastro = document.getElementById("btnCadastro");

    const formLogin = document.getElementById("formLogin");
    const formCadastro = document.getElementById("formCadastro");

    const mensagem = document.getElementById("mensagem");

    // 🔁 troca de abas
    btnLogin.addEventListener("click", () => {
        btnLogin.classList.add("active");
        btnCadastro.classList.remove("active");

        formLogin.classList.remove("hidden");
        formCadastro.classList.add("hidden");

        mensagem.innerHTML = "";
    });

    btnCadastro.addEventListener("click", () => {
        btnCadastro.classList.add("active");
        btnLogin.classList.remove("active");

        formCadastro.classList.remove("hidden");
        formLogin.classList.add("hidden");

        mensagem.innerHTML = "";
    });

    // 🔐 LOGIN
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const resposta = await login(
                document.getElementById("login").value,
                document.getElementById("senhaLogin").value
            );

            salvarToken(resposta.token);

            mensagem.innerHTML = "Login realizado com sucesso!";

            setTimeout(() => {
                window.location.href = "/frontend/pages/dashboard.html";
            }, 1000);

        } catch (erro) {
            mensagem.innerHTML = erro.message;
        }
    });

    // 🧾 CADASTRO
    formCadastro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const senha = document.getElementById("senhaCadastro").value;
        const confirmar = document.getElementById("senhaConfirmar").value;

        if (senha !== confirmar) {
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

            mensagem.innerHTML = "Cadastro realizado com sucesso!";

            // volta para login
            btnLogin.click();

            formCadastro.reset();

        } catch (erro) {
            mensagem.innerHTML = erro.message;
        }
    });

});