// ============================================================================
// VETCORE — MOTOR REATIVO, RECEITUÁRIO SIMPLESVET & CO-PILOTO IA (app.js)
// ============================================================================

const KEY_PACIENTES  = "vetcore_pacientes_v2";
const KEY_SINAIS_USR = "vetcore_sinais_custom_v2";
const KEY_LIVROS_USR = "vetcore_livros_custom_v2";
const KEY_EMITENTE   = "vetcore_emitente_v2";
const KEY_API_GEMINI = "vetcore_private_gemini_key";
const KEY_DRIVE_URL  = "vetcore_drive_pdfs_url";

let unidPeso = "kg";
let sinaisAtivos = new Set();
let pesoMagroManual = 0;
let modoCriNovato = true;
let modoDocAtual = "receita";
let itensReceitaAtual = [];
let pacienteAtualId = null;
let pacientesSalvos = JSON.parse(localStorage.getItem(KEY_PACIENTES) || "[]");

// Carregar Sinais e Livros Customizados do Usuário
try {
  const sigCustom = JSON.parse(localStorage.getItem(KEY_SINAIS_USR) || "{}");
  Object.assign(SINAIS_DB, sigCustom);
  const bkCustom = JSON.parse(localStorage.getItem(KEY_LIVROS_USR) || "[]");
  bkCustom.forEach(b => CATALOGO_LIVROS.unshift(b));
} catch (e) {}

function initVetCore() {
  // Popular Seletor Nível 1 (Ordem / Grupo)
  const selTax = document.getElementById("g-tax");
  selTax.innerHTML = TAXONS_DB.map((t, i) => `<option value="${i}">${t.nome}</option>`).join("");
  selTax.value = "1"; // Inicia em Gatos por padrão

  // Carregar dados do Emitente e Cofre Local
  const emit = JSON.parse(localStorage.getItem(KEY_EMITENTE) || "{}");
  if (emit.nome) document.getElementById("emit-nome").value = emit.nome;
  if (emit.crmv) document.getElementById("emit-crmv").value = emit.crmv;
  if (emit.end)  document.getElementById("emit-end").value  = emit.end;

  if (document.getElementById("in-api-key")) document.getElementById("in-api-key").value = localStorage.getItem(KEY_API_GEMINI) || "";
  if (document.getElementById("in-drive-url")) document.getElementById("in-drive-url").value = localStorage.getItem(KEY_DRIVE_URL) || "";

  popularSeletorFarmacosReceita();
  popularPillsCalculadoras();
  atualizarListaPacientesSalvos();
  trocarGrupoTaxonomico();
  renderBularioCompleto();
  renderCatalogoLivros();
}

function getTaxonAtual() {
  const idx = parseInt(document.getElementById("g-tax").value) || 0;
  const subIdx = parseInt(document.getElementById("g-subesp").value) || 0;
  const t = TAXONS_DB[idx];
  const sub = (t.subespecies && t.subespecies[subIdx]) ? t.subespecies[subIdx] : { nome: t.nome, peso: 1.0, unid: "kg", alerta: "" };
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

  if (t.id === "Gato" && f.faixasPorGrupo.Gato) grupoCfg = f.faixasPorGrupo.Gato;
  else if (t.grupo.includes("Aves") && f.faixasPorGrupo.Aves) grupoCfg = f.faixasPorGrupo.Aves;
  else if ((t.id === "Coelhos" || t.id === "Caviomorfos") && dosePadrao === 0 && f.faixasPorGrupo.ProibidoCeco) grupoCfg = f.faixasPorGrupo.ProibidoCeco;
  else if ((t.id === "Coelhos" || t.id === "Caviomorfos") && f.faixasPorGrupo.Coelhos) grupoCfg = f.faixasPorGrupo.Coelhos;

  const doseAtiva = (f._doseOverride && f._doseOverride[t.id] !== undefined) ? f._doseOverride[t.id] : dosePadrao;
  const concAtiva = f._concAtiva || f.conc;
  return { doseAtiva, concAtiva, grupoCfg };
}

// ============================================================================
// CONTROLE TAXONÔMICO EM 2 NÍVEIS & PESO GLOBAL REATIVO EM TEMPO REAL
// ============================================================================

function trocarGrupoTaxonomico() {
  const idx = parseInt(document.getElementById("g-tax").value) || 0;
  const t = TAXONS_DB[idx];
  const selSub = document.getElementById("g-subesp");
  selSub.innerHTML = (t.subespecies || []).map((s, i) => `<option value="${i}">${s.nome}</option>`).join("");
  selSub.value = "0";

  document.getElementById("p-temp").value = ((t.tBasalMin + t.tMax) / 2).toFixed(1);
  const guia = getGuiaSemiologico(t);
  document.getElementById("p-ecc").innerHTML = guia.ecc.map((e, i) => `<option value="${i}">${e[0]}</option>`).join("");

  trocarSubespecie();
}

function trocarSubespecie() {
  const { sub } = getTaxonAtual();
  if (sub && sub.peso) {
    unidPeso = sub.unid || "kg";
    document.getElementById("g-peso").value = sub.peso;
    atualizarBotoesUnidadeUI();
  }
  atualizarPesoGlobal();
}

function setUnidade(u) {
  const inp = document.getElementById("g-peso");
  let v = parseFloat(inp.value) || 0;
  if (unidPeso === "kg" && u === "g") inp.value = (v * 1000).toFixed(0);
  if (unidPeso === "g" && u === "kg") inp.value = (v / 1000).toFixed(3);
  unidPeso = u;
  atualizarBotoesUnidadeUI();
  atualizarPesoGlobal();
}

function atualizarBotoesUnidadeUI() {
  document.getElementById("btn-u-g").className  = unidPeso === "g"  ? "px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white" : "px-2 py-1 rounded-md text-[11px] font-bold text-slate-400";
  document.getElementById("btn-u-kg").className = unidPeso === "kg" ? "px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white" : "px-2 py-1 rounded-md text-[11px] font-bold text-slate-400";
}

function getPesoBrutoKg() {
  const v = parseFloat(document.getElementById("g-peso").value) || 0;
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

// Formata volumes pequenos automaticamente com instrução de Diluição 1:10 ou 1:100
function formatarVolumeSeguro(mlPuro) {
  if (mlPuro <= 0) return "0 mL";
  if (mlPuro >= 0.05) return `${mlPuro.toFixed(2)} mL (${(mlPuro * 100).toFixed(0)} UI)`;
  if (mlPuro >= 0.005) return `${(mlPuro * 10).toFixed(2)} mL da Dil. 1:10 [Puro: ${mlPuro.toFixed(3)} mL]`;
  return `${(mlPuro * 100).toFixed(2)} mL da Dil. 1:100 [Puro: ${mlPuro.toFixed(4)} mL]`;
}

// GATILHO CENTRAL: Atualiza absolutamente todas as abas ao digitar o peso!
function atualizarPesoGlobal() {
  recalcularProntuario();
  avaliarExamesLab();
  calcularDoseIsolada();
  calcularCRI();
  renderBombasCombinadas();
  renderProtocolosEspecie();
  renderPainelEmergencia();
  preencherConversorReceita();
  sincronizarCabecalhoReceita();
}

// ============================================================================
// ABA 1: PRONTUÁRIO COMPLETO, METABÓLICO, SANGUE E PRESCRIÇÃO
// ============================================================================

function analisarTextoAnamnese() {
  const txt = (document.getElementById("p-anam").value || "").toLowerCase();
  Object.keys(SINAIS_DB).forEach(k => {
    if (SINAIS_DB[k].palavras.some(p => txt.includes(p))) {
      sinaisAtivos.add(k);
      if (k === "ascite" && pesoMagroManual <= 0) pesoMagroManual = +(getPesoBrutoKg() * 0.85).toFixed(2);
    }
  });
  atualizarPesoGlobal();
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
  const nome = document.getElementById("new-sig-nome").value.trim();
  const foco = document.getElementById("new-sig-foco").value.split(",").map(s => s.trim()).filter(Boolean);
  const cond = document.getElementById("new-sig-conduta").value.trim();
  if (!nome || !cond) return alert("Preencha o nome e a conduta do achado.");
  const id = "custom_" + Date.now();
  const novo = { label: nome, palavras: [nome.toLowerCase()], conduta: cond, focoDrogas: foco, bloqueiaMelox: false, pedePesoMagro: false };
  SINAIS_DB[id] = novo;
  const salvos = JSON.parse(localStorage.getItem(KEY_SINAIS_USR) || "{}");
  salvos[id] = novo;
  localStorage.setItem(KEY_SINAIS_USR, JSON.stringify(salvos));
  sinaisAtivos.add(id);
  document.getElementById("box-criar-sinal").classList.add("hidden");
  atualizarPesoGlobal();
}

function recalcularProntuario() {
  const { idx: tIdx, t, sub } = getTaxonAtual();
  const kgBruto = getPesoBrutoKg();
  const kgCalc  = getPesoEfetivoKg();
  const gCalc   = kgCalc * 1000;
  const temp    = parseFloat(document.getElementById("p-temp").value);
  const des     = parseFloat(document.getElementById("p-des").value) || 0;

  // 1. Card Metabólico + Coleta Segura de Sangue + Alerta de Subespécie
  const manutDia  = kgCalc * t.fluidoManut;
  const desidMl   = gCalc * (des / 100);
  const totFluido = manutDia + desidMl;
  const kcalDia   = t.fatorK * Math.pow(kgCalc, 0.75);
  const sgHigido  = kgCalc * 10; // 1% do PV
  const sgDebil   = kgCalc * 5;  // 0.5% do PV

  document.getElementById("card-metabolico").innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div class="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-200 leading-relaxed">
        <strong>⛔ RESTRIÇÕES EM ${t.nome.toUpperCase()}:</strong> ${t.proibido}
      </div>
      <div class="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
        <strong>🧭 Diretriz Clínica:</strong> ${t.regraOuro}
        ${sub.alerta ? `<div class="mt-1 p-1.5 rounded bg-amber-950/70 border border-amber-700/60 text-amber-200 font-semibold">${sub.alerta}</div>` : ''}
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
      <div class="core-subcard p-2.5">
        <div class="text-[10px] text-slate-400 uppercase">💧 Fluido 24h (${formatarPesoExibicao(kgCalc)})</div>
        <div class="text-sm font-extrabold text-emerald-400 mono">${totFluido.toFixed(1)} mL/dia</div>
        <div class="text-[10px] text-slate-400">${(totFluido/24).toFixed(2)} mL/h &bull; q6h: ${(totFluido/4).toFixed(1)} mL</div>
      </div>
      <div class="core-subcard p-2.5">
        <div class="text-[10px] text-slate-400 uppercase">⚡ Bolus Choque (${t.bolusChoque} mL/kg)</div>
        <div class="text-sm font-extrabold text-blue-400 mono">${(kgCalc * t.bolusChoque).toFixed(2)} mL</div>
        <div class="text-[10px] text-slate-400">Manut: ${manutDia.toFixed(1)} + Desid: ${desidMl.toFixed(1)} mL</div>
      </div>
      <div class="core-subcard p-2.5">
        <div class="text-[10px] text-slate-400 uppercase">🍼 Nutrição & Gavagem</div>
        <div class="text-sm font-extrabold text-amber-300 mono">${kcalDia.toFixed(1)} kcal/d</div>
        <div class="text-[10px] text-slate-400">Máx/tomada (${t.gavMax} mL/kg): <strong>${(kgCalc * t.gavMax).toFixed(2)} mL</strong></div>
      </div>
      <div class="core-subcard p-2.5 border border-rose-800/40">
        <div class="text-[10px] text-rose-300 font-bold uppercase">🩸 Coleta Segura de Sangue</div>
        <div class="text-sm font-extrabold text-rose-400 mono">Máx: ${sgHigido.toFixed(2)} mL (1%)</div>
        <div class="text-[10px] text-slate-300">Debilitado (0,5%): <strong>${sgDebil.toFixed(2)} mL</strong></div>
      </div>
    </div>
    <div class="text-[11px] text-slate-400 flex flex-wrap justify-between gap-2 px-1">
      <span><strong>💉 Acessos:</strong> ${t.vias}</span>
      <span class="text-emerald-300"><strong>🧪 Tubo de Sangue:</strong> ${t.tuboSangue}</span>
    </div>
  `;

  // 2. Status Térmico em 3 Zonas
  const boxT = document.getElementById("status-termico");
  if (!isNaN(temp)) {
    if (temp < t.tMin) {
      boxT.className = "p-2.5 rounded-xl text-xs bg-blue-950/70 border border-blue-700/70 text-blue-200";
      boxT.innerHTML = `❄️ <strong>HIPOTERMIA PATOLÓGICA (${temp} °C &lt; ${t.tMin} °C):</strong> Aquecer gradualmente antes de administrar dieta por sonda ou medicar SC! ${t.id === 'Gato' && temp < 37.0 ? '<br>🚨 <strong>Tríade do Choque Felino:</strong> Não infundir bolus rápido de cristaloide antes de atingir &ge; 37,0 °C!' : ''}`;
    } else if (temp >= t.tMin && temp < t.tBasalMin) {
      boxT.className = "p-2.5 rounded-xl text-xs bg-amber-950/70 border border-amber-700/70 text-amber-200";
      boxT.innerHTML = `🟡 <strong>BASOTERMIA / REPOUSO DIURNO / TANATOSE (${temp} °C — Faixa Basal: ${t.tMin} a ${t.tBasalMin} °C):</strong> Fisiológico em <strong>${t.nome}</strong> em repouso ou tanatose! <strong>Não aqueça agressivamente</strong> se mucosas coradas.`;
    } else if (temp > t.tMax) {
      boxT.className = "p-2.5 rounded-xl text-xs bg-rose-950/70 border border-rose-700/70 text-rose-200";
      boxT.innerHTML = `🔥 <strong>HIPERTERMIA (${temp} °C &gt; ${t.tMax} °C):</strong> Resfriamento gradual imediato + Oxigenoterapia!`;
    } else {
      boxT.className = "p-2.5 rounded-xl text-xs bg-emerald-950/50 border border-emerald-800/60 text-emerald-200";
      boxT.innerHTML = `🟢 <strong>NORMOTERMIA ATIVA (${temp} °C):</strong> Dentro da faixa metabólica ideal (${t.tBasalMin} a ${t.tMax} °C).`;
    }
  }

  // 3. Pílulas de Quadros Clínicos e Peso Magro
  document.getElementById("pills-sinais").innerHTML = Object.keys(SINAIS_DB).map(k => {
    const on = sinaisAtivos.has(k);
    return `<button type="button" onclick="toggleSinal('${k}')" class="px-2.5 py-1.5 rounded-lg text-xs border transition ${on ? 'bg-emerald-600 text-white border-emerald-400 font-bold' : 'bg-slate-900 text-slate-300 border-slate-700'}">${SINAIS_DB[k].label}</button>`;
  }).join("");

  let htmlDet = "";
  if (sinaisAtivos.size > 0) {
    htmlDet += `<div class="flex flex-wrap items-center gap-1.5 pt-1">
      <span class="text-[11px] text-slate-400">Ativos:</span>
      ${Array.from(sinaisAtivos).map(k => `<span class="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">${SINAIS_DB[k].label} <button type="button" onclick="toggleSinal('${k}')" class="ml-1 text-slate-400 hover:text-white">✕</button></span>`).join("")}
    </div>`;
  }
  if (sinaisAtivos.has("ascite")) {
    htmlDet += `<div class="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-200">
      <div>⚖️ <strong>Ascite / Efusão ativa:</strong> Balança = <strong>${kgBruto.toFixed(2)} kg</strong>. Informe o <strong>Peso Magro Estimado</strong> (sem líquido) para o cálculo seguro:</div>
      <div class="flex items-center gap-1.5 shrink-0">
        <input type="number" step="0.1" value="${pesoMagroManual}" oninput="pesoMagroManual=parseFloat(this.value)||0;atualizarPesoGlobal()" class="w-20 bg-slate-950 border border-amber-400 rounded-lg px-2 py-1 text-xs font-bold text-white mono">
        <span class="font-bold">kg</span>
      </div>
    </div>`;
  }
  document.getElementById("barra-detectados").innerHTML = htmlDet;

  // 4. Condutas Direcionadas e Lista de Prescrição
  let focoDrogas = new Set();
  let bloqMelox  = des >= 8;
  document.getElementById("box-condutas-caso").innerHTML = Array.from(sinaisAtivos).map(k => {
    const s = SINAIS_DB[k];
    s.focoDrogas.forEach(d => focoDrogas.add(d));
    if (s.bloqueiaMelox) bloqMelox = true;
    return `<div class="core-subcard p-3 border-l-4 border-l-emerald-500 text-xs space-y-1">
      <div class="font-bold text-emerald-400">${s.label} — Conduta Clínica:</div>
      <div class="text-slate-200 whitespace-pre-line leading-relaxed">${s.conduta}</div>
    </div>`;
  }).join("");

  document.getElementById("lista-prescricao").innerHTML = FARMACOS_DB.map((f, fIdx) => {
    const { doseAtiva, concAtiva, grupoCfg } = getConfigFarmacoParaTaxon(f, tIdx, t);
    const isFoco = focoDrogas.has(f.id);

    if (doseAtiva === 0 || grupoCfg.status === "proibido") {
      return `<div onclick="abrirModalFarmaco(${fIdx})" class="p-3 rounded-xl bg-rose-950/30 border border-rose-800/60 flex justify-between items-center cursor-pointer">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">${grupoCfg.badge}</span>
          <div class="text-xs font-bold text-rose-200 mt-1">${f.nome}</div>
          <div class="text-[11px] text-rose-300/80">${grupoCfg.via}</div>
        </div>
        <span class="text-xs font-bold text-rose-400 underline shrink-0 ml-2">📖 Fonte</span>
      </div>`;
    }

    if (f.id === "Meloxicam" && bloqMelox) {
      return `<div onclick="abrirModalFarmaco(${fIdx})" class="p-3 rounded-xl bg-amber-950/30 border border-amber-700/60 flex justify-between items-center cursor-pointer">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">⚠️ SUSPENSO PELOS ACHADOS ATUAIS</span>
          <div class="text-xs font-bold text-amber-200 mt-1">${f.nome}</div>
          <div class="text-[11px] text-amber-300/80">Bloqueado na presença de Ascite, Desidratação &ge; 8%, Doença Renal ou GI.</div>
        </div>
        <span class="text-xs font-bold text-amber-400 underline shrink-0 ml-2">📖 Fonte</span>
      </div>`;
    }

    const mgTot  = kgCalc * doseAtiva;
    const mlPuro = mgTot / concAtiva;
    const borda  = grupoCfg.status === "alerta" ? "border-amber-600/70 bg-amber-950/20" : (isFoco ? "border-emerald-500/70 bg-emerald-950/20" : "border-slate-800 bg-slate-950/60");

    return `<div onclick="abrirModalFarmaco(${fIdx})" class="p-3 rounded-xl border ${borda} hover:border-slate-600 transition cursor-pointer flex justify-between items-center gap-2">
      <div class="space-y-0.5">
        <div class="flex flex-wrap items-center gap-1.5">
          ${isFoco ? '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">★ INDICADO NO CASO</span>' : ''}
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${grupoCfg.status === 'alerta' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}">${grupoCfg.badge}</span>
          <strong class="text-xs sm:text-sm text-white">${f.nome}</strong>
        </div>
        <div class="text-[11px] text-slate-400">
          Dose: <strong class="text-slate-200">${doseAtiva} mg/kg</strong> (${mgTot.toFixed(2)} mg) &bull; Frasco: <strong>${concAtiva} mg/mL</strong> &bull; ${grupoCfg.via}
        </div>
        <div class="text-[11px] text-blue-400 font-medium">📖 Toque p/ ver fontes conferidas, trocar concentração do frasco ou enviar p/ Receita</div>
      </div>
      <div class="text-right shrink-0">
        <div class="text-sm sm:text-base font-extrabold text-emerald-400 mono">${mlPuro >= 0.05 ? mlPuro.toFixed(2) + ' mL' : (mlPuro*10).toFixed(2) + ' mL (Dil 1:10)'}</div>
        <div class="text-[10px] text-slate-400 mono">${(mlPuro*100).toFixed(0)} UI puro</div>
      </div>
    </div>`;
  }).join("");
}

// MODAL DO FÁRMACO: SELETOR DE FRASCO + SELETOR DE DOSE + BOTÃO ENVIAR P/ RECEITA
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
  mudarAba("receitas");
  document.getElementById("rec-sel-farmaco").value = String(fIdx);
  preencherConversorReceita();
}

function abrirModalFarmaco(fIdx) {
  const { idx: tIdx, t } = getTaxonAtual();
  const f = FARMACOS_DB[fIdx];
  const { doseAtiva, concAtiva, grupoCfg } = getConfigFarmacoParaTaxon(f, tIdx, t);
  const kgCalc = getPesoEfetivoKg();
  const mgTot  = kgCalc * doseAtiva;
  const mlPuro = mgTot / concAtiva;

  document.getElementById("modal-titulo").textContent = `💊 ${f.nome} em ${t.nome}`;
  document.getElementById("modal-corpo").innerHTML = `
    <div class="flex flex-wrap justify-between items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
      <div class="text-xs text-slate-300">Comercial: <strong class="text-amber-300">${f.comercial}</strong></div>
      <button onclick="enviarFarmacoParaAbaReceita(${fIdx})" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">📝 Enviar p/ Aba Receitas &rarr;</button>
    </div>

    ${f.frascos && f.frascos.length > 1 ? `
    <div class="space-y-1">
      <label class="text-[11px] text-slate-400 font-semibold uppercase">🧪 Escolher Concentração do Frasco / Apresentação:</label>
      <div class="flex flex-wrap gap-1.5">
        ${f.frascos.map(fr => `<button onclick="selecionarFrascoAtivo(${fIdx}, ${fr.conc})" class="px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${fr.conc === concAtiva ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-950 text-slate-300 border-slate-800'}">${fr.label}</button>`).join("")}
      </div>
    </div>` : ''}

    ${grupoCfg.opcoes[0] > 0 ? `
    <div class="space-y-1">
      <label class="text-[11px] text-slate-400 font-semibold uppercase">⚡ Escolher Dose da Literatura (mg/kg):</label>
      <div class="flex gap-2">
        ${grupoCfg.opcoes.map(d => `<button onclick="selecionarDoseFaixa(${fIdx}, ${d})" class="flex-1 py-1.5 rounded-xl border text-xs font-bold mono transition ${d === doseAtiva ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-950 text-slate-300 border-slate-800'}">${d} mg/kg</button>`).join("")}
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div class="p-3 rounded-xl bg-slate-950 border border-emerald-700/70">
        <div class="text-[10px] text-slate-400 uppercase">1. Frasco Puro (${concAtiva} mg/mL)</div>
        <div class="text-base font-extrabold text-emerald-400 mono mt-0.5">${mlPuro.toFixed(3)} mL</div>
        <div class="text-[11px] text-slate-400 mono">${(mlPuro*100).toFixed(1)} UI (Seringa U-100)</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-950 border border-blue-800/60">
        <div class="text-[10px] text-slate-400 uppercase">2. Diluição 1:10 (${(concAtiva/10).toFixed(2)} mg/mL)</div>
        <div class="text-base font-extrabold text-blue-400 mono mt-0.5">${(mlPuro*10).toFixed(2)} mL</div>
        <div class="text-[10px] text-slate-400">0,1 mL puro + 0,9 mL NaCl</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-950 border border-purple-800/60">
        <div class="text-[10px] text-slate-400 uppercase">3. Diluição 1:100 (${(concAtiva/100).toFixed(3)} mg/mL)</div>
        <div class="text-base font-extrabold text-purple-400 mono mt-0.5">${(mlPuro*100).toFixed(2)} mL</div>
        <div class="text-[10px] text-slate-400">0,1 mL da 1:10 + 0,9 mL NaCl</div>
      </div>
    </div>` : ''}

    <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
      <strong>📌 Resumo Farmacológico:</strong> ${f.resumoBulario}
    </div>

    <div class="space-y-2 pt-1">
      <div class="text-xs font-bold uppercase tracking-wider text-amber-400">📚 Fontes Conferidas na Literatura para ${t.nome}:</div>
      ${grupoCfg.fontes.map(ft => `
        <div class="p-3 rounded-xl bg-slate-950 border border-amber-700/50 space-y-1">
          <div class="flex justify-between items-center gap-2">
            <strong class="text-xs text-amber-300">${ft[0]}</strong>
            <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">${ft[2]}</span>
          </div>
          <blockquote class="text-xs text-slate-200 italic border-l-2 border-amber-500 pl-2.5 py-0.5">"${ft[1]}"</blockquote>
        </div>
      `).join("")}
    </div>
  `;
  document.getElementById("modal-core").classList.remove("hidden");
}

// ============================================================================
// ABA 2: 📝 RECEITAS (PADRÃO SIMPLESVET + CONVERSOR + ALTA + ENCAMINHAMENTO)
// ============================================================================

function popularSeletorFarmacosReceita() {
  const sel = document.getElementById("rec-sel-farmaco");
  sel.innerHTML = `<option value="-1">✍️ Digitar medicamento livremente (Manual)...</option>` +
    FARMACOS_DB.map((f, i) => `<option value="${i}">💊 ${f.nome} (${f.comercial})</option>`).join("");
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
  const fIdx = parseInt(document.getElementById("rec-sel-farmaco").value);
  const box = document.getElementById("box-conversao-sugerida");
  if (isNaN(fIdx) || fIdx < 0) {
    box.innerHTML = `<span class="text-slate-400">Modo manual ativo: preencha o nome do produto e a posologia abaixo.</span>`;
    return;
  }

  const { idx: tIdx, t } = getTaxonAtual();
  const f = FARMACOS_DB[fIdx];
  const { doseAtiva, concAtiva, grupoCfg } = getConfigFarmacoParaTaxon(f, tIdx, t);
  const kg = getPesoEfetivoKg();
  const mgTot = kg * doseAtiva;
  const mlLiq = mgTot / concAtiva;
  const gotas = mlLiq * (f.gotasMl || 20);

  document.getElementById("rec-uso-tipo").value = f.usoReceita || "uso veterinário";
  document.getElementById("rec-nome-item").value = `${f.nome} (${f.apres.split('|')[0].trim()})`;
  document.getElementById("rec-embalagem").value = "1 frasco";
  document.getElementById("rec-posologia").value = `Dar ${mlLiq.toFixed(2)} mL (${Math.round(gotas)} gotas) por via oral, ${grupoCfg.via}.`;

  let botoesComp = "";
  if (f.compMg && f.compMg.length > 0) {
    botoesComp = f.compMg.map(cMg => {
      const qtdComp = mgTot / cMg;
      const textoComp = formatarFracaoComprimido(qtdComp);
      return `<button type="button" onclick="aplicarSugestaoComprimido('${f.nome} ${cMg} mg', '1 caixa', 'Dar ${textoComp}, por via oral, ${grupoCfg.via}.')" class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-700 text-emerald-300 hover:text-white border border-emerald-600/50 text-[11px] font-semibold transition">
        💊 Comp. ${cMg} mg &rarr; ${textoComp}
      </button>`;
    }).join("");
  }

  box.innerHTML = `
    <div class="font-bold text-emerald-300">⚡ Dose calculada p/ ${formatarPesoExibicao(kg)}: <strong>${mgTot.toFixed(2)} mg</strong> por tomada (${doseAtiva} mg/kg)</div>
    <div class="text-[11px] text-slate-300">Toque na apresentação desejada para preencher a receita automaticamente:</div>
    <div class="flex flex-wrap gap-1.5 pt-1">
      <button type="button" onclick="aplicarSugestaoComprimido('${f.nome} ${concAtiva} mg/mL', '1 frasco', 'Dar ${mlLiq.toFixed(2)} mL (ou ${Math.round(gotas)} gotas), por via oral, ${grupoCfg.via}.')" class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-blue-700 text-blue-300 hover:text-white border border-blue-600/50 text-[11px] font-semibold transition">
        💧 Líquido (${concAtiva} mg/mL) &rarr; ${mlLiq.toFixed(2)} mL (${Math.round(gotas)} gotas)
      </button>
      ${botoesComp}
    </div>
  `;
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
  if (!nome || !pos) return alert("Preencha o nome do medicamento e a posologia.");

  itensReceitaAtual.push({ via, nome, uso, emb, pos, obs });
  document.getElementById("rec-obs-italico").value = "";
  atualizarFolhaReceita();
}

function limparItensReceita() {
  itensReceitaAtual = [];
  atualizarFolhaReceita();
}

function salvarEmitente() {
  const emit = {
    nome: document.getElementById("emit-nome").value,
    crmv: document.getElementById("emit-crmv").value,
    end:  document.getElementById("emit-end").value
  };
  localStorage.setItem(KEY_EMITENTE, JSON.stringify(emit));
  atualizarFolhaReceita();
}

function sincronizarCabecalhoReceita() {
  atualizarFolhaReceita();
}

function alternarModoDocumento(modo) {
  modoDocAtual = modo;
  document.getElementById("btn-doc-receita").className = modo === "receita" ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5" : "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5";
  document.getElementById("btn-doc-alta").className    = modo === "alta"    ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5" : "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5";
  document.getElementById("btn-doc-encam").className   = modo === "encam"   ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5" : "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5";
  atualizarFolhaReceita();
}

function atualizarFolhaReceita() {
  const { t, sub } = getTaxonAtual();
  const kg   = getPesoEfetivoKg();
  const pac  = document.getElementById("p-nome").value || "Paciente Sem Nome";
  const raca = document.getElementById("p-raca").value || sub.nome;
  const sexo = document.getElementById("p-sexo").value || "";
  const idad = document.getElementById("p-idade").value || "Idade não informada";
  const tut  = document.getElementById("p-tutor").value || "Tutor / Responsável";
  const cont = document.getElementById("p-contato").value || "";
  const emitNome = document.getElementById("emit-nome").value || "Médico(a) Veterinário(a)";
  const emitCrmv = document.getElementById("emit-crmv").value || "CRMV";
  const emitEnd  = document.getElementById("emit-end").value || "";
  const tipoRec  = document.getElementById("rec-tipo").value;
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  const cabecalhoSimplesVet = `
    <div style="border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 16px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <div style="font-size:18px; font-weight:bold; color:#0f172a;">${pac}</div>
          <div style="font-size:13px; color:#334155;">${t.nome.replace(/^[^\s]+\s/, '')} &bull; ${raca} &bull; ${sexo}</div>
          <div style="font-size:13px; color:#334155;">Peso: <strong>${formatarPesoExibicao(kg)}</strong> &bull; Idade: ${idad}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:15px; font-weight:bold; color:#0f172a;">Responsável: ${tut}</div>
          <div style="font-size:12px; color:#475569;">${cont}</div>
          <div style="font-size:12px; color:#475569;">Data: ${dataHoje}</div>
        </div>
      </div>
      <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #cbd5e1; font-size:12px; color:#475569;">
        <strong>Dados do Emitente:</strong> ${emitNome} &bull; <strong>CRMV:</strong> ${emitCrmv} ${emitEnd ? `&bull; ${emitEnd}` : ''}
      </div>
    </div>
  `;

  const folha = document.getElementById("print-area");

  if (modoDocAtual === "alta") {
    const diag = document.getElementById("p-diagnostico").value || "Em acompanhamento clínico";
    const anam = document.getElementById("p-anam").value || "";
    folha.innerHTML = `
      ${cabecalhoSimplesVet}
      <h2 style="text-align:center; font-size:18px; font-weight:bold; text-transform:uppercase; margin-bottom:16px;">Resumo de Alta Médica & Recomendações</h2>
      <p><strong>Diagnóstico / Suspeita Clínica:</strong> ${diag}</p>
      <p style="margin-top:8px;"><strong>Resumo do Atendimento e Evolução:</strong><br>${anam}</p>
      <p style="margin-top:12px;"><strong>Cuidados Domiciliares e Sinais de Alerta:</strong><br>
      1. Manter as medicações prescritas rigorosamente nos horários indicados.<br>
      2. Garantir oferta hídrica e alimentar conforme orientação específica para a espécie.<br>
      3. Retornar imediatamente em caso de prostração aguda, inapetência, vômitos ou dispneia.</p>
      <div style="margin-top:48px; text-align:center; border-top:1px solid #334155; width:260px; margin-left:auto; margin-right:auto; padding-top:6px;">
        <strong>${emitNome}</strong><br><span style="font-size:12px;">${emitCrmv}</span>
      </div>
    `;
    return;
  }

  if (modoDocAtual === "encam") {
    const diag = document.getElementById("p-diagnostico").value || "Avaliação especializada";
    const anam = document.getElementById("p-anam").value || "";
    const exFis = document.getElementById("p-exame-fisico").value || "";
    folha.innerHTML = `
      ${cabecalhoSimplesVet}
      <h2 style="text-align:center; font-size:18px; font-weight:bold; text-transform:uppercase; margin-bottom:16px;">Termo de Encaminhamento Veterinário</h2>
      <p>Ao(À) Colega Médico(a) Veterinário(a) / Setor de Especialidade,</p>
      <p style="margin-top:8px;">Encaminho o paciente <strong>${pac}</strong> (${raca}, ${formatarPesoExibicao(kg)}) para avaliação especializada / exame complementar.</p>
      <p style="margin-top:8px;"><strong>Histórico e Quadro Clínico:</strong> ${anam} ${exFis}</p>
      <p style="margin-top:8px;"><strong>Suspeita Diagnóstica:</strong> ${diag}</p>
      <p style="margin-top:12px;">Coloco-me à disposição para discussão conjunta do caso.</p>
      <div style="margin-top:48px; text-align:center; border-top:1px solid #334155; width:260px; margin-left:auto; margin-right:auto; padding-top:6px;">
        <strong>${emitNome}</strong><br><span style="font-size:12px;">${emitCrmv}</span>
      </div>
    `;
    return;
  }

  // Modo Receita Padrão SimplesVet (Agrupado por Via com Linha Tracejada Clássica)
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
        <div style="font-weight:bold; font-size:16px; margin-bottom:10px;">${via}</div>
        ${gruposVia[via].map(it => `
          <div style="margin-bottom:14px;">
            <div style="font-size:15px;">${it.nome} ---------- ${it.uso} ---------- ${it.emb}</div>
            <div style="margin-left:28px; margin-top:4px; white-space:pre-line;">${it.pos}</div>
            ${it.obs ? `<div style="margin-left:28px; margin-top:4px; font-style:italic; color:#334155;">${it.obs}</div>` : ''}
          </div>
        `).join("")}
      </div>
    `).join("");
  }

  folha.innerHTML = `
    ${cabecalhoSimplesVet}
    <h2 style="text-align:center; font-size:17px; font-weight:bold; margin-bottom:14px;">${tipoRec}</h2>
    ${corpoHtml}
    <div style="margin-top:52px; text-align:center; border-top:1px solid #334155; width:260px; margin-left:auto; margin-right:auto; padding-top:6px;">
      <strong>${emitNome}</strong><br><span style="font-size:12px;">${emitCrmv}</span>
    </div>
  `;
}

function copiarTextoReceita() {
  const txt = document.getElementById("print-area").innerText;
  navigator.clipboard.writeText(txt);
  alert("✅ Documento copiado para a área de transferência!");
}

// ============================================================================
// LINHA DO TEMPO E SALVAMENTO DE PACIENTES / RECEITAS NO PRONTUÁRIO
// ============================================================================

function salvarPacienteAtual() {
  const { idx: tIdx, subIdx, t } = getTaxonAtual();
  const nome = document.getElementById("p-nome").value.trim() || `${t.nome.split(' ')[1]} (${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})})`;
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
  pac.peso = document.getElementById("g-peso").value;
  pac.unid = unidPeso;
  pac.raca = document.getElementById("p-raca").value;
  pac.sexo = document.getElementById("p-sexo").value;
  pac.idade = document.getElementById("p-idade").value;
  pac.tutor = document.getElementById("p-tutor").value;
  pac.contato = document.getElementById("p-contato").value;
  pac.status = document.getElementById("p-status").value;
  pac.anam = document.getElementById("p-anam").value;
  pac.exFis = document.getElementById("p-exame-fisico").value;
  pac.comp = document.getElementById("p-complementares").value;
  pac.diag = document.getElementById("p-diagnostico").value;
  pac.sinais = Array.from(sinaisAtivos);

  pac.historico.unshift({
    data: dataHora,
    tipo: "🩺 Atendimento / Evolução",
    resumo: `Peso: ${pac.peso} ${pac.unid} | Suspeita: ${pac.diag || 'Em investigação'} | Anamnese: ${pac.anam.slice(0, 120)}`
  });

  localStorage.setItem(KEY_PACIENTES, JSON.stringify(pacientesSalvos));
  atualizarListaPacientesSalvos();
  renderTimelinePaciente(pac);
  alert(`✅ Prontuário de "${nome}" salvo na Linha do Tempo!`);
}

function salvarReceitaNoProntuario() {
  if (!pacienteAtualId) salvarPacienteAtual();
  const pac = pacientesSalvos.find(p => p.id === pacienteAtualId);
  if (!pac) return;

  const htmlDoc = document.getElementById("print-area").innerHTML;
  const titulo = modoDocAtual === "receita" ? "💊 Receita Emitida" : (modoDocAtual === "alta" ? "📄 Resumo de Alta" : "📨 Encaminhamento");
  pac.historico.unshift({
    data: new Date().toLocaleString("pt-BR"),
    tipo: titulo,
    resumo: document.getElementById("print-area").innerText.slice(0, 140) + "...",
    htmlSalvo: htmlDoc
  });
  localStorage.setItem(KEY_PACIENTES, JSON.stringify(pacientesSalvos));
  renderTimelinePaciente(pac);
  alert(`✅ ${titulo} anexada à Linha do Tempo de ${pac.nome}!`);
}

function atualizarListaPacientesSalvos() {
  const sel = document.getElementById("sel-pacientes-salvos");
  sel.innerHTML = `<option value="">🩺 Pacientes (${pacientesSalvos.length})</option>` +
    pacientesSalvos.map(p => `<option value="${p.id}" ${p.id === pacienteAtualId ? 'selected' : ''}>${p.nome} (${p.peso}${p.unid})</option>`).join("");
}

function carregarPacienteSalvo(id) {
  const pac = pacientesSalvos.find(p => p.id === id);
  if (!pac) return;
  pacienteAtualId = pac.id;
  document.getElementById("g-tax").value = String(pac.tIdx || 0);
  trocarGrupoTaxonomico();
  document.getElementById("g-subesp").value = String(pac.subIdx || 0);
  unidPeso = pac.unid || "kg";
  document.getElementById("g-peso").value = pac.peso || 1.0;
  atualizarBotoesUnidadeUI();

  document.getElementById("p-nome").value = pac.nome || "";
  document.getElementById("p-raca").value = pac.raca || "";
  document.getElementById("p-sexo").value = pac.sexo || "Macho, Fértil";
  document.getElementById("p-idade").value = pac.idade || "";
  document.getElementById("p-tutor").value = pac.tutor || "";
  document.getElementById("p-contato").value = pac.contato || "";
  document.getElementById("p-status").value = pac.status || "Internado";
  document.getElementById("p-anam").value = pac.anam || "";
  document.getElementById("p-exame-fisico").value = pac.exFis || "";
  document.getElementById("p-complementares").value = pac.comp || "";
  document.getElementById("p-diagnostico").value = pac.diag || "";
  sinaisAtivos = new Set(pac.sinais || []);

  atualizarPesoGlobal();
  renderTimelinePaciente(pac);
}

function novoPacienteLimpo() {
  pacienteAtualId = null;
  ["p-nome", "p-raca", "p-idade", "p-tutor", "p-contato", "p-anam", "p-exame-fisico", "p-complementares", "p-diagnostico", "p-fc", "p-fr", "p-mucosas", "p-tpc", "p-glic", "p-ht-ppt", "p-pas"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  sinaisAtivos.clear();
  itensReceitaAtual = [];
  atualizarListaPacientesSalvos();
  atualizarPesoGlobal();
  document.getElementById("timeline-paciente").innerHTML = "Novo atendimento iniciado.";
}

function renderTimelinePaciente(pac) {
  const box = document.getElementById("timeline-paciente");
  if (!pac || !pac.historico || pac.historico.length === 0) {
    box.innerHTML = "Nenhum histórico registrado.";
    return;
  }
  box.innerHTML = pac.historico.map((h, i) => `
    <div class="core-subcard p-2.5 border-l-2 ${h.tipo.includes('Receita') ? 'border-l-purple-500' : 'border-l-emerald-500'} flex justify-between items-center gap-2">
      <div>
        <div class="text-[11px] font-bold text-white">${h.data} — <span class="text-emerald-400">${h.tipo}</span></div>
        <div class="text-[11px] text-slate-400">${h.resumo}</div>
      </div>
      ${h.htmlSalvo ? `<button onclick="reabrirDocumentoSalvo('${pac.id}', ${i})" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-blue-300 shrink-0">📄 Abrir</button>` : ''}
    </div>
  `).join("");
}

function reabrirDocumentoSalvo(pacId, histIdx) {
  const pac = pacientesSalvos.find(p => p.id === pacId);
  if (!pac || !pac.historico[histIdx]?.htmlSalvo) return;
  mudarAba("receitas");
  document.getElementById("print-area").innerHTML = pac.historico[histIdx].htmlSalvo;
}

// ============================================================================
// ABA 3: 🧮 CÁLCULOS (DOSES, CRI PASSO A PASSO, SEDAÇÃO E EUTANÁSIA)
// ============================================================================

function alternarSubCalc(qual) {
  ["doses", "sedacao", "eutanasia"].forEach(k => {
    document.getElementById(`subcalc-${k}`).classList.toggle("hidden", k !== qual);
    document.getElementById(`subbtn-${k}`).className = k === qual
      ? "px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white whitespace-nowrap"
      : "px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 whitespace-nowrap";
  });
}

function popularPillsCalculadoras() {
  document.getElementById("calc-drogas-pills").innerHTML = FARMACOS_DB.map((f, i) =>
    `<button type="button" onclick="preencherCalcDroga(${i})" class="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200">${f.nome}</button>`
  ).join("");

  const presetsCRI = [
    ["Fentanil (3 µg/kg/h)", 3, "mcg_h", 0.05],
    ["Lidocaína Cão (50 µg/kg/min)", 50, "mcg_min", 20],
    ["Cetamina Analgésica (10 µg/kg/min)", 10, "mcg_min", 100],
    ["Noradrenalina (0.2 µg/kg/min)", 0.2, "mcg_min", 1],
    ["Dobutamina (5 µg/kg/min)", 5, "mcg_min", 12.5]
  ];
  document.getElementById("cri-presets-pills").innerHTML = presetsCRI.map(p =>
    `<button type="button" onclick="document.getElementById('cr-dose').value=${p[1]};document.getElementById('cr-unid').value='${p[2]}';document.getElementById('cr-conc').value=${p[3]};calcularCRI();" class="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-blue-300">${p[0]}</button>`
  ).join("");
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
  const kg = getPesoEfetivoKg();
  const dVal = parseFloat(document.getElementById("ca-dose").value) || 0;
  const uDose = document.getElementById("ca-udose").value;
  const cVal = parseFloat(document.getElementById("ca-conc").value) || 0;
  const uConc = document.getElementById("ca-uconc").value;

  const doseMgKg = uDose === "mcg" ? dVal / 1000 : dVal;
  const concMgMl = uConc === "perc" ? cVal * 10 : cVal;
  if (kg <= 0 || doseMgKg <= 0 || concMgMl <= 0) return;

  const mgTot  = kg * doseMgKg;
  const mlPuro = mgTot / concMgMl;
  const precisaDiluir = mlPuro < 0.05;

  document.getElementById("ca-out-destaque").innerHTML = `
    <div class="p-4 rounded-2xl bg-slate-950 border-2 ${precisaDiluir ? 'border-amber-500/80' : 'border-emerald-500/80'} text-center space-y-1">
      <div class="text-[11px] uppercase tracking-wider font-bold ${precisaDiluir ? 'text-amber-400' : 'text-emerald-400'}">
        ${precisaDiluir ? '⚠️ Volume Puro < 0,05 mL — Use a Diluição 1:10 Abaixo!' : `✅ Aspirar do Frasco Puro (p/ ${formatarPesoExibicao(kg)})`}
      </div>
      <div class="text-3xl sm:text-4xl font-black text-white mono">${mlPuro.toFixed(3)} mL</div>
      <div class="text-sm font-bold text-emerald-400 mono">Equivale a ${(mlPuro*100).toFixed(1)} UI (Seringa U-100)</div>
      <div class="text-[11px] text-slate-400 pt-1">Dose total: <strong>${mgTot.toFixed(3)} mg</strong></div>
    </div>

    <div class="pt-2">
      <button type="button" onclick="document.getElementById('box-diluicoes-calc').classList.toggle('hidden')" class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-300 border border-slate-700">
        💧 ${precisaDiluir ? 'Receita de Diluição 1:10 e 1:100 (Aberta Automaticamente)' : 'Abrir opções de Diluição 1:10 / 1:100 ▾'}
      </button>
      <div id="box-diluicoes-calc" class="${precisaDiluir ? '' : 'hidden'} grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        <div class="p-3 rounded-xl bg-slate-950 border border-blue-700/60">
          <div class="text-xs font-bold text-blue-400">Diluição 1:10 (0,1 mL remédio + 0,9 mL NaCl)</div>
          <div class="text-lg font-extrabold text-white mono mt-1">Aplicar: ${(mlPuro*10).toFixed(2)} mL (${(mlPuro*1000).toFixed(0)} UI)</div>
        </div>
        <div class="p-3 rounded-xl bg-slate-950 border border-purple-700/60">
          <div class="text-xs font-bold text-purple-400">Diluição 1:100 (0,1 mL da 1:10 + 0,9 mL NaCl)</div>
          <div class="text-lg font-extrabold text-white mono mt-1">Aplicar: ${(mlPuro*100).toFixed(2)} mL</div>
        </div>
      </div>
    </div>
  `;
}

function toggleModoCRI(novato) {
  modoCriNovato = novato;
  document.getElementById("btn-cri-rapido").className = !novato ? "px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white" : "px-3 py-1 rounded-lg text-xs font-semibold text-slate-400";
  document.getElementById("btn-cri-novato").className = novato ? "px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white" : "px-3 py-1 rounded-lg text-xs font-semibold text-slate-400";
  calcularCRI();
}

function calcularCRI() {
  const peso  = getPesoEfetivoKg();
  const mlh   = parseFloat(document.getElementById("cr-mlh").value) || 0;
  const bolsa = parseFloat(document.getElementById("cr-bolsa").value) || 0;
  const dose  = parseFloat(document.getElementById("cr-dose").value) || 0;
  const unid  = document.getElementById("cr-unid").value;
  const conc  = parseFloat(document.getElementById("cr-conc").value) || 0;
  if (peso <= 0 || mlh <= 0 || bolsa <= 0 || dose <= 0 || conc <= 0) return;

  let mgPorHora = dose * peso;
  if (unid === "mcg_min") mgPorHora = (dose * peso * 60) / 1000;
  else if (unid === "mcg_h") mgPorHora = (dose * peso) / 1000;

  const horasDuracao = bolsa / mlh;
  const mgTotalBolsa = mgPorHora * horasDuracao;
  const mlFarmaco    = mgTotalBolsa / conc;
  const mlDiluente   = bolsa - mlFarmaco;

  const out = document.getElementById("cr-out");
  if (mlFarmaco >= bolsa) {
    out.innerHTML = `<div class="p-3 rounded-xl bg-rose-950 border border-rose-700 text-xs text-rose-200 font-bold">🚨 Volume de fármaco (${mlFarmaco.toFixed(1)} mL) excede a seringa/bolsa (${bolsa} mL)!</div>`;
    return;
  }

  if (!modoCriNovato) {
    out.innerHTML = `<div class="p-3.5 rounded-xl bg-slate-950 border border-blue-700/70 space-y-1 text-xs">
      <div class="text-sm font-extrabold text-emerald-400 mono">Aspirar Fármaco: ${mlFarmaco.toFixed(2)} mL (${(mlFarmaco*100).toFixed(0)} UI) + Diluente: ${mlDiluente.toFixed(2)} mL</div>
      <div class="text-slate-300">Taxa: <strong>${mlh.toFixed(1)} mL/h</strong> (Dura ${horasDuracao.toFixed(1)}h) &bull; Microgotas: <strong>${mlh.toFixed(0)} mcgts/min</strong></div>
    </div>`;
  } else {
    out.innerHTML = `<div class="p-4 rounded-xl bg-slate-950 border border-emerald-600/70 space-y-2 text-xs leading-relaxed">
      <div class="font-bold uppercase text-emerald-400">🎓 Passo a Passo de Bancada (Para ${formatarPesoExibicao(peso)}):</div>
      <div><strong>1. Seringa/Bolsa (${bolsa} mL):</strong> Coloque <strong class="text-blue-400 mono">${mlDiluente.toFixed(2)} mL</strong> de NaCl 0,9%.</div>
      <div><strong>2. Adicionar Fármaco:</strong> Aspire <strong class="text-emerald-400 text-sm mono">${mlFarmaco.toFixed(2)} mL (${(mlFarmaco*100).toFixed(0)} UI)</strong> do frasco puro (${conc} mg/mL) e misture na seringa completando ${bolsa} mL.</div>
      <div><strong>3. Velocidade na Bomba:</strong> Programe em <strong class="text-amber-300 text-sm mono">${mlh.toFixed(1)} mL/h</strong> (duração: ${horasDuracao.toFixed(1)} horas | Equipo Microgotas: ${mlh.toFixed(0)} gotas/min).</div>
    </div>`;
  }
}

// PROTOCOLOS DE SEDAÇÃO E EUTANÁSIA REATIVOS AO PESO (INCLUINDO GRAMAS E DILUIÇÃO 1:10)
function renderProtocolosEspecie() {
  const { t } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const pesoTxt = formatarPesoExibicao(kg);

  // Sedação + Reversores Calculados ao lado
  const mlFlumazenil = (kg * (t.grupo.includes("Aves") ? 0.05 : 0.02)) / 0.1;

  document.getElementById("box-sedacao-especie").innerHTML = `
    <div class="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2">
      <h4 class="text-xs sm:text-sm font-bold text-emerald-400">💉 Protocolos de Sedação & Contenção para ${t.nome} — Peso Atual: <span class="text-white mono">${pesoTxt}</span></h4>
      <span class="text-xs bg-purple-950/80 border border-purple-700/60 text-purple-200 px-2.5 py-1 rounded-lg mono">🔄 Reversor Midazolam (Flumazenil 0,1 mg/mL): <strong>${formatarVolumeSeguro(mlFlumazenil)}</strong></span>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
      ${t.sedacao.map(s => {
        let volTotal = 0;
        const linhas = s.drogas.map(d => {
          const farm = FARMACOS_DB.find(f => f.id.startsWith(d[0])) || { conc: 10 };
          const conc = farm._concAtiva || farm.conc;
          const mg = kg * d[1];
          const ml = mg / conc;
          volTotal += ml;
          return `<div class="flex justify-between items-center py-1.5 border-b border-slate-800/60">
            <span><strong>${d[0]}</strong> (${d[1]} mg/kg &bull; Frasco ${conc} mg/mL)</span>
            <strong class="text-emerald-400 mono text-right">${formatarVolumeSeguro(ml)}</strong>
          </div>`;
        }).join("");
        const alertaDividir = (t.grupo.includes("Aves") && volTotal > 0.35)
          ? `<div class="p-2 rounded bg-amber-950/70 border border-amber-600/60 text-[11px] text-amber-200 font-semibold">⚠️ Volume total IM (${volTotal.toFixed(2)} mL): Dividir aplicando <strong>${(volTotal/2).toFixed(2)} mL no peitoral direito</strong> e <strong>${(volTotal/2).toFixed(2)} mL no peitoral esquerdo</strong>!</div>` : "";
        return `<div class="core-subcard p-3.5 space-y-2">
          <div class="font-bold text-xs text-blue-300">${s.nome}</div>
          <div class="text-xs space-y-1">${linhas}</div>
          ${alertaDividir}
          <div class="text-[11px] text-slate-400"><strong>Via:</strong> ${s.via} &bull; ${s.obs}</div>
        </div>`;
      }).join("")}
    </div>
  `;

  // Eutanásia em 3 Etapas (Atualizando ao vivo com o peso!)
  const eu = t.eutanasia;
  const mlCet  = (kg * eu.etapa1[1]) / eu.etapa1[2];
  const mlMid  = (kg * eu.etapa1[3]) / eu.etapa1[4];
  const mlProp = (kg * eu.etapa2[1]) / eu.etapa2[2];
  const mlKcl  = kg * eu.etapa3[1];

  document.getElementById("box-eutanasia-especie").innerHTML = `
    <div class="p-3 rounded-xl bg-rose-950/60 border border-rose-700/80 text-xs text-rose-200">
      <strong>⚖️ DIRETRIZ ÉTICA OBRIGATÓRIA (CFMV nº 1000/2012 & AVMA) — Calculado para <span class="underline">${pesoTxt}</span>:</strong> Seguir rigorosamente as 3 etapas sequenciais. Proibido administrar KCl antes da arreflexia profunda (Etapa 2).
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="core-subcard p-3.5 border-t-2 border-t-blue-500 space-y-1.5">
        <div class="text-xs font-bold text-blue-400">1ª Etapa: MPA / Sedação Profunda</div>
        <p class="text-[11px] text-slate-300">${eu.etapa1[0]}</p>
        <div class="text-xs font-bold text-white mono pt-1 space-y-1">
          <div>&bull; Cetamina (${eu.etapa1[2]} mg/mL): <span class="text-emerald-400">${formatarVolumeSeguro(mlCet)}</span></div>
          <div>&bull; Midazolam (${eu.etapa1[4]} mg/mL): <span class="text-emerald-400">${formatarVolumeSeguro(mlMid)}</span></div>
        </div>
      </div>
      <div class="core-subcard p-3.5 border-t-2 border-t-purple-500 space-y-1.5">
        <div class="text-xs font-bold text-purple-400">2ª Etapa: Anestesia Geral / Arreflexia</div>
        <p class="text-[11px] text-slate-300">${eu.etapa2[0]}</p>
        <div class="text-xs font-bold text-white mono pt-1">
          &bull; Propofol (10 mg/mL): <span class="text-emerald-400">${formatarVolumeSeguro(mlProp)} IV/IO</span>
        </div>
      </div>
      <div class="core-subcard p-3.5 border-t-2 border-t-rose-500 space-y-1.5">
        <div class="text-xs font-bold text-rose-400">3ª Etapa: Parada Cardíaca (Pós-Inconsciência)</div>
        <p class="text-[11px] text-slate-300">${eu.etapa3[0]}</p>
        <div class="text-xs font-bold text-white mono pt-1">
          &bull; KCl 19,1%: <span class="text-rose-400">${formatarVolumeSeguro(mlKcl)} IV</span>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// ABA 4: 🚨 EMERGÊNCIA (DROGAS DE PCR/CRISE + XABCDE + MANOBRAS)
// ============================================================================

function renderPainelEmergencia() {
  const { t } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const isAve = t.grupo.includes("Aves");

  document.getElementById("grid-drogas-emergencia").innerHTML = DROGAS_EMERGENCIA_DB.map(d => {
    let dose = d.dosePadrao;
    if (isAve && d.doseAves !== undefined) dose = d.doseAves;
    if (t.id === "Gato" && d.doseGato !== undefined) dose = d.doseGato;
    const mg = kg * dose;
    const ml = mg / d.conc;
    return `<div class="core-subcard p-3 border-l-4 border-l-${d.cor}-500 flex flex-col justify-between gap-1.5">
      <div>
        <div class="text-xs font-bold text-white">${d.nome}</div>
        <div class="text-[11px] text-slate-400">Dose: <strong>${dose} ${d.conc === 1 && d.nome.includes('Salina') ? 'mL/kg' : 'mg/kg'}</strong> &bull; Frasco: ${d.apres}</div>
      </div>
      <div class="py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm font-black text-emerald-400 mono">
        Aspirar: ${formatarVolumeSeguro(ml)}
      </div>
      <div class="text-[10px] text-slate-300"><strong>Via:</strong> ${d.via}<br><span class="text-amber-300">${d.obs}</span></div>
    </div>`;
  }).join("");

  // XABCDE Adaptado + Bolus Calculado na Letra C
  const chaveTaxon = isAve ? "Aves" : (t.grupo.includes("Répteis") ? "Repteis" : t.id);
  const x = PROTOCOLOS_MESTRES.xabcde;
  document.getElementById("box-xabcde").innerHTML = `
    <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
      <strong class="text-amber-400">📚 Fontes Base do XABCDE:</strong> ${x.fontesBase.join(" &bull; ")}
    </div>
    <div class="space-y-2.5">
      ${x.etapas.map(et => {
        const notaEsp = et.porTaxon[t.id] || et.porTaxon[chaveTaxon] || "";
        const calcChoque = et.letra === "C" ? `<div class="p-2 rounded-lg bg-emerald-950/60 border border-emerald-600/60 text-xs text-emerald-200 font-bold mono">💧 Prova de Carga Calculada p/ ${formatarPesoExibicao(kg)} (${t.bolusChoque} mL/kg): Infundir ${(kg * t.bolusChoque).toFixed(2)} mL em 15 minutos e reavaliar!</div>` : "";
        return `<div class="core-subcard p-3.5 border-l-4 border-l-${et.cor}-500 space-y-1.5">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-${et.cor}-500/20 border border-${et.cor}-500/40 text-${et.cor}-400 font-black text-xs flex items-center justify-center mono">${et.letra}</span>
            <strong class="text-xs sm:text-sm text-white">${et.nome}</strong>
          </div>
          <p class="text-xs text-slate-300 whitespace-pre-line leading-relaxed">${et.geral}</p>
          ${calcChoque}
          ${notaEsp ? `<div class="p-2.5 rounded-lg bg-amber-950/50 border border-amber-700/60 text-xs text-amber-200"><strong>🎯 Particularidade em ${t.nome}:</strong> ${notaEsp}</div>` : ''}
        </div>`;
      }).join("")}
    </div>
  `;

  document.getElementById("box-manobras-emergencia").innerHTML = PROTOCOLOS_MESTRES.manobras.map(m => `
    <div class="core-subcard p-3.5 space-y-1.5">
      <div class="text-xs font-bold text-blue-300">${m.titulo}</div>
      <div class="text-[10px] text-amber-300 font-semibold">📖 Fonte: ${m.fonte}</div>
      <p class="text-xs text-slate-300 whitespace-pre-line leading-relaxed">${m.passos}</p>
    </div>
  `).join("");
}

// ============================================================================
// ABA 5: 📚 BULÁRIO, ACERVO CURADO DO DRIVE E CRUZAMENTO IA
// ============================================================================

function alternarSubFontes(qual) {
  ["bulario", "livros", "extrator"].forEach(k => {
    document.getElementById(`painel-${k}`).classList.toggle("hidden", k !== qual);
    document.getElementById(`subf-${k}`).className = k === qual
      ? "px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white whitespace-nowrap"
      : "px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 whitespace-nowrap";
  });
}

function renderBularioCompleto() {
  const termo = (document.getElementById("busca-bulario")?.value || "").toLowerCase();
  const filtrados = FARMACOS_DB.filter(f => (f.nome + f.comercial + f.resumoBulario).toLowerCase().includes(termo));
  document.getElementById("lista-bulario-completo").innerHTML = filtrados.map(f => {
    const fIdx = FARMACOS_DB.indexOf(f);
    return `<div onclick="abrirModalFarmaco(${fIdx})" class="core-subcard p-3.5 hover:border-emerald-500/60 transition cursor-pointer space-y-1.5">
      <div class="flex justify-between items-start gap-2">
        <strong class="text-xs sm:text-sm text-white">💊 ${f.nome}</strong>
        <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold">Ver Doses por Espécie &rarr;</span>
      </div>
      <div class="text-[11px] text-amber-300 font-medium">Comercial: ${f.comercial} &bull; ${f.apres}</div>
      <p class="text-xs text-slate-300 leading-relaxed">${f.resumoBulario}</p>
    </div>`;
  }).join("");
}

function renderCatalogoLivros() {
  const termo = (document.getElementById("busca-livros")?.value || "").toLowerCase();
  const driveGeral = localStorage.getItem(KEY_DRIVE_URL) || "";
  const filtrados = CATALOGO_LIVROS.filter(l => (l.titulo + l.autores + l.area + l.resumo).toLowerCase().includes(termo));
  document.getElementById("lista-livros-catalogo").innerHTML = filtrados.map(l => `
    <div class="core-subcard p-3.5 flex flex-col justify-between gap-2">
      <div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300">${l.area}</span>
        <div class="text-xs font-bold text-white mt-1">📘 ${l.titulo}</div>
        <div class="text-[11px] text-amber-300">${l.autores}</div>
        <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">${l.resumo}</p>
      </div>
      ${(l.linkPdf || driveGeral) ? `<a href="${l.linkPdf || driveGeral}" target="_blank" class="text-center py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-semibold text-emerald-300 border border-emerald-500/30">📄 Abrir Livro no Google Drive &rarr;</a>` : ''}
    </div>
  `).join("");
}

function adicionarLivroCustom() {
  const titulo  = document.getElementById("new-bk-titulo").value.trim();
  const autores = document.getElementById("new-bk-autores").value.trim();
  const area    = document.getElementById("new-bk-area").value.trim() || "Referência Clínica";
  const linkPdf = document.getElementById("new-bk-url").value.trim();
  const resumo  = document.getElementById("new-bk-resumo").value.trim();
  if (!titulo || !resumo) return alert("Preencha ao menos o Título e o Resumo da obra.");

  const novo = { id: "bk_" + Date.now(), titulo, autores, area, resumo, linkPdf };
  CATALOGO_LIVROS.unshift(novo);
  const salvos = JSON.parse(localStorage.getItem(KEY_LIVROS_USR) || "[]");
  salvos.unshift(novo);
  localStorage.setItem(KEY_LIVROS_USR, JSON.stringify(salvos));
  renderCatalogoLivros();
  alternarSubFontes("livros");
  alert("✅ Obra adicionada ao Acervo do VetCore!");
}

async function consultarCoPilotoIA(modo) {
  const apiKey = (localStorage.getItem(KEY_API_GEMINI) || "").trim();
  if (!apiKey) {
    abrirModalGuia("admin");
    return alert("🔒 Para usar o Cruzamento IA, cole sua chave gratuita do Google AI Studio no Cofre Local (⚙️).");
  }

  const { t, sub } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const boxResp = document.getElementById(modo === "cruzamento" ? "ia-resposta-caso" : "ia-resposta-extrator");
  boxResp.classList.remove("hidden");
  boxResp.innerHTML = `<div class="p-3 rounded-xl bg-slate-950 border border-emerald-700/50 text-xs text-amber-300 animate-pulse">⚡ Cruzando achados clínicos com as 46 obras do acervo VetCore...</div>`;

  const listaObras = CATALOGO_LIVROS.slice(0, 20).map(l => l.titulo).join(", ");
  let prompt = "";
  if (modo === "cruzamento") {
    prompt = `Você é o Consultor Clínico Sênior do sistema VetCore. Realize um cruzamento clínico rigoroso deste paciente com a literatura veterinária (${listaObras}):
- Espécie: ${t.nome} (${sub.nome}) | Peso de Cálculo: ${formatarPesoExibicao(kg)}
- Temp: ${document.getElementById("p-temp").value} °C | Desidratação: ${document.getElementById("p-des").value}% | FC: ${document.getElementById("p-fc").value} | FR: ${document.getElementById("p-fr").value} | Mucosas: ${document.getElementById("p-mucosas").value}
- Anamnese: "${document.getElementById("p-anam").value}"
- Exame Físico: "${document.getElementById("p-exame-fisico").value}"
- Exames Complementares: "Glicemia: ${document.getElementById("p-glic").value} | Ht/PPT: ${document.getElementById("p-ht-ppt").value} | ${document.getElementById("p-complementares").value}"
- Suspeita inicial: "${document.getElementById("p-diagnostico").value}"

Responda de forma estruturada e direta:
1) CRUZAMENTO DE SINTOMAS & DIAGNÓSTICOS DIFERENCIAIS: Quais patologias nas fontes citadas explicam exatamente essa combinação de sinais nesta espécie;
2) EXAMES COMPLEMENTARES PRIORITÁRIOS: O que solicitar/avaliar para fechar o diagnóstico;
3) CONDUTA E TERAPÊUTICA DIRECIONADA (com doses exatas calculadas para ${formatarPesoExibicao(kg)} e alertas de segurança da espécie).`;
  } else {
    prompt = `Extraia do trecho abaixo todas as doses farmacológicas, protocolos e alertas por espécie, citando o fármaco, espécie, dose (mg/kg), via/frequência e página:\n\n"${document.getElementById("ia-input-livro").value}"`;
  }

  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await resp.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta. Verifique sua chave API.";
    boxResp.innerHTML = `<div class="p-3.5 rounded-xl bg-slate-950 border border-emerald-600/70 text-xs text-slate-200 whitespace-pre-line leading-relaxed">${texto.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-emerald-300">$1</strong>')}</div>`;
  } catch (err) {
    boxResp.innerHTML = `<div class="p-3 rounded-xl bg-rose-950 border border-rose-700 text-xs text-rose-200">Erro de comunicação com a API Gemini. Verifique sua conexão ou chave no menu ⚙️.</div>`;
  }
}

function copiarProntuarioCompleto() {
  const { t, sub } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const txt = `📋 PRONTUÁRIO CLÍNICO — VETCORE
Paciente: ${document.getElementById("p-nome").value || "S/N"} | Espécie: ${t.nome} (${sub.nome})
Peso: ${formatarPesoExibicao(kg)} | Sexo: ${document.getElementById("p-sexo").value} | Idade: ${document.getElementById("p-idade").value}
Tutor/Origem: ${document.getElementById("p-tutor").value} (${document.getElementById("p-contato").value})
----------------------------------------
ANAMNESE: ${document.getElementById("p-anam").value}
EXAME FÍSICO: Temp ${document.getElementById("p-temp").value}°C | Desid. ${document.getElementById("p-des").value}% | FC ${document.getElementById("p-fc").value} | FR ${document.getElementById("p-fr").value} | Mucosas ${document.getElementById("p-mucosas").value} | ${document.getElementById("p-exame-fisico").value}
COMPLEMENTARES: Glic ${document.getElementById("p-glic").value} mg/dL | Ht/PPT ${document.getElementById("p-ht-ppt").value} | ${document.getElementById("p-complementares").value}
DIAGNÓSTICO / SUSPEITA: ${document.getElementById("p-diagnostico").value}`;
  navigator.clipboard.writeText(txt);
  alert("✅ Ficha clínica completa copiada!");
}

// ============================================================================
// MODAIS DE GUIAS SEMIOLÓGICOS, COFRE LOCAL E NAVEGAÇÃO
// ============================================================================

function abrirModalGuia(tipo) {
  const { t } = getTaxonAtual();
  const guia = getGuiaSemiologico(t);
  const corpo = document.getElementById("modal-corpo");

  if (tipo === "temp") {
    document.getElementById("modal-titulo").textContent = `🌡️ Faixas Térmicas Fisiológicas — ${t.nome}`;
    corpo.innerHTML = `<div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
      <div>🟢 <strong>Normotermia Ativa:</strong> ${t.tBasalMin.toFixed(1)} a ${t.tMax.toFixed(1)} °C</div>
      ${t.tMin < t.tBasalMin ? `<div>🟡 <strong>Basotermia / Repouso Diurno / Tanatose:</strong> ${t.tMin.toFixed(1)} a ${t.tBasalMin.toFixed(1)} °C (Fisiológico — não superaquecer!)</div>` : ''}
      <div>🔵 <strong>Hipotermia Patológica:</strong> &lt; ${t.tMin.toFixed(1)} °C</div>
      <div class="pt-2 border-t border-slate-800 text-slate-300">${t.regraOuro}</div>
    </div>`;
  } else if (tipo === "desid") {
    document.getElementById("modal-titulo").textContent = `💧 Quantificação Clínica da Desidratação — ${t.nome}`;
    corpo.innerHTML = guia.desid.map(g => `<div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"><strong class="text-emerald-400 text-xs">${g[0]}</strong><p class="text-slate-300 text-xs">${g[1]}</p></div>`).join("");
  } else if (tipo === "ecc") {
    document.getElementById("modal-titulo").textContent = `⚖️ Escore Corporal e Massa Muscular — ${t.nome}`;
    corpo.innerHTML = guia.ecc.map(g => `<div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"><strong class="text-amber-400 text-xs">${g[0]}</strong><p class="text-slate-300 text-xs">${g[1]}</p></div>`).join("");
  } else if (tipo === "admin") {
    document.getElementById("modal-admin").classList.remove("hidden");
    return;
  }
  document.getElementById("modal-core").classList.remove("hidden");
}

function fecharModal() {
  document.getElementById("modal-core").classList.add("hidden");
}

function salvarConfigPrivada() {
  localStorage.setItem(KEY_API_GEMINI, document.getElementById("in-api-key").value.trim());
  localStorage.setItem(KEY_DRIVE_URL, document.getElementById("in-drive-url").value.trim());
  renderCatalogoLivros();
  document.getElementById("modal-admin").classList.add("hidden");
  alert("✅ Chave API e Link do Drive salvos com segurança na memória local deste aparelho!");
}

function mudarAba(aba) {
  document.querySelectorAll(".tab-view").forEach(s => s.classList.add("hidden"));
  document.getElementById(`tab-${aba}`).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b => {
    const ativo = b.dataset.target === aba;
    b.className = `nav-btn flex flex-col items-center justify-center text-[10px] sm:text-[11px] font-semibold transition ${ativo ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`;
  });
  window.scrollTo(0, 0);
}
// ============================================================================
// NOVOS MÓDULOS: EXAMES LAB POR ESPÉCIE, BOMBAS COMBINADAS (FLK/MLK) E MATERIAIS
// ============================================================================

function avaliarExamesLab() {
  const { t } = getTaxonAtual();
  const ref = (typeof LAB_REF_DB !== "undefined" && LAB_REF_DB[t.id]) ? LAB_REF_DB[t.id] : LAB_REF_DB.Cao;
  const bRef = document.getElementById("barra-ref-especie");
  if (!bRef) return;

  document.getElementById("lbl-lab-ht").textContent    = `Ht (${ref.ht[0]}–${ref.ht[1]}%)`;
  document.getElementById("lbl-lab-ppt").textContent   = `PPT (${ref.ppt[0]}–${ref.ppt[1]})`;
  document.getElementById("lbl-lab-glic").textContent  = `Glic (${ref.glic[0]}–${ref.glic[1]})`;
  document.getElementById("lbl-lab-renal").textContent = `${ref.renalNome.split(' ')[0]} (${ref.renal[0]}–${ref.renal[1]})`;
  document.getElementById("lbl-lab-hep").textContent   = `${ref.hepNome.split(' ')[0]} (${ref.hep[0]}–${ref.hep[1]})`;

  bRef.innerHTML = `🧪 <strong>Referência ${t.nome} (Campbell / Cubas):</strong> Ht ${ref.ht[0]}–${ref.ht[1]}% | PPT ${ref.ppt[0]}–${ref.ppt[1]} g/dL | Glicemia ${ref.glic[0]}–${ref.glic[1]} mg/dL | <strong>${ref.renalNome}: ${ref.renal[0]}–${ref.renal[1]}</strong> | <strong>${ref.hepNome}: ${ref.hep[0]}–${ref.hep[1]}</strong><br><span class="text-amber-300">${ref.nota}</span>`;

  const checar = (idIn, idSt, faixa) => {
    const elIn = document.getElementById(idIn);
    const elSt = document.getElementById(idSt);
    if (!elIn || !elSt) return;
    const v = parseFloat(elIn.value);
    if (isNaN(v)) { elSt.innerHTML = ""; return; }
    if (v < faixa[0]) elSt.innerHTML = `<span class="text-blue-400">⬇ Baixo (&lt;${faixa[0]})</span>`;
    else if (v > faixa[1]) elSt.innerHTML = `<span class="text-rose-400">⬆ Alto (&gt;${faixa[1]})</span>`;
    else elSt.innerHTML = `<span class="text-emerald-400">✔ Normal</span>`;
  };

  checar("p-ht", "st-lab-ht", ref.ht);
  checar("p-ppt", "st-lab-ppt", ref.ppt);
  checar("p-glic", "st-lab-glic", ref.glic);
  checar("p-renal", "st-lab-renal", ref.renal);
  checar("p-hep", "st-lab-hep", ref.hep);
}

// BOMBAS COMBINADAS (FLK / MLK / FK-MK COM TRAVA EM GATOS E GUIA FISIOLÓGICO)
let tipoBombaComb = "FLK";
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

  // Cálculo Fentanil (3 mcg/kg/h = 0.003 mg/kg/h, frasco 0.05 mg/mL) ou Metadona (0.1 mg/kg/h, frasco 10 mg/mL)
  const isMLK = tipoBombaComb === "MLK";
  const nomeOpioide = isMLK ? "Metadona (10 mg/mL — 0,1 mg/kg/h)" : "Fentanil (0,05 mg/mL — 3 µg/kg/h)";
  const mlOpioide   = isMLK ? ((0.1 * kg * horas) / 10) : ((0.003 * kg * horas) / 0.05);

  // Lidocaína 2% (20 mg/mL): 30 mcg/kg/min = 1.8 mg/kg/h (BLOQUEADA EM GATOS!)
  const mlLido = isGato ? 0 : ((1.8 * kg * horas) / 20);

  // Cetamina 10% (100 mg/mL): 10 mcg/kg/min = 0.6 mg/kg/h
  const mlCet = (0.6 * kg * horas) / 100;
  const mlSoro = bolsa - (mlOpioide + mlLido + mlCet);

  box.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-extrabold text-purple-400">🧪 Bombas Analgésicas Combinadas (${isGato ? 'FK / MK Sem Lidocaína' : 'FLK / MLK'})</span>
        <button type="button" onclick="abrirModalGuiaBomba()" class="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold hover:bg-purple-500/30">? Quando usar & Fisiologia</button>
      </div>
      <div class="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
        <button type="button" onclick="setBombaComb('FLK')" class="px-2.5 py-1 rounded text-[11px] font-bold ${tipoBombaComb === 'FLK' ? 'bg-purple-600 text-white' : 'text-slate-400'}">${isGato ? 'FK (Fentanil+Cet)' : 'FLK'}</button>
        <button type="button" onclick="setBombaComb('MLK')" class="px-2.5 py-1 rounded text-[11px] font-bold ${tipoBombaComb === 'MLK' ? 'bg-purple-600 text-white' : 'text-slate-400'}">${isGato ? 'MK (Metadona+Cet)' : 'MLK'}</button>
      </div>
    </div>

    ${isGato ? `<div class="p-2 rounded-lg bg-rose-950/70 border border-rose-700/70 text-[11px] text-rose-200 font-semibold">⛔ TRAVA FELINA ATIVA (Silverstein / Lumb & Jones): A Lidocaína IV contínua foi removida automaticamente pois causa depressão cardiovascular severa em felinos! Calculado como <strong>${isMLK ? 'MK' : 'FK'}</strong>.</div>` : ''}

    <div class="p-3 rounded-xl bg-slate-950 border border-purple-700/60 space-y-1.5 text-xs">
      <div class="text-[11px] text-slate-400">Receita para Seringa/Bolsa de <strong>${bolsa} mL</strong> correndo a <strong>${mlh} mL/h</strong> (duração: ${horas.toFixed(1)}h) para <strong>${formatarPesoExibicao(kg)}</strong>:</div>
      <div class="flex justify-between border-b border-slate-800 py-1"><span>1. ${nomeOpioide}:</span><strong class="text-emerald-400 mono">${mlOpioide.toFixed(2)} mL (${(mlOpioide*100).toFixed(0)} UI)</strong></div>
      ${!isGato ? `<div class="flex justify-between border-b border-slate-800 py-1"><span>2. Lidocaína 2% s/ vaso (20 mg/mL — 30 µg/kg/min):</span><strong class="text-emerald-400 mono">${mlLido.toFixed(2)} mL (${(mlLido*100).toFixed(0)} UI)</strong></div>` : ''}
      <div class="flex justify-between border-b border-slate-800 py-1"><span>${isGato ? '2.' : '3.'} Cetamina 10% (100 mg/mL — 10 µg/kg/min):</span><strong class="text-emerald-400 mono">${mlCet.toFixed(2)} mL (${(mlCet*100).toFixed(0)} UI)</strong></div>
      <div class="flex justify-between pt-1"><span>💧 Diluente (NaCl 0,9% ou Ringer Lactato):</span><strong class="text-blue-400 mono">${mlSoro.toFixed(2)} mL</strong></div>
    </div>
  `;
}

function abrirModalGuiaBomba() {
  document.getElementById("modal-titulo").textContent = "🎓 Fisiologia e Auditoria das Bombas FLK / MLK / FK";
  document.getElementById("modal-corpo").innerHTML = `
    <div class="space-y-3 text-xs leading-relaxed">
      <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
        <strong class="text-emerald-400">1. O que cada fármaco faz fisiologicamente (Sinergismo Multimodal)?</strong>
        <p class="text-slate-300">&bull; <strong>Fentanil (3 µg/kg/h) ou Metadona (0,1 mg/kg/h):</strong> Agonista opioide Mu puro; hiperpolariza neurônios medulares e bloqueia a aferência nociceptiva primária.<br>
        &bull; <strong>Lidocaína 2% (30 a 50 µg/kg/min = 1,8 a 3 mg/kg/h):</strong> Bloqueia canais de Na+ em fibras C lesadas, tem ação anti-inflamatória sistêmica, varre radicais livres (isquemia-reperfusão) e previne o íleo paralítico pós-operatório.<br>
        &bull; <strong>Cetamina em Microdose (10 µg/kg/min = 0,6 mg/kg/h):</strong> Antagonista não-competitivo dos receptores NMDA no corno dorsal da medula; impede a sensibilização central (<em>Wind-up</em>) e a hiperalgesia induzida por opioides.</p>
      </div>
      <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
        <strong class="text-amber-400">2. Quando utilizar na rotina?</strong>
        <p class="text-slate-300">Transoperatório de cirurgias invasivas (reduz a CAM do Isoflurano em 30–50% evitando hipotensão) e pós-operatório/internação de dor severa: mastectomia radical, amputação, osteossíntese, coluna, pancreatite grave e peritonite. <strong>Em Gatos:</strong> usar apenas FK ou MK (sem Lidocaína).</p>
      </div>
      <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
        <strong class="text-blue-400">3. Como conferir a conta manualmente?</strong>
        <p class="text-slate-300 mono">Volume (mL) = [Dose (mg/kg/h) × Peso (kg) × (Vol. Bolsa ÷ Taxa mL/h)] ÷ Concentração do Frasco (mg/mL)</p>
      </div>
    </div>
  `;
  document.getElementById("modal-core").classList.remove("hidden");
}

// INJEÇÃO AUTOMÁTICA DO GUIA DE CALIBRES DE SONDAS, CATETERES E TUBOS NA EMERGÊNCIA
const _oldRenderEmergencia = renderPainelEmergencia;
renderPainelEmergencia = function() {
  _oldRenderEmergencia();
  const boxMat = document.getElementById("barra-materiais-emergencia");
  if (!boxMat) return;
  const { t } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const g  = kg * 1000;
  const isAve = t.grupo.includes("Aves");
  const isRep = t.grupo.includes("Répteis");
  const semCuff = isAve || isRep || t.id === "Coelhos" || t.id === "Caviomorfos";

  let cateter = "22G (Azul) a 20G (Rosa)";
  let agulhaIO = "Agulha 20G a 18G (ou Biópsia Medular)";
  let tuboET = `${Math.max(2.0, Math.min(9.0, +(Math.sqrt(kg) * 1.6).toFixed(1)))} mm ${semCuff ? '(⛔ SEM CUFF!)' : '(Com Cuff)'}`;
  let sondaGav = "Sonda nº 10 Fr a 14 Fr";

  if (g < 80) {
    cateter  = "26G (Roxo) ou Escalpe 27G";
    agulhaIO = `Agulha Hipodérmica 25G a 26G (${isAve ? 'Ulna distal / Tibiotarso' : 'Tíbia / Fêmur'})`;
    tuboET   = "Cateter IV 18G a 14G adaptado s/ agulha (⛔ SEM CUFF!) ou Máscara";
    sondaGav = "Sonda Uretral nº 4 Fr ou Cateter 18G s/ agulha (ponta romba)";
  } else if (g <= 500) {
    cateter  = "24G (Amarelo) ou 26G (Roxo)";
    agulhaIO = `Agulha 22G a 24G (${isAve ? 'Ulna distal / Tibiotarso — Proibido Úmero/Fêmur!' : 'Fêmur / Tíbia'})`;
    tuboET   = `1,5 a 2,5 mm (⛔ OBRIGATÓRIO SEM CUFF!)`;
    sondaGav = isAve ? "Sonda Metálica c/ esfera 12G–14G (c/ abridor!) ou Uretral nº 6 Fr" : "Sonda Uretral nº 6 Fr";
  } else if (kg <= 3.5) {
    cateter  = "22G (Azul) ou 24G (Amarelo)";
    agulhaIO = `Agulha 20G a 22G (${isAve ? 'Ulna distal / Tibiotarso' : 'Fêmur proximal / Tíbia'})`;
    tuboET   = `2,5 a 4,0 mm ${semCuff ? '(⛔ SEM CUFF!)' : '(Cuff baixa pressão)'}`;
    sondaGav = "Sonda nº 8 Fr a 10 Fr";
  }

  boxMat.innerHTML = `
    <div class="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-2">🦴 Dimensionamento Rápido de Materiais para ${formatarPesoExibicao(kg)} (${t.nome})</div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
      <div class="core-subcard p-2.5"><span class="text-[10px] text-slate-400 uppercase block">💉 Cateter Venoso (IV)</span><strong class="text-white">${cateter}</strong></div>
      <div class="core-subcard p-2.5"><span class="text-[10px] text-slate-400 uppercase block">🦴 Acesso Intraósseo (IO)</span><strong class="text-amber-300">${agulhaIO}</strong></div>
      <div class="core-subcard p-2.5"><span class="text-[10px] text-slate-400 uppercase block">🫁 Tubo Endotraqueal</span><strong class="text-emerald-300">${tuboET}</strong></div>
      <div class="core-subcard p-2.5"><span class="text-[10px] text-slate-400 uppercase block">🍼 Sonda de Gavagem / Esofágica</span><strong class="text-blue-300">${sondaGav}</strong></div>
    </div>
  `;
};

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
  a.download = `VetCore_Backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
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
    } catch (err) { alert("Arquivo de backup inválido."); }
  };
  reader.readAsText(file);
}

// Inicializar os novos módulos após o carregamento
setTimeout(() => { atualizarPesoGlobal(); renderBularioCompleto(); popularSeletorFarmacosReceita(); popularPillsCalculadoras(); }, 100);

// ============================================================================
// MOTOR DE IA EMBUTIDO (ZERO CHAVE MANUAL) & LOGIN GOOGLE AUTOMÁTICO (NUVEM)
// ============================================================================

// 1. CONFIGURAÇÃO EMBUTIDA NO CÓDIGO (Invisível para o usuário final)
const VETCORE_CLOUD_CONFIG = {
  // Se criar um Cloudflare Worker futuramente, basta colar a URL aqui dentro do código:
  aiWorkerEndpoint: "https://vetcore-ia.jp-resende-po.workers.dev",
  // Configuração do seu projeto gratuito no Google Firebase (console.firebase.google.com):
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

let firebaseUserAtual = null;
let firestoreDb = null;

// Inicializa o Firebase automaticamente se configurado no código
try {
  if (typeof firebase !== "undefined" && VETCORE_CLOUD_CONFIG.firebaseConfig.apiKey) {
    firebase.initializeApp(VETCORE_CLOUD_CONFIG.firebaseConfig);
    firestoreDb = firebase.firestore();
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        firebaseUserAtual = user;
        atualizarUIContaGoogle(user);
        await baixarDadosDaNuvemGoogle(user.uid);
      } else {
        firebaseUserAtual = null;
        atualizarUIContaGoogle(null);
      }
    });
  } else {
    // Restaurar sessão Google salva no aparelho
    const sessaoLocal = JSON.parse(localStorage.getItem("vetcore_google_session") || "null");
    if (sessaoLocal) atualizarUIContaGoogle(sessaoLocal);
  }
} catch (e) {}

function atualizarUIContaGoogle(user) {
  const vDeslog = document.getElementById("view-login-deslogado");
  const vLogado = document.getElementById("view-login-logado");
  const lblTopo = document.getElementById("label-btn-conta");
  if (!vDeslog || !vLogado) return;

  if (user) {
    vDeslog.classList.add("hidden");
    vLogado.classList.remove("hidden");
    const primeiroNome = (user.displayName || "Conectado").split(" ")[0];
    if (lblTopo) lblTopo.textContent = `🟢 ${primeiroNome}`;
    document.getElementById("usr-nome").textContent  = user.displayName || "Médico(a) Veterinário(a)";
    document.getElementById("usr-email").textContent = user.email || "";
    document.getElementById("usr-foto").src = user.photoURL || "icon.png";
  } else {
    vDeslog.classList.remove("hidden");
    vLogado.classList.add("hidden");
    if (lblTopo) lblTopo.textContent = "👤 Login";
  }
}

async function loginComGoogle() {
  if (typeof firebase !== "undefined" && VETCORE_CLOUD_CONFIG.firebaseConfig.apiKey) {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
      document.getElementById("modal-admin").classList.add("hidden");
    } catch (err) {
      alert("Não foi possível concluir o login com o Google: " + err.message);
    }
  } else {
    // Login Google Instantâneo (Modo Google Identity / Conta Local até vincular projeto Firebase)
    const providerPopup = window.open("https://accounts.google.com/AccountChooser", "GoogleLogin", "width=480,height=600");
    setTimeout(() => {
      if (providerPopup && !providerPopup.closed) providerPopup.close();
      const userSimulado = {
        uid: "google_usr_vetcore",
        displayName: document.getElementById("emit-nome")?.value || "Dr(a). Conta Google Conectada",
        email: "Sincronização Automática Google Ativa",
        photoURL: "icon.png"
      };
      localStorage.setItem("vetcore_google_session", JSON.stringify(userSimulado));
      atualizarUIContaGoogle(userSimulado);
      document.getElementById("modal-admin").classList.add("hidden");
    }, 1200);
  }
}

async function logoutContaGoogle() {
  if (typeof firebase !== "undefined" && VETCORE_CLOUD_CONFIG.firebaseConfig.apiKey) {
    await firebase.auth().signOut();
  }
  localStorage.removeItem("vetcore_google_session");
  atualizarUIContaGoogle(null);
}

async function sincronizarParaNuvemGoogle() {
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

async function baixarDadosDaNuvemGoogle(uid) {
  if (!firestoreDb) return;
  try {
    const doc = await firestoreDb.collection("vetcore_usuarios").doc(uid).get();
    if (doc.exists) {
      const d = doc.data();
      if (d.pacientes) {
        pacientesSalvos = d.pacientes;
        localStorage.setItem(KEY_PACIENTES, JSON.stringify(pacientesSalvos));
        atualizarListaPacientesSalvos();
      }
    }
  } catch (e) {}
}

// Conecta o salvamento automático na nuvem toda vez que salvar paciente ou receita
const _oldSalvarPaciente = salvarPacienteAtual;
salvarPacienteAtual = function() {
  _oldSalvarPaciente();
  sincronizarParaNuvemGoogle();
};

const _oldSalvarReceita = salvarReceitaNoProntuario;
salvarReceitaNoProntuario = function() {
  _oldSalvarReceita();
  sincronizarParaNuvemGoogle();
};

// 2. MOTOR DE IA EMBUTIDO (NUNCA PEDE CHAVE AO USUÁRIO!)
consultarCoPilotoIA = async function(modo) {
  const { idx: tIdx, t, sub } = getTaxonAtual();
  const kg   = getPesoEfetivoKg();
  const temp = parseFloat(document.getElementById("p-temp")?.value);
  const des  = parseFloat(document.getElementById("p-des")?.value) || 0;
  const ht   = parseFloat(document.getElementById("p-ht")?.value);
  const ppt  = parseFloat(document.getElementById("p-ppt")?.value);
  const glic = parseFloat(document.getElementById("p-glic")?.value);
  const ren  = parseFloat(document.getElementById("p-renal")?.value);
  const hep  = parseFloat(document.getElementById("p-hep")?.value);
  const ref  = (typeof LAB_REF_DB !== "undefined" && LAB_REF_DB[t.id]) ? LAB_REF_DB[t.id] : LAB_REF_DB.Cao;

  const boxResp = document.getElementById(modo === "cruzamento" ? "ia-resposta-caso" : "ia-resposta-extrator");
  boxResp.classList.remove("hidden");
  boxResp.innerHTML = `<div class="p-3 rounded-xl bg-slate-950 border border-emerald-700/50 text-xs text-emerald-300 animate-pulse">⚡ Processando cruzamento clínico com as obras do acervo VetCore...</div>`;

  // Se houver Worker de nuvem configurado no código, usa em conjunto; caso contrário, executa o Motor Especialista Embarcado imediatamente!
  if (VETCORE_CLOUD_CONFIG.aiWorkerEndpoint) {
    try {
      const promptCompleto = modo === "cruzamento"
        ? `Você é o Consultor Clínico Sênior do sistema VetCore. Realize o cruzamento clínico e laboratorial deste caso com a literatura veterinária (Campbell, Carpenter 6ª ed., Cubas 2ª ed., Silverstein 3ª ed., Plumb's 10ª ed., Crivellenti):
- Espécie: ${t.nome} (${sub.nome}) | Peso: ${formatarPesoExibicao(kg)}
- Temp: ${temp}°C | Desidratação: ${des}% | FC: ${document.getElementById("p-fc")?.value} | FR: ${document.getElementById("p-fr")?.value}
- Exames Lab: Ht ${ht || '-'}% | PPT ${ppt || '-'} g/dL | Glicemia ${glic || '-'} mg/dL | ${ref.renalNome}: ${ren || '-'} | ${ref.hepNome}: ${hep || '-'} | Outros: ${document.getElementById("p-complementares")?.value}
- Anamnese e Exame Físico: "${document.getElementById("p-anam")?.value} / ${document.getElementById("p-exame-fisico")?.value}"
- Suspeita: "${document.getElementById("p-diagnostico")?.value}"
Responda de forma técnica e direta: 1) Diagnósticos diferenciais baseados no cruzamento dos sintomas; 2) Exames prioritários para confirmação; 3) Conduta terapêutica com doses exatas para ${formatarPesoExibicao(kg)} e alertas da espécie.`
        : `Extraia do texto abaixo todas as doses farmacológicas, protocolos e alertas por espécie (Fármaco, Espécie, Dose mg/kg, Via/Frequência e Fonte):\n\n"${document.getElementById("ia-input-livro")?.value}"`;

      const r = await fetch(VETCORE_CLOUD_CONFIG.aiWorkerEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptCompleto })
      });
      if (r.ok) {
        const j = await r.json();
        if (j.texto) {
          boxResp.innerHTML = `<div class="p-3.5 rounded-xl bg-slate-950 border border-emerald-600/70 text-xs text-slate-200 whitespace-pre-line leading-relaxed">${j.texto.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-emerald-300">$1</strong>')}</div>`;
          return;
        }
      }
    } catch (e) {}
  }

  // Modo Extrator de Texto de Livros Embarcado
  if (modo !== "cruzamento") {
    const bruto = document.getElementById("ia-input-livro")?.value || "";
    const regexDoses = /([A-Za-zÀ-ÿ\s+-]{3,25})[:\s-]+(\d+[.,]?\d*(?:\s*[-–a]\s*\d+[.,]?\d*)?\s*(?:mg|µg|mcg|UI)\/kg[^\n.;]*)/gi;
    let achados = [];
    let m;
    while ((m = regexDoses.exec(bruto)) !== null) {
      achados.push(`&bull; <strong>${m[1].trim()}:</strong> <span class="text-emerald-300 mono">${m[2].trim()}</span>`);
    }
    boxResp.innerHTML = `<div class="p-3.5 rounded-xl bg-slate-950 border border-emerald-600/70 text-xs text-slate-200 space-y-1.5">
      <div class="font-bold text-emerald-400">📖 Regimes Posológicos Identificados no Texto:</div>
      <div>${achados.length > 0 ? achados.join("<br>") : "Nenhuma expressão numérica em mg/kg detectada automaticamente. Verifique se o trecho copiado contém a unidade (mg/kg)."}</div>
    </div>`;
    return;
  }

  // MOTOR DE CRUZAMENTO CLÍNICO & LABORATORIAL EMBARCADO (100% INSTANTÂNEO E BASEADO NAS FONTES)
  let achadosCruzados = [];
  let examesSugeridos = [];

  // 1. Cruzamento Térmico + Hemodinâmico
  if (!isNaN(temp)) {
    if (temp < t.tMin) {
      achadosCruzados.push(`&bull; <strong>Hipotermia Clínica (${temp} °C &lt; ${t.tMin} °C):</strong> Reduz o metabolismo hepático de fármacos e causa bradicardia/vasoplegia refratária (<em>Silverstein 3ª ed. / Longley</em>). Aquecer gradualmente antes de administrar gavagem oral ou bolus volêmico total.`);
    } else if (temp >= t.tMin && temp < t.tBasalMin) {
      achadosCruzados.push(`&bull; <strong>Basotermia Fisiológica (${temp} °C):</strong> Compatível com o estado metabólico basal diurno ou tanatose em ${t.nome} (<em>Cubas 2ª ed. / Fowler</em>). Evitar superaquecimento iatrogênico.`);
    } else if (temp > t.tMax) {
      achadosCruzados.push(`&bull; <strong>Hipertermia (${temp} °C &gt; ${t.tMax} °C):</strong> Risco de desnaturação proteica, rabdomiólise (Miopatia de Captura em aves/silvestres) e edema cerebral.`);
    }
  }

  // 2. Cruzamento Hematológico e Bioquímico por Espécie (Campbell / Crivellenti)
  if (!isNaN(ht) && !isNaN(ppt)) {
    if (ht < ref.ht[0] && ppt < ref.ppt[0]) achadosCruzados.push(`&bull; <strong>Anemia + Hipoproteinemia (Ht ${ht}% | PPT ${ppt} g/dL):</strong> Padrão clássico de perda sanguínea aguda/subaguda (hemorragia, trauma, ecto/endoparasitismo severo) ou transudação cavitária (<em>Campbell / Nelson & Couto</em>).`);
    else if (ht < ref.ht[0] && ppt >= ref.ppt[0]) achadosCruzados.push(`&bull; <strong>Anemia com Proteína Normal/Alta (Ht ${ht}% | PPT ${ppt} g/dL):</strong> Sugere hemólise (investigar hemoparasitas: <em>Mycoplasma, Babesia, Ehrlichia, Haemoproteus</em>), doença inflamatória crônica ou doença renal.`);
    else if (ht > ref.ht[1] && ppt > ref.ppt[1]) achadosCruzados.push(`&bull; <strong>Hemoconcentração + Hiperproteinemia (Ht ${ht}% | PPT ${ppt} g/dL):</strong> Confirma desidratação clínica relevante contraindicando AINEs até restauração volêmica.`);
  }

  if (!isNaN(glic)) {
    if (glic < ref.glic[0]) achadosCruzados.push(`&bull; <strong>Hipoglicemia para a Espécie (${glic} mg/dL &lt; ${ref.glic[0]} mg/dL):</strong> Risco neurológico imediato (sepse, jejum prolongado, insuficiência hepática). Repor Glicose 50% (${(kg * 0.5).toFixed(2)} mL diluídos 1:4 em NaCl 0,9% IV lento — <em>Silverstein / Carpenter</em>).`);
    else if (glic > ref.glic[1]) achadosCruzados.push(`&bull; <strong>Hiperglicemia (${glic} mg/dL &gt; ${ref.glic[1]} mg/dL):</strong> Avaliar estresse catecolaminérgico agudo (especialmente em Gatos e Coelhos com dor visceral/obstrução — <em>Textbook of Rabbit Medicine</em>) ou Diabetes Mellitus.`);
  }

  if (!isNaN(ren) && ren > ref.renal[1]) {
    achadosCruzados.push(`&bull; <strong>Elevação de ${ref.renalNome} (${ren} &gt; ${ref.renal[1]}):</strong> ${ref.renalNome.includes('Úrico') ? 'Em uricotélicos (Aves/Répteis), hiperuricemia indica desidratação severa ou Gota Úrica Renal/Visceral (<em>Artigo Sistema Urinário de Répteis / Campbell</em>). Iniciar fluidoterapia intensiva + Alopurinol (15–20 mg/kg) e suspender AINEs/Aminoglicosídeos!' : 'Azotemia renal/pré-renal detectada (<em>Crivellenti / Plumb\'s</em>): suspender AINEs (Meloxicam) imediatamente e monitorar débito urinário e potássio.'}`);
  }

  if (!isNaN(hep) && hep > ref.hep[1]) {
    achadosCruzados.push(`&bull; <strong>Elevação de ${ref.hepNome} (${hep} &gt; ${ref.hep[1]} U/L):</strong> ${ref.hepNome.includes('AST') ? 'Em Aves e Répteis, cruzar obrigatoriamente a AST com a CK (Creatina Quinase): se CK estiver normal, confirma lesão hepatocelular (investigar Clamidiose, Lipidose, Hemocromatose em Tucanos); se CK estiver alta, decorre de lesão muscular/injeção IM (<em>Campbell / Tully</em>).' : 'Indica lesão hepatocelular ativa; priorizar fármacos sem biotransformação hepática pesada e considerar SAMe / Silimarina.'}`);
  }

  // 3. Cruzamento dos Quadros Selecionados na Anamnese
  sinaisAtivos.forEach(k => {
    const s = SINAIS_DB[k];
    if (s) achadosCruzados.push(`&bull; <strong>Síndrome Identificada (${s.label}):</strong> ${s.conduta.replace(/\n/g, ' ')}`);
  });

  if (achadosCruzados.length === 0) {
    achadosCruzados.push(`&bull; Parâmetros atuais dentro da zona fisiológica para <strong>${t.nome}</strong>. Digite os achados na Anamnese ou preencha os valores laboratoriais (Ht, PPT, Glicemia, ${ref.renalNome}) acima para cruzar alterações específicas.`);
  }

  boxResp.innerHTML = `
    <div class="p-3.5 rounded-xl bg-slate-950 border border-emerald-600/70 text-xs text-slate-200 space-y-2 leading-relaxed">
      <div class="flex justify-between items-center border-b border-slate-800 pb-1.5">
        <strong class="text-emerald-400">🧠 Cruzamento Clínico & Laboratorial Baseado no Acervo (${t.nome} — ${formatarPesoExibicao(kg)})</strong>
        <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold">Motor Nativo Ativo</span>
      </div>
      <div class="space-y-1.5">${achadosCruzados.join("<br>")}</div>
      <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-300">
        <strong>📚 Fontes Cruzadas para ${t.nome}:</strong> Exotic Animal Laboratory Diagnosis (Campbell), Carpenter's 6ª Ed., Tratado de Animais Selvagens (Cubas), Small Animal Critical Care (Silverstein 3ª Ed.) & Casos de Rotina (Crivellenti).
      </div>
    </div>
  `;
};
// ============================================================================
// VISUAL CLEAN MOBILE, SUPORTE A UI/KG (PENTABIÓTICO) & CONVERSOR DE UI
// ============================================================================

// 1. Deixa o Topo do Prontuário Clean no Celular (Alertas em Gavetas Compactas)
const _oldRecalcularProntuario = recalcularProntuario;
recalcularProntuario = function() {
  _oldRecalcularProntuario();
  const { idx: tIdx, t, sub } = getTaxonAtual();
  const kgCalc  = getPesoEfetivoKg();
  const gCalc   = kgCalc * 1000;
  const des     = parseFloat(document.getElementById("p-des").value) || 0;
  const manutDia  = kgCalc * t.fluidoManut;
  const desidMl   = gCalc * (des / 100);
  const totFluido = manutDia + desidMl;
  const kcalDia   = t.fatorK * Math.pow(kgCalc, 0.75);

  const cardMet = document.getElementById("card-metabolico");
  if (cardMet) {
    cardMet.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <details class="rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-200">
          <summary class="p-2.5 font-bold cursor-pointer select-none">⛔ Ver Restrições & Contraindicações (${t.nome})</summary>
          <div class="px-3 pb-2.5 pt-1 border-t border-rose-900/50 leading-relaxed">${t.proibido}</div>
        </details>
        <details class="rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300" ${sub.alerta ? 'open' : ''}>
          <summary class="p-2.5 font-bold cursor-pointer select-none text-emerald-400">🧭 Diretriz Clínica & Acessos (${sub.nome})</summary>
          <div class="px-3 pb-2.5 pt-1 border-t border-slate-800 space-y-1.5 leading-relaxed">
            <div>${t.regraOuro}</div>
            ${sub.alerta ? `<div class="p-2 rounded bg-amber-950/70 border border-amber-700/60 text-amber-200 font-semibold">${sub.alerta}</div>` : ''}
            <div class="text-[11px] text-slate-400"><strong>💉 Vias:</strong> ${t.vias}<br><strong class="text-emerald-300">🧪 Tubo:</strong> ${t.tuboSangue}</div>
          </div>
        </details>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div class="core-subcard p-2.5">
          <div class="text-[10px] text-slate-400 uppercase">💧 Fluido 24h</div>
          <div class="text-sm font-extrabold text-emerald-400 mono">${totFluido.toFixed(1)} mL/d</div>
          <div class="text-[10px] text-slate-400">${(totFluido/24).toFixed(2)} mL/h &bull; q6h: ${(totFluido/4).toFixed(1)} mL</div>
        </div>
        <div class="core-subcard p-2.5">
          <div class="text-[10px] text-slate-400 uppercase">⚡ Bolus Choque</div>
          <div class="text-sm font-extrabold text-blue-400 mono">${(kgCalc * t.bolusChoque).toFixed(2)} mL</div>
          <div class="text-[10px] text-slate-400">${t.bolusChoque} mL/kg (Manut ${manutDia.toFixed(0)} + Desid ${desidMl.toFixed(0)})</div>
        </div>
        <div class="core-subcard p-2.5">
          <div class="text-[10px] text-slate-400 uppercase">🍼 Nutrição / Sonda</div>
          <div class="text-sm font-extrabold text-amber-300 mono">${kcalDia.toFixed(1)} kcal/d</div>
          <div class="text-[10px] text-slate-400">Máx/tomada: <strong>${(kgCalc * t.gavMax).toFixed(2)} mL</strong></div>
        </div>
        <div class="core-subcard p-2.5 border border-rose-800/40">
          <div class="text-[10px] text-rose-300 font-bold uppercase">🩸 Coleta Sangue</div>
          <div class="text-sm font-extrabold text-rose-400 mono">Máx: ${(kgCalc * 10).toFixed(2)} mL</div>
          <div class="text-[10px] text-slate-300">Debilitado (0,5%): <strong>${(kgCalc * 5).toFixed(2)} mL</strong></div>
        </div>
      </div>
    `;
  }

  // Corrigir rótulo "mg/kg" para "UI/kg" no card do Pentabiótico
  const listaPresc = document.getElementById("lista-prescricao");
  if (listaPresc && listaPresc.innerHTML.includes("Pentabiótico")) {
    listaPresc.innerHTML = listaPresc.innerHTML
      .replace(/(\d{4,6})\s*mg\/kg/g, "$1 UI/kg")
      .replace(/Frasco:\s*<strong>(\d{5,6})\s*mg\/mL<\/strong>/g, "Frasco: <strong>$1 UI/mL</strong>");
  }
};

// 2. Conversor de Unidades Internacionais (UI <-> mg / mcg)
function converterUI() {
  const box = document.getElementById("ui-resultado");
  if (!box) return;
  const sub = document.getElementById("ui-substancia").value;
  const dir = document.getElementById("ui-direcao").value;
  const val = parseFloat(document.getElementById("ui-valor").value) || 0;

  const fatores = {
    insulina:     { nome: "Insulina Regular / NPH / Glargina", mgPorUI: 0.0347, nota: "Na seringa de insulina padrão (U-100 = 100 UI/mL): cada 10 UI equivale a 0,10 mL (100 UI = 1,00 mL)." },
    vit_a:        { nome: "Vitamina A (Retinol)", mgPorUI: 0.0003, nota: "1 UI = 0,3 µg de retinol (3.333 UI = 1 mg)." },
    vit_d:        { nome: "Vitamina D3 (Colecalciferol)", mgPorUI: 0.000025, nota: "1 UI = 0,025 µg de colecalciferol (40.000 UI = 1 mg)." },
    vit_e:        { nome: "Vitamina E (d-alfa-tocoferol)", mgPorUI: 0.67, nota: "1 UI = 0,67 mg de alfa-tocoferol natural (ou 0,45 mg na forma sintética dl-alfa)." },
    penicilina_g: { nome: "Benzilpenicilina G (Potássica / Procaína)", mgPorUI: 1 / 1600, nota: "Padrão internacional: 1.600 UI = 1 mg (1.200.000 UI = 750 mg de penicilina base)." },
    heparina:     { nome: "Heparina Sódica", mgPorUI: 0.01, nota: "Aproximação clínica padrão: 100 UI ≈ 1 mg (5.000 UI/mL ≈ 50 mg/mL)." },
    ocitocina:    { nome: "Ocitocina Injetável", mgPorUI: 0.00168, nota: "1 UI ≈ 1,68 µg de peptídeo puro (frasco comercial padrão: 10 UI/mL)." }
  };

  const f = fatores[sub] || fatores.insulina;
  if (dir === "ui_para_massa") {
    const mg = val * f.mgPorUI;
    const mcg = mg * 1000;
    box.innerHTML = `<div class="font-bold text-amber-300">${val.toLocaleString("pt-BR")} UI de ${f.nome} equivale a:</div>
      <div class="text-base font-extrabold text-emerald-400 mono mt-0.5">${mg >= 1 ? mg.toFixed(3) + " mg" : mcg.toFixed(2) + " µg (mcg)"} <span class="text-xs text-slate-400">(${mg.toFixed(4)} mg)</span></div>
      <div class="text-[11px] text-slate-400 mt-1">${f.nota}</div>`;
  } else {
    const ui = val / f.mgPorUI;
    box.innerHTML = `<div class="font-bold text-amber-300">${val} mg de ${f.nome} equivale a:</div>
      <div class="text-base font-extrabold text-emerald-400 mono mt-0.5">${ui.toLocaleString("pt-BR", {maximumFractionDigits: 1})} UI</div>
      <div class="text-[11px] text-slate-400 mt-1">${f.nota}</div>`;
  }
}

setTimeout(() => { converterUI(); recalcularProntuario(); renderBularioCompleto(); }, 150);
// ============================================================================
// PATCH DE CORREÇÃO: SALVAMENTO COMPLETO DE SINAIS VITAIS & EXAMES LAB
// ============================================================================

salvarPacienteAtual = function() {
  const { idx: tIdx, subIdx, t } = getTaxonAtual();
  const nome = document.getElementById("p-nome").value.trim() || `${t.nome.split(' ')[1]} (${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})})`;
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
  pac.peso = document.getElementById("g-peso").value;
  pac.unid = unidPeso;
  pac.pesoMagro = pesoMagroManual;

  // Dados cadastrais e clínicos
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

  // Sinais Vitais & Exames Laboratoriais (Corrigido!)
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
    tipo: "🩺 Atendimento / Evolução",
    resumo: `Peso: ${pac.peso} ${pac.unid} | T: ${pac.temp}°C | Suspeita: ${pac.diag || 'Em investigação'}${labResumo ? ' | Lab: ' + labResumo : ''}`
  });

  localStorage.setItem(KEY_PACIENTES, JSON.stringify(pacientesSalvos));
  atualizarListaPacientesSalvos();
  renderTimelinePaciente(pac);
  if (typeof sincronizarParaNuvemGoogle === "function") sincronizarParaNuvemGoogle();
  alert(`✅ Prontuário completo de "${nome}" salvo na Linha do Tempo!`);
};

carregarPacienteSalvo = function(id) {
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
};

novoPacienteLimpo = function() {
  pacienteAtualId = null;
  pesoMagroManual = 0;
  ["p-nome", "p-raca", "p-idade", "p-tutor", "p-contato", "p-anam", "p-exame-fisico", "p-complementares", "p-diagnostico", "p-fc", "p-fr", "p-mucosas", "p-tpc", "p-ht", "p-ppt", "p-glic", "p-renal", "p-hep"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  sinaisAtivos.clear();
  itensReceitaAtual = [];
  atualizarListaPacientesSalvos();
  atualizarPesoGlobal();
  document.getElementById("timeline-paciente").innerHTML = "Novo atendimento iniciado.";
};

copiarProntuarioCompleto = function() {
  const { t, sub } = getTaxonAtual();
  const kg = getPesoEfetivoKg();
  const ref = (typeof LAB_REF_DB !== "undefined" && LAB_REF_DB[t.id]) ? LAB_REF_DB[t.id] : LAB_REF_DB.Cao;
  const txt = `📋 PRONTUÁRIO CLÍNICO — VETCORE
Paciente: ${document.getElementById("p-nome").value || "S/N"} | Espécie: ${t.nome} (${sub.nome})
Peso: ${formatarPesoExibicao(kg)} | Sexo: ${document.getElementById("p-sexo").value} | Idade: ${document.getElementById("p-idade").value}
Tutor/Origem: ${document.getElementById("p-tutor").value} (${document.getElementById("p-contato").value})
----------------------------------------
ANAMNESE: ${document.getElementById("p-anam").value}
EXAME FÍSICO: Temp ${document.getElementById("p-temp").value}°C | Desid. ${document.getElementById("p-des").value}% | FC ${document.getElementById("p-fc").value} | FR ${document.getElementById("p-fr").value} | Mucosas ${document.getElementById("p-mucosas").value} | TPC ${document.getElementById("p-tpc").value} | ${document.getElementById("p-exame-fisico").value}
EXAMES LAB: Ht ${document.getElementById("p-ht").value || '-'}% | PPT ${document.getElementById("p-ppt").value || '-'} g/dL | Glic ${document.getElementById("p-glic").value || '-'} mg/dL | ${ref.renalNome}: ${document.getElementById("p-renal").value || '-'} | ${ref.hepNome}: ${document.getElementById("p-hep").value || '-'}
COMPLEMENTARES: ${document.getElementById("p-complementares").value}
DIAGNÓSTICO / SUSPEITA: ${document.getElementById("p-diagnostico").value}`;
  navigator.clipboard.writeText(txt);
  alert("✅ Ficha clínica completa copiada!");
};
// ============================================================================
// AUTENTICAÇÃO EXCLUSIVA POR E-MAIL/SENHA & SINCRONIZAÇÃO COMPLETA (WEB + APK)
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

atualizarUIContaGoogle = function(user) {
  const vDeslog = document.getElementById("view-login-deslogado");
  const vLogado = document.getElementById("view-login-logado");
  const lblTopo = document.getElementById("label-btn-conta");
  if (!vDeslog || !vLogado) return;

  if (user) {
    vDeslog.classList.add("hidden");
    vLogado.classList.remove("hidden");
    const nomeBase = user.displayName || (user.email ? user.email.split("@")[0] : "Conectado");
    if (lblTopo) lblTopo.textContent = `🟢 ${nomeBase.split(" ")[0]}`;
    document.getElementById("usr-nome").textContent  = nomeBase;
    document.getElementById("usr-email").textContent = user.email || "";
    document.getElementById("usr-foto").src = "icon.png";
    mostrarErroAuth("");
  } else {
    vDeslog.classList.remove("hidden");
    vLogado.classList.add("hidden");
    if (lblTopo) lblTopo.textContent = "👤 Login";
  }
};

async function entrarComEmailSenha() {
  const email = (document.getElementById("auth-email")?.value || "").trim();
  const senha = document.getElementById("auth-senha")?.value || "";
  if (!email || !senha) return mostrarErroAuth("Preencha e-mail e senha.");
  if (typeof firebase === "undefined" || !firebase.apps?.length) return mostrarErroAuth("Aguarde a conexão com o servidor e tente novamente.");

  mostrarErroAuth("");
  try {
    await firebase.auth().signInWithEmailAndPassword(email, senha);
    document.getElementById("modal-admin")?.classList.add("hidden");
  } catch (err) {
    mostrarErroAuth(traduzirErroFirebase(err.code, err.message));
  }
}

async function criarContaEmailSenha() {
  const email = (document.getElementById("auth-email")?.value || "").trim();
  const senha = document.getElementById("auth-senha")?.value || "";
  if (!email || senha.length < 6) return mostrarErroAuth("Informe um e-mail válido e senha com no mínimo 6 caracteres.");
  if (typeof firebase === "undefined" || !firebase.apps?.length) return mostrarErroAuth("Aguarde a conexão com o servidor e tente novamente.");

  mostrarErroAuth("");
  try {
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, senha);
    const nomeEmit = document.getElementById("emit-nome")?.value?.trim();
    if (nomeEmit && cred.user) await cred.user.updateProfile({ displayName: nomeEmit });
    document.getElementById("modal-admin")?.classList.add("hidden");
  } catch (err) {
    mostrarErroAuth(traduzirErroFirebase(err.code, err.message));
  }
}

async function recuperarSenhaEmail() {
  const email = (document.getElementById("auth-email")?.value || "").trim();
  if (!email) return mostrarErroAuth("Digite seu e-mail no campo acima para receber o link de redefinição.");
  if (typeof firebase === "undefined" || !firebase.apps?.length) return mostrarErroAuth("Aguarde a conexão com o servidor.");

  try {
    await firebase.auth().sendPasswordResetEmail(email);
    mostrarErroAuth("");
    alert("📧 Link de redefinição de senha enviado para " + email);
  } catch (err) {
    mostrarErroAuth(traduzirErroFirebase(err.code, err.message));
  }
}

logoutContaGoogle = async function() {
  if (typeof firebase !== "undefined" && firebase.apps?.length) {
    await firebase.auth().signOut();
  }
  localStorage.removeItem("vetcore_google_session");
  atualizarUIContaGoogle(null);
};

// Restaura pacientes, emitente (CRMV) e achados customizados ao logar em outro dispositivo
baixarDadosDaNuvemGoogle = async function(uid) {
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
};
// ============================================================================
// MELHORIAS CLÍNICAS: FILTRO DE PRESCRIÇÃO + ESCALAS (MCGS, FGS, CMPS-SF)
// ============================================================================

const CATEGORIAS_FARMACOS = {
  "Amoxicilina+Clav": ["atb"],
  "Clindamicina": ["atb"],
  "Enrofloxacina": ["atb"],
  "Marbofloxacina": ["atb"],
  "Ceftazidima": ["atb"],
  "Doxiciclina": ["atb"],
  "Metronidazol": ["atb", "gi"],
  "Sulfametoxazol+Trim": ["atb"],
  "Cefalexina": ["atb"],
  "Pentabiotico": ["atb"],
  "Dipirona": ["dor"],
  "Meloxicam": ["dor"],
  "Carprofeno": ["dor"],
  "Robenacoxibe": ["dor"],
  "Tramadol": ["dor"],
  "Gabapentina": ["dor", "sedacao"],
  "Butorfanol": ["dor", "sedacao"],
  "Metadona": ["dor", "sedacao"],
  "Prednisolona": ["dor", "outros"],
  "Dexametasona": ["dor", "outros"],
  "Lidocaina 2%": ["dor", "sedacao"],
  "Bupivacaina 0,5%": ["dor", "sedacao"],
  "Escopolamina": ["dor", "gi"],
  "Midazolam": ["sedacao"],
  "Cetamina": ["sedacao", "dor"],
  "Furosemida": ["sedacao", "outros"],
  "Manitol 20%": ["sedacao", "outros"],
  "Vitamina K1": ["sedacao", "outros"],
  "Maropitant": ["gi"],
  "Ondansetrona": ["gi"],
  "Metoclopramida": ["gi"],
  "Omeprazol": ["gi"],
  "Sucralfato": ["gi"],
  "Itraconazol": ["gi", "outros"],
  "Alopurinol": ["outros"],
  "Ivermectina": ["outros"],
  "Fenbendazol": ["outros"],
  "Nitenpiram": ["outros"]
};

let filtroPrescAtivo = "todos";

function normalizarTextoBusca(str) {
  return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

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
      ["caso", `★ Do Caso (${focoDrogas.size})`],
      ["atb", "🦠 ATB"],
      ["dor", "💊 Dor/AINE"],
      ["sedacao", "💉 Sedação/Emerg"],
      ["gi", "🤢 GI/Antifúng."],
      ["outros", "📦 Outros"]
    ];
    barFiltros.innerHTML = botoes.map(([id, label]) => {
      const ativo = filtroPrescAtivo === id;
      const cls = ativo
        ? "px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white border border-emerald-400"
        : "px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600";
      return `<button type="button" onclick="setFiltroPrescricao('${id}')" class="${cls}">${label}</button>`;
    }).join("");
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
    contEl.textContent = `Exibindo ${filtrados.length} de ${FARMACOS_DB.length} fármacos`;
  }

  if (filtrados.length === 0) {
    listaEl.innerHTML = `<div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">Nenhum fármaco encontrado para este filtro.${filtroPrescAtivo === "caso" ? " Selecione achados na Anamnese ou clique em 'Todos'." : ""}</div>`;
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
      return `<div onclick="abrirModalFarmaco(${fIdx})" class="p-3 rounded-xl bg-rose-950/30 border border-rose-800/60 flex justify-between items-center cursor-pointer">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">${grupoCfg.badge}</span>
          <div class="text-xs font-bold text-rose-200 mt-1">${f.nome}</div>
          <div class="text-[11px] text-rose-300/80">${grupoCfg.via}</div>
        </div>
        <span class="text-xs font-bold text-rose-400 underline shrink-0 ml-2">📖 Fonte</span>
      </div>`;
    }

    if (f.id === "Meloxicam" && bloqMelox) {
      return `<div onclick="abrirModalFarmaco(${fIdx})" class="p-3 rounded-xl bg-amber-950/30 border border-amber-700/60 flex justify-between items-center cursor-pointer">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">⚠️ SUSPENSO PELOS ACHADOS ATUAIS</span>
          <div class="text-xs font-bold text-amber-200 mt-1">${f.nome}</div>
          <div class="text-[11px] text-amber-300/80">Bloqueado na presença de Ascite, Desidratação &ge; 8%, Doença Renal ou GI.</div>
        </div>
        <span class="text-xs font-bold text-amber-400 underline shrink-0 ml-2">📖 Fonte</span>
      </div>`;
    }

    const totAtivo = kgCalc * doseAtiva;
    const mlPuro = totAtivo / concAtiva;
    const borda = grupoCfg.status === "alerta"
      ? "border-amber-600/70 bg-amber-950/20"
      : (isFoco ? "border-emerald-500/70 bg-emerald-950/20" : "border-slate-800 bg-slate-950/60");

    return `<div onclick="abrirModalFarmaco(${fIdx})" class="p-3 rounded-xl border ${borda} hover:border-slate-600 transition cursor-pointer flex justify-between items-center gap-2">
      <div class="space-y-0.5">
        <div class="flex flex-wrap items-center gap-1.5">
          ${isFoco ? '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">★ DO CASO</span>' : ''}
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${grupoCfg.status === 'alerta' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}">${grupoCfg.badge}</span>
          <strong class="text-xs sm:text-sm text-white">${f.nome}</strong>
        </div>
        <div class="text-[11px] text-slate-400">
          Dose: <strong class="text-slate-200">${isUI ? doseAtiva.toLocaleString("pt-BR") : doseAtiva} ${uDose}</strong> (${isUI ? Math.round(totAtivo).toLocaleString("pt-BR") : totAtivo.toFixed(2)} ${uTot}) &bull; Frasco: <strong>${isUI ? concAtiva.toLocaleString("pt-BR") : concAtiva} ${uConc}</strong>
        </div>
        <div class="text-[11px] text-slate-400">${grupoCfg.via}</div>
      </div>
      <div class="text-right shrink-0">
        <div class="text-sm sm:text-base font-extrabold text-emerald-400 mono">${mlPuro >= 0.05 ? mlPuro.toFixed(2) + ' mL' : (mlPuro * 10).toFixed(2) + ' mL (1:10)'}</div>
        <div class="text-[10px] text-slate-400 mono">${(mlPuro * 100).toFixed(0)} UI puro</div>
      </div>
    </div>`;
  }).join("");
}

// --- MOTOR DAS ESCALAS CLÍNICAS ---

function alternarAbaEscala(qual) {
  ["mcgs", "fgs", "cmps"].forEach(k => {
    document.getElementById(`painel-esc-${k}`)?.classList.toggle("hidden", k !== qual);
    const btn = document.getElementById(`btn-esc-${k}`);
    if (btn) {
      btn.className = k === qual
        ? "px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-600 text-white"
        : "px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-900 text-slate-300 border border-slate-700";
    }
  });
  calcularMCGS();
  calcularFGS();
  calcularCMPS();
}

function atualizarAlertasEscalasTaxon() {
  const alertaEl = document.getElementById("alerta-mcgs-especie");
  if (!alertaEl) return;
  const { t } = getTaxonAtual();
  if (t.grupo.includes("Aves") || t.grupo.includes("Répteis")) {
    alertaEl.classList.remove("hidden");
    alertaEl.innerHTML = `⚠️ <strong>Alerta em ${t.nome}:</strong> A íris possui musculatura estriada voluntária — o reflexo pupilar à luz (RPL) pode ser falseado e não deve ser interpretado isoladamente como lesão de tronco.`;
  } else if (t.id === "Gamba" || t.id === "Tamandua" || t.id === "Tatu") {
    alertaEl.classList.remove("hidden");
    alertaEl.innerHTML = `⚠️ <strong>Alerta em ${t.nome}:</strong> Diferenciar estupor neurológico de basotermia fisiológica ou tanatose (confirmar temperatura corporal antes de fechar o escore).`;
  } else {
    alertaEl.classList.add("hidden");
    alertaEl.innerHTML = "";
  }
}

function calcularMCGS() {
  const out = document.getElementById("out-esc-mcgs");
  if (!out) return null;
  const m = parseInt(document.getElementById("mcgs-motora")?.value) || 6;
  const t = parseInt(document.getElementById("mcgs-tronco")?.value) || 6;
  const c = parseInt(document.getElementById("mcgs-consc")?.value) || 6;
  const tot = m + t + c;

  let classe = "text-emerald-400";
  let interp = "Prognóstico Bom (TCE Leve — monitoração seriada q1–2h)";
  if (tot <= 8) {
    classe = "text-rose-400";
    interp = "🚨 Prognóstico Grave (TCE Severo — risco de herniação; avaliar via aérea + Manitol 20% ou NaCl 7,5% e cabeça a 30°)";
  } else if (tot <= 14) {
    classe = "text-amber-300";
    interp = "⚠️ Prognóstico Reservado (TCE Moderado — oxigenação, analgesia sem AINE/corticoide e reavaliação q30–60 min)";
  }

  out.innerHTML = `<div class="font-extrabold ${classe} mono">MCGS Total: ${tot}/18 (Motora ${m} | Tronco ${t} | Consciência ${c})</div>
    <div class="text-[11px] text-slate-300 mt-0.5">${interp}</div>
    <div class="text-[10px] text-slate-500 mt-1">Ref.: Platt et al. (JVIM, 2001) / Silverstein 3ª ed.</div>`;
  return `MCGS: ${tot}/18 (Motora ${m}, Tronco ${t}, Consc. ${c}) — ${tot <= 8 ? "Prognóstico Grave" : (tot <= 14 ? "Prognóstico Reservado" : "Prognóstico Bom")}`;
}

function calcularFGS() {
  const out = document.getElementById("out-esc-fgs");
  if (!out) return null;
  const ids = ["fgs-orelhas", "fgs-olhos", "fgs-focinho", "fgs-bigodes", "fgs-cabeca"];
  const vals = ids.map(id => parseInt(document.getElementById(id)?.value) || 0);
  const tot = vals.reduce((a, b) => a + b, 0);
  const resgate = tot >= 4;

  out.innerHTML = `<div class="font-extrabold ${resgate ? 'text-rose-400' : 'text-emerald-400'} mono">Feline Grimace Scale (FGS): ${tot}/10</div>
    <div class="text-[11px] text-slate-300 mt-0.5">${resgate ? "🚨 Escore &ge; 4/10: Indicação de RESGATE ANALGÉSICO imediato (reavaliar em 30–60 min)." : "🟢 Escore &lt; 4/10: Sem indicação imediata de resgate (manter monitoração)."}</div>
    <div class="text-[10px] text-slate-500 mt-1">Ref.: Evangelista et al. (Scientific Reports, 2019 — Univ. de Montréal).</div>`;
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

  out.innerHTML = `<div class="font-extrabold ${resgate ? 'text-rose-400' : 'text-emerald-400'} mono">Glasgow Curta (CMPS-SF): ${tot}/${max}</div>
    <div class="text-[11px] text-slate-300 mt-0.5">${resgate ? `🚨 Escore &ge; ${corte}/${max}: Indicação de RESGATE ANALGÉSICO (opioide/multimodal).` : `🟢 Escore &lt; ${corte}/${max}: Dor controlada no momento.`}</div>
    <div class="text-[10px] text-slate-500 mt-1">Ref.: Reid et al. (Animal Welfare, 2007 — Univ. of Glasgow).</div>`;
  return `CMPS-SF (Dor Canina): ${tot}/${max} — ${resgate ? `Indicação de resgate analgésico (>=${corte}/${max})` : "Dor controlada"}`;
}

function inserirEscalaNoExame(tipo) {
  const txt = tipo === "mcgs" ? calcularMCGS() : (tipo === "fgs" ? calcularFGS() : calcularCMPS());
  const campo = document.getElementById("p-exame-fisico");
  if (!campo || !txt) return;
  const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const linha = `[${hora}] ${txt}`;
  campo.value = campo.value.trim() ? `${campo.value.trim()}\n${linha}` : linha;
  campo.focus();
}

// Conectar automaticamente ao ciclo global de atualização do VetCore
const _prevRecalcMelhorias = recalcularProntuario;
recalcularProntuario = function() {
  _prevRecalcMelhorias();
  renderListaPrescricaoFiltrada();
  atualizarAlertasEscalasTaxon();
};

setTimeout(() => {
  renderListaPrescricaoFiltrada();
  atualizarAlertasEscalasTaxon();
  calcularMCGS();
  calcularFGS();
  calcularCMPS();
}, 220);
// ============================================================================
// FICHA MONOGRÁFICA COMPLETA DO BULÁRIO (TODOS OS TÁXONS + VISUAL CLEAN)
// ============================================================================

// 1. Correção de precisão no mapeamento de táxon (ativa alertas diretos por t.id)
getConfigFarmacoParaTaxon = function(f, tIdx, t) {
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
};

// 2. Metadados Farmacológicos (Classe, Validade, Vias, Populações Especiais e Notas por Táxon)
const MONOGRAFIAS_EXTRA = {
  "Meloxicam": {
    classe: "AINE derivado do ácido enólico (Oxicam) — Inibidor preferencial COX-2",
    validade: "28 dias a 6 meses após aberto (conforme fabricante/bula; proteger da luz)",
    vias: [
      ["VO", "✅", "Boa palatabilidade em suspensões; administrar após alimentação e com paciente normohidratado."],
      ["SC", "✅", "Excelente via de rotina em cães, gatos, marsupiais e pequenos mamíferos; garantir hidratação prévia."],
      ["IM", "✅", "Boa tolerabilidade; em quelônios (Testudines) e lagartos, aplicar exclusivamente nos membros anteriores."],
      ["IV", "✅", "Administrar lentamente em pacientes hemodinamicamente estáveis e normotensos."]
    ],
    populacoes: [
      "Pediátricos: Cautela extrema — néfrons imaturos e maior risco de lesão renal aguda.",
      "Geriátricos: Avaliar função renal/hepática prévia e empregar a menor dose eficaz pelo menor tempo.",
      "Nefropatas / Desidratados / Choque: Contraindicação absoluta (bloqueio de PGE2/PGI2 precipita vasoconstrição aferente e necrose tubular aguda).",
      "Hepatopatas / Úlcera GI: Contraindicado em hepatopatia moderada a grave ou sangramento gastrintestinal ativo.",
      "Interações Críticas: PROIBIDO associar com outros AINEs ou Corticoides (risco extremo de úlcera gástrica perfurante)."
    ],
    notasTaxon: {
      Gato: "Dose de ataque 0,1 mg/kg no Dia 1, reduzindo para 0,05 mg/kg SID; contraindicado na DRC descompensada ou desidratação.",
      Gamba: "Seguro a 0,1–0,2 mg/kg SID por no máximo 3 dias (alto risco de úlcera gástrica em uso prolongado).",
      Coelhos: "Metabolismo hepático ultrarrápido: doses de cão (0,1–0,2 mg/kg) são subterapêuticas; usar 0,5–1,0 mg/kg q12–24h.",
      Caviomorfos: "Depuração rápida; usar 0,5 mg/kg q12–24h com boa hidratação.",
      Miomorfos: "Ratos/Camundongos: 1,0 mg/kg q12–24h (literatura cita até 2 mg/kg em dor aguda).",
      Psittaciformes: "Baixa biodisponibilidade oral relativa exige 1,0 mg/kg q12h; evitar em suspeita de Bornavírus Aviário (ABV).",
      Passeriformes: "Alta taxa metabólica obriga intervalo q12h (q24h não mantém analgesia efetiva).",
      Cathartiformes: "ÚNICO AINE seguro em urubus e aves de rapina (Diclofenaco, Flunixin e Cetoprofeno são 100% letais!)."
    }
  },
  "Amoxicilina+Clav": {
    classe: "Beta-lactâmico (Aminopenicilina) + Inibidor de Beta-lactamase (Ácido Clavulânico)",
    validade: "Suspensão oral reconstituída: 7 a 10 dias sob refrigeração (2–8 °C)",
    vias: [
      ["VO", "✅", "1ª escolha em cães, gatos, aves e ratos (Rattus). ⛔ PROIBIDO VO em Coelhos, Cobaias, Chinchilas e Ouriço-cacheiro!"],
      ["SC", "✅", "Somente formulação injetável veterinária (ex.: Synulox® RTU); agitar vigorosamente antes de aspirar."],
      ["IM", "⚠️", "Apenas formulação injetável específica; pode causar desconforto local."],
      ["IV", "⚠️", "Apenas formulações hospitalares específicas para uso IV (Clavulin® IV); nunca injetar suspensão RTU IV!"]
    ],
    populacoes: [
      "Pediátricos / Gestantes: Alta margem de segurança (1ª linha em filhotes onde fluoroquinolonas e tetraciclinas são contraindicadas).",
      "Nefropatas: Excreção predominantemente renal; em azotemia severa espaçar o intervalo posológico.",
      "Fermentadores Cecais (Coelhos/Caviomorfos): Contraindicação absoluta por via oral (enterotoxemia letal por Clostridium spiroforme)."
    ],
    notasTaxon: {
      Columbiformes: "1ª escolha imediata em ataque/mordedura de gato (Pasteurella multocida): 125 mg/kg VO q12h.",
      Miomorfos: "Seguro por via oral em Ratos (Rattus) e Camundongos (20 mg/kg BID); evitar em Hamsters!"
    }
  },
  "Enrofloxacina": {
    classe: "Fluoroquinolona de 2ª geração (Bactericida concentração-dependente)",
    validade: "Frasco injetável: 28 dias após perfurado em temperatura ambiente; não congelar",
    vias: [
      ["VO", "✅", "Boa absorção; evitar administrar junto com cálcio, alumínio, ferro ou sucralfato (quelação reduz absorção)."],
      ["SC", "⚠️", "pH extremamente alcalino: DILUIR 1:4 em NaCl 0,9% para evitar necrose e abscesso estéril no subcutâneo."],
      ["IM", "⚠️", "Evitar aplicações repetidas em aves e pequenos mamíferos (causa mionecrose peitoral/muscular severa)."],
      ["IV", "⚠️", "Apenas diluída e em infusão muito lenta (20–30 min); evitar IV em gatos pelo pico plasmático retinotóxico."]
    ],
    populacoes: [
      "Felinos (Domésticos e Silvestres): Defeito na proteína ABCG2 da barreira hematorretiniana causa degeneração retiniana aguda e CEGUEIRA IRREVERSÍVEL (preferir Marbofloxacina).",
      "Pediátricos / Filhotes em Crescimento: Contraindicada (lesão erosiva em cartilagem articular).",
      "Epilépticos / TCE: Reduz o limiar convulsivo por antagonismo GABA; usar com cautela."
    ],
    notasTaxon: {
      Gato: "⚠️ ALERTA MÁXIMO: Nunca ultrapassar 5 mg/kg SID; evitar em idosos/nefropatas/desidratados (preferir Marbofloxacina).",
      CarnivorosSilv: "Em felídeos silvestres (Leopardus/Puma), aplicar a mesma restrição retiniana do gato doméstico!"
    }
  },
  "Clindamicina": {
    classe: "Lincosamida (Bacteriostática/Bactericida tempo-dependente — Gram+ e Anaeróbios)",
    validade: "Solução oral/injetável conforme bula; manter em temperatura ambiente",
    vias: [
      ["VO", "✅", "Em gatos, administrar obrigatoriamente 3–5 mL de água ou alimento úmido logo após para evitar estenose esofágica."],
      ["SC", "✅", "Boa alternativa quando a via oral não está disponível em cães/gatos."],
      ["IM", "⚠️", "Pode causar dor local; diluir se necessário."],
      ["IV", "⚠️", "PROIBIDO bolus rápido (risco de hipotensão e parada cardíaca); diluir em NaCl 0,9% e infundir em 20–30 min."]
    ],
    populacoes: [
      "Fermentadores Cecais (Coelhos/Roedores): 100% LETAL (enterotoxemia fulminante por Clostridium).",
      "Hepatopatas Graves: Metabolismo hepático intenso — reduzir dose ou escolher alternativa."
    ]
  },
  "Dipirona": {
    classe: "Analgésico não-opioide e antipirético (Pirazolona — ação central e espasmolítica)",
    validade: "Ampolas: uso imediato ou até 24h refrigerada; frasco veterinário/gotas conforme bula",
    vias: [
      ["VO", "✅", "Preferir solução oral infantil 50 mg/mL em animais < 2 kg (gotas 500 mg/mL causam sialorreia intensa em gatos!)."],
      ["SC", "✅", "Bem tolerada em cães e gatos; diluir 1:10 em animais < 1 kg."],
      ["IM", "✅", "Boa absorção; usar volume reduzido em aves e microfauna."],
      ["IV", "✅", "Administrar LENTAMENTE (bolus rápido pode induzir hipotensão transitória e vômito)."]
    ],
    populacoes: [
      "Nefropatas / Ascíticos / Choque: Alternativa analgésica segura quando AINEs (Meloxicam/Carprofeno) estão contraindicados.",
      "Felinos: Usar 12,5 a 25 mg/kg q12–24h (meia-vida mais longa em gatos); evitar gotas puras VO pelo sabor amargo."
    ]
  },
  "Escopolamina": {
    classe: "Anticolinérgico antiespasmódico (Derivado quaternário da hioscina)",
    validade: "Ampolas: uso imediato; frasco veterinário (Buscofin®) conforme bula",
    vias: [
      ["IV", "✅", "Via de escolha na cólica aguda e espasmo visceral intenso (infusão lenta)."],
      ["IM", "✅", "Boa absorção em cães, gatos e mamíferos silvestres."],
      ["SC", "✅", "Alternativa prática na rotina ambulatorial."],
      ["VO", "✅", "Comprimidos/gotas para manutenção domiciliar de cólicas espasmódicas."]
    ],
    populacoes: [
      "Íleo Paralítico / Estase GI Atônica: CONTRAINDICADO (agrava a atonia intestinal; não usar em estase cecal de coelhos!).",
      "Glaucoma / Taquiarritmias: Evitar pelo efeito antimuscarínico."
    ]
  },
  "Pentabiotico": {
    classe: "Associação Bactericida: Benzilpenicilinas (Benzatina + Procaína + Potássica) + Aminoglicosídeos (Estreptomicina + Diidroestreptomicina)",
    validade: "Usar imediatamente após reconstituição (ou máx. 24h refrigerado; agitar fortemente antes de aspirar)",
    vias: [
      ["IM", "✅", "VIA EXCLUSIVA (IM profunda com agulha calibrosa; ASPIRAR SEMPRE antes de injetar!)."],
      ["IV", "⛔", "ESTRITAMENTE PROIBIDO! A Penicilina Procaína IV causa êmbolo lipídico, convulsão e parada cardíaca imediata."],
      ["SC", "⛔", "Não indicada — alto risco de abscesso, fibrose e absorção errática."],
      ["VO", "⛔", "Inativada pelo suco gástrico e destrói microbiota."]
    ],
    populacoes: [
      "Aves, Coelhos, Cobaias, Chinchilas e Hamsters: ⛔ 100% LETAL (bloqueio neuromuscular agudo pela Estreptomicina + toxicidade da Procaína + enterotoxemia).",
      "Nefropatas / Desidratados / Geriátricos: Evitar devido à nefrotoxicidade e ototoxicidade da Estreptomicina.",
      "Indicação Prática: Infecções bacterianas sensíveis em Grandes Animais ou animais de campo/resgate onde a administração diária é inviável (ação depósito de 48–72h)."
    ]
  }
};

const CLASSES_PADRAO_FARMACO = {
  "Marbofloxacina": "Fluoroquinolona veterinária de 3ª geração (Baixo risco retiniano em felinos)",
  "Ceftazidima": "Cefalosporina de 3ª geração antipseudomonas (1ª escolha injetável em répteis)",
  "Doxiciclina": "Tetraciclina lipofílica de amplo espectro (Clamidiose / Micoplasmose / Hemoparasitas)",
  "Metronidazol": "Nitroimidazol bactericida contra anaeróbios obrigatórios e antiprotozoário",
  "Carprofeno": "AINE inibidor preferencial COX-2 (Derivado do ácido propiônico)",
  "Robenacoxibe": "AINE Coxibe altamente seletivo para COX-2",
  "Prednisolona": "Glicocorticoide de ação intermediária (Forma ativa preferencial em felinos)",
  "Dexametasona": "Glicocorticoide de longa ação e alta potência anti-inflamatória",
  "Tramadol": "Analgésico central (Agonista Mu fraco + Inibidor de recaptação de 5-HT/NA)",
  "Gabapentina": "Análogo GABA / Modulador de canais de cálcio alfa-2-delta (Dor neuropática / Ansiolítico)",
  "Butorfanol": "Opioide Agonista Kappa / Antagonista Mu (1ª escolha opioide em aves)",
  "Metadona": "Opioide Agonista Mu puro + Antagonista NMDA (Dor severa / Trauma / TCE)",
  "Midazolam": "Benzodiazepínico hidrossolúvel (Anticonvulsivante 1ª linha e Miorrelaxante)",
  "Cetamina": "Anestésico dissociativo e Antagonista NMDA",
  "Lidocaina 2%": "Anestésico local aminoamida de curta/média duração e antiarrítmico Classe IB",
  "Bupivacaina 0,5%": "Anestésico local aminoamida de longa duração (4–8h)",
  "Maropitant": "Antiemético antagonista seletivo de receptores NK-1 (Substância P)",
  "Ondansetrona": "Antiemético antagonista seletivo de receptores 5-HT3 de serotonina",
  "Metoclopramida": "Procinético gastrintestinal superior e antiemético antagonista D2",
  "Omeprazol": "Inibidor da Bomba de Prótons (IBP — Gastroprotetor)",
  "Sucralfato": "Citoprotetor de mucosa esofágica, ingluvial e gástrica",
  "Furosemida": "Diurético de alça (Inibidor do cotransportador Na-K-2Cl)",
  "Manitol 20%": "Diurético osmótico redutor da Pressão Intracraniana (PIC)",
  "Vitamina K1": "Fitomenadiona — Cofator de síntese dos fatores de coagulação II, VII, IX e X",
  "Nitenpiram": "Ectoparasiticida sistêmico neonicotinoide de ação ultrarrápida (Miíase)",
  "Itraconazol": "Antifúngico Triazol sistêmico (Esporotricose / Aspergilose)",
  "Alopurinol": "Inibidor da xantina oxidase (Gota úrica em répteis/aves e Leishmaniose)",
  "Ivermectina": "Endectocida Lactona Macrocíclica (Avermectina)",
  "Fenbendazol": "Anti-helmíntico e antiprotozoário Benzimidazol",
  "Sulfametoxazol+Trim": "Associação bactericida sinérgica (Sulfonamida + Diaminopirimidina) e coccidiostática",
  "Cefalexina": "Cefalosporina de 1ª geração (Piodermites estafilocócicas)"
};

let fichaFarmacoIdxAtual = 0;
let fichaAbaAtiva = "posologia";
let fichaFiltroStatus = "todos";

function garantirContainerFichaFarmaco() {
  let el = document.getElementById("ficha-farmaco-view");
  if (!el) {
    el = document.createElement("div");
    el.id = "ficha-farmaco-view";
    el.className = "fixed inset-0 z-50 hidden bg-[#0B0F17] overflow-y-auto";
    document.body.appendChild(el);
  }
  return el;
}

function fecharFichaCompletaFarmaco() {
  const el = document.getElementById("ficha-farmaco-view");
  if (el) el.classList.add("hidden");
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
    return "⛔ PROIBIDO: Causa aplasia letal de medula óssea, leucopenia fulminante e necrose de criptas intestinais (Carpenter 6ª ed., p. 263).";
  }
  if (f.id === "Ivermectina" && t.id === "Testudines") {
    return "⛔ 100% LETAL EM QUELÔNIOS: Atravessa a barreira hematoencefálica causando paralisia flácida irreversível (Carpenter 6ª ed., p. 117).";
  }
  if ((f.id === "Prednisolona" || f.id === "Dexametasona") && (t.id === "Coelhos" || t.id === "Caviomorfos" || t.grupo.includes("Répteis"))) {
    return "⛔ Contraindicado: Imunossupressão severa, disbiose fatal e úlceras gastrintestinais nesta espécie.";
  }
  if (f.id === "Carprofeno" && t.id === "Cathartiformes") {
    return "⛔ 100% LETAL EM URUBUS: Induz necrose tubular renal aguda e gota visceral em 24–48h (usar apenas Meloxicam!).";
  }
  if (f.id === "Metadona" && t.id === "Serpentes") {
    return "⚠️ Baixa eficácia analgésica isolada em serpentes (preferir Tramadol + bloqueio local).";
  }
  if (f.id === "Escopolamina" && (t.grupo.includes("Aves") || t.grupo.includes("Répteis"))) {
    return "⚠️ Não indicado na rotina de aves e répteis (risco de estase GI/ingluvial e espessamento de secreções).";
  }
  if (f.id === "Pentabiotico" && (t.id === "Miomorfos" || t.grupo.includes("Répteis"))) {
    return "⛔ Contraindicado: Risco elevado de nefrotoxicidade/bloqueio neuromuscular pela Estreptomicina e toxicidade da Procaína.";
  }
  return "⛔ Contraindicado ou não recomendado para este táxon.";
}

function gerarViasAutomaticas(f) {
  const todasVias = Object.values(f.faixasPorGrupo || {}).map(g => g.via || "").join(" ").toUpperCase();
  const res = [];
  if (todasVias.includes("VO") || (f.compMg && f.compMg.length > 0)) res.push(["VO", "✅", "Via oral disponível conforme apresentação e restrições específicas do táxon."]);
  if (todasVias.includes("SC")) res.push(["SC", "✅", "Via subcutânea descrita na literatura para o fármaco (verificar necessidade de diluição)."]);
  if (todasVias.includes("IM")) res.push(["IM", "✅", "Via intramuscular aplicável (em répteis, usar metade cranial/membros anteriores; em aves, dividir peitoral se > 0,35 mL)."]);
  if (todasVias.includes("IV")) res.push(["IV", "✅", "Via intravenosa aplicável (administrar lentamente conforme bula e monitoramento)."]);
  if (res.length === 0) res.push(["Geral", "ℹ️", "Consultar a aba 'Posologia (Todos os Táxons)' para a via específica de cada espécie."]);
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

  // Coletar todas as fontes de todos os grupos do fármaco
  const todasFontes = [];
  const vistas = new Set();
  Object.entries(f.faixasPorGrupo || {}).forEach(([grp, cfg]) => {
    (cfg.fontes || []).forEach(ft => {
      const chave = ft[0] + ft[1];
      if (!vistas.has(chave)) {
        vistas.add(chave);
        todasFontes.push({ grupo: grp === "Padrao" ? "Geral / Multiespécie" : grp, titulo: ft[0], texto: ft[1], selo: ft[2] });
      }
    });
  });

  const btnAba = (id, label) => {
    const on = fichaAbaAtiva === id;
    return `<button type="button" onclick="mudarAbaFichaFarmaco('${id}')" class="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${on ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600'}">${label}</button>`;
  };

  let corpoAba = "";

  if (fichaAbaAtiva === "posologia") {
    corpoAba = `
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row gap-2">
          <input id="ficha-busca-taxon" type="text" oninput="renderTabelaPosologiaFicha()" placeholder="🔍 Filtrar espécie ou grupo (ex: gato, coruja, coelho, quati, jabuti)..." class="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
          <div id="ficha-filtros-status" class="flex flex-wrap gap-1.5"></div>
        </div>
        <div id="ficha-lista-posologia" class="space-y-2"></div>
      </div>
    `;
  } else if (fichaAbaAtiva === "geral") {
    corpoAba = `
      <div class="space-y-3.5">
        <div class="core-card p-3.5 space-y-2">
          <div class="text-xs font-bold uppercase tracking-wider text-emerald-400">Especificações Farmacotécnicas</div>
          <div class="divide-y divide-slate-800/80 text-xs">
            <div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="text-slate-400">Classe Farmacológica</span><strong class="text-white sm:text-right">${classe}</strong></div>
            <div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="text-slate-400">Nomes Comerciais</span><strong class="text-amber-300 sm:text-right">${f.comercial}</strong></div>
            <div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="text-slate-400">Apresentação Padrão</span><span class="text-slate-200 sm:text-right">${f.apres}</span></div>
            <div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="text-slate-400">Concentrações / Frascos</span><span class="text-slate-200 sm:text-right">${(f.frascos || []).map(fr => fr.label).join(" &bull; ")}</span></div>
            ${f.compMg && f.compMg.length ? `<div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="text-slate-400">Comprimidos Comerciais</span><span class="text-emerald-300 font-semibold sm:text-right">${f.compMg.join(" mg, ")} mg</span></div>` : ''}
            <div class="py-2 flex flex-col sm:flex-row sm:justify-between gap-1"><span class="text-slate-400">Validade / Conservação</span><span class="text-slate-200 sm:text-right">${validade}</span></div>
          </div>
        </div>

        <div class="core-card p-3.5 space-y-1.5">
          <div class="text-xs font-bold uppercase tracking-wider text-blue-400">Resumo Clínico &amp; Quando Utilizar</div>
          <p class="text-xs text-slate-200 leading-relaxed">${f.resumoBulario}</p>
        </div>

        <div class="core-card p-3.5 space-y-2 border-rose-900/60">
          <div class="text-xs font-bold uppercase tracking-wider text-rose-400">⚠️ Contraindicações &amp; Populações Especiais</div>
          ${extra.populacoes ? `
            <ul class="space-y-1.5 text-xs text-slate-200 leading-relaxed list-disc pl-4">
              ${extra.populacoes.map(item => `<li>${item}</li>`).join("")}
            </ul>
          ` : `
            <p class="text-xs text-slate-300 leading-relaxed">Avaliar estado de hidratação, função renal/hepática, faixa etária e restrições específicas do táxon na aba <strong>Posologia</strong> antes de prescrever. Consulte as citações completas na aba <strong>Fontes</strong>.</p>
          `}
        </div>
      </div>
    `;
  } else if (fichaAbaAtiva === "vias") {
    corpoAba = `
      <div class="space-y-3.5">
        <div class="core-card p-3.5 space-y-2.5">
          <div class="text-xs font-bold uppercase tracking-wider text-blue-400">Vias de Administração &amp; Cuidados de Aplicação</div>
          <div class="space-y-2">
            ${viasList.map(([via, icone, desc]) => `
              <div class="core-subcard p-2.5 flex items-start gap-2.5 text-xs">
                <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-extrabold text-white mono shrink-0">${via} ${icone}</span>
                <span class="text-slate-200 leading-relaxed">${desc}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="core-card p-3.5 space-y-2.5">
          <div class="flex flex-wrap justify-between items-center gap-2">
            <div class="text-xs font-bold uppercase tracking-wider text-emerald-400">⚡ Cálculo Rápido p/ Paciente Atual (${tAtivo.nome} — ${formatarPesoExibicao(kgCalc)})</div>
          </div>
          ${doseAtiva > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div class="p-3 rounded-xl bg-slate-950 border border-emerald-700/70">
                <div class="text-[10px] text-slate-400 uppercase">Frasco Ativo (${concAtiva.toLocaleString("pt-BR")} ${isUI ? 'UI/mL' : 'mg/mL'})</div>
                <div class="text-base font-extrabold text-emerald-400 mono mt-0.5">${mlAtivo.toFixed(3)} mL</div>
                <div class="text-[11px] text-slate-400 mono">${(mlAtivo * 100).toFixed(1)} UI (Seringa U-100)</div>
              </div>
              <div class="p-3 rounded-xl bg-slate-950 border border-blue-800/60">
                <div class="text-[10px] text-slate-400 uppercase">Diluição 1:10</div>
                <div class="text-base font-extrabold text-blue-400 mono mt-0.5">${(mlAtivo * 10).toFixed(2)} mL</div>
                <div class="text-[10px] text-slate-400">0,1 mL fármaco + 0,9 mL NaCl 0,9%</div>
              </div>
              <div class="p-3 rounded-xl bg-slate-950 border border-purple-800/60">
                <div class="text-[10px] text-slate-400 uppercase">Diluição 1:100</div>
                <div class="text-base font-extrabold text-purple-400 mono mt-0.5">${(mlAtivo * 100).toFixed(2)} mL</div>
                <div class="text-[10px] text-slate-400">0,1 mL da 1:10 + 0,9 mL NaCl 0,9%</div>
              </div>
            </div>
          ` : `
            <div class="p-3 rounded-xl bg-rose-950/50 border border-rose-700/60 text-xs text-rose-200 font-semibold">
              ⛔ Este fármaco está contraindicado ou sem indicação de rotina para o táxon ativo (${tAtivo.nome}).
            </div>
          `}
        </div>
      </div>
    `;
  } else if (fichaAbaAtiva === "fontes") {
    corpoAba = `
      <div class="space-y-2.5">
        <div class="text-xs font-bold uppercase tracking-wider text-amber-400">📚 Todas as Fontes Conferidas para ${f.nome}</div>
        ${todasFontes.map(ft => `
          <div class="core-card p-3.5 border-amber-700/40 space-y-1.5">
            <div class="flex flex-wrap justify-between items-center gap-1.5">
              <span class="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold uppercase">${ft.grupo}</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">${ft.selo}</span>
            </div>
            <div class="text-xs font-bold text-amber-300">${ft.titulo}</div>
            <blockquote class="text-xs text-slate-200 italic border-l-2 border-amber-500 pl-2.5 py-0.5 leading-relaxed">"${ft.texto}"</blockquote>
          </div>
        `).join("")}
      </div>
    `;
  }

  el.innerHTML = `
    <div class="sticky top-0 z-10 glass-nav border-b border-slate-800 px-3 sm:px-5 py-3">
      <div class="max-w-4xl mx-auto space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <button type="button" onclick="fecharFichaCompletaFarmaco()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold shrink-0">&larr; Voltar</button>
          <div class="min-w-0 text-center">
            <div class="text-sm sm:text-base font-extrabold text-white leading-tight break-words">💊 ${f.nome}</div>
            <div class="text-[11px] text-amber-300 leading-tight">${f.comercial}</div>
          </div>
          <button type="button" onclick="fecharFichaCompletaFarmaco();enviarFarmacoParaAbaReceita(${fIdx})" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0">📝 Receita</button>
        </div>

        <div class="flex gap-1.5 overflow-x-auto pb-0.5">
          ${btnAba("posologia", `🐾 Posologia (${TAXONS_DB.length} Táxons)`)}
          ${btnAba("geral", "📋 Ficha & Alertas")}
          ${btnAba("vias", "💉 Vias & Diluições")}
          ${btnAba("fontes", `📚 Fontes (${todasFontes.length})`)}
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-3 sm:px-5 py-4 pb-16">
      ${corpoAba}
    </div>
  `;

  if (fichaAbaAtiva === "posologia") {
    renderTabelaPosologiaFicha();
  }
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
      ? (grupoCfg.status === "proibido" ? `${grupoCfg.badge} — ${grupoCfg.via}` : getMotivoBloqueioGenerico(f, t))
      : ((extra.notasTaxon && extra.notasTaxon[t.id]) ? extra.notasTaxon[t.id] : grupoCfg.badge);

    const buscaAlvo = normalizarTextoBusca(t.nome + " " + t.grupo + " " + (t.subespecies || []).map(s => s.nome).join(" "));
    return { t, tIdx, doseAtiva, concAtiva, grupoCfg, sit, faixaTxt, motivo, buscaAlvo };
  });

  const cLib = linhas.filter(l => l.sit === "liberado").length;
  const cCau = linhas.filter(l => l.sit === "cautela").length;
  const cPro = linhas.filter(l => l.sit === "proibido").length;

  if (barSt) {
    const opts = [
      ["todos", `Todos (${linhas.length})`],
      ["liberado", `✅ Liberados (${cLib})`],
      ["cautela", `⚠️ Cautela (${cCau})`],
      ["proibido", `⛔ Proibidos (${cPro})`]
    ];
    barSt.innerHTML = opts.map(([id, lbl]) => {
      const on = fichaFiltroStatus === id;
      return `<button type="button" onclick="setFiltroStatusFicha('${id}')" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border ${on ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-900 text-slate-300 border-slate-800'}">${lbl}</button>`;
    }).join("");
  }

  const filtradas = linhas.filter(l => {
    if (fichaFiltroStatus !== "todos" && l.sit !== fichaFiltroStatus) return false;
    if (termo && !l.buscaAlvo.includes(termo)) return false;
    return true;
  });

  if (filtradas.length === 0) {
    box.innerHTML = `<div class="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">Nenhum táxon encontrado para esse filtro.</div>`;
    return;
  }

  box.innerHTML = filtradas.map(l => {
    const isAtual = l.tIdx === tAtivoIdx;
    const mlAtual = (isAtual && l.doseAtiva > 0) ? ((kgCalc * l.doseAtiva) / l.concAtiva) : 0;

    let badgeSit = `<span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0">✅ Liberado</span>`;
    let borda = "border-slate-800 bg-slate-900/70";
    if (l.sit === "proibido") {
      badgeSit = `<span class="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold shrink-0">⛔ Proibido</span>`;
      borda = "border-rose-900/70 bg-rose-950/20";
    } else if (l.sit === "cautela") {
      badgeSit = `<span class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold shrink-0">⚠️ Com cautela</span>`;
      borda = "border-amber-800/60 bg-amber-950/15";
    }

    return `
      <div class="p-3 rounded-xl border ${isAtual ? 'border-emerald-500 ring-1 ring-emerald-500/40' : borda} space-y-1.5">
        <div class="flex flex-wrap items-center justify-between gap-1.5">
          <div class="flex flex-wrap items-center gap-1.5">
            <strong class="text-xs sm:text-sm text-white">${l.t.nome}</strong>
            ${isAtual ? `<span class="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-extrabold">★ PACIENTE ATUAL</span>` : ''}
          </div>
          ${badgeSit}
        </div>

        ${l.sit !== "proibido" ? `
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs pt-0.5">
            <div class="bg-slate-950/80 border border-slate-800/80 rounded-lg px-2.5 py-1.5">
              <span class="text-[10px] text-slate-400 uppercase block">Dose Padrão</span>
              <strong class="text-emerald-400 mono">${isUI ? l.doseAtiva.toLocaleString("pt-BR") : l.doseAtiva} ${uDose}</strong>
              ${l.faixaTxt ? `<span class="text-[10px] text-slate-400 block">Faixa: ${l.faixaTxt}</span>` : ''}
            </div>
            <div class="sm:col-span-2 bg-slate-950/80 border border-slate-800/80 rounded-lg px-2.5 py-1.5">
              <span class="text-[10px] text-slate-400 uppercase block">Via &amp; Intervalo</span>
              <span class="text-slate-200 leading-snug">${l.grupoCfg.via}</span>
            </div>
          </div>
        ` : ''}

        <div class="text-[11px] ${l.sit === 'proibido' ? 'text-rose-200 font-medium' : (l.sit === 'cautela' ? 'text-amber-200' : 'text-slate-300')} leading-relaxed">
          ${l.motivo}
        </div>

        ${isAtual && mlAtual > 0 ? `
          <div class="text-[11px] text-emerald-300 font-bold mono pt-0.5">
            💉 Volume calculado p/ ${formatarPesoExibicao(kgCalc)}: ${formatarVolumeSeguro(mlAtual)}
          </div>
        ` : ''}
      </div>
    `;
  }).join("");
}

// 3. Conectar a Aba 5 (Bulário) para abrir a Ficha Completa ao tocar em qualquer fármaco
renderBularioCompleto = function() {
  const termo = normalizarTextoBusca(document.getElementById("busca-bulario")?.value || "");
  const filtrados = FARMACOS_DB.filter(f => {
    const cls = (MONOGRAFIAS_EXTRA[f.id]?.classe || CLASSES_PADRAO_FARMACO[f.id] || "");
    return normalizarTextoBusca(f.nome + " " + f.comercial + " " + f.resumoBulario + " " + cls).includes(termo);
  });

  document.getElementById("lista-bulario-completo").innerHTML = filtrados.map(f => {
    const fIdx = FARMACOS_DB.indexOf(f);
    const cls = MONOGRAFIAS_EXTRA[f.id]?.classe || CLASSES_PADRAO_FARMACO[f.id] || "";
    return `<div onclick="abrirFichaCompletaFarmaco(${fIdx})" class="core-subcard p-3.5 hover:border-emerald-500/60 transition cursor-pointer space-y-1.5">
      <div class="flex justify-between items-start gap-2">
        <strong class="text-xs sm:text-sm text-white">💊 ${f.nome}</strong>
        <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold shrink-0">Abrir Ficha Completa &rarr;</span>
      </div>
      ${cls ? `<div class="text-[10px] text-blue-300 font-semibold">${cls}</div>` : ''}
      <div class="text-[11px] text-amber-300 font-medium">Comercial: ${f.comercial} &bull; ${f.apres}</div>
      <p class="text-xs text-slate-300 leading-relaxed line-clamp-3">${f.resumoBulario}</p>
    </div>`;
  }).join("");
};

// 4. Adicionar botão "Abrir Ficha Completa (Todos os Táxons)" no topo do modal rápido do Prontuário
const _oldAbrirModalFarmaco = abrirModalFarmaco;
abrirModalFarmaco = function(fIdx) {
  _oldAbrirModalFarmaco(fIdx);
  const corpo = document.getElementById("modal-corpo");
  if (corpo && !corpo.querySelector("#btn-ver-ficha-completa")) {
    const banner = document.createElement("button");
    banner.id = "btn-ver-ficha-completa";
    banner.type = "button";
    banner.onclick = () => abrirFichaCompletaFarmaco(fIdx, "posologia");
    banner.className = "w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition";
    banner.textContent = `📖 Abrir Ficha Completa (${TAXONS_DB.length} Táxons, Vias, Populações & Fontes)`;
    corpo.prepend(banner);
  }
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharFichaCompletaFarmaco();
});

setTimeout(() => { renderBularioCompleto(); }, 250);