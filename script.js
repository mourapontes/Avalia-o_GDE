// Seletores de elementos do DOM
const form = document.getElementById('formAvaliacao');
const tipoSelect = document.getElementById('tipo');
const divFormularios = document.getElementById('formularios');
const resultadoDiv = document.getElementById('resultado');
const resultadoContent = document.getElementById('resultado-content');
const btnCalcular = document.getElementById('btn-calcular');
const btnPdf = document.getElementById('btn-pdf');
const btnReiniciar = document.getElementById('btn-reiniciar');
const groupModalidade = document.getElementById('group-modalidade');
let dadosCalculados = null;

// Constantes de critérios
const criteriosDesempenhoDocente = ["1. Assiduidade", "2. Pontualidade", "3. Plano de Trabalho Pedagógico", "4. Respeito e Urbanidade", "5. Comunicação com Coordenação", "6. Registro no Diário de Classe", "7. Cumprimento de Atividades"];
const criteriosDesempenhoNaoDocente = ["1. Assiduidade", "2. Pontualidade", "3. Cumprimento de Atividades", "4. Respeito e Urbanidade"];
const opcoesPadrao = [{ texto: "(4) Excelente / Sempre", valor: 4 }, { texto: "(3) Bom", valor: 3 }, { texto: "(2) Regular", valor: 2 }, { texto: "(1) Ruim", valor: 1 }, { texto: "(0) Insatisfatório", valor: 0 }];
const criteriosMetas = ["1. Avaliação da Educação Infantil", "2. Avaliação de Língua Portuguesa", "3. Avaliação de Matemática"];
const criteriosFormacaoDocente = ["1. Participação no Planejamento Pedagógico", "2. Participação na Jornada Pedagógica"];
const criteriosFormacaoNaoDocente = ["1. PARTICIPA DE FORMAÇÃO CONTINUADA OFERTADA PELO MUNICÍPIO"];
const opcoesFormacaoNaoDocente = [
  { texto: "(10) Não possui faltas", valor: 10 },
  { texto: "(7) De 1 (uma) a 2 (duas) faltas", valor: 7 },
  { texto: "(5) De 3 (três) a 4 (quatro) faltas", valor: 5 },
  { texto: "(3) De 5 (cinco) a 6 (seis) faltas", valor: 3 },
  { texto: "(0) Acima de 6 (seis) faltas", valor: 0 }
];

// Funções do aplicativo
function carregarFormulario() {
  const tipo = tipoSelect.value;
  divFormularios.innerHTML = "";
  resultadoDiv.style.display = 'none';
  if (!tipo) {
    divFormularios.style.display = "none";
    groupModalidade.style.display = "none";
    return;
  }
  groupModalidade.style.display = "block";
  if (tipo === 'docente') {
    adicionarGrupo("desempenho", "Critérios de Desempenho", criteriosDesempenhoDocente, opcoesPadrao);
    adicionarGrupo("formacao", "Critérios de Formação", criteriosFormacaoDocente, opcoesPadrao);
  } else if (tipo === 'nao_docente') {
    adicionarGrupo("desempenho", "Critérios de Desempenho", criteriosDesempenhoNaoDocente, opcoesPadrao);
    adicionarGrupo("formacao", "Formação e Capacitação", criteriosFormacaoNaoDocente, opcoesFormacaoNaoDocente);
  }
  adicionarGrupo("metas", "Metas", criteriosMetas, opcoesPadrao);
}

function adicionarGrupo(grupo, tituloText, lista, opcoes) {
  const titulo = document.createElement("h3");
  titulo.textContent = tituloText;
  divFormularios.appendChild(titulo);
  lista.forEach((criterio, i) => {
    const grupoDiv = document.createElement("div");
    grupoDiv.className = "form-group";
    const label = document.createElement("label");
    label.innerText = criterio;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    
    const select = document.createElement("select");
    select.name = `${grupo}_${i}`;
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.innerText = "-- Avalie --";
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    select.appendChild(defaultOpt);
    opcoes.forEach(opcao => {
      const opt = document.createElement("option");
      opt.value = opcao.valor;
      opt.innerText = opcao.texto;
      select.appendChild(opt);
    });
    
    wrapper.appendChild(select);
    grupoDiv.appendChild(label);
    grupoDiv.appendChild(wrapper);
    divFormularios.appendChild(grupoDiv);
  });
}

function calcular() {
  const nome = document.getElementById("nome").value;
  const cargo = document.getElementById("cargo").value;
  const tipo = tipoSelect.value;
  const modalidade = document.getElementById("modalidade").value;
  
  if (!nome || !cargo || !tipo || !modalidade) {
    alert("Todos os campos de identificação são obrigatórios.");
    return;
  }
  
  const desempenhoSoma = somarValores("desempenho_");
  const formacaoSoma = somarValores("formacao_");
  let notaDesempenho, notaFormacao;

  if (tipo === 'docente') {
    notaDesempenho = (desempenhoSoma / 2.8).toFixed(2);
    notaFormacao = ((formacaoSoma / 8) * 10).toFixed(2);
  } else {
    notaDesempenho = (desempenhoSoma / 1.6).toFixed(2);
    notaFormacao = formacaoSoma.toFixed(2);
  }
  
  const metasValores = [];
  document.querySelectorAll("select[name^='metas_']").forEach(s => metasValores.push(parseInt(s.value) || 0));
  let notaMetasCalculada = 0;
  if (modalidade === "infantil") notaMetasCalculada = metasValores[0] * 2.5;
  else if (modalidade === "fundamental") notaMetasCalculada = (metasValores[1] + metasValores[2]) * 1.25;
  else if (modalidade === "ambas") notaMetasCalculada = (metasValores[0] + metasValores[1] + metasValores[2]) * (10 / 12);
  const notaMetas = notaMetasCalculada.toFixed(2);
  
  dadosCalculados = { nome, cargo, notaDesempenho, notaFormacao, notaMetas };
  
  resultadoContent.innerHTML = `<strong>${nome}</strong> - ${cargo}<br>
    Nota Desempenho: <strong>${notaDesempenho}</strong><br>
    Nota Formação: <strong>${notaFormacao}</strong><br>
    Nota Metas: <strong>${notaMetas}</strong>`;
  resultadoDiv.style.display = "block";
  btnPdf.disabled = false;
}

function somarValores(prefixo) {
  let total = 0;
  document.querySelectorAll(`select[name^='${prefixo}']`).forEach(sel => total += parseInt(sel.value) || 0);
  return total;
}

function gerarPDF() {
    if (!dadosCalculados) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Cabeçalho Oficial
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Prefeitura Municipal de Cristino Castro-PI", pageW / 2, 20, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Comissão de Avaliação de Desempenho", pageW / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text("Lei Municipal Nº 266/2025", pageW / 2, 36, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(20, 45, pageW - 20, 45);

    // Título e dados
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Relatório de Avaliação de Desempenho GDE", pageW / 2, 55, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const yInicialCorpo = 70;
    doc.text(`Servidor: ${dadosCalculados.nome}`, 20, yInicialCorpo);
    doc.text(`Cargo/Função: ${dadosCalculados.cargo}`, 20, yInicialCorpo + 10);
    const agora = new Date();
    const dataHoraFormatada = agora.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(`Gerado em: ${dataHoraFormatada}`, pageW - 20, yInicialCorpo + 10, { align: 'right' });

    // Quadro de Notas
    const tableX = 20, tableY = yInicialCorpo + 25;
    const col1Width = 130, col2Width = 40, rowHeight = 10, tableWidth = col1Width + col2Width;
    const notesData = [
        { criterio: "Nota Desempenho", nota: dadosCalculados.notaDesempenho },
        { criterio: "Nota Formação", nota: dadosCalculados.notaFormacao },
        { criterio: "Nota Metas", nota: dadosCalculados.notaMetas }
    ];
    doc.setFillColor(230, 230, 230);
    doc.rect(tableX, tableY, tableWidth, rowHeight, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Critério de Avaliação", tableX + 5, tableY + 7);
    doc.text("Nota", tableX + col1Width + (col2Width / 2), tableY + 7, { align: 'center' });
    doc.setFont("helvetica", "normal");
    notesData.forEach((item, index) => {
        const currentY = tableY + (index + 1) * rowHeight;
        doc.rect(tableX, currentY, col1Width, rowHeight);
        doc.rect(tableX + col1Width, currentY, col2Width, rowHeight);
        doc.text(item.criterio, tableX + 5, currentY + 7);
        doc.text(item.nota, tableX + col1Width + (col2Width / 2), currentY + 7, { align: 'center' });
    });

    // Assinaturas
    let yAtual = tableY + (notesData.length + 1) * rowHeight + 25;
    const espacoEntreAssinaturas = 20, larguraLinha = 80;
    const x1 = (pageW - larguraLinha) / 2, x2 = x1 + larguraLinha;
    doc.setFontSize(10);
    for (let i = 0; i < 5; i++) {
        if (yAtual > 270) { doc.addPage(); yAtual = 30; }
        doc.line(x1, yAtual, x2, yAtual);
        doc.text("Membro da Comissão", pageW / 2, yAtual + 5, { align: 'center' });
        yAtual += espacoEntreAssinaturas;
    }
    
    doc.save(`avaliacao_gde_${dadosCalculados.nome.replace(/\s+/g, '_')}.pdf`);
}

function reiniciarForm() {
  form.reset();
  divFormularios.innerHTML = "";
  groupModalidade.style.display = "none";
  resultadoDiv.style.display = "none";
  btnPdf.disabled = true;
  dadosCalculados = null;
  document.querySelectorAll('select').forEach(sel => sel.classList.remove('select-green', 'select-yellow', 'select-red'));
}

function atualizarCorSelect(selectElement) {
  const valor = parseInt(selectElement.value, 10);
  selectElement.classList.remove('select-green', 'select-yellow', 'select-red');
  const maxValor = Array.from(selectElement.options).reduce((max, opt) => Math.max(max, parseInt(opt.value) || 0), 0);
  if (maxValor > 4) {
    if (valor >= 7) selectElement.classList.add('select-green');
    else if (valor >= 3) selectElement.classList.add('select-yellow');
    else selectElement.classList.add('select-red');
  } else {
    if (valor >= 3) selectElement.classList.add('select-green');
    else if (valor === 2) selectElement.classList.add('select-yellow');
    else selectElement.classList.add('select-red');
  }
}

// Event Listeners
tipoSelect.addEventListener('change', carregarFormulario);
btnCalcular.addEventListener('click', calcular);
btnPdf.addEventListener('click', gerarPDF);
btnReiniciar.addEventListener('click', reiniciarForm);
form.addEventListener('change', (e) => {
  btnPdf.disabled = true;
  if (e.target.tagName === 'SELECT' && e.target.value !== "") {
    atualizarCorSelect(e.target);
  }
});
