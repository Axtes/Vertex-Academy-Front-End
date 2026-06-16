import { listarCursos } from "/frontend/services/curso.service.js";
import { realizarInscricao } from "/frontend/services/inscricao.service.js";

let paginaAtual = 0;
let totalPaginas = 0;

async function init(page = 0) {

    const dados = await listarCursos(page);

    paginaAtual = dados.number;
    totalPaginas = dados.totalPages;

    render(dados.content);
    paginacao();
}

function render(cursos) {

    const container = document.getElementById("lista-cursos");
    container.innerHTML = "";

    cursos.forEach(curso => {

        const card = document.createElement("div");
        card.classList.add("curso-card");

        card.innerHTML = `
            <h3>${curso.titulo}</h3>
            <p>${curso.descricao}</p>

            <button onclick="inscrever(${curso.id})">
                Inscrever-se
            </button>
        `;

        container.appendChild(card);
    });
}

function paginacao() {

    document.getElementById("paginaAtual").textContent =
        `Página ${paginaAtual + 1} de ${totalPaginas}`;
}

window.inscrever = async function (cursoId) {

    try {
        await realizarInscricao(cursoId);
        alert("Inscrição realizada!");
    } catch (e) {
        alert("Erro: " + e.message);
    }
};

document.addEventListener("DOMContentLoaded", () => init());