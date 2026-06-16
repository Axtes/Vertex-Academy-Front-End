import { listarCursos } from "/frontend/services/curso.service.js";
import { buscarDadosAluno } from "/frontend/services/dashboard.service.js";
import { realizarInscricao } from "/frontend/services/inscricao.service.js";
import { removerToken } from "/frontend/services/token.storage.js";
import { obterToken } from "/frontend/services/token.storage.js";
import { Pagination } from "/frontend/utils/pagination.util.js";

let paginaAtual = 0;
let totalPaginas = 0;

async function carregarCursos(page = 0) {

    const listaCursos = document.getElementById("listaCursos");

    try {

        const dados = await listarCursos(page); // 👈 ESSA LINHA É OBRIGATÓRIA

        if (!dados || !dados.content) {
            throw new Error("Resposta inválida do servidor");
        }

        paginaAtual = dados.number;
        totalPaginas = dados.totalPages;

        renderCursos(dados.content);

        atualizarPaginacao();

    } catch (erro) {

        console.error("Erro ao carregar cursos:", erro);

        listaCursos.innerHTML = `
            <p style="color:red;">
                Erro ao carregar cursos
            </p>
        `;
    }
}

function renderCursos(cursos) {
    const container = document.getElementById("listaCursos");
    container.innerHTML = "";

    cursos.forEach(curso => {
        const div = document.createElement("div");
        div.classList.add("curso-card");

        div.innerHTML = `
            <h3>${curso.titulo}</h3>
            <p>Semestres: ${curso.semestres}</p>
            <p>Carga: ${curso.cargaHoraria ?? "Não informada"}</p>
            <button onclick="inscrever(${curso.id})">
                Inscrever-se
            </button>
        `;

        container.appendChild(div);
    });
}

function atualizarPaginacao() {

    document.getElementById("paginaAtual").textContent =
        `Página ${paginaAtual + 1} de ${totalPaginas}`;

    document.getElementById("btnAnterior").disabled =
        paginaAtual === 0;

    document.getElementById("btnProximo").disabled =
        paginaAtual >= totalPaginas - 1;
}

function setupEventos() {

    document.getElementById("btnAnterior").addEventListener("click", () => {
        if (paginaAtual > 0) carregarCursos(paginaAtual - 1);
    });

    document.getElementById("btnProximo").addEventListener("click", () => {
        if (paginaAtual < totalPaginas - 1) carregarCursos(paginaAtual + 1);
    });

    document.getElementById("btnInscricao").addEventListener("click", () => {
        window.location.href = "/inscricao";
    });
}

function controlarPermissoes(usuario) {

    const roles = usuario.roles || [];
    const isAluno =
        roles.includes("ROLE_USER") ||
        roles.includes("ROLE_STUDENT");

    const btn = document.getElementById("btnInscricao");

    // ⚠️ proteção: garante que o elemento existe
    if (!btn) return;

    if (!isAluno) {
        btn.style.display = "none";
    } else {
        btn.style.display = "block";
    }
}

window.inscrever = async function (cursoId) {

    try {
        await realizarInscricao(cursoId);
        alert("Inscrição realizada!");
    } catch (e) {
        alert(e.message);
    }
};

document.addEventListener("DOMContentLoaded", async () => {

    await carregarCursos(0);

    try {
        const usuario = await buscarDadosAluno();

        if (usuario) {
            document.getElementById("nomeUsuario").textContent = usuario.nome ?? "";
            document.getElementById("matriculaUsuario").textContent = usuario.matricula ?? "";
            document.getElementById("turmaUsuario").textContent = usuario.turma ?? "";

            controlarPermissoes(usuario);
        }

    } catch (erro) {
        console.log("Usuário não autenticado ou token inválido");
    }

    setupEventos();
});

const btnLogout = document.getElementById("btnLogout");

btnLogout.addEventListener("click", () => {

    removerToken();

    window.location.href =
        "/frontend/pages/auth.html";

});

const usuario = await buscarDadosAluno();

configurarMenu(usuario);

function configurarMenu(usuario){

    const menusAluno =
        document.querySelectorAll(".aluno-menu");


    if(usuario.role === "ROLE_STUDENT"){

        menusAluno.forEach(menu=>{
            menu.classList.remove("hidden");
        });

    }

}