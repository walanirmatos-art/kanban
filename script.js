/* =========================================================
1 - HIERARQUIA DAS PRIORIDADES
========================================================= */

const prioridadeNivel = {
    "Urgente": 1,
    "Crítico": 2,
    "Hoje": 3,
    "Amanhã": 4
};

const clientes = {
    "9550":"Fiat",
    "9480":"Renault",
    "9140":"Tenneco",
    "9860":"Volvo",
    "9420":"Iveco",
    "9850":"Scania",
    "9220":"Mercedes",
    "9630":"Whirlpool",
    "9900":"Psa",
    "9990":"Vibracoustic",
    "9310":"Faurencia",
    "9520":"Dayco",
};

let draggedCard = null;

const arquivosPDF = {};

/* =========================================================
MODAL
========================================================= */

function openModal(){
    document.getElementById('modal').style.display = 'flex';
}

function closeModal(){
    document.getElementById('modal').style.display = 'none';
}

/* =========================================================
CRIAR TAREFA
========================================================= */

function criarCardImportado(item){

    const card =
        document.createElement("div");

    card.className =
        `card ${item.prioridade}-card`;

    card.draggable = true;

    card.dataset.id =
        "TASK-" + Date.now();

    card.dataset.codigo =
        item.codigo;

    card.dataset.prioridade =
        item.prioridade;

    card.dataset.quantidade =
        item.quantidade;

    card.dataset.data =
        item.data;

    card.dataset.prazo =
        Date.now() + (12 * 60 * 60 * 1000);

    card.dataset.arquivo =
        item.arquivo;

    card.dataset.estoque31012 =
        item.estoque31012;

    card.dataset.cliente =
        item.cliente;

    card.dataset.posicoes =
         JSON.stringify(item.posicoes || []);

    card.innerHTML = `

    <p>
        <strong>Cliente:</strong>
        ${item.cliente || cliente}
    </p>

    <p>
        <strong>Código:</strong>
        ${item.codigo}
    </p>

    <p>
        <strong>Prioridade:</strong>
        ${item.prioridade}
    </p>

    <p>
        <strong>Quantidade:</strong>

        <span class="quantidade">
            ${item.quantidade}
        </span>
    </p>

    <p>
        <strong>Estoque 3.1012:</strong>
        ${item.estoque31012 || 0}
    </p>

    <p>
        <strong>Data:</strong>
        ${item.data}
    </p>

    <div class="timer"></div>
<div class="acoes-card">

    <button
        class="icon-btn"
        title="Posições"
        onclick='verPosicoes(${JSON.stringify(item.posicoes || [])})'
    >
        📦
    </button>

    <button
        class="icon-btn"
        title="Visualizar PDF"
        onclick="visualizarArquivo('${item.arquivo}')"
    >
        👁
    </button>

</div>

    <div class="mobile-actions">

        <button class="mobile-btn">
            ➜ Próximo
        </button>

    </div>
`;

    iniciarTimer(card);

    addDragEvents(card);

    adicionarAcaoMobile(card);

    document
        .getElementById("col-0")
        .appendChild(card);

    salvarDados();
}

/* =========================================================
FECHAR MODAL AO CLICAR FORA
========================================================= */

window.addEventListener('click',(e)=>{

    const modal =
        document.getElementById('modal');

    if(e.target === modal){
        closeModal();
    }

});

/* =========================================================
BOTÃO MOBILE
========================================================= */

function adicionarAcaoMobile(card){

    const btn = card.querySelector('.mobile-btn');

    btn.addEventListener('click', ()=>{

        const colunaAtual =
            card.closest('.cards').id;

        const numeroAtual =
            parseInt(colunaAtual.split('-')[1]);

        const proxima =
            document.getElementById(`col-${numeroAtual + 1}`);

        if(!proxima){
            return;
        }

        const quantidadeAtual = parseInt(
            card.querySelector('.quantidade').textContent
        );

        const quantidadeFeita = prompt(
            `Quantidade concluída?\nDisponível: ${quantidadeAtual}`
        );

        if(
            quantidadeFeita === null ||
            quantidadeFeita === ""
        ){
            return;
        }

        const feita = parseInt(quantidadeFeita);

        if(isNaN(feita) || feita <= 0){
            alert("Quantidade inválida");
            return;
        }

        if(feita >= quantidadeAtual){

            proxima.appendChild(card);

        }else{

            const clone = card.cloneNode(true);

            clone.dataset.prazo =
                card.dataset.prazo;

           clone.dataset.id =
                draggedCard.dataset.id;
            clone.querySelector('.quantidade')
            .textContent = feita;

            addDragEvents(clone);

            adicionarAcaoMobile(clone);

            proxima.appendChild(clone);

            card.querySelector('.quantidade')
            .textContent =
                quantidadeAtual - feita;

            iniciarTimer(clone);
        }

        salvarDados();
    });

}

/* =========================================================
TIMER
========================================================= */

function iniciarTimer(card){

    if(card.timerInterval){
        clearInterval(card.timerInterval);
    }

    const timerDiv =
        card.querySelector('.timer');

    const prazo =
        parseInt(card.dataset.prazo);

    function atualizarTempo(){

        const restante =
            prazo - Date.now();

        if(restante <= 0){

            timerDiv.innerHTML =
                "⛔ Tempo encerrado";

            clearInterval(card.timerInterval);

            return;
        }

        const horas =
            Math.floor(restante / (1000 * 60 * 60));

        const minutos =
            Math.floor(
                (restante % (1000 * 60 * 60))
                / (1000 * 60)
            );

        const segundos =
            Math.floor(
                (restante % (1000 * 60))
                / 1000
            );

        timerDiv.innerHTML =
            `⏳ ${horas}h ${minutos}m ${segundos}s`;
    }

    atualizarTempo();

    card.timerInterval =
        setInterval(atualizarTempo, 1000);
}

function verPosicoes(posicoes){

    let html = `
        <h2>Posições do Estoque</h2>
    `;

    posicoes.forEach(p => {

        html += `

            <div class="posicao-item">

                <strong>${p.local}</strong>

                <span>
                    ${p.quantidade}
                </span>

            </div>
        `;
    });

    document.getElementById(
        "modalPosicoesConteudo"
    ).innerHTML = html;

    document.getElementById(
        "modalPosicoes"
    ).style.display = "flex";
}

async function processarArquivo(){

    const files =
        document.getElementById("uploadArquivo").files;

    if(files.length === 0){

        alert("Selecione arquivos");

        return;
    }

    for(const file of files){

        const urlPDF =
    URL.createObjectURL(file);

arquivosPDF[file.name] = urlPDF;

        if(file.type !== "application/pdf"){
            continue;
        }

        const arrayBuffer =
            await file.arrayBuffer();

        const pdf =
            await pdfjsLib.getDocument({
                data: arrayBuffer
            }).promise;

        let textoCompleto = "";

        /* =========================
           LÊ TODAS PÁGINAS
        ========================= */

        for(let pagina = 1; pagina <= pdf.numPages; pagina++){

            const page =
                await pdf.getPage(pagina);

            const textContent =
                await page.getTextContent();

            const items =
    textContent.items;

const linhas = {};

items.forEach(item => {

    const y =
        Math.round(item.transform[5]);

    if(!linhas[y]){
        linhas[y] = [];
    }

    linhas[y].push({

        texto: item.str,

        x: item.transform[4]
    });
});

/* ORDENA LINHAS */

Object.keys(linhas)
.forEach(y => {

    linhas[y].sort((a,b)=>a.x - b.x);

    const linhaTexto =
        linhas[y]
        .map(i => i.texto)
        .join(" ");

    textoCompleto +=
        linhaTexto + "\n";
});
        }

        console.log(textoCompleto);

        processarTexto(
            textoCompleto,
            file.name
        );
    }
}

function processarTexto(texto, nomeArquivo){

    const codigos = {};
const regexCodigo =
    /\d{4}\.\d{4}\.\d{2}/g;

    let dataDocumento = "";

    const dataMatch =
        texto.match(/\d{2}\/\d{2}\/\d{4}/);

    if(dataMatch){

        dataDocumento = dataMatch[0];
    }

    /* =========================================
       MELHORA LEITURA PDF SAP
    ========================================= */

    texto = texto
        .replace(/\s+/g, " ")
        .replace(/3\.1012-/g, "\n3.1012-")
        .replace(/(\d{4}\.\d{4}\.\d{2})/g, "\n$1");

    const linhas =
        texto.split("\n");

    let codigoAtual = null;

   linhas.forEach(linha => {

    linha = linha.trim();

    const codigoEncontrado =
        linha.match(regexCodigo);

    if(codigoEncontrado){

        const codigo =
            codigoEncontrado[0];

        codigoAtual = codigo;

        const numeros =
            linha.match(/\d+/g);

        let quantidade = 0;

        if(numeros && numeros.length > 0){

            quantidade =
                parseInt(
                    numeros[numeros.length - 1]
                );
        }

        const prefixo =
            codigo.substring(0,4);

        const cliente =
            clientes[prefixo]
            || "Cliente não identificado";

        if(!codigos[codigo]){

            codigos[codigo] = {

                codigo,

                cliente,

                prioridade: "Hoje",

                quantidade:
                    quantidade,

                estoque31012: 0,

                data: dataDocumento,

                arquivo: nomeArquivo,

                posicoes: []
            };
        }

        return;
    }

    if(
        linha.includes("3.1012")
        &&
        codigoAtual
    ){

        const numeros =
            linha.match(/\d+/g);

        if(!numeros){
            return;
        }

        const quantidadeEstoque =
            parseInt(
                numeros[numeros.length - 1]
            );

        codigos[codigoAtual]
            .estoque31012 +=
                quantidadeEstoque;

        codigos[codigoAtual]
            .posicoes.push({

                local: linha,

                quantidade:
                    quantidadeEstoque
            });
    }

});
    console.log(codigos);

    Object.values(codigos)
    .forEach(item => {

        criarCardImportado(item);
    });
}


function visualizarArquivo(nomeArquivo){

    const url =
        arquivosPDF[nomeArquivo];

    if(!url){

        alert(
            "PDF não está mais carregado.\nImporte o arquivo novamente."
        );

        return;
    }

    const modal =
        document.getElementById("pdfModal");

    const frame =
        document.getElementById("pdfFrame");

    frame.src = url;

    modal.style.display = "block";
}

function fecharPDF(){

    document.getElementById("pdfModal")
    .style.display = "none";

    document.getElementById("pdfFrame")
    .src = "";
}

function verPosicoes(posicoes){

    let html = `
        <h2>Posições do Estoque</h2>
    `;

    posicoes.forEach(p => {

        html += `

            <div class="posicao-item">

                <strong>${p.local}</strong>

                <span>
                    ${p.quantidade}
                </span>

            </div>
        `;
    });

    document.getElementById(
        "modalPosicoesConteudo"
    ).innerHTML = html;

    document.getElementById(
        "modalPosicoes"
    ).style.display = "flex";
}

/* =========================================================
DRAG E DROP
========================================================= */


function addDragEvents(card){

    card.setAttribute("draggable", true);

    card.addEventListener('dragstart', (e) => {

        draggedCard = card;

        e.dataTransfer.setData(
            "text/plain",
            card.dataset.id
        );

        e.dataTransfer.effectAllowed = "move";

        card.classList.add("dragging");

        console.log("🟢 drag iniciado");

    });

    card.addEventListener('dragend', () => {

        card.classList.remove("dragging");

        draggedCard = null;

        console.log("🔴 drag finalizado");

    });

}



/* =========================================================
ATIVAR DRAG NAS COLUNAS
========================================================= */

function ativarColunas(){

    const columns =
        document.querySelectorAll('.cards');

    columns.forEach(column => {

        column.addEventListener('dragover', (e)=>{

            e.preventDefault();


             console.log("🟦 dragover");

            e.dataTransfer.dropEffect = "move";

        });

        column.addEventListener('dragenter', (e)=>{

            e.preventDefault();

            column.classList.add("drag-over");

        });

        column.addEventListener('dragleave', ()=>{

            column.classList.remove("drag-over");

        });

        column.addEventListener('mouseenter', ()=>{

           console.log("🟦 entrou coluna");

});

        column.addEventListener('drop', (e)=>{

            e.preventDefault();

            column.classList.remove("drag-over");

            if(!draggedCard){

                console.log("❌ draggedCard null");

                return;
            }

            console.log("📥 DROP OK");

            const quantidadeAtual = parseInt(
                draggedCard.querySelector('.quantidade').textContent
            );

            const quantidadeFeita = prompt(
                `Quantidade concluída?\nDisponível: ${quantidadeAtual}`
            );

            if(
                quantidadeFeita === null ||
                quantidadeFeita === ""
            ){
                return;
            }

            const feita =
                parseInt(quantidadeFeita);

            if(isNaN(feita) || feita <= 0){

                alert("Quantidade inválida");

                return;
            }

            /* MOVE COMPLETO */

            if(feita >= quantidadeAtual){

                column.appendChild(draggedCard);

            }else{

                const clone =
                    draggedCard.cloneNode(true);

                clone.dataset.id =
                    "TASK-" + Date.now();

                clone.querySelector('.quantidade')
                .textContent = feita;

                clone.dataset.quantidade =
                    feita;

                addDragEvents(clone);

                adicionarAcaoMobile(clone);

                iniciarTimer(clone);

                column.appendChild(clone);

                const restante =
                    quantidadeAtual - feita;

                draggedCard.querySelector('.quantidade')
                .textContent = restante;

                draggedCard.dataset.quantidade =
                    restante;
            }

            unirCardsDuplicados(column);

            ordenarColuna(column);

            salvarDados();

            draggedCard = null;

        });

    });

}

    

/* =========================================================
LIXEIRA
========================================================= */

const trash = document.getElementById('trash');

trash.addEventListener('dragover', (e)=>{

    e.preventDefault();

    trash.classList.add('hover');

});

trash.addEventListener('dragleave', ()=>{

    trash.classList.remove('hover');

});

trash.addEventListener('drop', (e)=>{

    e.preventDefault();

    if(!draggedCard) return;

    const confirmar = confirm(
        "Deseja apagar esta tarefa?"
    );

    if(confirmar){

        draggedCard.remove();

        salvarDados();

    }

    trash.classList.remove('hover');

    draggedCard = null;

});


function limparTodosCards(){

    const confirmar = confirm(

        "Deseja apagar TODOS os cards?"
    );

    if(!confirmar){
        return;
    }

    /* REMOVE CARDS */

    document
        .querySelectorAll('.card')
        .forEach(card => {

            if(card.timerInterval){

                clearInterval(
                    card.timerInterval
                );
            }

            card.remove();
        });

    /* LIMPA STORAGE */

    localStorage.removeItem(
        "kanban_tarefas"
    );

    /* LIMPA PDFs */

    for(const nome in arquivosPDF){

        URL.revokeObjectURL(
            arquivosPDF[nome]
        );
    }

    Object.keys(arquivosPDF)
    .forEach(key => {

        delete arquivosPDF[key];
    });

    alert("Todos os cards foram removidos");
}

/* =========================================================
RELATÓRIO
========================================================= */

function abrirRelatorio(){

    const tbody =
        document.getElementById('relatorioBody');

    tbody.innerHTML = "";

    const cards =
        document.querySelectorAll('.card');

    if(cards.length === 0){

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhuma tarefa encontrada
                </td>
            </tr>
        `;
    }

    cards.forEach(card => {

        const codigo =
         card.dataset.codigo +
    "_" +
    card.dataset.prioridade;

        const prioridade =
            card.dataset.prioridade;

        const quantidade =
            card.querySelector('.quantidade')
            .textContent;

        const data =
            card.dataset.data;

        const coluna =
            card.closest('.column')
            .querySelector('h2')
            .textContent;

        tbody.innerHTML += `
            <tr>
                <td>${codigo}</td>
                <td>${prioridade}</td>
                <td>${quantidade}</td>
                <td>${coluna}</td>
                <td>${data}</td>
            </tr>
        `;
    });

    document.getElementById('relatorioModal')
    .style.display = 'flex';
}

function fecharRelatorio(){

    document.getElementById('relatorioModal')
    .style.display = 'none';
}

/* =========================================================
ORDENAR
========================================================= */

function ordenarColuna(coluna){

    const cards =
        Array.from(coluna.querySelectorAll('.card'));

    cards.sort((a,b)=>{

        return (
            prioridadeNivel[a.dataset.prioridade]
            -
            prioridadeNivel[b.dataset.prioridade]
        );

    });

    cards.forEach(card=>{
        coluna.appendChild(card);
    });
}

/* =========================================================
UNIR DUPLICADOS
========================================================= */

function unirCardsDuplicados(coluna){

    const cards =
        Array.from(
            coluna.querySelectorAll('.card')
        );

    const mapa = {};

    cards.forEach(card => {

        const codigo =
            card.dataset.codigo;

        const quantidade = parseInt(
            card.querySelector('.quantidade')
            .textContent
        );

        if(!mapa[codigo]){

            mapa[codigo] = card;

        }else{

            const cardExistente =
                mapa[codigo];

            const qtdAtual = parseInt(
                cardExistente.querySelector('.quantidade')
                .textContent
            );

            const total =
                qtdAtual + quantidade;

            cardExistente.querySelector('.quantidade')
            .textContent = total;

            cardExistente.dataset.quantidade =
                total;

            card.remove();
        }

    });

    ordenarColuna(coluna);

    salvarDados();
}

/* =========================================================
SALVAR
========================================================= */

function salvarDados(){

    const tarefas = [];

    document.querySelectorAll('.card').forEach(card => {

        tarefas.push({

    id: card.dataset.id,

    codigo: card.dataset.codigo,

    prioridade: card.dataset.prioridade,

    quantidade:
        card.querySelector('.quantidade').textContent,

    data: card.dataset.data,

    prazo: card.dataset.prazo,

    coluna: card.closest('.cards').id,

    arquivo:
        card.dataset.arquivo || "",

    estoque31012:
        card.dataset.estoque31012 || 0,

    cliente:
        card.dataset.cliente || "",

    posicoes:
        JSON.parse(card.dataset.posicoes || "[]")
});

    });

    localStorage.setItem(
        "kanban_tarefas",
        JSON.stringify(tarefas)
    );

    console.log("💾 salvo");
}

/* =========================================================
CARREGAR
========================================================= */

function carregarDados(){

    const dados =
        JSON.parse(
            localStorage.getItem("kanban_tarefas")
        );

    if(!dados) return;

    document.querySelectorAll('.cards')
    .forEach(c => c.innerHTML = "");

    dados.forEach(item => {

        const card =
            document.createElement('div');

        card.className =
    `card ${item.prioridade}-card`;

        card.draggable = true;

        card.dataset.id = item.id;
        card.dataset.codigo = item.codigo;
        card.dataset.prioridade = item.prioridade;
        card.dataset.quantidade = item.quantidade;
        card.dataset.data = item.data;
        card.dataset.prazo = item.prazo;

        const cliente =
            clientes[item.codigo.substring(0,4)]
            || "Cliente não identificado";

        card.innerHTML = `
            <p>
                <strong>Cliente:</strong>
                <span class="cliente">${cliente}</span>
            </p>

            <p>
                <strong>Código:</strong>
                ${item.codigo}
            </p>

            <p>
                <strong>Prioridade:</strong>
                ${item.prioridade}
            </p>

            <p>
                <strong>Quantidade:</strong>
                <span class="quantidade">${item.quantidade}</span>
            </p>

            <p>
                <strong>Data:</strong>
                ${item.data}
            </p>

            <div class="timer"></div>

            <div class="mobile-actions">
                <button class="mobile-btn">
                    ➜ Próximo
                </button>
            </div>
        `;

        iniciarTimer(card);

        addDragEvents(card);

        adicionarAcaoMobile(card);

        const coluna =
            document.getElementById(item.coluna);

        if(coluna){
            coluna.appendChild(card);
        }

    });

    console.log("📦 dados carregados");
}

/* =========================================================
LIMPAR FORMULÁRIO
========================================================= */

function limparFormulario(){

    document.getElementById('codigo').value = "";
    document.getElementById('prioridade').value = "Urgente";
    document.getElementById('quantidade').value = "";
    document.getElementById('tempo').value = "";
    document.getElementById('data').value = "";
}

/* =========================================================
SCROLL
========================================================= */

function restaurarScroll(){

    const y =
        localStorage.getItem("kanban_scroll_y");

    if(y){
        window.scrollTo(0, parseInt(y));
    }
}

window.addEventListener('scroll', () => {

    localStorage.setItem(
        'kanban_scroll_y',
        window.scrollY
    );

});

/* =========================================================
INICIAR
========================================================= */

window.addEventListener('DOMContentLoaded', ()=>{

    const hoje = new Date();

    const dia =
        String(hoje.getDate()).padStart(2,'0');

    const mes =
        String(hoje.getMonth() + 1).padStart(2,'0');

    const ano =
        hoje.getFullYear();

    const dataBrasil =
        `${dia}/${mes}/${ano}`;

    document.getElementById('data').value =
        dataBrasil;

    ativarColunas();

    carregarDados();

    restaurarScroll();

    console.log("🚀 Sistema iniciado");

});
/* =========================================================
CRIAR TAREFA MANUAL
========================================================= */

function createTask(){

    const codigo =
        document.getElementById('codigo').value;

    const prioridade =
        document.getElementById('prioridade').value;

    const quantidade =
        document.getElementById('quantidade').value;

    const tempo =
        document.getElementById('tempo').value;

    let data =
    document.getElementById('data').value;

if(!data){

    data = new Date()
    .toLocaleDateString('pt-BR');
}

    if(!codigo || !quantidade){

        alert("Preencha os campos obrigatórios");

        return;
    }

    const cliente =
        clientes[codigo.substring(0,4)]
        || "Cliente não identificado";

    const card =
        document.createElement("div");

    card.className =
        `card ${prioridade}-card`;

    card.draggable = true;

    card.dataset.id =
        "TASK-" + Date.now();

    card.dataset.codigo =
        codigo;

    card.dataset.prioridade =
        prioridade;

    card.dataset.quantidade =
        quantidade;

    card.dataset.data =
        data;

    card.dataset.prazo =
        Date.now() + (
            (parseInt(tempo) || 12)
            * 60 * 60 * 1000
        );

    card.innerHTML = `

        <p>
            <strong>Cliente:</strong>
            ${cliente}
        </p>

        <p>
            <strong>Código:</strong>
            ${codigo}
        </p>

        <p>
            <strong>Prioridade:</strong>
            ${prioridade}
        </p>

        <p>
            <strong>Quantidade:</strong>

            <span class="quantidade">
                ${quantidade}
            </span>
        </p>

        <p>
            <strong>Data:</strong>
            ${data}
        </p>

        <div class="timer"></div>

        <div class="mobile-actions">

            <button class="mobile-btn">
                ➜ Próximo
            </button>

        </div>
    `;

    iniciarTimer(card);

    addDragEvents(card);

    adicionarAcaoMobile(card);

    document
        .getElementById("col-0")
        .appendChild(card);

    ordenarColuna(
        document.getElementById("col-0")
    );

    salvarDados();

    limparFormulario();

    closeModal();

    console.log("✅ tarefa criada");
}