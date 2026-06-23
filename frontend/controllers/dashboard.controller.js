import { listarCursos } from "/frontend/services/curso.service.js";
import { buscarDadosUsuarioLogado } from "/frontend/services/dashboard.service.js";
import { realizarInscricao } from "/frontend/services/inscricao.service.js";
import { removerToken } from "/frontend/services/token.storage.js";
import { obterToken } from "/frontend/services/token.storage.js";
import { Pagination } from "/frontend/utils/pagination.util.js";
import { cadastrarCursoApi } from "/frontend/services/curso.service.js";
import { cadastrarDisciplinaApi } from "/frontend/services/disciplina.service.js";
import { cadastrarProfessorApi } from "/frontend/services/professor.service.js";

let paginaAtual = 0;
let totalPaginas = 0;

async function carregarCursos(page = 0) {
    const listaCursos = document.getElementById("listaCursos");
    try {
        const dados = await listarCursos(page);
        if (!dados || !dados.content) {
            throw new Error("Resposta inválida do servidor");
        }
        paginaAtual = dados.number;
        totalPaginas = dados.totalPages;
        renderCursos(dados.content);
        atualizarPaginacao();
    } catch (erro) {
        console.error("Erro ao carregar cursos:", erro);
        if (listaCursos) {
            listaCursos.innerHTML = `<p style="color:red;">Erro ao carregar cursos</p>`;
        }
    }
}

function renderCursos(cursos) {
    const container = document.getElementById("listaCursos");
    if (!container) return;
    container.innerHTML = "";

    cursos.forEach(curso => {
        const div = document.createElement("div");
        div.classList.add("curso-card");
        div.innerHTML = `
            <h3>${curso.titulo}</h3>
            <p>Semestres: ${curso.semestres}</p>
            <p>Carga: ${curso.cargaHoraria ?? "Não informada"}</p>
            <button onclick="inscrever(${curso.id})">Inscrever-se</button>
        `;
        container.appendChild(div);
    });
}

function atualizarPaginacao() {
    const pagTxt = document.getElementById("paginaAtual");
    const btnAnt = document.getElementById("btnAnterior");
    const btnProx = document.getElementById("btnProximo");

    if (pagTxt) pagTxt.textContent = `Página ${paginaAtual + 1} de ${totalPaginas}`;
    if (btnAnt) btnAnt.disabled = paginaAtual === 0;
    if (btnProx) btnProx.disabled = paginaAtual >= totalPaginas - 1;
}

function setupEventos() {
    const btnAnt = document.getElementById("btnAnterior");
    const btnProx = document.getElementById("btnProximo");
    const btnInsc = document.getElementById("btnInscricao");

    if (btnAnt) btnAnt.addEventListener("click", () => { if (paginaAtual > 0) carregarCursos(paginaAtual - 1); });
    if (btnProx) btnProx.addEventListener("click", () => { if (paginaAtual < totalPaginas - 1) carregarCursos(paginaAtual + 1); });
    if (btnInsc) btnInsc.addEventListener("click", () => { window.location.href = "/inscricao"; });
}

function controlarPermissoes(usuario) {
    const btn = document.getElementById("btnInscricao");
    if (!btn) return;

    if (usuario.role === "ROLE_STUDENT" || usuario.role === "ROLE_USER") {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
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
    try {
        const usuario = await buscarDadosUsuarioLogado();

        if (usuario) {
            const nomeTxt = document.getElementById("nomeUsuario");
            const emailTxt = document.getElementById("emailUsuario");
            const matriculaTxt = document.getElementById("matriculaUsuario");
            const turmaTxt = document.getElementById("turmaUsuario");

            const wrapperEmail = document.getElementById("wrapperEmail");
            const wrapperMatricula = document.getElementById("wrapperMatricula");
            const wrapperTurma = document.getElementById("wrapperTurma");

            if (nomeTxt) nomeTxt.textContent = usuario.nome ?? "";

            if (usuario.role === "ROLE_ADMIN") {
                if (wrapperEmail) wrapperEmail.style.display = "block";
                if (wrapperMatricula) wrapperMatricula.style.display = "block";
                if (wrapperTurma) wrapperTurma.style.display = "none";

                if (emailTxt) emailTxt.textContent = usuario.email ?? "Não informado";
                if (matriculaTxt) matriculaTxt.textContent = usuario.id ?? "N/A";

            } else if (usuario.role === "ROLE_TEACHER") {
                if (wrapperEmail) wrapperEmail.style.display = "block";
                if (wrapperMatricula) wrapperMatricula.style.display = "block";
                if (wrapperTurma) wrapperTurma.style.display = "none";

                if (emailTxt) emailTxt.textContent = usuario.email ?? "Não informado";
                if (matriculaTxt) matriculaTxt.textContent = usuario.matricula ?? "N/A";

            } else if (usuario.role === "ROLE_STUDENT" || usuario.role === "ROLE_USER") {
                if (wrapperEmail) wrapperEmail.style.display = "none";
                if (wrapperMatricula) wrapperMatricula.style.display = "block";
                if (wrapperTurma) wrapperTurma.style.display = "block";

                if (matriculaTxt) matriculaTxt.textContent = usuario.matricula ?? "N/A";
                if (turmaTxt) turmaTxt.textContent = usuario.turma ?? "Não matriculado";

                await carregarCursos(0);
            }

            controlarPermissoes(usuario);
            configurarMenu(usuario);
        }
    } catch (erro) {
        console.error("Usuário não autenticado ou token inválido", erro);
        window.location.href = "/frontend/pages/auth.html";
    }

    setupEventos();
});

const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        removerToken();
        window.location.href = "/frontend/pages/auth.html";
    });
}

function configurarMenu(usuario) {
    const menusAluno = document.querySelectorAll(".aluno-menu");
    const menusAdmin = document.querySelectorAll(".admin-menu");
    const menusProf = document.querySelectorAll(".professor-menu");
    const conteudoPrincipal = document.getElementById("conteudoPrincipal");

    menusAluno.forEach(m => m.classList.add("hidden"));
    menusAdmin.forEach(m => m.classList.add("hidden"));
    menusProf.forEach(m => m.classList.add("hidden"));

    if (usuario.role === "ROLE_ADMIN") {
        menusAdmin.forEach(menu => menu.classList.remove("hidden"));

        if (conteudoPrincipal) {
            conteudoPrincipal.innerHTML = `
                <h2>Painel de Administração (Vertex Academy)</h2>
                <p style="color: #666; margin-bottom: 20px;">Selecione uma das opções na barra lateral para abrir o formulário de cadastro.</p>
                <div id="containerAdminForms"></div>
            `;
        }
        setupEventosAdmin();

    } else if (usuario.role === "ROLE_TEACHER") {
        menusProf.forEach(menu => menu.classList.remove("hidden"));

        if (conteudoPrincipal) {
            conteudoPrincipal.innerHTML = `
                <h2>Painel do Docente</h2>
                <p style="color: #666;">Bem-vindo, Professor. Utilize o menu lateral para lançamentos.</p>
                <div id="containerProfessorForms"></div>
            `;
        }
        setupEventosProfessor();

    } else {
        menusAluno.forEach(menu => menu.classList.remove("hidden"));
    }
}

function setupEventosAdmin() {
    const container = document.getElementById("containerAdminForms");
    const menuLateral = document.getElementById("menuLateral");

    if (!menuLateral || !container) return;

    const novoMenuLateral = menuLateral.cloneNode(true);
    menuLateral.parentNode.replaceChild(novoMenuLateral, menuLateral);

    novoMenuLateral.addEventListener("click", (evento) => {
        const botaoClicado = evento.target;

        if (botaoClicado.id === "btnCadCurso") {
            redefinirDestaqueMenu(botaoClicado);

            container.innerHTML = `
                <h3>Cadastrar Novo Curso</h3>
                <form id="formCurso" style="display:flex; flex-direction:column; gap:10px; max-width:400px; margin-top:20px;">
                    <input type="text" id="tituloCurso" placeholder="Título do Curso" required style="padding:10px; border:1px solid #ccc; border-radius:4px;"/>
                    <input type="number" id="semestresCurso" placeholder="Quantidade de Semestres" required style="padding:10px; border:1px solid #ccc; border-radius:4px;"/>
                    <textarea id="descricaoCurso" placeholder="Descrição do Curso" required style="padding:10px; border:1px solid #ccc; border-radius:4px; font-family:sans-serif; min-height:80px;"></textarea>
                    <button type="submit" style="padding:12px; background-color:#004080; color:white; border:none; cursor:pointer; font-weight:bold; border-radius:4px;">Salvar Curso</button>
                </form>
            `;

            document.getElementById("formCurso").addEventListener("submit", async (e) => {
                e.preventDefault();
                
                const dados = {
                    titulo: document.getElementById("tituloCurso").value,
                    semestres: parseInt(document.getElementById("semestresCurso").value),
                    descricao: document.getElementById("descricaoCurso").value
                };

                try {
                    await cadastrarCursoApi(dados);
                    alert("Curso cadastrado com sucesso!");
                    document.getElementById("formCurso").reset();
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        if (botaoClicado.id === "btnCadDisciplina") {
            redefinirDestaqueMenu(botaoClicado);

            container.innerHTML = `
                <h3>Cadastrar Nova Disciplina</h3>
                <form id="formDisciplina" style="display:flex; flex-direction:column; gap:10px; max-width:400px; margin-top:20px;">
                    <input type="text" id="nomeDisciplina" placeholder="Nome da Disciplina" required style="padding:10px; border:1px solid #ccc; border-radius:4px;"/>
                    <input type="number" id="cargaHoraria" placeholder="Carga Horária (horas)" required style="padding:10px; border:1px solid #ccc; border-radius:4px;"/>
                    <button type="submit" style="padding:12px; background-color:#004080; color:white; border:none; cursor:pointer; font-weight:bold; border-radius:4px;">Salvar Disciplina</button>
                </form>
            `;

            document.getElementById("formDisciplina").addEventListener("submit", async (e) => {
                e.preventDefault();

                const dados = {
                    nome: document.getElementById("nomeDisciplina").value,
                    cargaHoraria: parseInt(document.getElementById("cargaHoraria").value)
                };

                try {
                    await cadastrarDisciplinaApi(dados);
                    alert("Disciplina cadastrada com sucesso!");
                    document.getElementById("formDisciplina").reset();
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        if (botaoClicado.id === "btnCadProfessor") {
            redefinirDestaqueMenu(botaoClicado);

            container.innerHTML = `
                <h3>Promover Usuário a Professor</h3>
                <form id="formProfessor" style="display:flex; flex-direction:column; gap:10px; max-width:400px; margin-top:20px;">
                    <input type="number" id="idUsuarioProf" placeholder="ID do Usuário Base" required style="padding:10px; border:1px solid #ccc; border-radius:4px;"/>
                    <textarea id="biografiaProf" placeholder="Biografia/Resumo do Professor" required style="padding:10px; border:1px solid #ccc; border-radius:4px; font-family:sans-serif; min-height:60px;"></textarea>
                    
                    <select id="especializacaoProf" required style="padding:10px; border:1px solid #ccc; border-radius:4px; background:white;">
                        <option value="" disabled selected>Selecione a Especialização</option>
                        <option value="TECNICO">Técnico(a)</option>
                        <option value="LICENCIADO">Licenciado(a)</option>
                        <option value="Especilista(a)">Especilista(a)</option>
                        <option value="MESTRE">Mestre(a)</option>
                        <option value="DOUTOR">Doutor(a)</option>
                    </select>

                    <button type="submit" style="padding:12px; background-color:#004080; color:white; border:none; cursor:pointer; font-weight:bold; border-radius:4px;">Promover a Professor</button>
                </form>
            `;

            document.getElementById("formProfessor").addEventListener("submit", async (e) => {
                e.preventDefault();

                const dados = {
                    id: parseInt(document.getElementById("idUsuarioProf").value),
                    biografia: document.getElementById("biografiaProf").value,
                    especializacao: document.getElementById("especializacaoProf").value
                };

                try {
                    await cadastrarProfessorApi(dados);
                    alert("Professor promovido e cadastrado com sucesso!");
                    document.getElementById("formProfessor").reset();
                } catch (error) {
                    alert(error.message);
                }
            });
        }
        
        if (botaoClicado.id === "btnLogout") {
            removerToken();
            window.location.href = "/frontend/pages/auth.html";
        }
    });
}


function setupEventosProfessor() {
    const container = document.getElementById("containerProfessorForms");
    const btnLancasNotas = document.getElementById("btnLancasNotas");
    const btnMinhasTurmas = document.getElementById("btnMinhasTurmas");

    if (btnLancasNotas) {
        btnLancasNotas.addEventListener("click", () => {
            redefinirDestaqueMenu(btnLancasNotas);
            container.innerHTML = `<h3>Lançamento de Notas</h3><p style="color:#555;">Selecione a turma para atribuir as notas...</p>`;
        });
    }

    if (btnMinhasTurmas) {
        btnMinhasTurmas.addEventListener("click", () => {
            redefinirDestaqueMenu(btnMinhasTurmas);
            container.innerHTML = `<h3>Minhas Turmas Alocadas</h3><p style="color:#555;">Exibindo diário de classe das suas turmas...</p>`;
        });
    }
}

function redefinirDestaqueMenu(botaoAtivo) {
    document.querySelectorAll("#menuLateral button").forEach(btn => {
        btn.style.backgroundColor = "";
        btn.style.color = "";
    });
    botaoAtivo.style.backgroundColor = "#e3f2fd";
    botaoAtivo.style.color = "#0066cc";
}