// LocalContext renderer
const $ = (s) => document.querySelector(s);
const state = { root: null, files: [], selected: new Set(), q: '', lastText: '' };

function fmtBytes(n) { if (n < 1024) return n + ' B'; if (n < 1048576) return (n / 1024).toFixed(1) + ' KB'; return (n / 1048576).toFixed(1) + ' MB'; }
function fmtNum(n) { return n.toLocaleString('ru-RU'); }
function budget() { return parseInt($('#budgetSel').value, 10); }

async function pick() {
  const root = await window.lc.pickDir();
  if (!root) return;
  state.root = root; $('#root').textContent = root; $('#root').title = root;
  $('#stats').textContent = 'Сканирование…';
  const res = await window.lc.scanDir(root);
  if (res.error) { $('#stats').textContent = 'Ошибка: ' + res.error; return; }
  state.files = res.files; state.selected = new Set();
  // по умолчанию выбираем все текстовые файлы
  for (const f of state.files) if (!f.binary) state.selected.add(f.rel);
  renderFiles(); updateEstimate();
  $('#build').disabled = state.selected.size === 0;
}

function renderFiles() {
  const root = $('#files'); root.innerHTML = '';
  const q = state.q.toLowerCase();
  for (const f of state.files) {
    if (q && !f.rel.toLowerCase().includes(q)) continue;
    const row = document.createElement('label');
    row.className = 'frow' + (f.binary ? ' bin' : '') + (f.secret ? ' secret' : '');
    if (f.secret) row.title = 'Файл помечен как секрет: содержимое скрыто из контекста';
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = state.selected.has(f.rel); cb.disabled = f.binary;
    cb.addEventListener('change', () => { if (cb.checked) state.selected.add(f.rel); else state.selected.delete(f.rel); updateEstimate(); $('#build').disabled = state.selected.size === 0; });
    const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = (f.secret ? '🔒 ' : '') + f.rel;
    const sz = document.createElement('span'); sz.className = 'sz'; sz.textContent = f.binary ? 'bin' : fmtBytes(f.size);
    row.append(cb, nm, sz); root.appendChild(row);
  }
}

function updateEstimate() {
  let bytes = 0;
  for (const f of state.files) if (state.selected.has(f.rel)) bytes += f.size;
  const estTokens = Math.ceil(bytes / 4); // грубая оценка до сборки
  const b = budget(); const pct = Math.min(100, (estTokens / b) * 100);
  const fill = $('#fill'); fill.style.width = pct + '%'; fill.classList.toggle('over', estTokens > b);
  $('#stats').innerHTML = `Выбрано <b>${state.selected.size}</b> файлов · ~<b>${fmtNum(estTokens)}</b> токенов (оценка) · ${fmtBytes(bytes)} · бюджет ${fmtNum(b)}`;
}

async function build() {
  $('#build').disabled = true; $('#stats').textContent = 'Сборка контекста…';
  const res = await window.lc.build({ root: state.root, rels: [...state.selected], format: $('#format').value });
  $('#build').disabled = false;
  if (res.error) { $('#stats').textContent = 'Ошибка: ' + res.error; return; }
  state.lastText = res.text;
  $('#preview').textContent = res.text.slice(0, 20000) + (res.text.length > 20000 ? '\n\n… (предпросмотр обрезан; полный текст копируется/сохраняется)' : '');
  const b = budget(); const pct = Math.min(100, (res.tokens / b) * 100);
  const fill = $('#fill'); fill.style.width = pct + '%'; fill.classList.toggle('over', res.tokens > b);
  const over = res.tokens > b ? ` · ⚠ превышен бюджет на ${fmtNum(res.tokens - b)}` : '';
  const sec = (res.secrets && res.secrets.length) ? ` · 🔒 секретов скрыто: <b>${res.secrets.length}</b>` : '';
  $('#stats').innerHTML = `Готово: <b>${res.included}</b> файлов · <b>${fmtNum(res.tokens)}</b> токенов · ${fmtNum(res.chars)} символов${over}${sec}`;
  $('#copy').disabled = false; $('#save').disabled = false;
}

$('#pick').addEventListener('click', pick);
$('#build').addEventListener('click', build);
$('#copy').addEventListener('click', async () => { await window.lc.copy(state.lastText); $('#copy').textContent = '✓ Скопировано'; setTimeout(() => $('#copy').textContent = '📋 Копировать', 1500); });
$('#save').addEventListener('click', async () => { const p = await window.lc.save(state.lastText); if (p) { $('#save').textContent = '✓ Сохранено'; setTimeout(() => $('#save').textContent = '💾 Сохранить', 1500); } });
$('#q').addEventListener('input', (e) => { state.q = e.target.value; renderFiles(); });
$('#all').addEventListener('click', () => { for (const f of state.files) if (!f.binary) state.selected.add(f.rel); renderFiles(); updateEstimate(); $('#build').disabled = state.selected.size === 0; });
$('#none').addEventListener('click', () => { state.selected.clear(); renderFiles(); updateEstimate(); $('#build').disabled = true; });
$('#budgetSel').addEventListener('change', updateEstimate);
