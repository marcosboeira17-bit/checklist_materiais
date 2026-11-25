
// =====================================
// MATERIAIS INICIAIS
// =====================================

const materiaisIniciais = [
    { id: 1, nome: "Isolador Pequeno", quantidade: 15 },
    { id: 2, nome: "Cabo Flat (metros)", quantidade: 500 },
    { id: 3, nome: "Alça Flat", quantidade: 20 },
    { id: 4, nome: "Isolador Grande", quantidade: 10 },
    { id: 5, nome: "Cinta Metalica", quantidade: 2 },
    { id: 6, nome: "Celo", quantidade: 50 },
    { id: 7, nome: "Fita isolante", quantidade: 2 }
];

let materiais = JSON.parse(
    localStorage.getItem("materiais")
) || materiaisIniciais;

let historico = JSON.parse(
    localStorage.getItem("historico")
) || [];

// Evita interpretar textos digitados como HTML
function protegerTexto(texto) {
    const elemento = document.createElement("div");
    elemento.textContent = String(texto);
    return elemento.innerHTML;
}

// =====================================
// ARMAZENAMENTO
// =====================================

function salvarMateriais() {
    localStorage.setItem(
        "materiais",
        JSON.stringify(materiais)
    );
}

function salvarHistorico() {
    localStorage.setItem(
        "historico",
        JSON.stringify(historico)
    );
}

// =====================================
// MENSAGENS
// =====================================

function mostrarMensagem(texto, tipo) {

    const mensagem = document.getElementById("mensagem");

    if (mensagem) {
        mensagem.textContent = texto;
        mensagem.className = "mensagem " + tipo;
    }
}

// =====================================
// LOGIN DO OPERADOR
// =====================================

function configurarLogin() {

    const form = document.getElementById("formLogin");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const senha = document.getElementById("senha").value;

        if (usuario === "operador" && senha === "1234") {

            sessionStorage.setItem("operadorLogado", "true");

            window.location.href = "operador.html";

        } else {

            mostrarMensagem(
                "Usuário ou senha incorretos.",
                "erro"
            );
        }
    });
}

// =====================================
// PROTEÇÃO DAS PÁGINAS (SIMULAÇÃO)
// =====================================

function verificarLogin() {

    const paginaRestrita = document.body.dataset.restrito;

    if (
        paginaRestrita === "true" &&
        sessionStorage.getItem("operadorLogado") !== "true"
    ) {
        document.body.style.display = "none";
        window.location.replace("index.html");
        return false;
    }

    return true;
}

function sair() {

    sessionStorage.removeItem("operadorLogado");

    window.location.href = "index.html";
}

// =====================================
// DATA AUTOMÁTICA
// =====================================

function mostrarData() {

    const campoData = document.getElementById("dataAtual");

    if (!campoData) return;

    const agora = new Date();

    campoData.textContent =
        "Data: " + agora.toLocaleDateString("pt-BR") +
        " | Hora: " + agora.toLocaleTimeString("pt-BR");
}

// =====================================
// CADASTRO DE MATERIAIS
// =====================================

function configurarCadastro() {

    const form = document.getElementById("formMaterial");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const nome = document.getElementById("nomeMaterial").value.trim();

        const quantidade = Number(
            document.getElementById("quantidadeMaterial").value
        );

        if (
            !nome ||
            !Number.isInteger(quantidade) ||
            quantidade <= 0
        ) {
            alert("Preencha os dados corretamente.");
            return;
        }

        const existe = materiais.some(
            material => material.nome.toLowerCase() === nome.toLowerCase()
        );

        if (existe) {
            alert("Este material já está cadastrado.");
            return;
        }

        const novoMaterial = {
            id: Date.now(),
            nome: nome,
            quantidade: quantidade
        };

        materiais.push(novoMaterial);

        salvarMateriais();
        listarMateriais();

        form.reset();
    });
}

// =====================================
// LISTAR MATERIAIS DO OPERADOR
// =====================================

function listarMateriais() {

    const lista = document.getElementById("listaMateriais");

    if (!lista) return;

    lista.innerHTML = "";

    if (materiais.length === 0) {
        lista.innerHTML = "<p>Nenhum material cadastrado.</p>";
        return;
    }

    materiais.forEach(function (material) {

        lista.innerHTML += `
            <div class="material">

                <div>
                    <strong>${protegerTexto(material.nome)}</strong>
                    <small>
                        Quantidade necessária: ${material.quantidade}
                    </small>
                </div>

                <button
                    class="btn vermelho"
                    onclick="excluirMaterial(${material.id})">
                    Excluir
                </button>

            </div>
        `;
    });
}

// =====================================
// EXCLUIR MATERIAL
// =====================================

function excluirMaterial(id) {

    const confirmar = confirm(
        "Deseja realmente excluir este material?"
    );

    if (!confirmar) return;

    materiais = materiais.filter(
        material => material.id !== id
    );

    salvarMateriais();
    listarMateriais();
}

// =====================================
// LISTA DE CONFERÊNCIA DO TÉCNICO
// =====================================

function listarConferencia() {

    const lista = document.getElementById("listaConferencia");

    if (!lista) return;

    lista.innerHTML = "";

    if (materiais.length === 0) {

        lista.innerHTML = "<p>Nenhum material disponível para conferência.</p>";

        document.querySelector(
            "#formConferencia button[type='submit']"
        ).disabled = true;

        return;
    }

    materiais.forEach(function (material) {

        lista.innerHTML += `
            <div class="material">

                <div>
                    <strong>${protegerTexto(material.nome)}</strong>

                    <small>
                        Necessário: ${material.quantidade}
                    </small>

                    <p id="status-${material.id}"></p>
                </div>

                <input
                    type="number"
                    id="qtd-${material.id}"
                    aria-label="Quantidade disponível"
                    min="0"
                    step="1"
                    placeholder="Qtd."
                    required
                    oninput="verificarQuantidade(${material.id})">

            </div>
        `;
    });
}

// =====================================
// VERIFICAR QUANTIDADE
// =====================================

function verificarQuantidade(id) {

    const material = materiais.find(
        item => item.id === id
    );

    const campo = document.getElementById("qtd-" + id);
    const status = document.getElementById("status-" + id);

    if (campo.value === "" || !campo.validity.valid) {
        status.textContent = "";
        return;
    }

    const quantidade = Number(campo.value);

    if (quantidade >= material.quantidade) {

        status.textContent = "Quantidade suficiente";
        status.className = "status-ok";

    } else {

        const falta = material.quantidade - quantidade;

        status.textContent = "Faltam: " + falta;
        status.className = "status-falta";
    }
}

// =====================================
// SALVAR CONFERÊNCIA
// =====================================

function configurarConferencia() {

    const form = document.getElementById("formConferencia");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const nome = document.getElementById("nomeTecnico").value.trim();

        if (!nome) {
            mostrarMensagem("Informe seu nome.", "erro");
            return;
        }

        if (materiais.length === 0) {
            mostrarMensagem("Não existem materiais cadastrados.", "erro");
            return;
        }

        const itens = materiais.map(function (material) {

            const campo = document.getElementById(
                "qtd-" + material.id
            );

            return {
                nome: material.nome,
                necessaria: material.quantidade,
                disponivel: Number(campo.value)
            };
        });

        const agora = new Date();

        const conferencia = {
            id: Date.now(),
            tecnico: nome,
            data: agora.toLocaleDateString("pt-BR"),
            hora: agora.toLocaleTimeString("pt-BR"),
            itens: itens
        };

        historico.unshift(conferencia);

        try {

            salvarHistorico();

        } catch (erro) {

            historico.shift();

            mostrarMensagem(
                "Não foi possível salvar a conferência.",
                "erro"
            );

            return;
        }

        form.reset();

        listarConferencia();
        mostrarData();

        mostrarMensagem(
            "Conferência salva com sucesso! Obrigado, " + nome + ".",
            "sucesso"
        );
    });
}

// =====================================
// HISTÓRICO
// =====================================

function listarHistorico(filtro = "") {

    const lista = document.getElementById("listaHistorico");

    if (!lista) return;

    lista.innerHTML = "";

    document.getElementById("totalConferencias").textContent =
        historico.length;

    const pendencias = historico.filter(
        registro => registro.itens.some(
            item => item.disponivel < item.necessaria
        )
    );

    document.getElementById("totalPendencias").textContent =
        pendencias.length;

    const registros = historico.filter(
        registro => registro.tecnico.toLowerCase().includes(
            filtro.toLowerCase()
        )
    );

    if (registros.length === 0) {

        lista.innerHTML = "<p>Nenhuma conferência encontrada.</p>";

        return;
    }

    registros.forEach(function (registro) {

        const possuiPendencia = registro.itens.some(
            item => item.disponivel < item.necessaria
        );

        let detalhes = "";

        registro.itens.forEach(function (item) {

            const falta = item.disponivel < item.necessaria;

            detalhes += `
                <div class="material">

                    <div>
                        <strong>${protegerTexto(item.nome)}</strong>
                        <small>Necessário: ${item.necessaria}</small>
                    </div>

                    <span class="${falta ? "status-falta" : "status-ok"}">
                        ${item.disponivel} / ${item.necessaria}
                    </span>

                </div>
            `;
        });

        lista.innerHTML += `
            <article class="registro">

                <h3>${protegerTexto(registro.tecnico)}</h3>

                <p>
                    ${protegerTexto(registro.data)}
                    às ${protegerTexto(registro.hora)}
                </p>

                <p class="${possuiPendencia ? "status-falta" : "status-ok"}">

                    ${possuiPendencia
                        ? "Possui materiais faltantes"
                        : "Materiais completos"}

                </p>

                <details>

                    <summary>Visualizar conferência</summary>

                    ${detalhes}

                </details>

            </article>
        `;
    });
}

// =====================================
// PESQUISA DO HISTÓRICO
// =====================================

function configurarPesquisa() {

    const pesquisa = document.getElementById("pesquisa");

    if (!pesquisa) return;

    pesquisa.addEventListener("input", function () {

        listarHistorico(pesquisa.value);

    });
}

// =====================================
// COMPARTILHAR LINK
// =====================================

function configurarLink() {

    const campo = document.getElementById("linkConferencia");

    if (!campo) return;

    campo.value = new URL(
        "tecnico.html",
        window.location.href
    ).href;
}

async function copiarLink() {

    const campo = document.getElementById("linkConferencia");

    try {

        await navigator.clipboard.writeText(campo.value);

        mostrarMensagem(
            "Link copiado com sucesso!",
            "sucesso"
        );

    } catch (erro) {

        campo.select();

        mostrarMensagem(
            "Selecione e copie o link manualmente.",
            "erro"
        );
    }
}

// =====================================
// INICIALIZAÇÃO DO SISTEMA
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    if (!verificarLogin()) return;

    configurarLogin();

    mostrarData();

    configurarCadastro();

    listarMateriais();

    listarConferencia();

    configurarConferencia();

    listarHistorico();

    configurarPesquisa();

    configurarLink();

});
