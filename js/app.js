/*
 * Calculadora de ração.
 *
 * Quantidade de cada ingrediente = total × (% do ingrediente ÷ soma das %).
 * Dividir pela soma mantém o total certo mesmo quando as porcentagens editadas
 * não fecham 100% (o site avisa nesse caso).
 */
const CHAVE = 'racao-formulas-v1';
const CHAVE_PREFS = 'racao-prefs-v1';
const $ = (id) => document.getElementById(id);

let modo = 0;          // 0 = a partir do total, 1 = a partir de um ingrediente
let editando = false;
let formulas = ler(CHAVE) || {};   // só as fases editadas: { fase: [%...] }

function ler(chave) {
  try { return JSON.parse(localStorage.getItem(chave)); } catch { return null; }
}
function gravar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* sem armazenamento: segue sem salvar */ }
}

const fmt = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
// Aceita "2,5" e "2.5".
const num = (s) => {
  const v = parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(v) && v > 0 ? v : 0;
};
const fase = () => $('fase').value;
const pcts = () => formulas[fase()] || FORMULAS_PADRAO[fase()];
const editada = (f = fase()) => Boolean(formulas[f]);
const iguais = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

/* ---------- listas ---------- */

function preencherFases() {
  const atual = fase();
  $('fase').innerHTML = Object.keys(FORMULAS_PADRAO)
    .map((f) => `<option value="${f}">${f}${editada(f) ? ' • editada' : ''}</option>`)
    .join('');
  if (atual) $('fase').value = atual;
}

function preencherIngredientes() {
  const atual = $('ing').value;
  const p = pcts();
  $('ing').innerHTML = INGREDIENTES
    .map((n, i) => (p[i] > 0 ? `<option value="${i}">${n}</option>` : ''))
    .join('');
  if ([...$('ing').options].some((o) => o.value === atual)) $('ing').value = atual;
}

/* ---------- desenho ---------- */

function desenhar() {
  const p = pcts();
  $('lista').innerHTML = INGREDIENTES.map((nome, i) => {
    if (!editando && !(p[i] > 0)) return '';
    const pct = editando
      ? `<span class="pct"><input type="text" inputmode="decimal" autocomplete="off" data-i="${i}"
           value="${p[i] ? fmt(p[i]) : ''}" placeholder="0" aria-label="Porcentagem de ${nome}">%</span>`
      : `<span class="pct">${fmt(p[i])}%</span>`;
    return `<div class="item" data-i="${i}">
        <div class="nome"><div class="linha"><span>${nome}</span>${pct}</div><div class="barra"><i></i></div></div>
        <b></b>
      </div>`;
  }).join('');

  $('edit').textContent = editando ? 'Concluir' : 'Editar %';
  $('edit').setAttribute('aria-pressed', editando);
  $('dica').hidden = !editando;
  marcarEditada();
  preencherIngredientes();
  atualizar();
}

function marcarEditada() {
  $('tag').hidden = !editada();
  $('reset').hidden = !editada();
}

function calcular() {
  const p = pcts();
  const soma = p.reduce((a, b) => a + b, 0);
  const q = num($('qtd').value);
  let total = 0;
  if (soma > 0) {
    if (modo === 0) total = q;
    else {
      const base = p[+$('ing').value];
      total = base > 0 ? (q * soma) / base : 0;
    }
  }
  const kg = p.map((v) => (soma > 0 ? (total * v) / soma : 0));
  return { p, soma, total, kg };
}

function atualizar() {
  const { p, soma, total, kg } = calcular();

  $('lista').querySelectorAll('.item').forEach((el) => {
    const i = +el.dataset.i;
    el.querySelector('b').textContent = `${fmt(kg[i])} kg`;
    el.querySelector('.barra i').style.width = `${soma > 0 ? (p[i] / soma) * 100 : 0}%`;
    el.classList.toggle('zero', !(p[i] > 0));
    el.classList.toggle('base', modo === 1 && String(i) === $('ing').value);
  });

  $('tot').textContent = `${fmt(total)} kg`;
  const fecha = Math.abs(soma - 100) < 0.005;
  $('soma').textContent = `Soma das porcentagens: ${fmt(soma)}%`;
  $('totRow').classList.toggle('ruim', !fecha);
  $('aviso').hidden = fecha;
  if (!fecha) {
    $('aviso').textContent = soma > 0
      ? `A soma dá ${fmt(soma)}% (${soma > 100 ? 'sobram' : 'faltam'} ${fmt(Math.abs(100 - soma))}%). `
        + 'As quantidades foram calculadas proporcionalmente, mas ajuste para fechar 100%.'
      : 'Informe a porcentagem de pelo menos um ingrediente.';
  }
  $('share').disabled = !(total > 0);
  $('atalhos').hidden = modo === 1;
}

function definirModo(m) {
  modo = m;
  $('m0').setAttribute('aria-pressed', m === 0);
  $('m1').setAttribute('aria-pressed', m === 1);
  $('wIng').hidden = m === 0;
  $('lq').textContent = m === 0 ? 'Total da mistura' : 'Quantidade desse ingrediente';
  salvarPrefs();
  atualizar();
}

function salvarPrefs() {
  gravar(CHAVE_PREFS, { fase: fase(), modo, ing: $('ing').value, qtd: $('qtd').value });
}

/* ---------- compartilhar ---------- */

function textoMistura() {
  const { p, soma, total, kg } = calcular();
  const linhas = INGREDIENTES
    .map((n, i) => (p[i] > 0 ? `• ${n}: ${fmt(kg[i])} kg (${fmt((p[i] / soma) * 100)}%)` : null))
    .filter(Boolean);
  return [
    `Ração – ${fase()}${editada() ? ' (fórmula editada)' : ''}`,
    ...linhas,
    `Total: ${fmt(total)} kg`,
  ].join('\n');
}

async function compartilhar() {
  const texto = textoMistura();
  if (navigator.share) {
    try { await navigator.share({ text: texto }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  try {
    await navigator.clipboard.writeText(texto);
    avisar('Mistura copiada. É só colar no WhatsApp.');
  } catch {
    avisar('Não foi possível copiar neste navegador.');
  }
}

let timerToast;
function avisar(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(timerToast);
  timerToast = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ---------- eventos ---------- */

$('lista').addEventListener('input', (e) => {
  const campo = e.target;
  if (!campo.dataset.i) return;
  const f = fase();
  const nova = pcts().slice();
  nova[+campo.dataset.i] = num(campo.value);
  if (iguais(nova, FORMULAS_PADRAO[f])) delete formulas[f];
  else formulas[f] = nova;
  gravar(CHAVE, formulas);
  marcarEditada();
  preencherFases();
  preencherIngredientes();
  atualizar();
});
// Ao sair do campo, mostra o número já formatado (ex.: "2.50" vira "2,5").
$('lista').addEventListener('change', (e) => {
  const campo = e.target;
  if (!campo.dataset.i) return;
  const v = pcts()[+campo.dataset.i];
  campo.value = v ? fmt(v) : '';
});

$('edit').addEventListener('click', () => { editando = !editando; desenhar(); });
$('reset').addEventListener('click', () => {
  if (!confirm(`Voltar às porcentagens originais de "${fase()}"?`)) return;
  delete formulas[fase()];
  gravar(CHAVE, formulas);
  preencherFases();
  desenhar();
  avisar('Fórmula original restaurada.');
});
$('fase').addEventListener('change', () => { desenhar(); salvarPrefs(); });
$('ing').addEventListener('change', () => { atualizar(); salvarPrefs(); });
$('qtd').addEventListener('input', () => { atualizar(); salvarPrefs(); });
$('m0').addEventListener('click', () => definirModo(0));
$('m1').addEventListener('click', () => definirModo(1));
$('atalhos').addEventListener('click', (e) => {
  const kg = e.target.dataset && e.target.dataset.kg;
  if (!kg) return;
  $('qtd').value = kg;
  atualizar();
  salvarPrefs();
});
$('share').addEventListener('click', compartilhar);

/* ---------- início ---------- */

preencherFases();
const prefs = ler(CHAVE_PREFS);
if (prefs) {
  if (prefs.fase in FORMULAS_PADRAO) $('fase').value = prefs.fase;
  if (prefs.qtd != null) $('qtd').value = prefs.qtd;
}
desenhar();
if (prefs) {
  if ([...$('ing').options].some((o) => o.value === prefs.ing)) $('ing').value = prefs.ing;
  if (prefs.modo === 1) definirModo(1);
}

/* ---------- tema claro / escuro ---------- */

const CHAVE_TEMA = 'racao-tema';
const temaEscuroSistema = matchMedia('(prefers-color-scheme: dark)');
const temaAtual = () => document.documentElement.dataset.theme || (temaEscuroSistema.matches ? 'dark' : 'light');

function mostrarTema() {
  const escuro = temaAtual() === 'dark';
  document.documentElement.classList.toggle('escuro', escuro);
  const txt = escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro';
  $('tema').setAttribute('aria-label', txt);
  $('tema').title = txt;
  // Cor da barra do navegador no celular acompanha o tema.
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.content = escuro ? '#1b2218' : '#2f6b3a';
  });
}
$('tema').addEventListener('click', () => {
  const novo = temaAtual() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = novo;
  try { localStorage.setItem(CHAVE_TEMA, novo); } catch { /* sem armazenamento */ }
  mostrarTema();
});
temaEscuroSistema.addEventListener('change', mostrarTema);
mostrarTema();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
