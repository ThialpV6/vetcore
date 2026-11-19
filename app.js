// ============================================================================
// VETCORE — CLINICAL PRECISION ENGINE (app.js — FASE 1 CONSOLIDADA)
// Arquitetura limpa, sem patches empilhados, 100% compatível com database.js
// ============================================================================

const KEY_PACIENTES  = "vetcore_pacientes_v2";
const KEY_SINAIS_USR = "vetcore_sinais_custom_v2";
const KEY_LIVROS_USR = "vetcore_livros_custom_v2";
const KEY_EMITENTE   = "vetcore_emitente_v2";
const KEY_DRIVE_URL  = "vetcore_drive_pdfs_url";
const KEY_THEME      = "vetcore_theme_v1";

const VETCORE_CLOUD_CONFIG = {
  aiWorkerEndpoint: "https://vetcore-ia.jp-resende-po.workers.dev",
  firebaseConfig: {
    apiKey: "AIzaSyD4ihHNFLbv8s2VYl6-cPLrOyUNceXBSw4",
    authDomain: "vetcore-4ff31.firebaseapp.com",
    projectId: "vetcore-4ff31",
    storageBucket: "vetcore-4ff31.firebasestorage.app",
    messagingSenderId: "200227006483",
    appId: "1:200227006483:web:f8f642ceea34ff898477e6",
    measurementId: "G-K9Y02EP0DF"
  }
};

// Estado Global
let unidPeso = "kg";
let sinaisAtivos = new Set();
let pesoMagroManual = 0;
let modoCriNovato = true;
let tipoBombaComb = "FLK";
let modoDocAtual = "receita";
let itensReceitaAtual = [];
let pacienteAtualId = null;
let filtroPrescAtivo = "todos";
let fichaFarmacoIdxAtual = 0;
let fichaAbaAtiva = "posologia";
let fichaFiltroStatus = "todos";
let pacientesSalvos = JSON.parse(localStorage.getItem(KEY_PACIENTES) || "[]");
let firebaseUserAtual = null;
let firestoreDb = null;

// Carregar Sinais e Livros Customizados do Usuário
try {
  const sigCustom = JSON.parse(localStorage.getItem(KEY_SINAIS_USR) || "{}");
  Object.assign(SINAIS_DB, sigCustom);
  const bkCustom = JSON.parse(localStorage.getItem(KEY_LIVROS_USR) || "[]");
  bkCustom.forEach(b => CATALOGO_LIVROS.unshift(b));
} catch (e) {}

// ============================================================================
// UTILITÁRIOS DE UI: TEMA, TOASTS, SANITIZAÇÃO & FORMATAÇÃO
// ============================================================================

function limparEmoji(str) {
  return (str || "")
    .replace(/^[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\s]+/u, "")
    .trim();
}

function normalizarTextoBusca(str) {
  return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(msg, tipo = "info") {
  const cont = document.getElementById("vc-toast-container");
  if (!cont) return;
  const el = document.createElement("div");
  el.className = `vc-toast vc-toast-${tipo}`;
  el.textContent = msg;
  cont.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    el.style.transition = "all 0.2s ease";
    setTimeout(() => el.remove(), 220);
  }, 3000);
}

function aplicarTema(tema) {
  const t = tema === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem(KEY_THEME, t);
  const meta = document.getElementById("meta-theme-color");
  if (meta) meta.setAttribute("content", t === "light" ? "#F4F6F9" : "#000000");
  document.getElementById("ico-tema-sol")?.classList.toggle("hidden", t !== "dark");
  document.getElementById("ico-tema-lua")?.classList.toggle("hidden", t !== "light");
}

function alternarTemaVetCore() {
  const atual = document.documentElement.getAttribute("data-theme") || "dark";
  const proximo = atual === "dark" ? "light" : "dark";
  aplicarTema(proximo);
  showToast(proximo === "light" ? "Modo Claro ativado" : "Modo Escuro AMOLED ativado", "info");
}

function corSemanticaClasse(cor) {
  const mapa = {
    rose: "danger",
    amber: "warn",
    emerald: "ok",
    teal: "accent",
    blue: "info",
    purple: "purple"
  };
  return mapa[cor] || "accent";
}

// ============================================================================
// INICIALIZAÇÃO ÚNICA & FIREBASE AUTH/FIRESTORE
// ============================================================================

function initFirebaseVetCore() {
  try {
    if (typeof firebase === "undefined" || !VETCORE_CLOUD_CONFIG.firebaseConfig.apiKey) return;
    if (!firebase.apps.length) {
      firebase.initializeApp(VETCORE_CLOUD_CONFIG.firebaseConfig);
    }
    firestoreDb = firebase.firestore();
    firebase.auth().onAuthStateChanged(async (user) => {
      firebaseUserAtual = user || null;
      atualizarUIConta(firebaseUserAtual);
      if (user) await baixarDadosDaNuvem(user.uid);
    });
  } catch (e) {}
}

function initVetCore() {
  aplicarTema(localStorage.getItem(KEY_THEME) || "dark");

  const selTax = document.getElementById("g-tax");
  if (selTax) {
    selTax.innerHTML = TAXONS_DB.map((t, i) => `<option value="${i}">${limparEmoji(t.nome)}</option>`).join("");
    selTax.value = "1";
  }

  const emit = JSON.parse(localStorage.getItem(KEY_EMITENTE) || "{}");
  if (emit.nome && document.getElementById("emit-nome")) document.getElementById("emit-nome").value = emit.nome;
  if (emit.crmv && document.getElementById("emit-crmv")) document.getElementById("emit-crmv").value = emit.crmv;
  if (emit.end  && document.getElementById("emit-end"))  document.getElementById("emit-end").value  = emit.end;

  popularSeletorFarmacosReceita();
  popularPillsCalculadoras();
  popularPresetsUI();
  atualizarListaPacientesSalvos();
  trocarGrupoTaxonomico();
  renderBularioCompleto();
  renderCatalogoLivros();
  calcularMCGS();
  calcularFGS();
  calcularCMPS();
  converterUIUniversal();
  initFirebaseVetCore();
}

// ============================================================================
// NAVEGAÇÃO, SHEETS & BUSCA GLOBAL (COMMAND BAR)
// ============================================================================

function mudarAba(aba) {
  document.querySelectorAll(".tab-view").forEach(s => s.classList.add("hidden"));
  document.getElementById(`tab-${aba}`)?.classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.target === aba);
  });
  window.scrollTo(0, 0);
}

function alternarSubProntuario(qual) {
  ["resumo", "clinico", "ia", "prescricao"].forEach(k => {
    document.getElementById(`subp-${k}`)?.classList.toggle("hidden", k !== qual);
    document.getElementById(`subp-btn-${k}`)?.classList.toggle("active", k === qual);
  });
  if (qual === "ia") atualizarResumoContextoIA();
  if (qual === "prescricao") renderListaPrescricaoFiltrada();
  window.scrollTo(0, 0);
}

function abrirSheetPaciente() {
  document.getElementById("sheet-paciente")?.classList.remove("hidden");
}

function fecharSheetPaciente() {
  document.getElementById("sheet-paciente")?.classList.add("hidden");
}

function abrirBuscaGlobal() {
  const modal = document.getElementById("modal-busca-global");
  const inp = document.getElementById("input-busca-global");
  if (!modal) return;
  modal.classList.remove("hidden");
  if (inp) {
    inp.value = "";
    setTimeout(() => inp.focus(), 60);
  }
  executarBuscaGlobal();
}

function fecharBuscaGlobal() {
  document.getElementById("modal-busca-global")?.classList.add("hidden");
}

function executarBuscaGlobal() {
  const box = document.getElementById("resultados-busca-global");
  if (!box) return;
  const termo = normalizarTextoBusca(document.getElementById("input-busca-global")?.value || "");
  const resultados = [];

  // 1. Ferramentas e Escalas
  const ferramentas = [
    { titulo: "Calculadora Livre de Doses (mg / µg)", sub: "Aba Cálculos", tag: "Ferramenta", acao: () => { mudarAba("calc"); alternarSubCalc("doses"); } },
    { titulo: "Calculadora & Conversor Universal de UI", sub: "UI/kg para mL e UI para mg/µg", tag: "Ferramenta", acao: () => { mudarAba("calc"); alternarSubCalc("doses"); } },
    { titulo: "Infusão Contínua (CRI) & Bombas FLK / MLK / FK", sub: "Aba Cálculos", tag: "Ferramenta", acao: () => { mudarAba("calc"); alternarSubCalc("cri"); } },
    { titulo: "Protocolos de Sedação da Espécie", sub: "Aba Cálculos", tag: "Protocolo", acao: () => { mudarAba("calc"); alternarSubCalc("sedacao"); } },
    { titulo: "Protocolo de Eutanásia (3 Etapas CFMV)", sub: "Aba Cálculos", tag: "Protocolo", acao: () => { mudarAba("calc"); alternarSubCalc("eutanasia"); } },
    { titulo: "Escala de Coma de Glasgow Modificada (MCGS)", sub: "TCE — Prontuário Clínico", tag: "Escala", acao: () => { mudarAba("prontuario"); alternarSubProntuario("clinico"); abrirEscalaDireta("mcgs"); } },
    { titulo: "Feline Grimace Scale (FGS — Dor em Gatos)", sub: "Dor Felina — Prontuário Clínico", tag: "Escala", acao: () => { mudarAba("prontuario"); alternarSubProntuario("clinico"); abrirEscalaDireta("fgs"); } },
    { titulo: "Glasgow Curta de Dor em Cães (CMPS-SF)", sub: "Dor Canina — Prontuário Clínico", tag: "Escala", acao: () => { mudarAba("prontuario"); alternarSubProntuario("clinico"); abrirEscalaDireta("cmps"); } },
    { titulo: "Drogas de Emergência, PCR & XABCDE", sub: "Aba Emergência", tag: "Emergência", acao: () => { mudarAba("emergencia"); } },
    { titulo: "Análise Clínica por IA", sub: "Prontuário — Cruzamento Diagnóstico", tag: "IA", acao: () => { mudarAba("prontuario"); alternarSubProntuario("ia"); } }
  ];

  ferramentas.forEach(ft => {
    if (!termo || normalizarTextoBusca(ft.titulo + " " + ft.sub).includes(termo)) {
      resultados.push(ft);
    }
  });

  // 2. Fármacos
  FARMACOS_DB.forEach((f, idx) => {
    if (termo && normalizarTextoBusca(f.nome + " " + f.comercial + " " + f.id).includes(termo)) {
      resultados.push({
        titulo: f.nome,
        sub: f.comercial,
        tag: "Fármaco",
        acao: () => abrirFichaCompletaFarmaco(idx, "posologia")
      });
    }
  });

  // 3. Táxons e Subespécies
  TAXONS_DB.forEach((t, tIdx) => {
    const subsTxt = (t.subespecies || []).map(s => s.nome).join(" ");
    if (termo && normalizarTextoBusca(t.nome + " " + t.grupo + " " + subsTxt).includes(termo)) {
      resultados.push({
        titulo: limparEmoji(t.nome),
        sub: `Trocar espécie ativa (${t.grupo})`,
        tag: "Espécie",
        acao: () => {
          document.getElementById("g-tax").value = String(tIdx);
          trocarGrupoTaxonomico();
          showToast(`Espécie alterada para ${limparEmoji(t.nome)}`, "ok");
        }
      });
    }
  });

  // 4. Manobras de Emergência
  PROTOCOLOS_MESTRES.manobras.forEach(m => {
    if (termo && normalizarTextoBusca(m.titulo + " " + m.passos).includes(termo)) {
      resultados.push({
        titulo: limparEmoji(m.titulo),
        sub: m.fonte,
        tag: "Manobra",
        acao: () => mudarAba("emergencia")
      });
    }
  });

  const limitar = termo ? resultados.slice(0, 18) : resultados.slice(0, 8);
  window._acoesBuscaGlobal = limitar.map(r => r.acao);

  if (limitar.length === 0) {
    box.innerHTML = `<div class="p-4 text-center text-xs vc-muted">Nenhum resultado encontrado para "${escapeHtml(document.getElementById("input-busca-global")?.value)}".</div>`;
    return;
  }

  box.innerHTML = limitar.map((r, i) => `
    <button type="button" onclick="executarItemBuscaGlobal(${i})" class="w-full text-left vc-card-interactive p-3 flex items-center justify-between gap-2">
      <div class="min-w-0">
        <div class="text-xs font-bold vc-text truncate">${escapeHtml(r.titulo)}</div>
        <div class="text-[11px] vc-muted truncate">${escapeHtml(r.sub)}</div>
      </div>
      <span class="vc-badge vc-badge-neutral shrink-0">${r.tag}</span>
    </button>
  `).join("");
}

function executarItemBuscaGlobal(i) {
  fecharBuscaGlobal();
  if (window._acoesBuscaGlobal && window._acoesBuscaGlobal[i]) {
    window._acoesBuscaGlobal[i]();
  }
}

function abrirEscalaDireta(qual) {
  const det = document.getElementById("box-escalas-clinicas");
  if (det) det.open = true;
  alternarAbaEscala(qual);
  setTimeout(() => det?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
}

// Atalhos de Teclado (Ctrl+K / Escape)
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    abrirBuscaGlobal();
  } else if (e.key === "Escape") {
    fecharBuscaGlobal();
    fecharSheetPaciente();
    fecharModal();
    fecharFichaCompletaFarmaco();
    document.getElementById("modal-admin")?.classList.add("hidden");
  }
});

// ============================================================================
// CONTEXTO TAXONÔMICO & PESO GLOBAL REATIVO
// ============================================================================

function getTaxonAtual() {
  const idx = parseInt(document.getElementById("g-tax")?.value) || 0;
  const subIdx = parseInt(document.getElementById("g-subesp")?.value) || 0;
  const t = TAXONS_DB[idx] || TAXONS_DB[0];
  const sub = (t.subespecies && t.subespecies[subIdx]) ? t.subespecies[subIdx] : { nome: limparEmoji(t.nome), peso: 1.0, unid: "kg", alerta: "" };
  return { idx, subIdx, t, sub };
}

function getGuiaSemiologico(t) {
  if (t.grupo.includes("Aves")) return GUIAS_SEMIOLOGICOS.padraoAves;
  if (t.grupo.includes("Répteis")) return GUIAS_SEMIOLOGICOS.padraoRepteis;
  return GUIAS_SEMIOLOGICOS.padraoMamiferos;
}

function getConfigFarmacoParaTaxon(f, tIdx, t) {
  const dosePadrao = f.dosesPadrao[tIdx] !== undefined ? f.dosesPadrao[tIdx] : f.dosesPadrao[0];
  let grupoCfg = f.faixasPorGrupo.Padrao;

  if (f.faixasPorGrupo[t.id]) {
    grupoCfg = f.faixasPorGrupo[t.id];
  } else if ((t.id === "Coelhos" || t.id === "Caviomorfos" || t.id === "Miomorfos") && dosePadrao === 0 && f.faixasPorGrupo.ProibidoCeco) {
    grupoCfg = f.faixasPorGrupo.ProibidoCeco;
  } else if (t.grupo.includes("Aves") && f.faixasPorGrupo.Aves) {
    grupoCfg = f.faixasPorGrupo.Aves;
  } else if (t.id === "Caviomorfos" && f.faixasPorGrupo.Coelhos) {
    grupoCfg = f.faixasPorGrupo.Coelhos;
  }

  const doseAtiva = (f._doseOverride && f._doseOverride[t.id] !== undefined) ? f._doseOverride[t.id] : dosePadrao;
  const concAtiva = f._concAtiva || f.conc;
  return { doseAtiva, concAtiva, grupoCfg };
}

function trocarGrupoTaxonomico() {
  const idx = parseInt(document.getElementById("g-tax")?.value) || 0;
  const t = TAXONS_DB[idx] || TAXONS_DB[0];
  const selSub = document.getElementById("g-subesp");
  if (selSub) {
    selSub.innerHTML = (t.subespecies || []).map((s, i) => `<option value="${i}">${s.nome}</option>`).join("");
    selSub.value = "0";
  }

  const elTemp = document.getElementById("p-temp");
  if (elTemp) elTemp.value = ((t.tBasalMin + t.tMax) / 2).toFixed(1);

  const guia = getGuiaSemiologico(t);
  const elEcc = document.getElementById("p-ecc");
  if (elEcc) elEcc.innerHTML = guia.ecc.map((e, i) => `<option value="${i}">${e[0]}</option>`).join("");

  trocarSubespecie();
}

function trocarSubespecie() {
  const { sub } = getTaxonAtual();
  if (sub && sub.peso) {
    unidPeso = sub.unid || "kg";
    const elPeso = document.getElementById("g-peso");
    if (elPeso) elPeso.value = sub.peso;
    atualizarBotoesUnidadeUI();
  }
  atualizarPesoGlobal();
}

function setUnidade(u) {
  const inp = document.getElementById("g-peso");
  if (!inp) return;
  const v = parseFloat(inp.value) || 0;
  if (unidPeso === "kg" && u === "g") inp.value = (v * 1000).toFixed(0);
  if (unidPeso === "g" && u === "kg") inp.value = (v / 1000).toFixed(3);
  unidPeso = u;
  atualizarBotoesUnidadeUI();
  atualizarPesoGlobal();
}

function atualizarBotoesUnidadeUI() {
  document.getElementById("btn-u-g")?.classList.toggle("active", unidPeso === "g");
  document.getElementById("btn-u-kg")?.classList.toggle("active", unidPeso === "kg");
}

function getPesoBrutoKg() {
  const v = parseFloat(document.getElementById("g-peso")?.value) || 0;
  return unidPeso === "g" ? v / 1000 : v;
}

function getPesoEfetivoKg() {
  const bruto = getPesoBrutoKg();
  if (sinaisAtivos.has("ascite") && pesoMagroManual > 0 && pesoMagroManual < bruto) return pesoMagroManual;
  return bruto;
}

function formatarPesoExibicao(kg) {
  return unidPeso === "g" ? `${(kg * 1000).toFixed(0)} g (${kg.toFixed(3)} kg)` : `${kg.toFixed(2)} kg`;
}

function formatarPesoCurto(kg) {
  return unidPeso === "g" ? `${(kg * 1000).toFixed(0)} g` : `${kg.toFixed(2)} kg`;
}

function formatarVolumeSeguro(mlPuro) {
  if (mlPuro <= 0) return "0 mL";
  if (mlPuro >= 0.05) return `${mlPuro.toFixed(2)} mL (${(mlPuro * 100).toFixed(0)} UI)`;
  if (mlPuro >= 0.005) return `${(mlPuro * 10).toFixed(2)} mL da Dil. 1:10 [Puro: ${mlPuro.toFixed(3)} mL]`;
  return `${(mlPuro * 100).toFixed(2)} mL da Dil. 1:100 [Puro: ${mlPuro.toFixed(4)} mL]`;
}

function atualizarPillCabecalho() {
  const { t, sub } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const nomePac = (document.getElementById("p-nome")?.value || "").trim();
  const nomeCurtoEsp = limparEmoji(t.nome).split("(")[0].trim();
  const lbl = nomePac ? `${nomePac} · ${nomeCurtoEsp}` : `${nomeCurtoEsp} (${sub.nome.split("(")[0].trim()})`;
  const elRes = document.getElementById("pill-paciente-resumo");
  const elPes = document.getElementById("pill-paciente-peso");
  if (elRes) elRes.textContent = lbl;
  if (elPes) elPes.textContent = formatarPesoCurto(kg);
}

function atualizarPesoGlobal() {
  atualizarPillCabecalho();
  recalcularProntuario();
  avaliarExamesLab();
  atualizarAlertasEscalasTaxon();
  atualizarResumoContextoIA();
  calcularDoseIsolada();
  calcularDoseUI();
  calcularCRI();
  renderBombasCombinadas();
  renderProtocolosEspecie();
  renderPainelEmergencia();
  preencherConversorReceita();
  sincronizarCabecalhoReceita();
}

// ============================================================================
// ABA 1: PRONTUÁRIO, METABÓLICO, SEMIOLOGIA, LABORATÓRIO E PRESCRIÇÃO
// ============================================================================

function analisarTextoAnamnese() {
  const txt = (document.getElementById("p-anam")?.value || "").toLowerCase();
  let mudou = false;
  Object.keys(SINAIS_DB).forEach(k => {
    if (SINAIS_DB[k].palavras.some(p => txt.includes(p)) && !sinaisAtivos.has(k)) {
      sinaisAtivos.add(k);
      mudou = true;
      if (k === "ascite" && pesoMagroManual <= 0) pesoMagroManual = +(getPesoBrutoKg() * 0.85).toFixed(2);
    }
  });
  if (mudou) atualizarPesoGlobal();
}

function toggleSinal(k) {
  if (sinaisAtivos.has(k)) sinaisAtivos.delete(k);
  else {
    sinaisAtivos.add(k);
    if (k === "ascite" && pesoMagroManual <= 0) pesoMagroManual = +(getPesoBrutoKg() * 0.85).toFixed(2);
  }
  atualizarPesoGlobal();
}

function salvarNovoSinalCustom() {
  const nome = document.getElementById("new-sig-nome")?.value.trim();
  const foco = (document.getElementById("new-sig-foco")?.value || "").split(",").map(s => s.trim()).filter(Boolean);
  const cond = document.getElementById("new-sig-conduta")?.value.trim();
  if (!nome || !cond) return showToast("Preencha o nome e a conduta do achado.", "warn");
  const id = "custom_" + Date.now();
  const novo = { label: nome, palavras: [nome.toLowerCase()], conduta: cond, focoDrogas: foco, bloqueiaMelox: false, pedePesoMagro: false };
  SINAIS_DB[id] = novo;
  const salvos = JSON.parse(localStorage.getItem(KEY_SINAIS_USR) || "{}");
  salvos[id] = novo;
  localStorage.setItem(KEY_SINAIS_USR, JSON.stringify(salvos));
  sinaisAtivos.add(id);
  document.getElementById("box-criar-sinal")?.classList.add("hidden");
  document.getElementById("new-sig-nome").value = "";
  document.getElementById("new-sig-foco").value = "";
  document.getElementById("new-sig-conduta").value = "";
  atualizarPesoGlobal();
  sincronizarParaNuvem();
  showToast("Achado clínico salvo na sua base.", "ok");
}

function recalcularProntuario() {
  const { t, sub } = getTaxonAtual();
  const kgBruto = getPesoBrutoKg();
  const kgCalc  = getPesoEfetivoKg();
  const gCalc   = kgCalc * 1000;
  const temp    = parseFloat(document.getElementById("p-temp")?.value);
  const des     = parseFloat(document.getElementById("p-des")?.value) || 0;

  const manutDia  = kgCalc * t.fluidoManut;
  const desidMl   = gCalc * (des / 100);
  const totFluido = manutDia + desidMl;
  const kcalDia   = t.fatorK * Math.pow(kgCalc, 0.75);
  const nomeEsp   = limparEmoji(t.nome);

  // 1. Painel Metabólico + Gavetas Recolhíveis Clean
  const cardMet = document.getElementById("card-metabolico");
  if (cardMet) {
    cardMet.innerHTML = `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div class="vc-subcard p-3">
          <div class="text-[10px] font-bold uppercase tracking-wider vc-muted">Fluido 24h</div>
          <div class="text-base sm:text-lg font-extrabold vc-accent-text mono mt-0.5">${totFluido.toFixed(1)} mL/d</div>
          <div class="text-[11px] vc-secondary mono">${(totFluido/24).toFixed(2)} mL/h &middot; q6h ${(totFluido/4).toFixed(1)} mL</div>
        </div>
        <div class="vc-subcard p-3">
          <div class="text-[10px] font-bold uppercase tracking-wider vc-muted">Bolus Choque</div>
          <div class="text-base sm:text-lg font-extrabold vc-info-text mono mt-0.5">${(kgCalc * t.bolusChoque).toFixed(2)} mL</div>
          <div class="text-[11px] vc-secondary">${t.bolusChoque} mL/kg (M ${manutDia.toFixed(0)} + D ${desidMl.toFixed(0)})</div>
        </div>
        <div class="vc-subcard p-3">
          <div class="text-[10px] font-bold uppercase tracking-wider vc-muted">Nutrição &amp; Sonda</div>
          <div class="text-base sm:text-lg font-extrabold vc-warn-text mono mt-0.5">${kcalDia.toFixed(1)} kcal/d</div>
          <div class="text-[11px] vc-secondary">Máx/tomada: <strong class="vc-text mono">${(kgCalc * t.gavMax).toFixed(2)} mL</strong></div>
        </div>
        <div class="vc-subcard p-3 vc-accent-left-danger">
          <div class="text-[10px] font-bold uppercase tracking-wider vc-danger-text">Coleta Segura Sangue</div>
          <div class="text-base sm:text-lg font-extrabold vc-danger-text mono mt-0.5">${(kgCalc * 10).toFixed(2)} mL</div>
          <div class="text-[11px] vc-secondary">Debilitado (0,5%): <strong class="vc-text mono">${(kgCalc * 5).toFixed(2)} mL</strong></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <details class="vc-alert vc-alert-danger !p-0 overflow-hidden">
          <summary class="px-3 py-2.5 text-xs font-bold cursor-pointer select-none flex items-center justify-between gap-2">
            <span>Restrições &amp; Contraindicações (${escapeHtml(nomeEsp)})</span>
            <span class="text-[10px] opacity-80">Ver</span>
          </summary>
          <div class="px-3 pb-3 pt-2 border-t text-xs leading-relaxed vc-text" style="border-color:var(--danger-border)">${t.proibido}</div>
        </details>

        <details class="vc-subcard !p-0 overflow-hidden" ${sub.alerta ? "open" : ""}>
          <summary class="px-3 py-2.5 text-xs font-bold cursor-pointer select-none flex items-center justify-between gap-2 vc-text">
            <span>Diretriz Clínica &amp; Acessos (${escapeHtml(sub.nome.split("(")[0].trim())})</span>
            <span class="text-[10px] vc-muted">Ver</span>
          </summary>
          <div class="px-3 pb-3 pt-2 border-t vc-divider space-y-2 text-xs vc-secondary leading-relaxed">
            <div>${t.regraOuro}</div>
            ${sub.alerta ? `<div class="vc-alert vc-alert-warn !py-2 !px-2.5 font-semibold">${sub.alerta}</div>` : ""}
            <div class="text-[11px]"><strong class="vc-text">Acessos:</strong> ${t.vias}<br><strong class="vc-accent-text">Tubo de Sangue:</strong> ${t.tuboSangue}</div>
          </div>
        </details>
      </div>
    `;
  }

  // 2. Status Térmico em 3 Zonas
  const boxT = document.getElementById("status-termico");
  if (boxT && !isNaN(temp)) {
    if (temp < t.tMin) {
      boxT.className = "vc-alert vc-alert-info";
      boxT.innerHTML = `<strong>Hipotermia Patológica (${temp} °C &lt; ${t.tMin} °C):</strong> Aquecer gradualmente antes de administrar dieta por sonda ou medicar SC.${t.id === "Gato" && temp < 37.0 ? "<br><strong>Tríade do Choque Felino:</strong> Não infundir bolus rápido de cristaloide antes de atingir &ge; 37,0 °C." : ""}`;
    } else if (temp >= t.tMin && temp < t.tBasalMin) {
      boxT.className = "vc-alert vc-alert-warn";
      boxT.innerHTML = `<strong>Basotermia / Repouso Diurno / Tanatose (${temp} °C — Faixa Basal: ${t.tMin} a ${t.tBasalMin} °C):</strong> Fisiológico em ${escapeHtml(nomeEsp)}; não aquecer agressivamente se mucosas coradas.`;
    } else if (temp > t.tMax) {
      boxT.className = "vc-alert vc-alert-danger";
      boxT.innerHTML = `<strong>Hipertermia (${temp} °C &gt; ${t.tMax} °C):</strong> Resfriamento gradual imediato e oxigenoterapia.`;
    } else {
      boxT.className = "vc-alert vc-alert-ok";
      boxT.innerHTML = `<strong>Normotermia Ativa (${temp} °C):</strong> Dentro da faixa fisiológica ideal (${t.tBasalMin} a ${t.tMax} °C).`;
    }
  }

  // 3. Pílulas de Quadros Clínicos & Peso Magro
  const pillsEl = document.getElementById("pills-sinais");
  if (pillsEl) {
    pillsEl.innerHTML = Object.keys(SINAIS_DB).map(k => {
      const on = sinaisAtivos.has(k);
      return `<button type="button" onclick="toggleSinal('${k}')" class="vc-chip ${on ? "active" : ""}">${escapeHtml(limparEmoji(SINAIS_DB[k].label))}</button>`;
    }).join("");
  }

  let htmlDet = "";
  if (sinaisAtivos.size > 0) {
    htmlDet += `<div class="flex flex-wrap items-center gap-1.5 pt-1">
      <span class="text-[11px] vc-muted">Achados ativos:</span>
      ${Array.from(sinaisAtivos).map(k => `<span class="vc-badge vc-badge-accent">${escapeHtml(limparEmoji(SINAIS_DB[k].label))} <button type="button" onclick="toggleSinal('${k}')" class="ml-1 opacity-75 hover:opacity-100">×</button></span>`).join("")}
    </div>`;
  }
  if (sinaisAtivos.has("ascite")) {
    htmlDet += `<div class="vc-alert vc-alert-warn flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div><strong>Ascite / Efusão ativa:</strong> Peso na balança = <strong>${kgBruto.toFixed(2)} kg</strong>. Informe o <strong>Peso Magro Estimado</strong> para cálculo seguro:</div>
      <div class="flex items-center gap-1.5 shrink-0">
        <input type="number" step="0.1" value="${pesoMagroManual}" oninput="pesoMagroManual=parseFloat(this.value)||0;atualizarPesoGlobal()" class="vc-input !w-20 !py-1 mono font-bold">
        <span class="font-bold text-xs">kg</span>
      </div>
    </div>`;
  }
  const barraDet = document.getElementById("barra-detectados");
  if (barraDet) barraDet.innerHTML = htmlDet;

  // 4. Protocolos de Trava Rápida (Offline) na Sub-aba IA
  const boxCond = document.getElementById("box-condutas-caso");
  if (boxCond) {
    if (sinaisAtivos.size === 0) {
      boxCond.innerHTML = `<div class="text-xs vc-muted">Nenhum achado clínico marcado. Selecione quadros na aba <strong>Clínico</strong> ou digite na Anamnese para ativar alertas automáticos de segurança.</div>`;
    } else {
      boxCond.innerHTML = Array.from(sinaisAtivos).map(k => {
        const s = SINAIS_DB[k];
        if (!s) return "";
        return `<div class="vc-subcard p-3 vc-accent-left-accent space-y-1 text-xs">
          <div class="font-bold vc-accent-text">${escapeHtml(limparEmoji(s.label))}</div>
          <div class="vc-secondary whitespace-pre-line leading-relaxed">${s.conduta}</div>
        </div>`;
      }).join("");
    }
  }

  // 5. Render Prescrição Filtrada (uma única passagem limpa!)
  renderListaPrescricaoFiltrada();
}

// ============================================================================
// PRESCRIÇÃO FILTRADA (CATEGORIAS + BUSCA + SUPORTE A UI/KG)
// ============================================================================

const CATEGORIAS_FARMACOS = {
  "Amoxicilina+Clav": ["atb"], "Clindamicina": ["atb"], "Enrofloxacina": ["atb"],
  "Marbofloxacina": ["atb"], "Ceftazidima": ["atb"], "Doxiciclina": ["atb"],
  "Metronidazol": ["atb", "gi"], "Sulfametoxazol+Trim": ["atb"], "Cefalexina": ["atb"],
  "Pentabiotico": ["atb"], "Dipirona": ["dor"], "Meloxicam": ["dor"],
  "Carprofeno": ["dor"], "Robenacoxibe": ["dor"], "Tramadol": ["dor"],
  "Gabapentina": ["dor", "sedacao"], "Butorfanol": ["dor", "sedacao"], "Metadona": ["dor", "sedacao"],
  "Prednisolona": ["dor", "outros"], "Dexametasona": ["dor", "outros"],
  "Lidocaina 2%": ["dor", "sedacao"], "Bupivacaina 0,5%": ["dor", "sedacao"],
  "Escopolamina": ["dor", "gi"], "Midazolam": ["sedacao"], "Cetamina": ["sedacao", "dor"],
  "Furosemida": ["sedacao", "outros"], "Manitol 20%": ["sedacao", "outros"],
  "Vitamina K1": ["sedacao", "outros"], "Maropitant": ["gi"], "Ondansetrona": ["gi"],
  "Metoclopramida": ["gi"], "Omeprazol": ["gi"], "Sucralfato": ["gi"],
  "Itraconazol": ["gi", "outros"], "Alopurinol": ["outros"], "Ivermectina": ["outros"],
  "Fenbendazol": ["outros"], "Nitenpiram": ["outros"]
};

function setFiltroPrescricao(cat) {
  filtroPrescAtivo = cat;
  renderListaPrescricaoFiltrada();
}

function renderListaPrescricaoFiltrada() {
  const listaEl = document.getElementById("lista-prescricao");
  const barFiltros = document.getElementById("filtros-prescricao");
  const contEl = document.getElementById("cont-prescricao");
  if (!listaEl) return;

  const { idx: tIdx, t } = getTaxonAtual();
  const kgCalc = getPesoEfetivoKg();
  const des = parseFloat(document.getElementById("p-des")?.value) || 0;
  const termo = normalizarTextoBusca(document.getElementById("busca-prescricao")?.value || "");

  let focoDrogas = new Set();
  let bloqMelox = des >= 8;
  Array.from(sinaisAtivos).forEach(k => {
    const s = SINAIS_DB[k];
    if (!s) return;
    (s.focoDrogas || []).forEach(d => focoDrogas.add(d));
    if (s.bloqueiaMelox) bloqMelox = true;
  });

  if (barFiltros) {
    const botoes = [
      ["todos", "Todos"],
      ["caso", `Do Caso (${focoDrogas.size})`],
      ["atb", "ATB"],
      ["dor", "Dor / AINE"],
      ["sedacao", "Sedação / Emerg"],
      ["gi", "GI / Antifúng."],
      ["outros", "Outros"]
    ];
    barFiltros.innerHTML = botoes.map(([id, label]) =>
      `<button type="button" onclick="setFiltroPrescricao('${id}')" class="vc-chip ${filtroPrescAtivo === id ? "active" : ""}">${label}</button>`
    ).join("");
  }

  const filtrados = FARMACOS_DB.filter(f => {
    const cats = CATEGORIAS_FARMACOS[f.id] || ["outros"];
    const passaCat =
      filtroPrescAtivo === "todos" ||
      (filtroPrescAtivo === "caso" ? focoDrogas.has(f.id) : cats.includes(filtroPrescAtivo));
    if (!passaCat) return false;
    if (!termo) return true;
    return normalizarTextoBusca(f.nome + " " + f.comercial + " " + f.id).includes(termo);
  });

  if (contEl) {
    contEl.textContent = `Exibindo ${filtrados.length} de ${FARMACOS_DB.length} fármacos para ${limparEmoji(t.nome)} (${formatarPesoCurto(kgCalc)})`;
  }

  if (filtrados.length === 0) {
    listaEl.innerHTML = `<div class="vc-subcard p-4 text-xs vc-muted text-center">Nenhum fármaco encontrado para este filtro.${filtroPrescAtivo === "caso" ? " Marque achados na aba Clínico ou selecione 'Todos'." : ""}</div>`;
    return;
  }

  listaEl.innerHTML = filtrados.map(f => {
    const fIdx = FARMACOS_DB.indexOf(f);
    const { doseAtiva, concAtiva, grupoCfg } = getConfigFarmacoParaTaxon(f, tIdx, t);
    const isFoco = focoDrogas.has(f.id);
    const isUI = f.id === "Pentabiotico";
    const uDose = isUI ? "UI/kg" : "mg/kg";
    const uTot  = isUI ? "UI" : "mg";
    const uConc = isUI ? "UI/mL" : "mg/mL";

    if (doseAtiva === 0 || grupoCfg.status === "proibido") {
      return `<div onclick="abrirModalFarmaco(${fIdx})" class="vc-card-interactive p-3 vc-accent-left-danger flex justify-between items-center gap-2">
        <div class="min-w-0 space-y-1">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="vc-badge vc-badge-danger">Proibido</span>
            <strong class="text-xs sm:text-sm vc-text">${escapeHtml(f.nome)}</strong>
          </div>
          <div class="text-[11px] vc-danger-text">${limparEmoji(grupoCfg.via)}</div>
        </div>
        <span class="text-xs font-bold vc-danger-text shrink-0">Fonte</span>
      </div>`;
    }

    if (f.id === "Meloxicam" && bloqMelox) {
      return `<div onclick="abrirModalFarmaco(${fIdx})" class="vc-card-interactive p-3 vc-accent-left-warn flex justify-between items-center gap-2">
        <div class="min-w-0 space-y-1">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="vc-badge vc-badge-warn">Suspenso pelos achados</span>
            <strong class="text-xs sm:text-sm vc-text">${escapeHtml(f.nome)}</strong>
          </div>
          <div class="text-[11px] vc-warn-text">Bloqueado na presença de Ascite, Desidratação &ge; 8%, Doença Renal ou GI.</div>
        </div>
        <span class="text-xs font-bold vc-warn-text shrink-0">Detalhes</span>
      </div>`;
    }

    const totAtivo = kgCalc * doseAtiva;
    const mlPuro = totAtivo / concAtiva;
    const bordaLeft = grupoCfg.status === "alerta"
      ? "vc-accent-left-warn"
      : (isFoco ? "vc-accent-left-accent" : "");

    return `<div onclick="abrirModalFarmaco(${fIdx})" class="vc-card-interactive p-3 ${bordaLeft} flex justify-between items-center gap-3">
      <div class="min-w-0 space-y-1">
        <div class="flex flex-wrap items-center gap-1.5">
          ${isFoco ? '<span class="vc-badge vc-badge-accent">Do Caso</span>' : ""}
          ${grupoCfg.status === "alerta" ? `<span class="vc-badge vc-badge-warn">Cautela</span>` : ""}
          <strong class="text-xs sm:text-sm vc-text">${escapeHtml(f.nome)}</strong>
        </div>
        <div class="text-[11px] vc-secondary">
          <strong class="vc-text mono">${isUI ? doseAtiva.toLocaleString("pt-BR") : doseAtiva} ${uDose}</strong> (${isUI ? Math.round(totAtivo).toLocaleString("pt-BR") : totAtivo.toFixed(2)} ${uTot}) &middot; Frasco <span class="mono">${isUI ? concAtiva.toLocaleString("pt-BR") : concAtiva} ${uConc}</span>
        </div>
        <div class="text-[11px] vc-muted truncate">${limparEmoji(grupoCfg.via)}</div>
      </div>
      <div class="text-right shrink-0">
        <div class="text-sm sm:text-base font-extrabold vc-accent-text mono">${mlPuro >= 0.05 ? mlPuro.toFixed(2) + " mL" : (mlPuro * 10).toFixed(2) + " mL"}</div>
        <div class="text-[10px] vc-muted mono">${mlPuro >= 0.05 ? (mlPuro * 100).toFixed(0) + " UI" : "Dil. 1:10"}</div>
      </div>
    </div>`;
  }).join("");
}

// ============================================================================
// LABORATÓRIO COM BARRAS VISUAIS DE REFERÊNCIA POR ESPÉCIE
// ============================================================================

function avaliarExamesLab() {
  const { t } = getTaxonAtual();
  const ref = (typeof LAB_REF_DB !== "undefined" && LAB_REF_DB[t.id]) ? LAB_REF_DB[t.id] : LAB_REF_DB.Cao;
  const bRef = document.getElementById("barra-ref-especie");
  if (!bRef) return;

  document.getElementById("lbl-lab-ht").textContent    = `Ht (${ref.ht[0]}–${ref.ht[1]}%)`;
  document.getElementById("lbl-lab-ppt").textContent   = `PPT (${ref.ppt[0]}–${ref.ppt[1]})`;
  document.getElementById("lbl-lab-glic").textContent  = `Glic (${ref.glic[0]}–${ref.glic[1]})`;
  document.getElementById("lbl-lab-renal").textContent = `${ref.renalNome.split(" ")[0]} (${ref.renal[0]}–${ref.renal[1]})`;
  document.getElementById("lbl-lab-hep").textContent   = `${ref.hepNome.split(" ")[0]} (${ref.hep[0]}–${ref.hep[1]})`;

  bRef.innerHTML = `<strong class="vc-text">Referência ${escapeHtml(limparEmoji(t.nome))}:</strong> Ht ${ref.ht[0]}–${ref.ht[1]}% · PPT ${ref.ppt[0]}–${ref.ppt[1]} g/dL · Glic ${ref.glic[0]}–${ref.glic[1]} mg/dL · ${ref.renalNome}: ${ref.renal[0]}–${ref.renal[1]} · ${ref.hepNome}: ${ref.hep[0]}–${ref.hep[1]}<div class="vc-warn-text font-medium mt-1">${limparEmoji(ref.nota)}</div>`;

  const checar = (idIn, idSt, idBar, faixa) => {
    const elIn = document.getElementById(idIn);
    const elSt = document.getElementById(idSt);
    const elBar = document.getElementById(idBar);
    if (!elIn || !elSt) return;
    const v = parseFloat(elIn.value);
    if (isNaN(v)) {
      elSt.innerHTML = "";
      if (elBar) elBar.innerHTML = "";
      return;
    }

    const span = Math.max(0.01, faixa[1] - faixa[0]);
    let pct = 25 + ((v - faixa[0]) / span) * 50;
    pct = Math.max(4, Math.min(96, pct));
    let corVar = "var(--ok)";
    if (v < faixa[0]) {
      corVar = "var(--info)";
      elSt.innerHTML = `<span class="vc-info-text">Baixo (&lt;${faixa[0]})</span>`;
    } else if (v > faixa[1]) {
      corVar = "var(--danger)";
      elSt.innerHTML = `<span class="vc-danger-text">Alto (&gt;${faixa[1]})</span>`;
    } else {
      elSt.innerHTML = `<span class="vc-ok-text">Normal</span>`;
    }

    if (elBar) {
      elBar.innerHTML = `<div class="vc-lab-bar"><div class="vc-lab-zone"></div><div class="vc-lab-dot" style="left:${pct}%;background:${corVar}"></div></div>`;
    }
  };

  checar("p-ht", "st-lab-ht", "bar-lab-ht", ref.ht);
  checar("p-ppt", "st-lab-ppt", "bar-lab-ppt", ref.ppt);
  checar("p-glic", "st-lab-glic", "bar-lab-glic", ref.glic);
  checar("p-renal", "st-lab-renal", "bar-lab-renal", ref.renal);
  checar("p-hep", "st-lab-hep", "bar-lab-hep", ref.hep);
}

// ============================================================================
// ESCALAS CLÍNICAS INTERATIVAS (MCGS, FGS, CMPS-SF)
// ============================================================================

function alternarAbaEscala(qual) {
  ["mcgs", "fgs", "cmps"].forEach(k => {
    document.getElementById(`painel-esc-${k}`)?.classList.toggle("hidden", k !== qual);
    document.getElementById(`btn-esc-${k}`)?.classList.toggle("active", k === qual);
  });
  calcularMCGS();
  calcularFGS();
  calcularCMPS();
}

function atualizarAlertasEscalasTaxon() {
  const alertaEl = document.getElementById("alerta-mcgs-especie");
  if (!alertaEl) return;
  const { t } = getTaxonAtual();
  const nome = limparEmoji(t.nome);
  if (t.grupo.includes("Aves") || t.grupo.includes("Répteis")) {
    alertaEl.classList.remove("hidden");
    alertaEl.innerHTML = `<strong>Alerta em ${escapeHtml(nome)}:</strong> A íris possui musculatura estriada voluntária — o reflexo pupilar à luz (RPL) pode ser falseado e não deve ser interpretado isoladamente como lesão de tronco.`;
  } else if (t.id === "Gamba" || t.id === "Tamandua" || t.id === "Tatu") {
    alertaEl.classList.remove("hidden");
    alertaEl.innerHTML = `<strong>Alerta em ${escapeHtml(nome)}:</strong> Diferenciar estupor neurológico de basotermia fisiológica ou tanatose (confirmar temperatura corporal antes de fechar o escore).`;
  } else {
    alertaEl.classList.add("hidden");
  }
}

function calcularMCGS() {
  const out = document.getElementById("out-esc-mcgs");
  if (!out) return null;
  const m = parseInt(document.getElementById("mcgs-motora")?.value) || 6;
  const t = parseInt(document.getElementById("mcgs-tronco")?.value) || 6;
  const c = parseInt(document.getElementById("mcgs-consc")?.value) || 6;
  const tot = m + t + c;

  let cls = "vc-ok-text";
  let interp = "Prognóstico Bom (TCE Leve — monitoração seriada q1–2h).";
  if (tot <= 8) {
    cls = "vc-danger-text";
    interp = "Prognóstico Grave (TCE Severo — risco de herniação; avaliar via aérea, Manitol 20% ou NaCl 7,5% e cabeceira a 30°).";
  } else if (tot <= 14) {
    cls = "vc-warn-text";
    interp = "Prognóstico Reservado (TCE Moderado — oxigenação, analgesia sem AINE/corticoide e reavaliação q30–60 min).";
  }

  out.innerHTML = `<div class="font-extrabold ${cls} mono">MCGS Total: ${tot}/18 (Motora ${m} · Tronco ${t} · Consciência ${c})</div>
    <div class="text-[11px] vc-secondary mt-1">${interp}</div>
    <div class="text-[10px] vc-muted mt-1">Ref.: Platt et al. (JVIM, 2001) / Silverstein 3ª ed.</div>`;
  return `MCGS: ${tot}/18 (Motora ${m}, Tronco ${t}, Consc. ${c}) — ${tot <= 8 ? "Prognóstico Grave" : (tot <= 14 ? "Prognóstico Reservado" : "Prognóstico Bom")}`;
}

function calcularFGS() {
  const out = document.getElementById("out-esc-fgs");
  if (!out) return null;
  const ids = ["fgs-orelhas", "fgs-olhos", "fgs-focinho", "fgs-bigodes", "fgs-cabeca"];
  const tot = ids.reduce((acc, id) => acc + (parseInt(document.getElementById(id)?.value) || 0), 0);
  const resgate = tot >= 4;

  out.innerHTML = `<div class="font-extrabold ${resgate ? "vc-danger-text" : "vc-ok-text"} mono">Feline Grimace Scale (FGS): ${tot}/10</div>
    <div class="text-[11px] vc-secondary mt-1">${resgate ? "Escore >= 4/10: Indicação de resgate analgésico imediato (reavaliar em 30–60 min)." : "Escore < 4/10: Sem indicação imediata de resgate (manter monitoração)."}</div>
    <div class="text-[10px] vc-muted mt-1">Ref.: Evangelista et al. (Scientific Reports, 2019 — Univ. de Montréal).</div>`;
  return `FGS (Dor Felina): ${tot}/10 — ${resgate ? "Indicação de resgate analgésico (>=4/10)" : "Sem indicação imediata de resgate (<4/10)"}`;
}

function calcularCMPS() {
  const out = document.getElementById("out-esc-cmps");
  if (!out) return null;
  const v = parseInt(document.getElementById("cmps-voc")?.value) || 0;
  const f = parseInt(document.getElementById("cmps-ferida")?.value) || 0;
  const p = parseInt(document.getElementById("cmps-palp")?.value) || 0;
  const po = parseInt(document.getElementById("cmps-post")?.value) || 0;
  const co = parseInt(document.getElementById("cmps-comp")?.value) || 0;
  const mob = parseInt(document.getElementById("cmps-mob")?.value);

  const semMob = isNaN(mob) || mob < 0;
  const tot = v + f + p + po + co + (semMob ? 0 : mob);
  const max = semMob ? 20 : 24;
  const corte = semMob ? 5 : 6;
  const resgate = tot >= corte;

  out.innerHTML = `<div class="font-extrabold ${resgate ? "vc-danger-text" : "vc-ok-text"} mono">Glasgow Curta (CMPS-SF): ${tot}/${max}</div>
    <div class="text-[11px] vc-secondary mt-1">${resgate ? `Escore >= ${corte}/${max}: Indicação de resgate analgésico (opioide/multimodal).` : `Escore < ${corte}/${max}: Dor controlada no momento.`}</div>
    <div class="text-[10px] vc-muted mt-1">Ref.: Reid et al. (Animal Welfare, 2007 — Univ. of Glasgow).</div>`;
  return `CMPS-SF (Dor Canina): ${tot}/${max} — ${resgate ? `Indicação de resgate analgésico (>=${corte}/${max})` : "Dor controlada"}`;
}

function inserirEscalaNoExame(tipo) {
  const txt = tipo === "mcgs" ? calcularMCGS() : (tipo === "fgs" ? calcularFGS() : calcularCMPS());
  const campo = document.getElementById("p-exame-fisico");
  if (!campo || !txt) return;
  const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const linha = `[${hora}] ${txt}`;
  campo.value = campo.value.trim() ? `${campo.value.trim()}\n${linha}` : linha;
  showToast("Escore inserido no Exame Físico.", "ok");
}

// ============================================================================
// MOTOR DE ANÁLISE IA (RACIOCÍNIO DIFERENCIAL REAL — SEM FINGIR LOCAL COMO IA)
// ============================================================================

function atualizarResumoContextoIA() {
  const el = document.getElementById("ia-resumo-contexto");
  if (!el) return;
  const { t } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const chips = [
    `<span class="vc-badge vc-badge-neutral">${escapeHtml(limparEmoji(t.nome))}</span>`,
    `<span class="vc-badge vc-badge-accent mono">${formatarPesoCurto(kg)}</span>`
  ];
  const temp = document.getElementById("p-temp")?.value;
  if (temp) chips.push(`<span class="vc-badge vc-badge-neutral mono">T ${temp}°C</span>`);
  if (sinaisAtivos.size > 0) chips.push(`<span class="vc-badge vc-badge-info">${sinaisAtivos.size} achado(s)</span>`);
  const labsPreenchidos = ["p-ht", "p-ppt", "p-glic", "p-renal", "p-hep"].filter(id => document.getElementById(id)?.value).length;
  if (labsPreenchidos > 0) chips.push(`<span class="vc-badge vc-badge-purple">${labsPreenchidos} exame(s) lab</span>`);
  el.innerHTML = chips.join("");
}

function formatarMarkdownIA(texto) {
  return escapeHtml(texto)
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="vc-text">$1</strong>')
    .replace(/^###\s*(.+)$/gm, '<div class="text-xs font-bold uppercase tracking-wider vc-accent-text pt-2">$1</div>')
    .replace(/^##\s*(.+)$/gm, '<div class="text-xs font-bold uppercase tracking-wider vc-accent-text pt-2">$1</div>')
    .replace(/\n/g, "<br>");
}

async function consultarCoPilotoIA(modo) {
  const { t, sub } = getTaxonAtual();
  const kg   = getPesoEfetivoKg();
  const temp = document.getElementById("p-temp")?.value || "-";
  const des  = document.getElementById("p-des")?.value || "0";
  const ht   = document.getElementById("p-ht")?.value || "-";
  const ppt  = document.getElementById("p-ppt")?.value || "-";
  const glic = document.getElementById("p-glic")?.value || "-";
  const ren  = document.getElementById("p-renal")?.value || "-";
  const hep  = document.getElementById("p-hep")?.value || "-";
  const ref  = (typeof LAB_REF_DB !== "undefined" && LAB_REF_DB[t.id]) ? LAB_REF_DB[t.id] : LAB_REF_DB.Cao;

  const boxResp = document.getElementById(modo === "cruzamento" ? "ia-resposta-caso" : "ia-resposta-extrator");
  if (!boxResp) return;
  boxResp.classList.remove("hidden");
  boxResp.innerHTML = `
    <div class="vc-subcard p-4 space-y-2.5">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold vc-accent-text">Processando raciocínio clínico na IA...</span>
        <span class="vc-badge vc-badge-accent">Gemini</span>
      </div>
      <div class="vc-skeleton w-4/5"></div>
      <div class="vc-skeleton w-full"></div>
      <div class="vc-skeleton w-3/4"></div>
    </div>
  `;

  const achadosLista = Array.from(sinaisAtivos).map(k => limparEmoji(SINAIS_DB[k]?.label || k)).join(", ") || "Nenhum marcado";
  const promptCompleto = modo === "cruzamento"
    ? `Atue como médico veterinário intensivista e especialista em clínica médica e fauna silvestre.
Analise de forma INTEGRADA o caso clínico abaixo, sem repetir protocolos genéricos soltos e respeitando rigorosamente a fisiologia da espécie informada (jamais cite condutas de outra ordem taxonômica):

DADOS DO PACIENTE:
- Táxon / Subespécie: ${limparEmoji(t.nome)} (${sub.nome})
- Peso de cálculo: ${formatarPesoExibicao(kg)} | Idade: ${document.getElementById("p-idade")?.value || "Não informada"} | Sexo: ${document.getElementById("p-sexo")?.value || "-"}
- Vitais: Temp ${temp}°C | Desidratação ${des}% | FC ${document.getElementById("p-fc")?.value || "-"} | FR ${document.getElementById("p-fr")?.value || "-"} | Mucosas ${document.getElementById("p-mucosas")?.value || "-"} | TPC ${document.getElementById("p-tpc")?.value || "-"}
- Laboratório (Ref. da espécie): Ht ${ht}% (${ref.ht[0]}-${ref.ht[1]}) | PPT ${ppt} g/dL (${ref.ppt[0]}-${ref.ppt[1]}) | Glicemia ${glic} mg/dL (${ref.glic[0]}-${ref.glic[1]}) | ${ref.renalNome}: ${ren} (${ref.renal[0]}-${ref.renal[1]}) | ${ref.hepNome}: ${hep} (${ref.hep[0]}-${ref.hep[1]})
- Achados marcados: ${achadosLista}
- Anamnese: "${document.getElementById("p-anam")?.value || "Não preenchida"}"
- Exame Físico / Escalas: "${document.getElementById("p-exame-fisico")?.value || "Não preenchido"}"
- Complementares: "${document.getElementById("p-complementares")?.value || "Nenhum"}"
- Suspeita inicial do clínico: "${document.getElementById("p-diagnostico")?.value || "Em aberto"}"

ENTREGUE EXATAMENTE EM 4 BLOCOS CURTOS E OBJETIVOS:
## 1. Síntese Integrada
Correlacione fisiopatologicamente os sinais e exames em conjunto para esta espécie (aponte contradições ou causas secundárias).
## 2. Diagnósticos Diferenciais Ranqueados
Liste de 3 a 5 hipóteses em ordem decrescente de probabilidade, citando o que fortalece e o que falta confirmar em cada uma.
## 3. Próximos Passos Diagnósticos
Exames objetivos e priorizados para diferenciar as hipóteses acima.
## 4. Armadilhas Terapêuticas do Caso
Interações, contraindicações cruzadas ou ajustes de dose específicos para este quadro (não invente números de página de livros).`
    : `Extraia do texto abaixo todas as doses farmacológicas, vias, frequências e alertas por espécie de forma organizada e limpa:\n\n"${document.getElementById("ia-input-livro")?.value || ""}"`;

  try {
    const r = await fetch(VETCORE_CLOUD_CONFIG.aiWorkerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptCompleto })
    });
    const j = await r.json();

    if (r.ok && j.texto && !j.texto.startsWith("Erro da API Gemini") && !j.texto.startsWith("Falha interna")) {
      boxResp.innerHTML = `
        <div class="vc-subcard p-4 vc-accent-left-accent space-y-2.5 text-xs vc-secondary leading-relaxed">
          <div class="flex items-center justify-between pb-2 border-b vc-divider">
            <strong class="vc-accent-text">Análise Clínica Integrada — ${escapeHtml(limparEmoji(t.nome))}</strong>
            <span class="vc-badge vc-badge-ok">IA Online</span>
          </div>
          <div>${formatarMarkdownIA(j.texto)}</div>
        </div>
      `;
      return;
    }

    const detalhe = j?.texto || `HTTP ${r.status}`;
    boxResp.innerHTML = `
      <div class="vc-alert vc-alert-warn flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div><strong>IA temporariamente indisponível:</strong> ${escapeHtml(detalhe)}</div>
        <button type="button" onclick="consultarCoPilotoIA('${modo}')" class="vc-btn vc-btn-secondary shrink-0">Tentar novamente</button>
      </div>
    `;
  } catch (e) {
    boxResp.innerHTML = `
      <div class="vc-alert vc-alert-warn flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div><strong>Sem conexão com o servidor de IA.</strong> Os protocolos de trava rápida offline permanecem disponíveis abaixo.</div>
        <button type="button" onclick="consultarCoPilotoIA('${modo}')" class="vc-btn vc-btn-secondary shrink-0">Tentar novamente</button>
      </div>
    `;
  }
}

// ============================================================================
// MODAL RÁPIDO DO FÁRMACO (BOTTOM SHEET) & GUIAS SEMIOLÓGICOS
// ============================================================================

function selecionarDoseFaixa(fIdx, novaDose) {
  const { t } = getTaxonAtual();
  if (!FARMACOS_DB[fIdx]._doseOverride) FARMACOS_DB[fIdx]._doseOverride = {};
  FARMACOS_DB[fIdx]._doseOverride[t.id] = novaDose;
  atualizarPesoGlobal();
  abrirModalFarmaco(fIdx);
}

function selecionarFrascoAtivo(fIdx, novaConc) {
  FARMACOS_DB[fIdx]._concAtiva = novaConc;
  atualizarPesoGlobal();
  abrirModalFarmaco(fIdx);
}

function enviarFarmacoParaAbaReceita(fIdx) {
  fecharModal();
  fecharFichaCompletaFarmaco();
  mudarAba("receitas");
  const sel = document.getElementById("rec-sel-farmaco");
  if (sel) sel.value = String(fIdx);
  preencherConversorReceita();
  showToast("Fármaco carregado no construtor de receitas.", "info");
}

function abrirModalFarmaco(fIdx) {
  const { idx: tIdx, t } = getTaxonAtual();
  const f = FARMACOS_DB[fIdx];
  if (!f) return;
  const { doseAtiva, concAtiva, grupoCfg } = getConfigFarmacoParaTaxon(f, tIdx, t);
  const kgCalc = getPesoEfetivoKg();
  const isUI = f.id === "Pentabiotico";
  const uDose = isUI ? "UI/kg" : "mg/kg";
  const uConc = isUI ? "UI/mL" : "mg/mL";
  const totAtivo = kgCalc * doseAtiva;
  const mlPuro = totAtivo / concAtiva;

  document.getElementById("modal-titulo").textContent = `${f.nome} — ${limparEmoji(t.nome)}`;
  document.getElementById("modal-corpo").innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <button type="button" onclick="abrirFichaCompletaFarmaco(${fIdx}, 'posologia')" class="vc-btn vc-btn-soft w-full">Ficha Completa (${TAXONS_DB.length} Táxons)</button>
      <button type="button" onclick="enviarFarmacoParaAbaReceita(${fIdx})" class="vc-btn vc-btn-primary w-full">Enviar para Receita</button>
    </div>

    <div class="vc-subcard p-2.5 text-xs vc-secondary">
      Comercial: <strong class="vc-text">${escapeHtml(f.comercial)}</strong>
    </div>

    ${f.frascos && f.frascos.length > 1 ? `
    <div class="space-y-1.5">
      <div class="vc-section-label">Concentração do Frasco</div>
      <div class="flex flex-wrap gap-1.5">
        ${f.frascos.map(fr => `<button type="button" onclick="selecionarFrascoAtivo(${fIdx}, ${fr.conc})" class="vc-chip ${fr.conc === concAtiva ? "active" : ""}">${escapeHtml(fr.label)}</button>`).join("")}
      </div>
    </div>` : ""}

    ${grupoCfg.opcoes[0] > 0 ? `
    <div class="space-y-1.5">
      <div class="vc-section-label">Faixa de Dose (${uDose})</div>
      <div class="flex gap-1.5">
        ${grupoCfg.opcoes.map(d => `<button type="button" onclick="selecionarDoseFaixa(${fIdx}, ${d})" class="vc-chip flex-1 justify-center mono ${d === doseAtiva ? "active" : ""}">${isUI ? d.toLocaleString("pt-BR") : d} ${uDose}</button>`).join("")}
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div class="vc-subcard p-3 vc-accent-left-accent">
        <div class="text-[10px] vc-muted uppercase">Frasco Puro (${isUI ? concAtiva.toLocaleString("pt-BR") : concAtiva} ${uConc})</div>
        <div class="text-base font-extrabold vc-accent-text mono mt-0.5">${mlPuro.toFixed(3)} mL</div>
        <div class="text-[11px] vc-muted mono">${(mlPuro * 100).toFixed(1)} UI (U-100)</div>
      </div>
      <div class="vc-subcard p-3 vc-accent-left-info">
        <div class="text-[10px] vc-muted uppercase">Diluição 1:10</div>
        <div class="text-base font-extrabold vc-info-text mono mt-0.5">${(mlPuro * 10).toFixed(2)} mL</div>
        <div class="text-[10px] vc-muted">0,1 mL + 0,9 mL NaCl</div>
      </div>
      <div class="vc-subcard p-3 vc-accent-left-purple">
        <div class="text-[10px] vc-muted uppercase">Diluição 1:100</div>
        <div class="text-base font-extrabold vc-purple-text mono mt-0.5">${(mlPuro * 100).toFixed(2)} mL</div>
        <div class="text-[10px] vc-muted">0,1 mL (1:10) + 0,9 mL</div>
      </div>
    </div>` : `<div class="vc-alert vc-alert-danger font-semibold">${limparEmoji(grupoCfg.via)}</div>`}

    <div class="vc-subcard p-3 text-xs vc-secondary leading-relaxed">
      <strong class="vc-text">Resumo Clínico:</strong> ${f.resumoBulario}
    </div>

    <div class="space-y-2">
      <div class="vc-section-label">Fontes Conferidas para ${escapeHtml(limparEmoji(t.nome))}</div>
      ${grupoCfg.fontes.map(ft => `
        <div class="vc-subcard p-3 space-y-1">
          <div class="flex justify-between items-center gap-2">
            <strong class="text-xs vc-warn-text">${escapeHtml(ft[0])}</strong>
            <span class="vc-badge vc-badge-ok shrink-0">Conferido</span>
          </div>
          <blockquote class="text-xs vc-secondary italic pl-2.5 border-l-2" style="border-color:var(--warn)">"${escapeHtml(ft[1])}"</blockquote>
        </div>
      `).join("")}
    </div>
  `;
  document.getElementById("modal-core")?.classList.remove("hidden");
}

function abrirModalGuia(tipo) {
  const { t } = getTaxonAtual();
  const guia = getGuiaSemiologico(t);
  const corpo = document.getElementById("modal-corpo");

  if (tipo === "admin") {
    document.getElementById("modal-admin")?.classList.remove("hidden");
    return;
  }

  if (tipo === "temp") {
    document.getElementById("modal-titulo").textContent = `Faixas Térmicas — ${limparEmoji(t.nome)}`;
    corpo.innerHTML = `<div class="vc-subcard p-3.5 text-xs space-y-2">
      <div class="vc-ok-text font-semibold">Normotermia Ativa: ${t.tBasalMin.toFixed(1)} a ${t.tMax.toFixed(1)} °C</div>
      ${t.tMin < t.tBasalMin ? `<div class="vc-warn-text font-semibold">Basotermia / Repouso / Tanatose: ${t.tMin.toFixed(1)} a ${t.tBasalMin.toFixed(1)} °C (Fisiológico)</div>` : ""}
      <div class="vc-info-text font-semibold">Hipotermia Patológica: &lt; ${t.tMin.toFixed(1)} °C</div>
      <div class="pt-2 border-t vc-divider vc-secondary">${t.regraOuro}</div>
    </div>`;
  } else if (tipo === "desid") {
    document.getElementById("modal-titulo").textContent = `Desidratação — ${limparEmoji(t.nome)}`;
    corpo.innerHTML = guia.desid.map(g => `<div class="vc-subcard p-3 space-y-1"><strong class="vc-accent-text text-xs">${g[0]}</strong><p class="vc-secondary text-xs">${g[1]}</p></div>`).join("");
  } else if (tipo === "ecc") {
    document.getElementById("modal-titulo").textContent = `Escore Corporal — ${limparEmoji(t.nome)}`;
    corpo.innerHTML = guia.ecc.map(g => `<div class="vc-subcard p-3 space-y-1"><strong class="vc-warn-text text-xs">${g[0]}</strong><p class="vc-secondary text-xs">${g[1]}</p></div>`).join("");
  }
  document.getElementById("modal-core")?.classList.remove("hidden");
}

function fecharModal() {
  document.getElementById("modal-core")?.classList.add("hidden");
}

// ============================================================================
// ABA 2: RECEITAS, RESUMO DE ALTA & ENCAMINHAMENTO
// ============================================================================

function popularSeletorFarmacosReceita() {
  const sel = document.getElementById("rec-sel-farmaco");
  if (!sel) return;
  sel.innerHTML = `<option value="-1">Digitar medicamento manualmente...</option>` +
    FARMACOS_DB.map((f, i) => `<option value="${i}">${f.nome} (${f.comercial})</option>`).join("");
}

function formatarFracaoComprimido(num) {
  if (num >= 0.20 && num <= 0.30) return "1/4 (um quarto) do comprimido";
  if (num >= 0.45 && num <= 0.58) return "1/2 (meio) comprimido";
  if (num >= 0.70 && num <= 0.80) return "3/4 do comprimido";
  if (num >= 0.90 && num <= 1.15) return "1 comprimido";
  if (num >= 1.40 && num <= 1.60) return "1 e 1/2 comprimido";
  if (num >= 1.85 && num <= 2.15) return "2 comprimidos";
  return `${num.toFixed(2)} comprimido(s)`;
}

function preencherConversorReceita() {
  const sel = document.getElementById("rec-sel-farmaco");
  const box = document.getElementById("box-conversao-sugerida");
  if (!sel || !box) return;
  const fIdx = parseInt(sel.value);
  if (isNaN(fIdx) || fIdx < 0) {
    box.innerHTML = `<span class="vc-secondary text-xs">Modo manual ativo: preencha o medicamento e a posologia abaixo.</span>`;
    return;
  }

  const { idx: tIdx, t } = getTaxonAtual();
  const f = FARMACOS_DB[fIdx];
  const { doseAtiva, concAtiva, grupoCfg } = getConfigFarmacoParaTaxon(f, tIdx, t);
  const kg = getPesoEfetivoKg();
  const isUI = f.id === "Pentabiotico";
  const totAtivo = kg * doseAtiva;
  const mlLiq = doseAtiva > 0 ? totAtivo / concAtiva : 0;
  const gotas = mlLiq * (f.gotasMl || 20);

  document.getElementById("rec-uso-tipo").value = f.usoReceita || "uso veterinário";
  document.getElementById("rec-nome-item").value = `${f.nome} (${f.apres.split("|")[0].trim()})`;
  document.getElementById("rec-embalagem").value = "1 frasco";
  document.getElementById("rec-posologia").value = isUI
    ? `Aplicar ${mlLiq.toFixed(2)} mL por via IM profunda, ${limparEmoji(grupoCfg.via)}.`
    : `Dar ${mlLiq.toFixed(2)} mL (${Math.round(gotas)} gotas) por via oral, ${limparEmoji(grupoCfg.via)}.`;

  const viaLimpa = limparEmoji(grupoCfg.via);
  window._sugestoesReceita = [
    {
      label: `Líquido → ${mlLiq.toFixed(2)} mL${isUI ? "" : ` (${Math.round(gotas)} gts)`}`,
      ativo: true,
      nomeItem: `${f.nome} ${concAtiva} ${isUI ? "UI/mL" : "mg/mL"}`,
      emb: "1 frasco",
      posol: `${isUI ? `Aplicar ${mlLiq.toFixed(2)} mL via IM profunda` : `Dar ${mlLiq.toFixed(2)} mL (${Math.round(gotas)} gotas) por via oral`}, ${viaLimpa}.`
    }
  ];

  if (f.compMg && f.compMg.length > 0) {
    f.compMg.forEach(cMg => {
      const textoComp = formatarFracaoComprimido(totAtivo / cMg);
      window._sugestoesReceita.push({
        label: `Comp. ${cMg} mg → ${textoComp}`,
        ativo: false,
        nomeItem: `${f.nome} ${cMg} mg`,
        emb: "1 caixa",
        posol: `Dar ${textoComp}, por via oral, ${viaLimpa}.`
      });
    });
  }

  box.innerHTML = `
    <div class="text-xs font-bold vc-accent-text">Dose para ${formatarPesoExibicao(kg)}: ${isUI ? Math.round(totAtivo).toLocaleString("pt-BR") + " UI" : totAtivo.toFixed(2) + " mg"} (${isUI ? doseAtiva.toLocaleString("pt-BR") + " UI/kg" : doseAtiva + " mg/kg"})</div>
    <div class="flex flex-wrap gap-1.5 pt-1">
      ${window._sugestoesReceita.map((s, idx) => `<button type="button" onclick="aplicarSugestaoReceitaIdx(${idx})" class="vc-chip ${s.ativo ? "active" : ""}">${escapeHtml(s.label)}</button>`).join("")}
    </div>
  `;
}

function aplicarSugestaoReceitaIdx(idx) {
  const s = window._sugestoesReceita && window._sugestoesReceita[idx];
  if (!s) return;
  aplicarSugestaoComprimido(s.nomeItem, s.emb, s.posol);
}

function aplicarSugestaoComprimido(nomeItem, emb, posol) {
  document.getElementById("rec-nome-item").value = nomeItem;
  document.getElementById("rec-embalagem").value = emb;
  document.getElementById("rec-posologia").value = posol;
}

function adicionarItemNaReceita() {
  const via  = document.getElementById("rec-via-grupo").value;
  const nome = document.getElementById("rec-nome-item").value.trim();
  const uso  = document.getElementById("rec-uso-tipo").value;
  const emb  = document.getElementById("rec-embalagem").value.trim() || "1 unidade";
  const pos  = document.getElementById("rec-posologia").value.trim();
  const obs  = document.getElementById("rec-obs-italico").value.trim();
  if (!nome || !pos) return showToast("Preencha o medicamento e a posologia.", "warn");

  itensReceitaAtual.push({ via, nome, uso, emb, pos, obs });
  document.getElementById("rec-obs-italico").value = "";
  atualizarFolhaReceita();
  showToast("Item adicionado à receita.", "ok");
}

function limparItensReceita() {
  itensReceitaAtual = [];
  atualizarFolhaReceita();
  showToast("Itens da receita limpos.", "info");
}

function salvarEmitente() {
  const emit = {
    nome: document.getElementById("emit-nome")?.value || "",
    crmv: document.getElementById("emit-crmv")?.value || "",
    end:  document.getElementById("emit-end")?.value || ""
  };
  localStorage.setItem(KEY_EMITENTE, JSON.stringify(emit));
  atualizarFolhaReceita();
}

function sincronizarCabecalhoReceita() {
  atualizarFolhaReceita();
}

function alternarModoDocumento(modo) {
  modoDocAtual = modo;
  ["receita", "alta", "encam"].forEach(k => {
    document.getElementById(`btn-doc-${k}`)?.classList.toggle("active", k === modo);
  });
  atualizarFolhaReceita();
}

function atualizarFolhaReceita() {
  const folha = document.getElementById("print-area");
  if (!folha) return;
  const { t, sub } = getTaxonAtual();
  const kg   = getPesoEfetivoKg();
  const pac  = document.getElementById("p-nome")?.value || "Paciente Sem Nome";
  const raca = document.getElementById("p-raca")?.value || sub.nome;
  const sexo = document.getElementById("p-sexo")?.value || "";
  const idad = document.getElementById("p-idade")?.value || "Idade não informada";
  const tut  = document.getElementById("p-tutor")?.value || "Tutor / Responsável";
  const cont = document.getElementById("p-contato")?.value || "";
  const emitNome = document.getElementById("emit-nome")?.value || "Médico(a) Veterinário(a)";
  const emitCrmv = document.getElementById("emit-crmv")?.value || "CRMV";
  const emitEnd  = document.getElementById("emit-end")?.value || "";
  const tipoRec  = document.getElementById("rec-tipo")?.value || "Receita Simples";
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  const cabecalhoSimplesVet = `
    <div style="border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 16px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
        <div>
          <div style="font-size:18px; font-weight:bold; color:#0f172a;">${escapeHtml(pac)}</div>
          <div style="font-size:13px; color:#334155;">${escapeHtml(limparEmoji(t.nome))} &bull; ${escapeHtml(raca)} &bull; ${escapeHtml(sexo)}</div>
          <div style="font-size:13px; color:#334155;">Peso: <strong>${formatarPesoExibicao(kg)}</strong> &bull; Idade: ${escapeHtml(idad)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:15px; font-weight:bold; color:#0f172a;">Responsável: ${escapeHtml(tut)}</div>
          <div style="font-size:12px; color:#475569;">${escapeHtml(cont)}</div>
          <div style="font-size:12px; color:#475569;">Data: ${dataHoje}</div>
        </div>
      </div>
      <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #cbd5e1; font-size:12px; color:#475569;">
        <strong>Emitente:</strong> ${escapeHtml(emitNome)} &bull; <strong>CRMV:</strong> ${escapeHtml(emitCrmv)} ${emitEnd ? `&bull; ${escapeHtml(emitEnd)}` : ""}
      </div>
    </div>
  `;

  if (modoDocAtual === "alta") {
    const diag = document.getElementById("p-diagnostico")?.value || "Em acompanhamento clínico";
    const anam = document.getElementById("p-anam")?.value || "";
    folha.innerHTML = `
      ${cabecalhoSimplesVet}
      <h2 style="text-align:center; font-size:17px; font-weight:bold; text-transform:uppercase; margin-bottom:14px;">Resumo de Alta Médica &amp; Recomendações</h2>
      <p><strong>Diagnóstico / Suspeita Clínica:</strong> ${escapeHtml(diag)}</p>
      <p style="margin-top:8px;"><strong>Resumo do Atendimento:</strong><br>${escapeHtml(anam)}</p>
      <p style="margin-top:12px;"><strong>Cuidados Domiciliares e Sinais de Alerta:</strong><br>
      1. Administrar as medicações prescritas rigorosamente nos horários indicados.<br>
      2. Manter oferta hídrica e nutricional adequada à espécie.<br>
      3. Retornar imediatamente em caso de prostração aguda, inapetência, vômitos ou dispneia.</p>
      <div style="margin-top:44px; text-align:center; border-top:1px solid #334155; width:260px; margin-left:auto; margin-right:auto; padding-top:6px;">
        <strong>${escapeHtml(emitNome)}</strong><br><span style="font-size:12px;">${escapeHtml(emitCrmv)}</span>
      </div>
    `;
    return;
  }

  if (modoDocAtual === "encam") {
    const diag = document.getElementById("p-diagnostico")?.value || "Avaliação especializada";
    const anam = document.getElementById("p-anam")?.value || "";
    const exFis = document.getElementById("p-exame-fisico")?.value || "";
    folha.innerHTML = `
      ${cabecalhoSimplesVet}
      <h2 style="text-align:center; font-size:17px; font-weight:bold; text-transform:uppercase; margin-bottom:14px;">Termo de Encaminhamento Veterinário</h2>
      <p>Ao(À) Colega Médico(a) Veterinário(a),</p>
      <p style="margin-top:8px;">Encaminho o paciente <strong>${escapeHtml(pac)}</strong> (${escapeHtml(raca)}, ${formatarPesoExibicao(kg)}) para avaliação especializada / exame complementar.</p>
      <p style="margin-top:8px;"><strong>Histórico e Quadro Clínico:</strong> ${escapeHtml(anam)} ${escapeHtml(exFis)}</p>
      <p style="margin-top:8px;"><strong>Suspeita Diagnóstica:</strong> ${escapeHtml(diag)}</p>
      <p style="margin-top:12px;">Coloco-me à disposição para discussão conjunta do caso.</p>
      <div style="margin-top:44px; text-align:center; border-top:1px solid #334155; width:260px; margin-left:auto; margin-right:auto; padding-top:6px;">
        <strong>${escapeHtml(emitNome)}</strong><br><span style="font-size:12px;">${escapeHtml(emitCrmv)}</span>
      </div>
    `;
    return;
  }

  const gruposVia = {};
  itensReceitaAtual.forEach(it => {
    if (!gruposVia[it.via]) gruposVia[it.via] = [];
    gruposVia[it.via].push(it);
  });

  let corpoHtml = "";
  if (Object.keys(gruposVia).length === 0) {
    corpoHtml = `
      <div style="margin-top:14px;">
        <div style="font-weight:bold; font-size:15px; margin-bottom:10px;">Uso Oral:</div>
        <div style="margin-bottom:6px;">Amoxicilina + Clavulanato 50 mg/mL ---------- uso veterinário ---------- 1 frasco</div>
        <div style="margin-left:28px; margin-bottom:14px;">Dar ${(kg * 15 / 50).toFixed(2)} mL de 12 em 12 horas, durante 7 dias.</div>
      </div>
    `;
  } else {
    corpoHtml = Object.keys(gruposVia).map(via => `
      <div style="margin-top:16px;">
        <div style="font-weight:bold; font-size:16px; margin-bottom:10px;">${escapeHtml(via)}</div>
        ${gruposVia[via].map(it => `
          <div style="margin-bottom:14px;">
            <div style="font-size:15px;">${escapeHtml(it.nome)} ---------- ${escapeHtml(it.uso)} ---------- ${escapeHtml(it.emb)}</div>
            <div style="margin-left:28px; margin-top:4px; white-space:pre-line;">${escapeHtml(it.pos)}</div>
            ${it.obs ? `<div style="margin-left:28px; margin-top:4px; font-style:italic; color:#334155;">${escapeHtml(it.obs)}</div>` : ""}
          </div>
        `).join("")}
      </div>
    `).join("");
  }

  folha.innerHTML = `
    ${cabecalhoSimplesVet}
    <h2 style="text-align:center; font-size:17px; font-weight:bold; margin-bottom:14px;">${escapeHtml(tipoRec)}</h2>
    ${corpoHtml}
    <div style="margin-top:48px; text-align:center; border-top:1px solid #334155; width:260px; margin-left:auto; margin-right:auto; padding-top:6px;">
      <strong>${escapeHtml(emitNome)}</strong><br><span style="font-size:12px;">${escapeHtml(emitCrmv)}</span>
    </div>
  `;
}

function copiarTextoReceita() {
  const txt = document.getElementById("print-area")?.innerText || "";
  navigator.clipboard.writeText(txt).then(() => showToast("Documento copiado.", "ok"));
}

function compartilharReceitaWhatsApp() {
  const txt = document.getElementById("print-area")?.innerText || "";
  window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
}

// ============================================================================
// SALVAMENTO COMPLETO DE PRONTUÁRIOS, SINAIS VITAIS, LAB E LINHA DO TEMPO
// ============================================================================

function salvarPacienteAtual() {
  const { idx: tIdx, subIdx, t } = getTaxonAtual();
  const nomeBaseEsp = limparEmoji(t.nome).split(" ")[0];
  const nome = document.getElementById("p-nome")?.value.trim() || `${nomeBaseEsp} (${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})`;
  const dataHora = new Date().toLocaleString("pt-BR");

  let pac = pacientesSalvos.find(p => p.id === pacienteAtualId || p.nome.toLowerCase() === nome.toLowerCase());
  if (!pac) {
    pac = { id: "pac_" + Date.now(), nome, historico: [] };
    pacientesSalvos.unshift(pac);
    pacienteAtualId = pac.id;
  }

  pac.nome = nome;
  pac.tIdx = tIdx;
  pac.subIdx = subIdx;
  pac.peso = document.getElementById("g-peso")?.value || "1";
  pac.unid = unidPeso;
  pac.pesoMagro = pesoMagroManual;

  pac.raca    = document.getElementById("p-raca")?.value || "";
  pac.sexo    = document.getElementById("p-sexo")?.value || "Macho, Fértil";
  pac.idade   = document.getElementById("p-idade")?.value || "";
  pac.tutor   = document.getElementById("p-tutor")?.value || "";
  pac.contato = document.getElementById("p-contato")?.value || "";
  pac.status  = document.getElementById("p-status")?.value || "Internado";
  pac.anam    = document.getElementById("p-anam")?.value || "";
  pac.exFis   = document.getElementById("p-exame-fisico")?.value || "";
  pac.comp    = document.getElementById("p-complementares")?.value || "";
  pac.diag    = document.getElementById("p-diagnostico")?.value || "";
  pac.sinais  = Array.from(sinaisAtivos);

  pac.temp    = document.getElementById("p-temp")?.value || "";
  pac.des     = document.getElementById("p-des")?.value || "0";
  pac.ecc     = document.getElementById("p-ecc")?.value || "0";
  pac.fc      = document.getElementById("p-fc")?.value || "";
  pac.fr      = document.getElementById("p-fr")?.value || "";
  pac.mucosas = document.getElementById("p-mucosas")?.value || "";
  pac.tpc     = document.getElementById("p-tpc")?.value || "";
  pac.ht      = document.getElementById("p-ht")?.value || "";
  pac.ppt     = document.getElementById("p-ppt")?.value || "";
  pac.glic    = document.getElementById("p-glic")?.value || "";
  pac.renal   = document.getElementById("p-renal")?.value || "";
  pac.hep     = document.getElementById("p-hep")?.value || "";

  const labResumo = [
    pac.ht ? `Ht ${pac.ht}%` : "",
    pac.ppt ? `PPT ${pac.ppt}` : "",
    pac.glic ? `Glic ${pac.glic}` : "",
    pac.renal ? `Renal ${pac.renal}` : "",
    pac.hep ? `Hep ${pac.hep}` : ""
  ].filter(Boolean).join(" | ");

  pac.historico.unshift({
    data: dataHora,
    tipo: "Atendimento / Evolução",
    resumo: `Peso: ${pac.peso} ${pac.unid} | T: ${pac.temp}°C | Suspeita: ${pac.diag || "Em investigação"}${labResumo ? " | Lab: " + labResumo : ""}`
  });

  localStorage.setItem(KEY_PACIENTES, JSON.stringify(pacientesSalvos));
  atualizarListaPacientesSalvos();
  renderTimelinePaciente(pac);
  sincronizarParaNuvem();
  showToast(`Prontuário de "${nome}" salvo.`, "ok");
}

function salvarReceitaNoProntuario() {
  if (!pacienteAtualId) salvarPacienteAtual();
  const pac = pacientesSalvos.find(p => p.id === pacienteAtualId);
  if (!pac) return;

  const htmlDoc = document.getElementById("print-area")?.innerHTML || "";
  const titulo = modoDocAtual === "receita" ? "Receita Emitida" : (modoDocAtual === "alta" ? "Resumo de Alta" : "Encaminhamento");
  pac.historico.unshift({
    data: new Date().toLocaleString("pt-BR"),
    tipo: titulo,
    resumo: (document.getElementById("print-area")?.innerText || "").slice(0, 140) + "...",
    htmlSalvo: htmlDoc
  });
  localStorage.setItem(KEY_PACIENTES, JSON.stringify(pacientesSalvos));
  renderTimelinePaciente(pac);
  sincronizarParaNuvem();
  showToast(`${titulo} anexada à Linha do Tempo.`, "ok");
}

function atualizarListaPacientesSalvos() {
  const sel = document.getElementById("sel-pacientes-salvos");
  if (!sel) return;
  sel.innerHTML = `<option value="">Pacientes salvos (${pacientesSalvos.length})</option>` +
    pacientesSalvos.map(p => `<option value="${p.id}" ${p.id === pacienteAtualId ? "selected" : ""}>${escapeHtml(p.nome)} (${p.peso} ${p.unid})</option>`).join("");
}

function carregarPacienteSalvo(id) {
  const pac = pacientesSalvos.find(p => p.id === id);
  if (!pac) return;
  pacienteAtualId = pac.id;
  document.getElementById("g-tax").value = String(pac.tIdx || 0);
  trocarGrupoTaxonomico();
  document.getElementById("g-subesp").value = String(pac.subIdx || 0);
  unidPeso = pac.unid || "kg";
  pesoMagroManual = pac.pesoMagro || 0;
  document.getElementById("g-peso").value = pac.peso || 1.0;
  atualizarBotoesUnidadeUI();

  const mapa = {
    "p-nome": pac.nome, "p-raca": pac.raca, "p-sexo": pac.sexo || "Macho, Fértil",
    "p-idade": pac.idade, "p-tutor": pac.tutor, "p-contato": pac.contato,
    "p-status": pac.status || "Internado", "p-anam": pac.anam, "p-exame-fisico": pac.exFis,
    "p-complementares": pac.comp, "p-diagnostico": pac.diag,
    "p-temp": pac.temp, "p-des": pac.des, "p-ecc": pac.ecc,
    "p-fc": pac.fc, "p-fr": pac.fr, "p-mucosas": pac.mucosas, "p-tpc": pac.tpc,
    "p-ht": pac.ht, "p-ppt": pac.ppt, "p-glic": pac.glic, "p-renal": pac.renal, "p-hep": pac.hep
  };
  Object.keys(mapa).forEach(k => {
    const el = document.getElementById(k);
    if (el && mapa[k] !== undefined && mapa[k] !== "") el.value = mapa[k];
  });

  sinaisAtivos = new Set(pac.sinais || []);
  atualizarPesoGlobal();
  renderTimelinePaciente(pac);
  fecharSheetPaciente();
  showToast(`Paciente "${pac.nome}" carregado.`, "info");
}

function novoPacienteLimpo() {
  pacienteAtualId = null;
  pesoMagroManual = 0;
  ["p-nome", "p-raca", "p-idade", "p-tutor", "p-contato", "p-anam", "p-exame-fisico", "p-complementares", "p-diagnostico", "p-fc", "p-fr", "p-mucosas", "p-tpc", "p-ht", "p-ppt", "p-glic", "p-renal", "p-hep"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  sinaisAtivos.clear();
  itensReceitaAtual = [];
  const iaBox = document.getElementById("ia-resposta-caso");
  if (iaBox) { iaBox.innerHTML = ""; iaBox.classList.add("hidden"); }
  atualizarListaPacientesSalvos();
  atualizarPesoGlobal();
  const tl = document.getElementById("timeline-paciente");
  if (tl) tl.innerHTML = "Novo atendimento iniciado.";
  showToast("Novo atendimento iniciado.", "info");
}

function renderTimelinePaciente(pac) {
  const box = document.getElementById("timeline-paciente");
  if (!box) return;
  if (!pac || !pac.historico || pac.historico.length === 0) {
    box.innerHTML = "Nenhum histórico registrado.";
    return;
  }
  box.innerHTML = pac.historico.map((h, i) => `
    <div class="vc-subcard p-2.5 ${h.tipo.includes("Receita") ? "vc-accent-left-purple" : "vc-accent-left-accent"} flex justify-between items-center gap-2">
      <div class="min-w-0">
        <div class="text-[11px] font-bold vc-text">${escapeHtml(h.data)} — <span class="vc-accent-text">${escapeHtml(limparEmoji(h.tipo))}</span></div>
        <div class="text-[11px] vc-muted truncate">${escapeHtml(h.resumo)}</div>
      </div>
      ${h.htmlSalvo ? `<button type="button" onclick="reabrirDocumentoSalvo('${pac.id}', ${i})" class="vc-btn vc-btn-secondary !py-1 !px-2 !text-[10px] shrink-0">Abrir</button>` : ""}
    </div>
  `).join("");
}

function reabrirDocumentoSalvo(pacId, histIdx) {
  const pac = pacientesSalvos.find(p => p.id === pacId);
  if (!pac || !pac.historico[histIdx]?.htmlSalvo) return;
  mudarAba("receitas");
  document.getElementById("print-area").innerHTML = pac.historico[histIdx].htmlSalvo;
}

function copiarProntuarioCompleto() {
  const { t, sub } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const ref = (typeof LAB_REF_DB !== "undefined" && LAB_REF_DB[t.id]) ? LAB_REF_DB[t.id] : LAB_REF_DB.Cao;
  const txt = `PRONTUÁRIO CLÍNICO — VETCORE
Paciente: ${document.getElementById("p-nome")?.value || "S/N"} | Espécie: ${limparEmoji(t.nome)} (${sub.nome})
Peso: ${formatarPesoExibicao(kg)} | Sexo: ${document.getElementById("p-sexo")?.value} | Idade: ${document.getElementById("p-idade")?.value}
Tutor/Origem: ${document.getElementById("p-tutor")?.value} (${document.getElementById("p-contato")?.value})
----------------------------------------
ANAMNESE: ${document.getElementById("p-anam")?.value}
EXAME FÍSICO: Temp ${document.getElementById("p-temp")?.value}°C | Desid. ${document.getElementById("p-des")?.value}% | FC ${document.getElementById("p-fc")?.value} | FR ${document.getElementById("p-fr")?.value} | Mucosas ${document.getElementById("p-mucosas")?.value} | TPC ${document.getElementById("p-tpc")?.value} | ${document.getElementById("p-exame-fisico")?.value}
EXAMES LAB: Ht ${document.getElementById("p-ht")?.value || "-"}% | PPT ${document.getElementById("p-ppt")?.value || "-"} g/dL | Glic ${document.getElementById("p-glic")?.value || "-"} mg/dL | ${ref.renalNome}: ${document.getElementById("p-renal")?.value || "-"} | ${ref.hepNome}: ${document.getElementById("p-hep")?.value || "-"}
COMPLEMENTARES: ${document.getElementById("p-complementares")?.value}
DIAGNÓSTICO / SUSPEITA: ${document.getElementById("p-diagnostico")?.value}`;
  navigator.clipboard.writeText(txt).then(() => showToast("Ficha clínica copiada.", "ok"));
}

// ============================================================================
// ABA 3: CÁLCULOS (DOSES, UI UNIVERSAL, CRI, FLK/MLK, SEDAÇÃO E EUTANÁSIA)
// ============================================================================

function alternarSubCalc(qual) {
  ["doses", "cri", "sedacao", "eutanasia"].forEach(k => {
    document.getElementById(`subcalc-${k}`)?.classList.toggle("hidden", k !== qual);
    document.getElementById(`subbtn-${k}`)?.classList.toggle("active", k === qual);
  });
}

function popularPillsCalculadoras() {
  const pillsEl = document.getElementById("calc-drogas-pills");
  if (pillsEl) {
    pillsEl.innerHTML = FARMACOS_DB.filter(f => f.id !== "Pentabiotico").map(f => {
      const i = FARMACOS_DB.indexOf(f);
      return `<button type="button" onclick="preencherCalcDroga(${i})" class="vc-chip">${escapeHtml(f.nome.split("(")[0].trim())}</button>`;
    }).join("");
  }

  const presetsCRI = [
    ["Fentanil (3 µg/kg/h)", 3, "mcg_h", 0.05],
    ["Lidocaína Cão (50 µg/kg/min)", 50, "mcg_min", 20],
    ["Cetamina (10 µg/kg/min)", 10, "mcg_min", 100],
    ["Noradrenalina (0,2 µg/kg/min)", 0.2, "mcg_min", 1],
    ["Dobutamina (5 µg/kg/min)", 5, "mcg_min", 12.5]
  ];
  const criEl = document.getElementById("cri-presets-pills");
  if (criEl) {
    criEl.innerHTML = presetsCRI.map(p =>
      `<button type="button" onclick="document.getElementById('cr-dose').value=${p[1]};document.getElementById('cr-unid').value='${p[2]}';document.getElementById('cr-conc').value=${p[3]};calcularCRI();" class="vc-chip">${p[0]}</button>`
    ).join("");
  }
}

function preencherCalcDroga(fIdx) {
  const { idx: tIdx, t } = getTaxonAtual();
  const f = FARMACOS_DB[fIdx];
  const { doseAtiva, concAtiva } = getConfigFarmacoParaTaxon(f, tIdx, t);
  document.getElementById("ca-dose").value = doseAtiva;
  document.getElementById("ca-udose").value = "mg";
  document.getElementById("ca-conc").value = concAtiva;
  document.getElementById("ca-uconc").value = "mgml";
  calcularDoseIsolada();
}

function calcularDoseIsolada() {
  const out = document.getElementById("ca-out-destaque");
  if (!out) return;
  const kg = getPesoEfetivoKg();
  const dVal = parseFloat(document.getElementById("ca-dose")?.value) || 0;
  const uDose = document.getElementById("ca-udose")?.value;
  const cVal = parseFloat(document.getElementById("ca-conc")?.value) || 0;
  const uConc = document.getElementById("ca-uconc")?.value;

  const doseMgKg = uDose === "mcg" ? dVal / 1000 : dVal;
  const concMgMl = uConc === "perc" ? cVal * 10 : cVal;
  if (kg <= 0 || doseMgKg <= 0 || concMgMl <= 0) {
    out.innerHTML = "";
    return;
  }

  const mgTot  = kg * doseMgKg;
  const mlPuro = mgTot / concMgMl;
  const precisaDiluir = mlPuro < 0.05;

  out.innerHTML = `
    <div class="vc-subcard p-4 text-center space-y-1 ${precisaDiluir ? "vc-accent-left-warn" : "vc-accent-left-accent"}">
      <div class="text-[11px] uppercase tracking-wider font-bold ${precisaDiluir ? "vc-warn-text" : "vc-accent-text"}">
        ${precisaDiluir ? "Volume Puro < 0,05 mL — Usar Diluição 1:10" : `Aspirar do Frasco (${formatarPesoCurto(kg)})`}
      </div>
      <div class="text-3xl font-extrabold vc-text mono">${mlPuro.toFixed(3)} mL</div>
      <div class="text-xs font-bold vc-accent-text mono">${(mlPuro * 100).toFixed(1)} UI (Seringa U-100) &middot; Total ${mgTot.toFixed(3)} mg</div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
      <div class="vc-subcard p-2.5 vc-accent-left-info">
        <div class="text-[10px] font-bold vc-info-text uppercase">Diluição 1:10 (0,1 + 0,9 mL NaCl)</div>
        <div class="text-sm font-extrabold vc-text mono mt-0.5">${(mlPuro * 10).toFixed(2)} mL (${(mlPuro * 1000).toFixed(0)} UI)</div>
      </div>
      <div class="vc-subcard p-2.5 vc-accent-left-purple">
        <div class="text-[10px] font-bold vc-purple-text uppercase">Diluição 1:100</div>
        <div class="text-sm font-extrabold vc-text mono mt-0.5">${(mlPuro * 100).toFixed(2)} mL</div>
      </div>
    </div>
  `;
}

// --- CALCULADORA & CONVERSOR UNIVERSAL DE UI ---

const PRESETS_UI_UNIVERSAL = [
  { nome: "Pentabiótico (1,2M / 5 mL)", doseUI: 30000, frascoUI: 1200000, dilMl: 5, refUI: 1600, refMassa: 1, refUnid: "mg" },
  { nome: "Insulina U-100", doseUI: 0.25, frascoUI: 100, dilMl: 1, refUI: 1, refMassa: 0.0347, refUnid: "mg" },
  { nome: "Ocitocina (10 UI/mL)", doseUI: 5, frascoUI: 10, dilMl: 1, refUI: 1, refMassa: 1.68, refUnid: "mcg" },
  { nome: "Heparina (5.000 UI/mL)", doseUI: 100, frascoUI: 5000, dilMl: 1, refUI: 100, refMassa: 1, refUnid: "mg" },
  { nome: "Vit. A (Retinol)", doseUI: 10000, frascoUI: 50000, dilMl: 1, refUI: 1, refMassa: 0.3, refUnid: "mcg" },
  { nome: "Vit. D3", doseUI: 1000, frascoUI: 10000, dilMl: 1, refUI: 1, refMassa: 0.025, refUnid: "mcg" },
  { nome: "Vit. E", doseUI: 50, frascoUI: 100, dilMl: 1, refUI: 1, refMassa: 0.67, refUnid: "mg" }
];

function popularPresetsUI() {
  const box = document.getElementById("ui-presets-pills");
  if (!box) return;
  box.innerHTML = PRESETS_UI_UNIVERSAL.map((p, i) =>
    `<button type="button" onclick="aplicarPresetUI(${i})" class="vc-chip">${p.nome}</button>`
  ).join("");
}

function alternarModoUI(modo) {
  document.getElementById("painel-ui-dose")?.classList.toggle("hidden", modo !== "dose");
  document.getElementById("painel-ui-massa")?.classList.toggle("hidden", modo !== "massa");
  document.getElementById("btn-ui-dose")?.classList.toggle("active", modo === "dose");
  document.getElementById("btn-ui-massa")?.classList.toggle("active", modo === "massa");
  calcularDoseUI();
  converterUIUniversal();
}

function aplicarPresetUI(idx) {
  const p = PRESETS_UI_UNIVERSAL[idx];
  if (!p) return;
  document.getElementById("uid-dose").value = p.doseUI;
  document.getElementById("uid-frasco-ui").value = p.frascoUI;
  document.getElementById("uid-diluente").value = p.dilMl;
  document.getElementById("uim-ref-ui").value = p.refUI;
  document.getElementById("uim-ref-massa").value = p.refMassa;
  document.getElementById("uim-ref-unid").value = p.refUnid;
  calcularDoseUI();
  converterUIUniversal();
}

function calcularDoseUI() {
  const box = document.getElementById("uid-resultado");
  if (!box) return;
  const kg = getPesoEfetivoKg();
  const doseUIkg = parseFloat(document.getElementById("uid-dose")?.value) || 0;
  const frascoUI = parseFloat(document.getElementById("uid-frasco-ui")?.value) || 0;
  const dilMl    = parseFloat(document.getElementById("uid-diluente")?.value) || 1;
  if (kg <= 0 || doseUIkg <= 0 || frascoUI <= 0 || dilMl <= 0) {
    box.innerHTML = `<span class="vc-muted">Informe a dose em UI/kg, as UI do frasco e o volume de diluente (use 1 mL se o frasco já estiver em UI/mL).</span>`;
    return;
  }

  const concUIml = frascoUI / dilMl;
  const uiTotal  = kg * doseUIkg;
  const mlFinal  = uiTotal / concUIml;

  box.innerHTML = `
    <div class="text-[11px] vc-secondary">Concentração: <strong class="vc-text mono">${concUIml.toLocaleString("pt-BR")} UI/mL</strong> &middot; Total (${formatarPesoCurto(kg)}): <strong class="vc-warn-text mono">${uiTotal.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} UI</strong></div>
    <div class="text-xl font-extrabold vc-accent-text mono mt-1">Aspirar: ${formatarVolumeSeguro(mlFinal)}</div>
  `;
}

function converterUIUniversal() {
  const box = document.getElementById("uim-resultado");
  if (!box) return;
  const refUI    = parseFloat(document.getElementById("uim-ref-ui")?.value) || 0;
  const refMassa = parseFloat(document.getElementById("uim-ref-massa")?.value) || 0;
  const refUnid  = document.getElementById("uim-ref-unid")?.value || "mg";
  const val      = parseFloat(document.getElementById("uim-valor")?.value) || 0;
  const dir      = document.getElementById("uim-dir")?.value || "ui";

  if (refUI <= 0 || refMassa <= 0 || val <= 0) {
    box.innerHTML = `<span class="vc-muted">Informe a equivalência da bula e o valor a converter.</span>`;
    return;
  }

  const refMg = refUnid === "mcg" ? (refMassa / 1000) : refMassa;
  const mgPorUI = refMg / refUI;

  if (dir === "ui") {
    const mg = val * mgPorUI;
    const mcg = mg * 1000;
    box.innerHTML = `
      <div class="text-[11px] vc-secondary">${val.toLocaleString("pt-BR")} UI equivale a:</div>
      <div class="text-lg font-extrabold vc-accent-text mono mt-0.5">${mg >= 1 ? mg.toFixed(4) + " mg" : mcg.toFixed(3) + " µg"}</div>
      <div class="text-[11px] vc-muted mono">${mg.toFixed(5)} mg &middot; ${mcg.toFixed(2)} µg</div>
    `;
  } else {
    const emMg = dir === "mcg" ? (val / 1000) : val;
    const ui = emMg / mgPorUI;
    box.innerHTML = `
      <div class="text-[11px] vc-secondary">${val} ${dir === "mcg" ? "µg" : "mg"} equivale a:</div>
      <div class="text-lg font-extrabold vc-accent-text mono mt-0.5">${ui.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} UI</div>
    `;
  }
}

// --- CRI & BOMBAS COMBINADAS ---

function toggleModoCRI(novato) {
  modoCriNovato = novato;
  document.getElementById("btn-cri-novato")?.classList.toggle("active", novato);
  document.getElementById("btn-cri-rapido")?.classList.toggle("active", !novato);
  calcularCRI();
}

function calcularCRI() {
  const out = document.getElementById("cr-out");
  if (!out) return;
  const peso  = getPesoEfetivoKg();
  const mlh   = parseFloat(document.getElementById("cr-mlh")?.value) || 0;
  const bolsa = parseFloat(document.getElementById("cr-bolsa")?.value) || 0;
  const dose  = parseFloat(document.getElementById("cr-dose")?.value) || 0;
  const unid  = document.getElementById("cr-unid")?.value;
  const conc  = parseFloat(document.getElementById("cr-conc")?.value) || 0;
  if (peso <= 0 || mlh <= 0 || bolsa <= 0 || dose <= 0 || conc <= 0) return;

  let mgPorHora = dose * peso;
  if (unid === "mcg_min") mgPorHora = (dose * peso * 60) / 1000;
  else if (unid === "mcg_h") mgPorHora = (dose * peso) / 1000;

  const horasDuracao = bolsa / mlh;
  const mgTotalBolsa = mgPorHora * horasDuracao;
  const mlFarmaco    = mgTotalBolsa / conc;
  const mlDiluente   = bolsa - mlFarmaco;

  if (mlFarmaco >= bolsa) {
    out.innerHTML = `<div class="vc-alert vc-alert-danger font-bold">Volume de fármaco (${mlFarmaco.toFixed(1)} mL) excede a seringa/bolsa (${bolsa} mL).</div>`;
    return;
  }

  if (!modoCriNovato) {
    out.innerHTML = `<div class="vc-subcard p-3.5 vc-accent-left-info space-y-1 text-xs">
      <div class="text-sm font-extrabold vc-accent-text mono">Fármaco: ${mlFarmaco.toFixed(2)} mL (${(mlFarmaco * 100).toFixed(0)} UI) + Diluente: ${mlDiluente.toFixed(2)} mL</div>
      <div class="vc-secondary">Taxa: <strong class="vc-text">${mlh.toFixed(1)} mL/h</strong> (${horasDuracao.toFixed(1)}h) &middot; Microgotas: <strong class="vc-text">${mlh.toFixed(0)} mcgts/min</strong></div>
    </div>`;
  } else {
    out.innerHTML = `<div class="vc-subcard p-3.5 vc-accent-left-accent space-y-1.5 text-xs vc-secondary leading-relaxed">
      <div class="font-bold vc-accent-text uppercase text-[11px]">Passo a Passo (${formatarPesoCurto(peso)})</div>
      <div><strong class="vc-text">1. Diluente (${bolsa} mL):</strong> Coloque <strong class="vc-info-text mono">${mlDiluente.toFixed(2)} mL</strong> de NaCl 0,9%.</div>
      <div><strong class="vc-text">2. Fármaco:</strong> Aspire <strong class="vc-accent-text mono">${mlFarmaco.toFixed(2)} mL (${(mlFarmaco * 100).toFixed(0)} UI)</strong> do frasco (${conc} mg/mL) e complete até ${bolsa} mL.</div>
      <div><strong class="vc-text">3. Bomba:</strong> Programe em <strong class="vc-warn-text mono">${mlh.toFixed(1)} mL/h</strong> (duração ${horasDuracao.toFixed(1)}h | ${mlh.toFixed(0)} mcgts/min).</div>
    </div>`;
  }
}

function setBombaComb(tipo) {
  tipoBombaComb = tipo;
  renderBombasCombinadas();
}

function renderBombasCombinadas() {
  const box = document.getElementById("box-bombas-combinadas");
  if (!box) return;
  const { t } = getTaxonAtual();
  const kg    = getPesoEfetivoKg();
  const mlh   = parseFloat(document.getElementById("cr-mlh")?.value) || 10;
  const bolsa = parseFloat(document.getElementById("cr-bolsa")?.value) || 100;
  const horas = mlh > 0 ? (bolsa / mlh) : 0;
  const isGato = t.id === "Gato" || (t.id === "CarnivorosSilv" && document.getElementById("g-subesp")?.value === "1");

  const isMLK = tipoBombaComb === "MLK";
  const nomeOpioide = isMLK ? "Metadona (10 mg/mL — 0,1 mg/kg/h)" : "Fentanil (0,05 mg/mL — 3 µg/kg/h)";
  const mlOpioide   = isMLK ? ((0.1 * kg * horas) / 10) : ((0.003 * kg * horas) / 0.05);
  const mlLido = isGato ? 0 : ((1.8 * kg * horas) / 20);
  const mlCet = (0.6 * kg * horas) / 100;
  const mlSoro = bolsa - (mlOpioide + mlLido + mlCet);

  box.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b vc-divider">
      <div>
        <span class="vc-section-label">Bombas Combinadas (${isGato ? "FK / MK" : "FLK / MLK"})</span>
        <button type="button" onclick="abrirModalGuiaBomba()" class="ml-2 text-[11px] font-bold vc-info-text hover:underline">Fisiologia</button>
      </div>
      <div class="vc-segmented !p-0.5">
        <button type="button" onclick="setBombaComb('FLK')" class="vc-seg-btn !py-1 !px-2.5 !text-[11px] ${tipoBombaComb === "FLK" ? "active" : ""}">${isGato ? "FK" : "FLK"}</button>
        <button type="button" onclick="setBombaComb('MLK')" class="vc-seg-btn !py-1 !px-2.5 !text-[11px] ${tipoBombaComb === "MLK" ? "active" : ""}">${isGato ? "MK" : "MLK"}</button>
      </div>
    </div>

    ${isGato ? `<div class="vc-alert vc-alert-danger font-semibold">Trava Felina Ativa: Lidocaína IV contínua removida automaticamente (depressão cardiovascular em felinos). Calculado como ${isMLK ? "MK" : "FK"}.</div>` : ""}

    <div class="vc-subcard p-3.5 space-y-1.5 text-xs">
      <div class="text-[11px] vc-muted">Bolsa ${bolsa} mL a ${mlh} mL/h (${horas.toFixed(1)}h) — ${formatarPesoCurto(kg)}</div>
      <div class="flex justify-between py-1.5 border-b vc-divider"><span class="vc-secondary">1. ${nomeOpioide}</span><strong class="vc-accent-text mono">${mlOpioide.toFixed(2)} mL</strong></div>
      ${!isGato ? `<div class="flex justify-between py-1.5 border-b vc-divider"><span class="vc-secondary">2. Lidocaína 2% s/ vaso (30 µg/kg/min)</span><strong class="vc-accent-text mono">${mlLido.toFixed(2)} mL</strong></div>` : ""}
      <div class="flex justify-between py-1.5 border-b vc-divider"><span class="vc-secondary">${isGato ? "2." : "3."} Cetamina 10% (10 µg/kg/min)</span><strong class="vc-accent-text mono">${mlCet.toFixed(2)} mL</strong></div>
      <div class="flex justify-between pt-1.5"><span class="vc-text font-semibold">Diluente (NaCl 0,9% / RL)</span><strong class="vc-info-text mono">${mlSoro.toFixed(2)} mL</strong></div>
    </div>
  `;
}

function abrirModalGuiaBomba() {
  document.getElementById("modal-titulo").textContent = "Fisiologia das Bombas FLK / MLK / FK";
  document.getElementById("modal-corpo").innerHTML = `
    <div class="space-y-2.5 text-xs vc-secondary leading-relaxed">
      <div class="vc-subcard p-3 space-y-1">
        <strong class="vc-accent-text">Sinergismo Multimodal</strong>
        <p><strong class="vc-text">Fentanil / Metadona:</strong> Agonista Mu puro; bloqueia aferência nociceptiva primária.<br>
        <strong class="vc-text">Lidocaína 2% (cães):</strong> Bloqueio de canais Na+ em fibras C, efeito anti-inflamatório sistêmico e procinético.<br>
        <strong class="vc-text">Cetamina (microdose):</strong> Antagonista NMDA; previne sensibilização central (wind-up).</p>
      </div>
      <div class="vc-subcard p-3 space-y-1">
        <strong class="vc-warn-text">Indicação &amp; Trava Felina</strong>
        <p>Cirurgias invasivas, osteossíntese, mastectomia radical, pancreatite e dor severa. Em felinos, usar apenas FK ou MK (sem Lidocaína).</p>
      </div>
    </div>
  `;
  document.getElementById("modal-core")?.classList.remove("hidden");
}

function renderProtocolosEspecie() {
  const { t } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const pesoTxt = formatarPesoExibicao(kg);
  const nomeEsp = limparEmoji(t.nome);
  const mlFlumazenil = (kg * (t.grupo.includes("Aves") ? 0.05 : 0.02)) / 0.1;

  const boxSed = document.getElementById("box-sedacao-especie");
  if (boxSed) {
    boxSed.innerHTML = `
      <div class="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b vc-divider">
        <div>
          <span class="vc-section-label">Protocolos de Sedação — ${escapeHtml(nomeEsp)}</span>
          <div class="text-xs vc-muted mt-0.5">Peso ativo: <strong class="vc-text mono">${pesoTxt}</strong></div>
        </div>
        <span class="vc-badge vc-badge-purple mono">Reversor Flumazenil: ${formatarVolumeSeguro(mlFlumazenil)}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${t.sedacao.map(s => {
          let volTotal = 0;
          const linhas = s.drogas.map(d => {
            const farm = FARMACOS_DB.find(f => f.id.startsWith(d[0])) || { conc: 10 };
            const conc = farm._concAtiva || farm.conc;
            const ml = (kg * d[1]) / conc;
            volTotal += ml;
            return `<div class="flex justify-between items-center py-1.5 border-b vc-divider text-xs">
              <span class="vc-secondary"><strong class="vc-text">${d[0]}</strong> (${d[1]} mg/kg · ${conc} mg/mL)</span>
              <strong class="vc-accent-text mono text-right">${formatarVolumeSeguro(ml)}</strong>
            </div>`;
          }).join("");
          const alertaDiv = (t.grupo.includes("Aves") && volTotal > 0.35)
            ? `<div class="vc-alert vc-alert-warn !py-2">Volume IM (${volTotal.toFixed(2)} mL): dividir ${(volTotal / 2).toFixed(2)} mL em cada lado do peitoral.</div>` : "";
          return `<div class="vc-subcard p-3.5 space-y-2">
            <div class="font-bold text-xs vc-text">${escapeHtml(s.nome)}</div>
            <div>${linhas}</div>
            ${alertaDiv}
            <div class="text-[11px] vc-muted"><strong class="vc-secondary">Via:</strong> ${s.via} · ${s.obs}</div>
          </div>`;
        }).join("")}
      </div>
    `;
  }

  const boxEu = document.getElementById("box-eutanasia-especie");
  if (boxEu) {
    const eu = t.eutanasia;
    const mlCet  = (kg * eu.etapa1[1]) / eu.etapa1[2];
    const mlMid  = (kg * eu.etapa1[3]) / eu.etapa1[4];
    const mlProp = (kg * eu.etapa2[1]) / eu.etapa2[2];
    const mlKcl  = kg * eu.etapa3[1];
    boxEu.innerHTML = `
      <div class="vc-alert vc-alert-danger">
        <strong>Diretriz Ética (CFMV nº 1000/2012 &amp; AVMA) — ${pesoTxt}:</strong> Seguir rigorosamente as 3 etapas sequenciais. Proibido administrar KCl antes de arreflexia profunda confirmada (Etapa 2).
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="vc-subcard p-3.5 vc-accent-left-info space-y-1.5">
          <div class="text-xs font-bold vc-info-text">1ª Etapa: Sedação Profunda (MPA)</div>
          <p class="text-[11px] vc-secondary">${eu.etapa1[0]}</p>
          <div class="text-xs font-bold vc-text mono pt-1 space-y-1">
            <div>Cetamina: <span class="vc-accent-text">${formatarVolumeSeguro(mlCet)}</span></div>
            <div>Midazolam: <span class="vc-accent-text">${formatarVolumeSeguro(mlMid)}</span></div>
          </div>
        </div>
        <div class="vc-subcard p-3.5 vc-accent-left-purple space-y-1.5">
          <div class="text-xs font-bold vc-purple-text">2ª Etapa: Anestesia Geral</div>
          <p class="text-[11px] vc-secondary">${eu.etapa2[0]}</p>
          <div class="text-xs font-bold vc-text mono pt-1">Propofol: <span class="vc-accent-text">${formatarVolumeSeguro(mlProp)} IV/IO</span></div>
        </div>
        <div class="vc-subcard p-3.5 vc-accent-left-danger space-y-1.5">
          <div class="text-xs font-bold vc-danger-text">3ª Etapa: Parada Cardíaca</div>
          <p class="text-[11px] vc-secondary">${eu.etapa3[0]}</p>
          <div class="text-xs font-bold vc-text mono pt-1">KCl 19,1%: <span class="vc-danger-text">${formatarVolumeSeguro(mlKcl)} IV</span></div>
        </div>
      </div>
    `;
  }
}

// ============================================================================
// ABA 4: EMERGÊNCIA (MATERIAIS, DROGAS PCR, XABCDE E MANOBRAS)
// ============================================================================

function renderPainelEmergencia() {
  const { t } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const g  = kg * 1000;
  const isAve = t.grupo.includes("Aves");
  const isRep = t.grupo.includes("Répteis");
  const semCuff = isAve || isRep || t.id === "Coelhos" || t.id === "Caviomorfos";
  const nomeEsp = limparEmoji(t.nome);

  // Materiais
  const boxMat = document.getElementById("barra-materiais-emergencia");
  if (boxMat) {
    let cateter = "22G (Azul) a 20G (Rosa)";
    let agulhaIO = "Agulha 20G a 18G (ou Biópsia Medular)";
    let tuboET = `${Math.max(2.0, Math.min(9.0, +(Math.sqrt(kg) * 1.6).toFixed(1)))} mm ${semCuff ? "(SEM CUFF)" : "(Com Cuff)"}`;
    let sondaGav = "Sonda nº 10 Fr a 14 Fr";

    if (g < 80) {
      cateter  = "26G (Roxo) ou Escalpe 27G";
      agulhaIO = `Agulha 25G–26G (${isAve ? "Ulna distal / Tibiotarso" : "Tíbia / Fêmur"})`;
      tuboET   = "Cateter IV 18G–14G adaptado (SEM CUFF)";
      sondaGav = "Sonda Uretral nº 4 Fr ou Cateter 18G romba";
    } else if (g <= 500) {
      cateter  = "24G (Amarelo) ou 26G (Roxo)";
      agulhaIO = `Agulha 22G–24G (${isAve ? "Ulna distal / Tibiotarso — Proibido Úmero/Fêmur" : "Fêmur / Tíbia"})`;
      tuboET   = "1,5 a 2,5 mm (OBRIGATÓRIO SEM CUFF)";
      sondaGav = isAve ? "Sonda Metálica 12G–14G ou Uretral nº 6 Fr" : "Sonda Uretral nº 6 Fr";
    } else if (kg <= 3.5) {
      cateter  = "22G (Azul) ou 24G (Amarelo)";
      agulhaIO = `Agulha 20G–22G (${isAve ? "Ulna distal / Tibiotarso" : "Fêmur proximal / Tíbia"})`;
      tuboET   = `2,5 a 4,0 mm ${semCuff ? "(SEM CUFF)" : "(Cuff baixa pressão)"}`;
      sondaGav = "Sonda nº 8 Fr a 10 Fr";
    }

    boxMat.innerHTML = `
      <div class="vc-section-label mb-2.5">Dimensionamento de Materiais — ${escapeHtml(nomeEsp)} (${formatarPesoCurto(kg)})</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        <div class="vc-subcard p-2.5"><span class="text-[10px] vc-muted uppercase block">Cateter IV</span><strong class="vc-text">${cateter}</strong></div>
        <div class="vc-subcard p-2.5"><span class="text-[10px] vc-muted uppercase block">Acesso Intraósseo</span><strong class="vc-warn-text">${agulhaIO}</strong></div>
        <div class="vc-subcard p-2.5"><span class="text-[10px] vc-muted uppercase block">Tubo Endotraqueal</span><strong class="vc-accent-text">${tuboET}</strong></div>
        <div class="vc-subcard p-2.5"><span class="text-[10px] vc-muted uppercase block">Sonda Gavagem</span><strong class="vc-info-text">${sondaGav}</strong></div>
      </div>
    `;
  }

  // Drogas de Emergência
  const gridEm = document.getElementById("grid-drogas-emergencia");
  if (gridEm) {
    gridEm.innerHTML = DROGAS_EMERGENCIA_DB.map(d => {
      let dose = d.dosePadrao;
      if (isAve && d.doseAves !== undefined) dose = d.doseAves;
      if (t.id === "Gato" && d.doseGato !== undefined) dose = d.doseGato;
      const ml = (kg * dose) / d.conc;
      const sem = corSemanticaClasse(d.cor);
      return `<div class="vc-subcard p-3 vc-accent-left-${sem} flex flex-col justify-between gap-2">
        <div>
          <div class="text-xs font-bold vc-text">${escapeHtml(d.nome)}</div>
          <div class="text-[11px] vc-muted">Dose: <strong class="vc-secondary">${dose} ${d.conc === 1 && d.nome.includes("Salina") ? "mL/kg" : "mg/kg"}</strong> · ${d.apres}</div>
        </div>
        <div class="py-1.5 px-2.5 rounded-lg text-sm font-extrabold vc-accent-text mono" style="background:var(--bg-surface);border:1px solid var(--border-subtle)">
          ${formatarVolumeSeguro(ml)}
        </div>
        <div class="text-[11px] vc-secondary leading-snug"><strong class="vc-text">Via:</strong> ${d.via}<div class="vc-warn-text mt-0.5">${limparEmoji(d.obs)}</div></div>
      </div>`;
    }).join("");
  }

  // XABCDE
  const boxX = document.getElementById("box-xabcde");
  if (boxX) {
    const chaveTaxon = isAve ? "Aves" : (isRep ? "Repteis" : t.id);
    const x = PROTOCOLOS_MESTRES.xabcde;
    boxX.innerHTML = `
      <div class="vc-subcard p-2.5 text-[11px] vc-muted"><strong class="vc-secondary">Fontes Base:</strong> ${x.fontesBase.join(" · ")}</div>
      <div class="space-y-2.5">
        ${x.etapas.map(et => {
          const sem = corSemanticaClasse(et.cor);
          const notaEsp = et.porTaxon[t.id] || et.porTaxon[chaveTaxon] || "";
          const calcChoque = et.letra === "C" ? `<div class="vc-alert vc-alert-accent font-bold mono">Prova de Carga (${formatarPesoCurto(kg)} · ${t.bolusChoque} mL/kg): Infundir ${(kg * t.bolusChoque).toFixed(2)} mL em 15 min e reavaliar.</div>` : "";
          return `<div class="vc-subcard p-3.5 vc-accent-left-${sem} space-y-2">
            <div class="flex items-center gap-2">
              <span class="vc-badge vc-badge-${sem} mono !text-xs !px-2">${et.letra}</span>
              <strong class="text-xs sm:text-sm vc-text">${et.nome}</strong>
            </div>
            <p class="text-xs vc-secondary whitespace-pre-line leading-relaxed">${et.geral}</p>
            ${calcChoque}
            ${notaEsp ? `<div class="vc-alert vc-alert-warn"><strong>Particularidade em ${escapeHtml(nomeEsp)}:</strong> ${limparEmoji(notaEsp)}</div>` : ""}
          </div>`;
        }).join("")}
      </div>
    `;
  }

  // Manobras
  const boxMan = document.getElementById("box-manobras-emergencia");
  if (boxMan) {
    boxMan.innerHTML = PROTOCOLOS_MESTRES.manobras.map(m => `
      <div class="vc-subcard p-3.5 space-y-1.5">
        <div class="text-xs font-bold vc-text">${escapeHtml(limparEmoji(m.titulo))}</div>
        <div class="text-[10px] vc-accent-text font-semibold">Fonte: ${m.fonte}</div>
        <p class="text-xs vc-secondary whitespace-pre-line leading-relaxed">${m.passos}</p>
      </div>
    `).join("");
  }
}

// ============================================================================
// ABA 5: BULÁRIO, FICHA MONOGRÁFICA COMPLETA (TODOS OS TÁXONS) & BIBLIOTECA
// ============================================================================

const MONOGRAFIAS_EXTRA = {
  "Meloxicam": {
    classe: "AINE derivado do ácido enólico (Oxicam) — Inibidor preferencial COX-2",
    validade: "28 dias a 6 meses após aberto (conforme bula; proteger da luz)",
    vias: [
      ["VO", "Liberada", "Boa palatabilidade em suspensões; administrar após alimentação com paciente normohidratado."],
      ["SC", "Liberada", "Excelente via de rotina em cães, gatos, marsupiais e pequenos mamíferos; garantir hidratação prévia."],
      ["IM", "Liberada", "Boa tolerabilidade; em quelônios (Testudines) e lagartos, aplicar exclusivamente nos membros anteriores."],
      ["IV", "Liberada", "Administrar lentamente em pacientes hemodinamicamente estáveis e normotensos."]
    ],
    populacoes: [
      "Pediátricos: Cautela extrema — néfrons imaturos e maior risco de lesão renal aguda.",
      "Geriátricos: Avaliar função renal/hepática prévia e empregar a menor dose eficaz pelo menor tempo.",
      "Nefropatas / Desidratados / Choque: Contraindicação absoluta (vasoconstrição aferente e necrose tubular aguda).",
      "Hepatopatas / Úlcera GI: Contraindicado em hepatopatia moderada a grave ou sangramento GI ativo.",
      "Interações Críticas: Proibido associar com outros AINEs ou Corticoides (risco de perfuração gástrica)."
    ],
    notasTaxon: {
      Gato: "Dose de ataque 0,1 mg/kg no Dia 1, reduzindo para 0,05 mg/kg SID; contraindicado na DRC descompensada.",
      Gamba: "Seguro a 0,1–0,2 mg/kg SID por no máximo 3 dias (alto risco de úlcera gástrica em uso prolongado).",
      Coelhos: "Metabolismo hepático ultrarrápido: usar 0,5–1,0 mg/kg q12–24h.",
      Caviomorfos: "Depuração rápida; usar 0,5 mg/kg q12–24h com boa hidratação.",
      Miomorfos: "Ratos/Camundongos: 1,0 mg/kg q12–24h (literatura cita até 2 mg/kg em dor aguda).",
      Psittaciformes: "Baixa biodisponibilidade oral relativa exige 1,0 mg/kg q12h; evitar em suspeita de Bornavírus Aviário.",
      Passeriformes: "Alta taxa metabólica obriga intervalo q12h.",
      Cathartiformes: "Único AINE seguro em urubus e aves de rapina (Diclofenaco, Flunixin e Cetoprofeno são letais)."
    }
  },
  "Amoxicilina+Clav": {
    classe: "Beta-lactâmico (Aminopenicilina) + Inibidor de Beta-lactamase (Ácido Clavulânico)",
    validade: "Suspensão oral reconstituída: 7 a 10 dias sob refrigeração (2–8 °C)",
    vias: [
      ["VO", "Liberada", "1ª escolha em cães, gatos, aves e ratos (Rattus). Proibido VO em Coelhos, Cobaias, Chinchilas e Ouriço-cacheiro."],
      ["SC", "Liberada", "Somente formulação injetável veterinária (Synulox RTU); agitar vigorosamente antes de aspirar."],
      ["IM", "Cautela", "Apenas formulação injetável específica; pode causar desconforto local."],
      ["IV", "Cautela", "Apenas formulações hospitalares específicas para uso IV; nunca injetar suspensão RTU IV."]
    ],
    populacoes: [
      "Pediátricos / Gestantes: Alta margem de segurança (1ª linha em filhotes).",
      "Nefropatas: Excreção predominantemente renal; em azotemia severa espaçar o intervalo.",
      "Fermentadores Cecais (Coelhos/Caviomorfos): Contraindicação absoluta por via oral (enterotoxemia letal)."
    ],
    notasTaxon: {
      Columbiformes: "1ª escolha imediata em ataque/mordedura de gato (Pasteurella multocida): 125 mg/kg VO q12h.",
      Miomorfos: "Seguro por via oral em Ratos (Rattus) e Camundongos (20 mg/kg BID); evitar em Hamsters."
    }
  },
  "Enrofloxacina": {
    classe: "Fluoroquinolona de 2ª geração (Bactericida concentração-dependente)",
    validade: "Frasco injetável: 28 dias após perfurado em temperatura ambiente; não congelar",
    vias: [
      ["VO", "Liberada", "Boa absorção; evitar administrar junto com cálcio, alumínio, ferro ou sucralfato (quelação)."],
      ["SC", "Cautela", "pH alcalino: diluir 1:4 em NaCl 0,9% para evitar necrose e abscesso estéril subcutâneo."],
      ["IM", "Cautela", "Evitar aplicações repetidas em aves e pequenos mamíferos (mionecrose muscular)."],
      ["IV", "Cautela", "Apenas diluída em infusão lenta (20–30 min); evitar IV em gatos pelo pico retinotóxico."]
    ],
    populacoes: [
      "Felinos (Domésticos e Silvestres): Defeito ABCG2 causa degeneração retiniana aguda e cegueira irreversível (preferir Marbofloxacina).",
      "Pediátricos em Crescimento: Contraindicada (lesão em cartilagem articular).",
      "Epilépticos / TCE: Reduz limiar convulsivo por antagonismo GABA."
    ],
    notasTaxon: {
      Gato: "Nunca ultrapassar 5 mg/kg SID; evitar em idosos/nefropatas/desidratados (preferir Marbofloxacina).",
      CarnivorosSilv: "Em felídeos silvestres (Leopardus/Puma), aplicar a mesma restrição retiniana do gato doméstico."
    }
  },
  "Clindamicina": {
    classe: "Lincosamida (Bacteriostática/Bactericida — Gram+ e Anaeróbios)",
    validade: "Conforme bula; manter em temperatura ambiente",
    vias: [
      ["VO", "Liberada", "Em gatos, administrar 3–5 mL de água ou alimento úmido logo após para evitar estenose esofágica."],
      ["SC", "Liberada", "Boa alternativa quando a via oral não está disponível em cães/gatos."],
      ["IM", "Cautela", "Pode causar dor local."],
      ["IV", "Cautela", "Proibido bolus rápido (risco de hipotensão/parada); diluir em NaCl 0,9% e infundir em 20–30 min."]
    ],
    populacoes: [
      "Fermentadores Cecais (Coelhos/Roedores): 100% letal (enterotoxemia fulminante por Clostridium).",
      "Hepatopatas Graves: Metabolismo hepático intenso — reduzir dose ou escolher alternativa."
    ]
  },
  "Dipirona": {
    classe: "Analgésico não-opioide e antipirético (Pirazolona)",
    validade: "Ampolas: uso imediato ou até 24h refrigerada",
    vias: [
      ["VO", "Liberada", "Preferir solução oral infantil 50 mg/mL em animais < 2 kg (gotas 500 mg/mL causam sialorreia intensa em gatos)."],
      ["SC", "Liberada", "Bem tolerada em cães e gatos; diluir 1:10 em animais < 1 kg."],
      ["IM", "Liberada", "Boa absorção; usar volume reduzido em aves e microfauna."],
      ["IV", "Liberada", "Administrar lentamente (bolus rápido pode induzir hipotensão transitória)."]
    ],
    populacoes: [
      "Nefropatas / Ascíticos / Choque: Alternativa analgésica segura quando AINEs estão contraindicados.",
      "Felinos: Usar 12,5 a 25 mg/kg q12–24h; evitar gotas puras VO pelo sabor amargo."
    ]
  },
  "Escopolamina": {
    classe: "Anticolinérgico antiespasmódico (Derivado quaternário da hioscina)",
    validade: "Ampolas: uso imediato; frasco veterinário conforme bula",
    vias: [
      ["IV", "Liberada", "Via de escolha na cólica aguda e espasmo visceral intenso (infusão lenta)."],
      ["IM", "Liberada", "Boa absorção em cães, gatos e mamíferos silvestres."],
      ["SC", "Liberada", "Alternativa prática na rotina ambulatorial."],
      ["VO", "Liberada", "Comprimidos/gotas para manutenção domiciliar de cólicas espasmódicas."]
    ],
    populacoes: [
      "Íleo Paralítico / Estase GI Atônica: Contraindicado (não usar em estase cecal de coelhos).",
      "Glaucoma / Taquiarritmias: Evitar pelo efeito antimuscarínico."
    ]
  },
  "Pentabiotico": {
    classe: "Associação Bactericida: Benzilpenicilinas (Benzatina + Procaína + Potássica) + Estreptomicinas",
    validade: "Usar imediatamente após reconstituição (ou máx. 24h refrigerado; agitar fortemente)",
    vias: [
      ["IM", "Liberada", "Via exclusiva (IM profunda com agulha calibrosa; aspirar sempre antes de injetar)."],
      ["IV", "Proibida", "Estritamente proibido: Penicilina Procaína IV causa êmbolo lipídico, convulsão e parada cardíaca imediata."],
      ["SC", "Proibida", "Não indicada — risco de abscesso, fibrose e absorção errática."],
      ["VO", "Proibida", "Inativada pelo suco gástrico e destrói microbiota."]
    ],
    populacoes: [
      "Aves, Coelhos, Cobaias, Chinchilas e Hamsters: 100% letal (bloqueio neuromuscular + toxicidade da Procaína + enterotoxemia).",
      "Nefropatas / Desidratados / Geriátricos: Evitar pela nefrotoxicidade/ototoxicidade da Estreptomicina.",
      "Indicação Prática: Grandes Animais ou animais de campo/resgate onde a administração diária é inviável (depósito 48–72h)."
    ]
  }
};

const CLASSES_PADRAO_FARMACO = {
  "Marbofloxacina": "Fluoroquinolona veterinária de 3ª geração (Baixo risco retiniano em felinos)",
  "Ceftazidima": "Cefalosporina de 3ª geração antipseudomonas (1ª escolha injetável em répteis)",
  "Doxiciclina": "Tetraciclina lipofílica de amplo espectro",
  "Metronidazol": "Nitroimidazol bactericida contra anaeróbios obrigatórios e antiprotozoário",
  "Carprofeno": "AINE inibidor preferencial COX-2",
  "Robenacoxibe": "AINE Coxibe altamente seletivo para COX-2",
  "Prednisolona": "Glicocorticoide de ação intermediária (preferencial em felinos)",
  "Dexametasona": "Glicocorticoide de longa ação",
  "Tramadol": "Analgésico central (Agonista Mu fraco + inibidor 5-HT/NA)",
  "Gabapentina": "Análogo GABA / Modulador de canais de cálcio alfa-2-delta",
  "Butorfanol": "Opioide Agonista Kappa / Antagonista Mu (1ª escolha opioide em aves)",
  "Metadona": "Opioide Agonista Mu puro + Antagonista NMDA",
  "Midazolam": "Benzodiazepínico hidrossolúvel (Anticonvulsivante 1ª linha)",
  "Cetamina": "Anestésico dissociativo e Antagonista NMDA",
  "Lidocaina 2%": "Anestésico local aminoamida e antiarrítmico Classe IB",
  "Bupivacaina 0,5%": "Anestésico local aminoamida de longa duração (4–8h)",
  "Maropitant": "Antiemético antagonista seletivo NK-1",
  "Ondansetrona": "Antiemético antagonista seletivo 5-HT3",
  "Metoclopramida": "Procinético gastrintestinal superior e antiemético D2",
  "Omeprazol": "Inibidor da Bomba de Prótons (IBP)",
  "Sucralfato": "Citoprotetor de mucosa esofágica, ingluvial e gástrica",
  "Furosemida": "Diurético de alça",
  "Manitol 20%": "Diurético osmótico redutor da PIC",
  "Vitamina K1": "Fitomenadiona — Cofator dos fatores II, VII, IX e X",
  "Nitenpiram": "Ectoparasiticida sistêmico neonicotinoide (Miíase)",
  "Itraconazol": "Antifúngico Triazol sistêmico",
  "Alopurinol": "Inibidor da xantina oxidase (Gota úrica / Leishmaniose)",
  "Ivermectina": "Endectocida Lactona Macrocíclica",
  "Fenbendazol": "Anti-helmíntico e antiprotozoário Benzimidazol",
  "Sulfametoxazol+Trim": "Associação bactericida sinérgica e coccidiostática",
  "Cefalexina": "Cefalosporina de 1ª geração"
};

function alternarSubFontes(qual) {
  ["bulario", "livros", "extrator"].forEach(k => {
    document.getElementById(`painel-${k}`)?.classList.toggle("hidden", k !== qual);
    document.getElementById(`subf-${k}`)?.classList.toggle("active", k === qual);
  });
}

function renderBularioCompleto() {
  const box = document.getElementById("lista-bulario-completo");
  if (!box) return;
  const termo = normalizarTextoBusca(document.getElementById("busca-bulario")?.value || "");
  const filtrados = FARMACOS_DB.filter(f => {
    const cls = MONOGRAFIAS_EXTRA[f.id]?.classe || CLASSES_PADRAO_FARMACO[f.id] || "";
    return normalizarTextoBusca(f.nome + " " + f.comercial + " " + f.resumoBulario + " " + cls).includes(termo);
  });

  box.innerHTML = filtrados.map(f => {
    const fIdx = FARMACOS_DB.indexOf(f);
    const cls = MONOGRAFIAS_EXTRA[f.id]?.classe || CLASSES_PADRAO_FARMACO[f.id] || "";
    return `<div onclick="abrirFichaCompletaFarmaco(${fIdx})" class="vc-card-interactive p-3.5 space-y-1.5">
      <div class="flex justify-between items-start gap-2">
        <strong class="text-xs sm:text-sm vc-text">${escapeHtml(f.nome)}</strong>
        <span class="vc-badge vc-badge-accent shrink-0">Ficha</span>
      </div>
      ${cls ? `<div class="text-[11px] vc-info-text font-semibold">${escapeHtml(cls)}</div>` : ""}
      <div class="text-[11px] vc-warn-text font-medium">${escapeHtml(f.comercial)} &middot; ${escapeHtml(f.apres)}</div>
      <p class="text-xs vc-secondary leading-relaxed line-clamp-3">${escapeHtml(f.resumoBulario)}</p>
    </div>`;
  }).join("");
}

function garantirContainerFichaFarmaco() {
  let el = document.getElementById("ficha-farmaco-view");
  if (!el) {
    el = document.createElement("div");
    el.id = "ficha-farmaco-view";
    el.className = "vc-fullscreen-view hidden";
    document.body.appendChild(el);
  }
  return el;
}

function fecharFichaCompletaFarmaco() {
  document.getElementById("ficha-farmaco-view")?.classList.add("hidden");
  document.body.style.overflow = "";
}

function abrirFichaCompletaFarmaco(fIdx, abaInicial) {
  fichaFarmacoIdxAtual = fIdx;
  fichaAbaAtiva = abaInicial || "posologia";
  fichaFiltroStatus = "todos";
  fecharModal();
  const el = garantirContainerFichaFarmaco();
  el.classList.remove("hidden");
  el.scrollTop = 0;
  document.body.style.overflow = "hidden";
  renderFichaCompletaFarmaco();
}

function mudarAbaFichaFarmaco(aba) {
  fichaAbaAtiva = aba;
  renderFichaCompletaFarmaco();
}

function setFiltroStatusFicha(st) {
  fichaFiltroStatus = st;
  renderTabelaPosologiaFicha();
}

function getMotivoBloqueioGenerico(f, t) {
  if (f.id === "Fenbendazol" && (t.id === "Columbiformes" || t.id === "Cathartiformes")) {
    return "Proibido: causa aplasia letal de medula óssea, leucopenia fulminante e necrose de criptas intestinais (Carpenter 6ª ed., p. 263).";
  }
  if (f.id === "Ivermectina" && t.id === "Testudines") {
    return "100% letal em quelônios: atravessa a barreira hematoencefálica causando paralisia flácida irreversível (Carpenter 6ª ed., p. 117).";
  }
  if ((f.id === "Prednisolona" || f.id === "Dexametasona") && (t.id === "Coelhos" || t.id === "Caviomorfos" || t.grupo.includes("Répteis"))) {
    return "Contraindicado: imunossupressão severa, disbiose fatal e úlceras gastrintestinais nesta espécie.";
  }
  if (f.id === "Carprofeno" && t.id === "Cathartiformes") {
    return "100% letal em urubus: induz necrose tubular renal aguda e gota visceral em 24–48h (usar apenas Meloxicam).";
  }
  if (f.id === "Metadona" && t.id === "Serpentes") {
    return "Baixa eficácia analgésica isolada em serpentes (preferir Tramadol + bloqueio local).";
  }
  if (f.id === "Escopolamina" && (t.grupo.includes("Aves") || t.grupo.includes("Répteis"))) {
    return "Não indicado na rotina de aves e répteis (risco de estase GI/ingluvial e espessamento de secreções).";
  }
  if (f.id === "Pentabiotico" && (t.id === "Miomorfos" || t.grupo.includes("Répteis"))) {
    return "Contraindicado: risco elevado de nefrotoxicidade/bloqueio neuromuscular pela Estreptomicina e toxicidade da Procaína.";
  }
  return "Contraindicado ou não recomendado para este táxon.";
}

function gerarViasAutomaticas(f) {
  const todasVias = Object.values(f.faixasPorGrupo || {}).map(g => g.via || "").join(" ").toUpperCase();
  const res = [];
  if (todasVias.includes("VO") || (f.compMg && f.compMg.length > 0)) res.push(["VO", "Liberada", "Via oral disponível conforme apresentação e restrições específicas do táxon."]);
  if (todasVias.includes("SC")) res.push(["SC", "Liberada", "Via subcutânea descrita na literatura para o fármaco (verificar necessidade de diluição)."]);
  if (todasVias.includes("IM")) res.push(["IM", "Liberada", "Via intramuscular aplicável (em répteis, usar membros anteriores; em aves, dividir peitoral se > 0,35 mL)."]);
  if (todasVias.includes("IV")) res.push(["IV", "Liberada", "Via intravenosa aplicável (administrar lentamente conforme bula)."]);
  if (res.length === 0) res.push(["Geral", "Info", "Consultar a aba 'Posologia' para a via específica de cada espécie."]);
  return res;
}

function renderFichaCompletaFarmaco() {
  const el = garantirContainerFichaFarmaco();
  const fIdx = fichaFarmacoIdxAtual;
  const f = FARMACOS_DB[fIdx];
  if (!f) return;

  const extra = MONOGRAFIAS_EXTRA[f.id] || {};
  const classe = extra.classe || CLASSES_PADRAO_FARMACO[f.id] || "Fármaco de uso clínico veterinário";
  const validade = extra.validade || "Seguir bula do fabricante e manter protegido de luz e calor.";
  const viasList = extra.vias || gerarViasAutomaticas(f);
  const { idx: tAtivoIdx, t: tAtivo } = getTaxonAtual();
  const kgCalc = getPesoEfetivoKg();
  const { doseAtiva, concAtiva } = getConfigFarmacoParaTaxon(f, tAtivoIdx, tAtivo);
  const isUI = f.id === "Pentabiotico";
  const mlAtivo = doseAtiva > 0 ? ((kgCalc * doseAtiva) / concAtiva) : 0;

  const todasFontes = [];
  const vistas = new Set();
  Object.entries(f.faixasPorGrupo || {}).forEach(([grp, cfg]) => {
    (cfg.fontes || []).forEach(ft => {
      const chave = ft[0] + ft[1];
      if (!vistas.has(chave)) {
        vistas.add(chave);
        todasFontes.push({ grupo: grp === "Padrao" ? "Geral / Multiespécie" : grp, titulo: ft[0], texto: ft[1] });
      }
    });
  });

  let corpoAba = "";
  if (fichaAbaAtiva === "posologia") {
    corpoAba = `
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row gap-2">
          <input id="ficha-busca-taxon" type="text" oninput="renderTabelaPosologiaFicha()" placeholder="Filtrar espécie ou grupo (ex: gato, coruja, coelho, quati, jabuti)..." class="vc-input flex-1">
          <div id="ficha-filtros-status" class="flex flex-wrap gap-1.5"></div>
        </div>
        <div id="ficha-lista-posologia" class="space-y-2"></div>
      </div>
    `;
  } else if (fichaAbaAtiva === "geral") {
    corpoAba = `
      <div class="space-y-3.5">
        <div class="vc-card p-4 space-y-2">
          <div class="vc-section-label">Especificações Farmacotécnicas</div>
          <div class="divide-y vc-divider text-xs">
            <div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="vc-muted">Classe Farmacológica</span><strong class="vc-text sm:text-right">${escapeHtml(classe)}</strong></div>
            <div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="vc-muted">Nomes Comerciais</span><strong class="vc-warn-text sm:text-right">${escapeHtml(f.comercial)}</strong></div>
            <div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="vc-muted">Apresentação Padrão</span><span class="vc-secondary sm:text-right">${escapeHtml(f.apres)}</span></div>
            <div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="vc-muted">Frascos / Concentrações</span><span class="vc-secondary sm:text-right">${(f.frascos || []).map(fr => escapeHtml(fr.label)).join(" · ")}</span></div>
            ${f.compMg && f.compMg.length ? `<div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="vc-muted">Comprimidos</span><span class="vc-accent-text font-semibold sm:text-right">${f.compMg.join(" mg, ")} mg</span></div>` : ""}
            <div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="vc-muted">Validade / Conservação</span><span class="vc-secondary sm:text-right">${escapeHtml(validade)}</span></div>
          </div>
        </div>

        <div class="vc-card p-4 space-y-1.5">
          <div class="vc-section-label">Resumo Clínico &amp; Indicação</div>
          <p class="text-xs vc-secondary leading-relaxed">${escapeHtml(f.resumoBulario)}</p>
        </div>

        <div class="vc-card p-4 space-y-2 vc-accent-left-danger">
          <div class="vc-section-label vc-danger-text">Contraindicações &amp; Populações Especiais</div>
          ${extra.populacoes ? `
            <ul class="space-y-1.5 text-xs vc-secondary leading-relaxed list-disc pl-4">
              ${extra.populacoes.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          ` : `<p class="text-xs vc-secondary leading-relaxed">Avaliar estado de hidratação, função renal/hepática, faixa etária e restrições específicas do táxon na aba <strong>Posologia</strong>.</p>`}
        </div>
      </div>
    `;
  } else if (fichaAbaAtiva === "vias") {
    corpoAba = `
      <div class="space-y-3.5">
        <div class="vc-card p-4 space-y-2.5">
          <div class="vc-section-label">Vias de Administração &amp; Cuidados</div>
          <div class="space-y-2">
            ${viasList.map(([via, st, desc]) => {
              const badgeCls = st === "Proibida" ? "vc-badge-danger" : (st === "Cautela" ? "vc-badge-warn" : "vc-badge-ok");
              return `<div class="vc-subcard p-3 flex items-start gap-2.5 text-xs">
                <span class="vc-badge ${badgeCls} mono shrink-0">${via} · ${st}</span>
                <span class="vc-secondary leading-relaxed">${escapeHtml(desc)}</span>
              </div>`;
            }).join("")}
          </div>
        </div>

        <div class="vc-card p-4 space-y-2.5">
          <div class="vc-section-label">Cálculo para o Paciente Atual (${escapeHtml(limparEmoji(tAtivo.nome))} · ${formatarPesoCurto(kgCalc)})</div>
          ${doseAtiva > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div class="vc-subcard p-3 vc-accent-left-accent">
                <div class="text-[10px] vc-muted uppercase">Frasco (${concAtiva.toLocaleString("pt-BR")} ${isUI ? "UI/mL" : "mg/mL"})</div>
                <div class="text-base font-extrabold vc-accent-text mono mt-0.5">${mlAtivo.toFixed(3)} mL</div>
                <div class="text-[11px] vc-muted mono">${(mlAtivo * 100).toFixed(1)} UI (U-100)</div>
              </div>
              <div class="vc-subcard p-3 vc-accent-left-info">
                <div class="text-[10px] vc-muted uppercase">Diluição 1:10</div>
                <div class="text-base font-extrabold vc-info-text mono mt-0.5">${(mlAtivo * 10).toFixed(2)} mL</div>
                <div class="text-[10px] vc-muted">0,1 mL + 0,9 mL NaCl</div>
              </div>
              <div class="vc-subcard p-3 vc-accent-left-purple">
                <div class="text-[10px] vc-muted uppercase">Diluição 1:100</div>
                <div class="text-base font-extrabold vc-purple-text mono mt-0.5">${(mlAtivo * 100).toFixed(2)} mL</div>
                <div class="text-[10px] vc-muted">0,1 mL (1:10) + 0,9 mL</div>
              </div>
            </div>
          ` : `<div class="vc-alert vc-alert-danger font-semibold">Fármaco contraindicado ou sem indicação de rotina para ${escapeHtml(limparEmoji(tAtivo.nome))}.</div>`}
        </div>
      </div>
    `;
  } else if (fichaAbaAtiva === "fontes") {
    corpoAba = `
      <div class="space-y-2.5">
        <div class="vc-section-label">Fontes Conferidas para ${escapeHtml(f.nome)}</div>
        ${todasFontes.map(ft => `
          <div class="vc-card p-3.5 space-y-1.5">
            <div class="flex flex-wrap justify-between items-center gap-1.5">
              <span class="vc-badge vc-badge-info">${escapeHtml(ft.grupo)}</span>
              <span class="vc-badge vc-badge-ok">Conferido</span>
            </div>
            <div class="text-xs font-bold vc-warn-text">${escapeHtml(ft.titulo)}</div>
            <blockquote class="text-xs vc-secondary italic pl-2.5 border-l-2 leading-relaxed" style="border-color:var(--warn)">"${escapeHtml(ft.texto)}"</blockquote>
          </div>
        `).join("")}
      </div>
    `;
  }

  el.innerHTML = `
    <div class="sticky top-0 z-10 vc-glass vc-header px-3 sm:px-5 py-3">
      <div class="max-w-4xl mx-auto space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <button type="button" onclick="fecharFichaCompletaFarmaco()" class="vc-btn vc-btn-secondary shrink-0">&larr; Voltar</button>
          <div class="min-w-0 text-center">
            <div class="text-sm sm:text-base font-extrabold vc-text leading-tight truncate">${escapeHtml(f.nome)}</div>
            <div class="text-[11px] vc-warn-text truncate">${escapeHtml(f.comercial)}</div>
          </div>
          <button type="button" onclick="enviarFarmacoParaAbaReceita(${fIdx})" class="vc-btn vc-btn-primary shrink-0">Receita</button>
        </div>

        <div class="vc-segmented overflow-x-auto no-scrollbar">
          <button type="button" onclick="mudarAbaFichaFarmaco('posologia')" class="vc-seg-btn ${fichaAbaAtiva === "posologia" ? "active" : ""}">Posologia (${TAXONS_DB.length})</button>
          <button type="button" onclick="mudarAbaFichaFarmaco('geral')" class="vc-seg-btn ${fichaAbaAtiva === "geral" ? "active" : ""}">Ficha &amp; Alertas</button>
          <button type="button" onclick="mudarAbaFichaFarmaco('vias')" class="vc-seg-btn ${fichaAbaAtiva === "vias" ? "active" : ""}">Vias &amp; Diluições</button>
          <button type="button" onclick="mudarAbaFichaFarmaco('fontes')" class="vc-seg-btn ${fichaAbaAtiva === "fontes" ? "active" : ""}">Fontes (${todasFontes.length})</button>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-3 sm:px-5 py-4 pb-16">
      ${corpoAba}
    </div>
  `;

  if (fichaAbaAtiva === "posologia") renderTabelaPosologiaFicha();
}

function renderTabelaPosologiaFicha() {
  const box = document.getElementById("ficha-lista-posologia");
  const barSt = document.getElementById("ficha-filtros-status");
  if (!box) return;

  const f = FARMACOS_DB[fichaFarmacoIdxAtual];
  const extra = MONOGRAFIAS_EXTRA[f.id] || {};
  const isUI = f.id === "Pentabiotico";
  const uDose = isUI ? "UI/kg" : "mg/kg";
  const termo = normalizarTextoBusca(document.getElementById("ficha-busca-taxon")?.value || "");
  const { idx: tAtivoIdx } = getTaxonAtual();
  const kgCalc = getPesoEfetivoKg();

  const linhas = TAXONS_DB.map((t, tIdx) => {
    const { doseAtiva, concAtiva, grupoCfg } = getConfigFarmacoParaTaxon(f, tIdx, t);
    const proibido = doseAtiva === 0 || grupoCfg.status === "proibido";
    const cautela = !proibido && (grupoCfg.status === "alerta" || Boolean(extra.notasTaxon && extra.notasTaxon[t.id]));
    const sit = proibido ? "proibido" : (cautela ? "cautela" : "liberado");

    const opcoesValidas = (grupoCfg.opcoes || []).filter(x => x > 0);
    const faixaTxt = (!proibido && opcoesValidas.length > 1)
      ? `${isUI ? opcoesValidas[0].toLocaleString("pt-BR") : opcoesValidas[0]} a ${isUI ? opcoesValidas[opcoesValidas.length - 1].toLocaleString("pt-BR") : opcoesValidas[opcoesValidas.length - 1]} ${uDose}`
      : "";

    const motivo = proibido
      ? (grupoCfg.status === "proibido" ? `${limparEmoji(grupoCfg.badge)} — ${limparEmoji(grupoCfg.via)}` : getMotivoBloqueioGenerico(f, t))
      : ((extra.notasTaxon && extra.notasTaxon[t.id]) ? extra.notasTaxon[t.id] : limparEmoji(grupoCfg.badge));

    const buscaAlvo = normalizarTextoBusca(t.nome + " " + t.grupo + " " + (t.subespecies || []).map(s => s.nome).join(" "));
    return { t, tIdx, doseAtiva, concAtiva, grupoCfg, sit, faixaTxt, motivo, buscaAlvo };
  });

  const cLib = linhas.filter(l => l.sit === "liberado").length;
  const cCau = linhas.filter(l => l.sit === "cautela").length;
  const cPro = linhas.filter(l => l.sit === "proibido").length;

  if (barSt) {
    const opts = [
      ["todos", `Todos (${linhas.length})`],
      ["liberado", `Liberados (${cLib})`],
      ["cautela", `Cautela (${cCau})`],
      ["proibido", `Proibidos (${cPro})`]
    ];
    barSt.innerHTML = opts.map(([id, lbl]) =>
      `<button type="button" onclick="setFiltroStatusFicha('${id}')" class="vc-chip ${fichaFiltroStatus === id ? "active" : ""}">${lbl}</button>`
    ).join("");
  }

  const filtradas = linhas.filter(l => {
    if (fichaFiltroStatus !== "todos" && l.sit !== fichaFiltroStatus) return false;
    if (termo && !l.buscaAlvo.includes(termo)) return false;
    return true;
  });

  if (filtradas.length === 0) {
    box.innerHTML = `<div class="vc-subcard p-4 text-xs vc-muted text-center">Nenhum táxon encontrado para esse filtro.</div>`;
    return;
  }

  box.innerHTML = filtradas.map(l => {
    const isAtual = l.tIdx === tAtivoIdx;
    const mlAtual = (isAtual && l.doseAtiva > 0) ? ((kgCalc * l.doseAtiva) / l.concAtiva) : 0;
    const badgeSit = l.sit === "proibido"
      ? `<span class="vc-badge vc-badge-danger shrink-0">Proibido</span>`
      : (l.sit === "cautela" ? `<span class="vc-badge vc-badge-warn shrink-0">Com cautela</span>` : `<span class="vc-badge vc-badge-ok shrink-0">Liberado</span>`);
    const leftCls = l.sit === "proibido" ? "vc-accent-left-danger" : (l.sit === "cautela" ? "vc-accent-left-warn" : (isAtual ? "vc-accent-left-accent" : ""));

    return `
      <div class="vc-card p-3.5 ${leftCls} space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-1.5">
          <div class="flex flex-wrap items-center gap-1.5">
            <strong class="text-xs sm:text-sm vc-text">${escapeHtml(limparEmoji(l.t.nome))}</strong>
            ${isAtual ? `<span class="vc-badge vc-badge-accent">Paciente Atual</span>` : ""}
          </div>
          ${badgeSit}
        </div>

        ${l.sit !== "proibido" ? `
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div class="vc-subcard px-2.5 py-2">
              <span class="text-[10px] vc-muted uppercase block">Dose Padrão</span>
              <strong class="vc-accent-text mono">${isUI ? l.doseAtiva.toLocaleString("pt-BR") : l.doseAtiva} ${uDose}</strong>
              ${l.faixaTxt ? `<span class="text-[10px] vc-muted block">Faixa: ${l.faixaTxt}</span>` : ""}
            </div>
            <div class="sm:col-span-2 vc-subcard px-2.5 py-2">
              <span class="text-[10px] vc-muted uppercase block">Via &amp; Intervalo</span>
              <span class="vc-secondary leading-snug">${escapeHtml(limparEmoji(l.grupoCfg.via))}</span>
            </div>
          </div>
        ` : ""}

        <div class="text-[11px] ${l.sit === "proibido" ? "vc-danger-text font-medium" : (l.sit === "cautela" ? "vc-warn-text" : "vc-secondary")} leading-relaxed">
          ${escapeHtml(l.motivo)}
        </div>

        ${isAtual && mlAtual > 0 ? `<div class="text-[11px] vc-accent-text font-bold mono">Volume para ${formatarPesoCurto(kgCalc)}: ${formatarVolumeSeguro(mlAtual)}</div>` : ""}
      </div>
    `;
  }).join("");
}

function renderCatalogoLivros() {
  const box = document.getElementById("lista-livros-catalogo");
  if (!box) return;
  const termo = normalizarTextoBusca(document.getElementById("busca-livros")?.value || "");
  const driveGeral = localStorage.getItem(KEY_DRIVE_URL) || "";
  const filtrados = CATALOGO_LIVROS.filter(l => normalizarTextoBusca(l.titulo + " " + l.autores + " " + l.area + " " + l.resumo).includes(termo));

  box.innerHTML = filtrados.map(l => `
    <div class="vc-subcard p-3.5 flex flex-col justify-between gap-2">
      <div class="space-y-1">
        <span class="vc-badge vc-badge-info">${escapeHtml(l.area)}</span>
        <div class="text-xs font-bold vc-text">${escapeHtml(l.titulo)}</div>
        <div class="text-[11px] vc-warn-text">${escapeHtml(l.autores)}</div>
        <p class="text-[11px] vc-secondary leading-relaxed">${escapeHtml(l.resumo)}</p>
      </div>
      ${(l.linkPdf || driveGeral) ? `<a href="${l.linkPdf || driveGeral}" target="_blank" class="vc-btn vc-btn-soft w-full">Abrir no Google Drive &rarr;</a>` : ""}
    </div>
  `).join("");
}

function adicionarLivroCustom() {
  const titulo  = document.getElementById("new-bk-titulo")?.value.trim();
  const autores = document.getElementById("new-bk-autores")?.value.trim();
  const area    = document.getElementById("new-bk-area")?.value.trim() || "Referência Clínica";
  const linkPdf = document.getElementById("new-bk-url")?.value.trim();
  const resumo  = document.getElementById("new-bk-resumo")?.value.trim();
  if (!titulo || !resumo) return showToast("Preencha ao menos o Título e o Resumo.", "warn");

  const novo = { id: "bk_" + Date.now(), titulo, autores, area, resumo, linkPdf };
  CATALOGO_LIVROS.unshift(novo);
  const salvos = JSON.parse(localStorage.getItem(KEY_LIVROS_USR) || "[]");
  salvos.unshift(novo);
  localStorage.setItem(KEY_LIVROS_USR, JSON.stringify(salvos));
  renderCatalogoLivros();
  alternarSubFontes("livros");
  showToast("Obra adicionada ao acervo.", "ok");
}

// ============================================================================
// AUTENTICAÇÃO E-MAIL / SENHA, SINCRONIZAÇÃO COMPLETA & BACKUP JSON
// ============================================================================

function mostrarErroAuth(msg) {
  const el = document.getElementById("auth-erro");
  if (!el) return;
  if (!msg) { el.classList.add("hidden"); el.textContent = ""; return; }
  el.textContent = msg;
  el.classList.remove("hidden");
}

function traduzirErroFirebase(code, fallback) {
  const mapa = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-not-found": "Conta não encontrada. Clique em 'Criar Conta'.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/email-already-in-use": "Este e-mail já está cadastrado. Clique em 'Entrar' ou use 'Esqueci minha senha'.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/network-request-failed": "Sem conexão com a internet."
  };
  return mapa[code] || fallback || "Erro ao autenticar.";
}

function atualizarUIConta(user) {
  const vDeslog = document.getElementById("view-login-deslogado");
  const vLogado = document.getElementById("view-login-logado");
  const dotOnline = document.getElementById("dot-conta-online");
  if (!vDeslog || !vLogado) return;

  if (user) {
    vDeslog.classList.add("hidden");
    vLogado.classList.remove("hidden");
    dotOnline?.classList.remove("hidden");
    const nomeBase = user.displayName || (user.email ? user.email.split("@")[0] : "Conectado");
    document.getElementById("usr-nome").textContent  = nomeBase;
    document.getElementById("usr-email").textContent = user.email || "";
    mostrarErroAuth("");
  } else {
    vDeslog.classList.remove("hidden");
    vLogado.classList.add("hidden");
    dotOnline?.classList.add("hidden");
  }
}

async function entrarComEmailSenha() {
  const email = (document.getElementById("auth-email")?.value || "").trim();
  const senha = document.getElementById("auth-senha")?.value || "";
  if (!email || !senha) return mostrarErroAuth("Preencha e-mail e senha.");
  if (typeof firebase === "undefined" || !firebase.apps?.length) return mostrarErroAuth("Aguarde a conexão com o servidor.");

  mostrarErroAuth("");
  try {
    await firebase.auth().signInWithEmailAndPassword(email, senha);
    document.getElementById("modal-admin")?.classList.add("hidden");
    showToast("Conta conectada. Sincronizando dados...", "ok");
  } catch (err) {
    mostrarErroAuth(traduzirErroFirebase(err.code, err.message));
  }
}

async function criarContaEmailSenha() {
  const email = (document.getElementById("auth-email")?.value || "").trim();
  const senha = document.getElementById("auth-senha")?.value || "";
  if (!email || senha.length < 6) return mostrarErroAuth("Informe um e-mail válido e senha com no mínimo 6 caracteres.");
  if (typeof firebase === "undefined" || !firebase.apps?.length) return mostrarErroAuth("Aguarde a conexão com o servidor.");

  mostrarErroAuth("");
  try {
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, senha);
    const nomeEmit = document.getElementById("emit-nome")?.value?.trim();
    if (nomeEmit && cred.user) await cred.user.updateProfile({ displayName: nomeEmit });
    document.getElementById("modal-admin")?.classList.add("hidden");
    showToast("Conta criada com sucesso.", "ok");
  } catch (err) {
    mostrarErroAuth(traduzirErroFirebase(err.code, err.message));
  }
}

async function recuperarSenhaEmail() {
  const email = (document.getElementById("auth-email")?.value || "").trim();
  if (!email) return mostrarErroAuth("Digite seu e-mail acima para receber o link de redefinição.");
  if (typeof firebase === "undefined" || !firebase.apps?.length) return mostrarErroAuth("Aguarde a conexão com o servidor.");

  try {
    await firebase.auth().sendPasswordResetEmail(email);
    mostrarErroAuth("");
    showToast(`Link de redefinição enviado para ${email}`, "ok");
  } catch (err) {
    mostrarErroAuth(traduzirErroFirebase(err.code, err.message));
  }
}

async function logoutContaGoogle() {
  if (typeof firebase !== "undefined" && firebase.apps?.length) {
    await firebase.auth().signOut();
  }
  atualizarUIConta(null);
  showToast("Sessão encerrada.", "info");
}

async function sincronizarParaNuvem() {
  if (!firestoreDb || !firebaseUserAtual) return;
  try {
    await firestoreDb.collection("vetcore_usuarios").doc(firebaseUserAtual.uid).set({
      atualizadoEm: new Date().toISOString(),
      pacientes: pacientesSalvos,
      emitente: JSON.parse(localStorage.getItem(KEY_EMITENTE) || "{}"),
      sinaisCustom: JSON.parse(localStorage.getItem(KEY_SINAIS_USR) || "{}")
    }, { merge: true });
  } catch (e) {}
}

async function baixarDadosDaNuvem(uid) {
  if (!firestoreDb) return;
  try {
    const doc = await firestoreDb.collection("vetcore_usuarios").doc(uid).get();
    if (!doc.exists) return;
    const d = doc.data();

    if (Array.isArray(d.pacientes)) {
      pacientesSalvos = d.pacientes;
      localStorage.setItem(KEY_PACIENTES, JSON.stringify(pacientesSalvos));
      atualizarListaPacientesSalvos();
    }
    if (d.emitente && typeof d.emitente === "object") {
      localStorage.setItem(KEY_EMITENTE, JSON.stringify(d.emitente));
      if (d.emitente.nome && document.getElementById("emit-nome")) document.getElementById("emit-nome").value = d.emitente.nome;
      if (d.emitente.crmv && document.getElementById("emit-crmv")) document.getElementById("emit-crmv").value = d.emitente.crmv;
      if (d.emitente.end  && document.getElementById("emit-end"))  document.getElementById("emit-end").value  = d.emitente.end;
      atualizarFolhaReceita();
    }
    if (d.sinaisCustom && typeof d.sinaisCustom === "object") {
      localStorage.setItem(KEY_SINAIS_USR, JSON.stringify(d.sinaisCustom));
      Object.assign(SINAIS_DB, d.sinaisCustom);
      recalcularProntuario();
    }
  } catch (e) {}
}

function exportarBackupVetCore() {
  const dados = {
    pacientes: JSON.parse(localStorage.getItem(KEY_PACIENTES) || "[]"),
    sinaisCustom: JSON.parse(localStorage.getItem(KEY_SINAIS_USR) || "{}"),
    livrosCustom: JSON.parse(localStorage.getItem(KEY_LIVROS_USR) || "[]"),
    emitente: JSON.parse(localStorage.getItem(KEY_EMITENTE) || "{}")
  };
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `VetCore_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  showToast("Backup JSON exportado.", "ok");
}

function importarBackupVetCore(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const d = JSON.parse(e.target.result);
      if (d.pacientes) localStorage.setItem(KEY_PACIENTES, JSON.stringify(d.pacientes));
      if (d.sinaisCustom) localStorage.setItem(KEY_SINAIS_USR, JSON.stringify(d.sinaisCustom));
      if (d.livrosCustom) localStorage.setItem(KEY_LIVROS_USR, JSON.stringify(d.livrosCustom));
      if (d.emitente) localStorage.setItem(KEY_EMITENTE, JSON.stringify(d.emitente));
      location.reload();
    } catch (err) {
      showToast("Arquivo de backup inválido.", "danger");
    }
  };
  reader.readAsText(file);
}
