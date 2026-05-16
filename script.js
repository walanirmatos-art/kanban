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

const columns = document.querySelectorAll('.cards');

let draggedCard = null;

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

function createTask(){

    const codigoInput = document.getElementById('codigo');
    const prioridadeInput = document.getElementById('prioridade');
    const quantidadeInput = document.getElementById('quantidade');
    const tempoInput = document.getElementById('tempo');

    const codigo = codigoInput.value.trim();

    /* CORRIGIDO */
    const prioridade = prioridadeInput.value.trim();

    const quantidade = parseInt(quantidadeInput.value);
    const tempo = parseInt(tempoInput.value);

    /* VALIDAÇÕES */

    if(codigo === ""){
        alert("Digite o código");
        return;
    }

    if(isNaN(quantidade) || quantidade <= 0){
        alert("Quantidade inválida");
        return;
    }

    if(isNaN(tempo) || tempo <= 0){
        alert("Tempo inválido");
        return;
    }

    const data = new Date().toLocaleDateString('pt-BR');

    const prefixo = codigo.substring(0,4);

    const cliente =
        clientes[prefixo] || "Cliente não identificado";

    const prazo =
        Date.now() + (tempo * 60 * 1000);

    const taskId =
        "TASK-" + Date.now();

    /* =====================================================
    PROCURA DUPLICADO
    ===================================================== */

    const cards =
        document.querySelectorAll('#col-0 .card');

    let existente = null;

    cards.forEach(card => {

        if(card.dataset.codigo === codigo){
            existente = card;
        }

    });

    /* =====================================================
    SE EXISTIR
    ===================================================== */

    if(existente){

        const qtdAtual = parseInt(
            existente.querySelector('.quantidade').textContent
        );

        const total = qtdAtual + quantidade;

        existente.querySelector('.quantidade').textContent = total;

        existente.dataset.quantidade = total;

        ordenarColuna(
            document.getElementById('col-0')
        );

        salvarDados();

        closeModal();

        limparFormulario();

        return;
    }

    /* =====================================================
    CRIA CARD
    ===================================================== */

    const card = document.createElement('div');

    card.classList.add('card');

    /* PRIORIDADE */

    if(prioridade === "Urgente"){
        card.classList.add('Urgente-card');
    }

    if(prioridade === "Crítico"){
        card.classList.add('Crítico-card');
    }

    if(prioridade === "Hoje"){
        card.classList.add('Hoje-card');
    }

    if(prioridade === "Amanhã"){
        card.classList.add('Amanhã-card');
    }

    card.draggable = true;

    card.dataset.id = taskId;
    card.dataset.codigo = codigo;
    card.dataset.prioridade = prioridade;
    card.dataset.quantidade = quantidade;
    card.dataset.data = data;
    card.dataset.prazo = prazo;

    card.innerHTML = `
        <p>
            <strong>Cliente:</strong>
            <span class="cliente">${cliente}</span>
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
            <span class="quantidade">${quantidade}</span>
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

    const colunaInicial =
        document.getElementById('col-0');

    colunaInicial.appendChild(card);

    ordenarColuna(colunaInicial);

    salvarDados();

    closeModal();

    limparFormulario();
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
                card.dataset.id;

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

/* =========================================================
DRAG E DROP
========================================================= */
function addDragEvents(card){

    card.addEventListener('dragstart', () => {

        draggedCard = card;

        card.classList.add("dragging");

    });

    card.addEventListener('dragend', () => {

        card.classList.remove("dragging");

        draggedCard = null;

    });

}

columns.forEach(column => {

    column.addEventListener('dragover', (e)=>{

        e.preventDefault();

    });

    column.addEventListener('drop', (e)=>{

        e.preventDefault();

        if(!draggedCard) return;

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

        const feita = parseInt(quantidadeFeita);

        if(isNaN(feita) || feita <= 0){

            alert("Quantidade inválida");

            return;
        }

        /* MOVE COMPLETO */

        if(feita >= quantidadeAtual){

            column.appendChild(draggedCard);

            unirCardsDuplicados(column);

        }else{

            /* CLONA */

            const clone =
                draggedCard.cloneNode(true);

            clone.dataset.prazo =
                draggedCard.dataset.prazo;

            clone.dataset.id =
                draggedCard.dataset.id;

            clone.querySelector('.quantidade')
            .textContent = feita;

            addDragEvents(clone);

            adicionarAcaoMobile(clone);

            iniciarTimer(clone);

            column.appendChild(clone);

            unirCardsDuplicados(column);

            /* SOBRA */

            draggedCard.querySelector('.quantidade')
            .textContent =
                quantidadeAtual - feita;
        }

        ordenarColuna(column);

        salvarDados();

        draggedCard = null;

    });

});

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
            card.dataset.codigo;

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
        Array.from(coluna.querySelectorAll('.card'));

    const mapa = {};

    cards.forEach(card=>{

        const id = card.dataset.id;

        const quantidade = parseInt(
            card.querySelector('.quantidade').textContent
        );

        if(!mapa[id]){

            mapa[id] = card;

        }else{

            const cardExistente = mapa[id];

            const qtdAtual = parseInt(
                cardExistente.querySelector('.quantidade').textContent
            );

            const total =
                qtdAtual + quantidade;

            cardExistente.querySelector('.quantidade')
            .textContent = total;

            cardExistente.dataset.quantidade = total;

            card.remove();
        }

    });

    ordenarColuna(coluna);
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
            quantidade: card.querySelector('.quantidade').textContent,
            data: card.dataset.data,
            prazo: card.dataset.prazo,
            coluna: card.closest('.cards').id
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

        card.className = "card";

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

    carregarDados();

    restaurarScroll();

    console.log("🚀 Sistema iniciado");

});
