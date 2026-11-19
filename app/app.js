// Leonida Trophy Atlas v2 — checklist, tracker, roadmap, planner and missable guide.
// All trophy data comes from data/trophies.json and data/roadmap.json (fetched locally,
// never from the network). Progress lives in localStorage and in the file you export.
const STORE_KEY = 'gta6-trophy-atlas-v2';
const $ = (id) => document.getElementById(id);
const trophyDoc = await (await fetch('data/trophies.json')).json();
const roadDoc = await (await fetch('data/roadmap.json')).json();
const trophies = trophyDoc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const KIND_LABELS = {
  story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities',
  side: 'Side', robberies: 'Robberies', money: 'Money', platinum: 'Platinum', online: 'Online',
};
const CHAPTERS = ['Ch 1', 'Ch 2', 'Ch 3', 'Ch 4', 'Ch 5', 'Anytime', 'Post-story'];

let earned = new Set();
try {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
  if (Array.isArray(saved)) for (const id of saved) if (byId.has(id)) earned.add(id);
} catch { earned = new Set(); }

const params = new URLSearchParams(location.search);
const state = {
  view: ['checklist', 'roadmap', 'planner', 'missable'].includes(params.get('view')) ? params.get('view') : 'checklist',
  kind: params.get('filter') || params.get('kind') || 'all',
  grade: params.get('grade') || 'all',
  difficulty: params.get('difficulty') || 'all',
  chapter: params.get('chapter') || 'all',
  sort: params.get('sort') || 'id',
  search: params.get('q') || '',
  earnedOnly: params.get('earned') === '1',
  spoiler: params.get('spoiler') === 'on' || params.get('spoiler') === '1',
  selected: Number(params.get('trophy')) || null,
};

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function hoursLeft() {
  return trophies.reduce((sum, t) => sum + (earned.has(t.id) ? 0 : t.hours), 0);
}

function fmtHours(h) {
  if (h === 0) return '—';
  return (Number.isInteger(h) ? h : h.toFixed(1)) + ' h';
}

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function isHidden(t) {
  return state.spoiler && t.story && !earned.has(t.id);
}

function visibleName(t) {
  return isHidden(t) ? 'Hidden story trophy' : t.name;
}

function visibleDesc(t) {
  return isHidden(t) ? 'Spoilers hidden — tick this trophy earned to reveal it.' : t.description;
}

function gradeChip(t) {
  return '<span class="chip ' + t.grade + '">' + t.grade + '</span>';
}

function syncUrl() {
  const p = new URLSearchParams();
  if (state.view !== 'checklist') p.set('view', state.view);
  if (state.kind !== 'all') p.set('filter', state.kind);
  if (state.grade !== 'all') p.set('grade', state.grade);
  if (state.difficulty !== 'all') p.set('difficulty', state.difficulty);
  if (state.chapter !== 'all') p.set('chapter', state.chapter);
  if (state.sort !== 'id') p.set('sort', state.sort);
  if (state.search) p.set('q', state.search);
  if (state.earnedOnly) p.set('earned', '1');
  if (state.spoiler) p.set('spoiler', 'on');
  if (state.selected) p.set('trophy', String(state.selected));
  const qs = p.toString();
  history.replaceState(null, '', qs ? '?' + qs : location.pathname);
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  $('progressText').textContent = done + ' of ' + total + ' earned · ' + pct + '%';
  $('hoursLeft').textContent = '· ~' + hoursLeft().toFixed(1).replace(/\.0$/, '') + ' h left';
  $('progressFill').style.width = pct + '%';
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || [0, 0];
    byGrade[t.grade][1]++;
    if (earned.has(t.id)) byGrade[t.grade][0]++;
  }
  $('gradeCounts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => g + ' ' + byGrade[g][0] + '/' + byGrade[g][1]).join(' · ');
  const byKind = {};
  for (const t of trophies) {
    for (const k of t.kinds) {
      byKind[k] = byKind[k] || [0, 0];
      byKind[k][1]++;
      if (earned.has(t.id)) byKind[k][0]++;
    }
  }
  $('kindCounts').textContent = ['story', 'side', 'robberies', 'collectibles', 'activities', 'money', 'missable']
    .map((k) => KIND_LABELS[k] + ' ' + byKind[k][0] + '/' + byKind[k][1]).join(' · ');
}

function filteredTrophies() {
  const q = state.search.trim().toLowerCase();
  let list = trophies.filter((t) => {
    if (state.kind === 'online') return false;
    if (state.kind !== 'all' && !t.kinds.includes(state.kind)) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.difficulty !== 'all' && t.difficulty !== Number(state.difficulty)) return false;
    if (state.chapter !== 'all' && t.chapter !== state.chapter) return false;
    if (state.earnedOnly && !earned.has(t.id)) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.chapter).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (state.sort === 'difficulty') list = [...list].sort((a, b) => b.difficulty - a.difficulty || b.hours - a.hours);
  else if (state.sort === 'hours') list = [...list].sort((a, b) => b.hours - a.hours);
  else if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  else list = [...list].sort((a, b) => a.id - b.id);
  return list;
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveEarned();
  renderAll();
}

function selectTrophy(id) {
  state.selected = id;
  renderChecklist();
  renderDetail();
  syncUrl();
}

function renderChecklist() {
  const list = filteredTrophies();
  const rows = $('rows');
  rows.replaceChildren();
  for (const t of list) {
    const tr = document.createElement('tr');
    if (earned.has(t.id)) tr.classList.add('earned');
    if (state.selected === t.id) tr.classList.add('selected');
    tr.dataset.id = String(t.id);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('change', (e) => { e.stopPropagation(); toggleEarned(t.id); });
    const c0 = document.createElement('td');
    c0.className = 'c-earn';
    c0.append(box);
    const c1 = document.createElement('td');
    const nm = document.createElement('div');
    nm.className = 'tname';
    nm.textContent = visibleName(t);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag';
      flag.textContent = '  ⚠ MISSABLE';
      nm.append(flag);
    }
    if (t.status === 'lead') {
      const lead = document.createElement('span');
      lead.className = 'lead';
      lead.textContent = '  · best lead';
      nm.append(lead);
    }
    const ds = document.createElement('div');
    ds.className = 'tdesc';
    ds.textContent = visibleDesc(t);
    c1.append(nm, ds);
    const c2 = document.createElement('td');
    c2.innerHTML = gradeChip(t);
    const c3 = document.createElement('td');
    c3.className = 'kind';
    c3.textContent = t.kinds.map((k) => KIND_LABELS[k] || k).join(' · ');
    const c4 = document.createElement('td');
    c4.className = 'stars';
    c4.textContent = stars(t.difficulty);
    c4.title = 'Difficulty ' + t.difficulty + ' of 5';
    const c5 = document.createElement('td');
    c5.className = 'hours';
    c5.textContent = fmtHours(t.hours);
    const c6 = document.createElement('td');
    c6.className = 'chapter';
    c6.textContent = t.chapter;
    tr.append(c0, c1, c2, c3, c4, c5, c6);
    tr.addEventListener('click', (e) => { if (e.target !== box) selectTrophy(t.id); });
    rows.append(tr);
  }
  $('countLine').textContent = list.length + ' of 55 trophies shown' +
    (earned.size ? ' · ' + earned.size + ' earned' : '') +
    (state.kind === 'online' ? '' : '');
  $('onlineNote').textContent = state.kind === 'online'
    ? 'Online trophies: 0. Every one of the 55 trophies is single-player and offline — there is nothing to earn online, and no online mode is needed for the platinum.'
    : '';
}

function renderDetail() {
  const box = $('detail');
  const t = state.selected ? byId.get(state.selected) : null;
  if (!t) {
    box.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = 'Pick a trophy';
    const p = document.createElement('p');
    p.textContent = 'Click any row in the checklist to open its full guide here: numbered steps, difficulty, time, chapter, prerequisites, missable warnings and cited sources.';
    const p2 = document.createElement('p');
    p2.textContent = 'Start with Positive Mental Attitude — it holds the game\u2019s only potentially missable step, in Chapter 1.';
    box.append(h, p, p2);
    return;
  }
  box.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = visibleName(t);
  const d = document.createElement('p');
  d.className = 'odesc';
  d.textContent = 'Official: “' + visibleDesc(t) + '”';
  box.append(h, d);
  const meta = document.createElement('div');
  meta.className = 'meta';
  const metaRows = [
    ['Grade', t.grade],
    ['Difficulty', stars(t.difficulty) + ' (' + t.difficulty + '/5)'],
    ['Time', fmtHours(t.hours)],
    ['Chapter', t.chapter],
    ['Kind', t.kinds.map((k) => KIND_LABELS[k] || k).join(' · ')],
    ['Prerequisite', t.prereq],
    ['Status', t.status === 'lead' ? 'Best current lead — method unconfirmed' : t.status === 'partial' ? 'Partly confirmed — see step 1' : 'Confirmed'],
  ];
  for (const [k, v] of metaRows) {
    const cell = document.createElement('div');
    const b = document.createElement('b');
    b.textContent = k + ': ';
    cell.append(b, document.createTextNode(v));
    meta.append(cell);
  }
  box.append(meta);
  if (t.missable && t.missableNote) {
    const w = document.createElement('p');
    w.className = 'warn';
    w.textContent = '⚠ MISSABLE — ' + t.missableNote;
    box.append(w);
  }
  if (isHidden(t)) {
    const w = document.createElement('p');
    w.className = 'warn';
    w.textContent = 'Spoilers are hidden for this story trophy. Tick it earned (below) or turn spoilers off to read its guide.';
    box.append(w);
  } else {
    const gh = document.createElement('h3');
    gh.textContent = 'How to earn it';
    const ol = document.createElement('ol');
    for (const step of t.guide.split('\n')) {
      const li = document.createElement('li');
      li.textContent = step.replace(/^\d+\.\s*/, '');
      ol.append(li);
    }
    box.append(gh, ol);
    const sh = document.createElement('h3');
    sh.textContent = 'Sources — where each fact comes from';
    const srcs = document.createElement('p');
    srcs.className = 'srcs';
    t.sources.forEach((s, i) => {
      if (i > 0) srcs.append(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      srcs.append(a);
    });
    box.append(sh, srcs);
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'markbtn' + (earned.has(t.id) ? ' earned' : '');
  btn.textContent = earned.has(t.id) ? '✓ Earned — click to unmark' : 'Mark as earned';
  btn.addEventListener('click', () => toggleEarned(t.id));
  box.append(btn);
}

function chipFor(t) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tchip' + (earned.has(t.id) ? ' done' : '');
  const label = document.createElement('span');
  label.textContent = (earned.has(t.id) ? '✓ ' : '') + visibleName(t) + ' ';
  const g = document.createElement('span');
  g.className = 'g';
  g.textContent = t.grade;
  b.append(label, g);
  b.addEventListener('click', () => {
    state.view = 'checklist';
    state.kind = 'all';
    state.grade = 'all';
    state.difficulty = 'all';
    state.chapter = 'all';
    state.earnedOnly = false;
    state.search = '';
    syncControls();
    selectTrophy(t.id);
    showView('checklist');
    document.getElementById('view-checklist').scrollIntoView();
  });
  return b;
}

function renderRoadmap() {
  $('roadmapTitle').textContent = roadDoc.title;
  $('roadmapIntro').textContent = 'Difficulty ' + roadDoc.difficulty + ' · about ' + roadDoc.totalHours +
    ' hours · ' + roadDoc.playthroughs + ' playthrough · ' + roadDoc.online + ' online trophies. ' + roadDoc.saveNote;
  const list = $('roadmapList');
  list.replaceChildren();
  for (const s of roadDoc.stages) {
    const card = document.createElement('article');
    card.className = 'stage';
    const h = document.createElement('h3');
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = String(s.n);
    h.append(n, document.createTextNode(s.title + '  '));
    const hrs = document.createElement('span');
    hrs.className = 'stagehours';
    hrs.textContent = s.hours;
    h.append(hrs);
    const p = document.createElement('p');
    p.textContent = s.blurb;
    const tip = document.createElement('p');
    tip.className = 'tip';
    tip.textContent = 'Tip: ' + s.tip;
    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const id of s.trophies) {
      const t = byId.get(id);
      if (t) chips.append(chipFor(t));
    }
    card.append(h, p, tip, chips);
    list.append(card);
  }
}

function renderPlanner() {
  const body = $('plannerBody');
  body.replaceChildren();
  const left = document.createElement('div');
  left.className = 'plan';
  const totalCard = document.createElement('div');
  totalCard.className = 'plancard';
  const th = document.createElement('h3');
  th.textContent = 'Hours left on your run';
  const big = document.createElement('div');
  big.className = 'big';
  big.textContent = '~' + hoursLeft().toFixed(1).replace(/\.0$/, '') + ' h';
  const tp = document.createElement('p');
  tp.textContent = earned.size + ' of 55 earned. The full platinum is rated about 200 hours; your remaining total falls as you tick trophies off. Story chapters carry their play time; A Long Road carries only the extra checklist grind on top of the other trophies, so the total does not double-count.';
  totalCard.append(th, big, tp);
  const catCard = document.createElement('div');
  catCard.className = 'plancard';
  const ch = document.createElement('h3');
  ch.textContent = 'Hours left by category';
  catCard.append(ch);
  const order = ['story', 'activities', 'collectibles', 'robberies', 'side', 'money'];
  for (const k of order) {
    const rem = trophies.filter((t) => !earned.has(t.id) && t.kinds[0] === k);
    const h = rem.reduce((s, t) => s + t.hours, 0);
    const row = document.createElement('div');
    row.className = 'planrow';
    const l = document.createElement('span');
    l.className = 'left';
    l.textContent = KIND_LABELS[k] + ' (' + rem.length + ' left)';
    const r = document.createElement('span');
    r.textContent = '~' + h.toFixed(1).replace(/\.0$/, '') + ' h';
    row.append(l, r);
    catCard.append(row);
  }
  left.append(totalCard, catCard);
  body.append(left);
  const remList = trophies.filter((t) => !earned.has(t.id)).sort((a, b) => b.hours - a.hours).slice(0, 10);
  const rh = document.createElement('h3');
  rh.textContent = 'Biggest remaining time sinks';
  body.append(rh);
  const tbl = document.createElement('table');
  tbl.className = 'plain';
  const tb = document.createElement('tbody');
  for (const t of remList) {
    const tr = document.createElement('tr');
    const c1 = document.createElement('td');
    c1.textContent = visibleName(t) + ' — ' + t.chapter;
    const c2 = document.createElement('td');
    c2.textContent = fmtHours(t.hours) + ' · ' + stars(t.difficulty);
    tr.append(c1, c2);
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => {
      state.view = 'checklist';
      selectTrophy(t.id);
      showView('checklist');
    });
    tb.append(tr);
  }
  tbl.append(tb);
  body.append(tbl);
  const c100 = $('checklist100');
  c100.replaceChildren();
  for (const group of roadDoc.checklist100) {
    const gh = document.createElement('h3');
    gh.textContent = group.group;
    const t2 = document.createElement('table');
    t2.className = 'plain';
    const tb2 = document.createElement('tbody');
    for (const row of group.rows) {
      const tr = document.createElement('tr');
      const c1 = document.createElement('td');
      c1.textContent = row.item;
      const c2 = document.createElement('td');
      c2.textContent = row.need;
      tr.append(c1, c2);
      tb2.append(tr);
    }
    t2.append(tb2);
    c100.append(gh, t2);
  }
}

function renderMissable() {
  const body = $('missableBody');
  body.replaceChildren();
  const miss = trophies.find((t) => t.missable);
  const card = document.createElement('div');
  card.className = 'misscard';
  const h = document.createElement('h3');
  h.textContent = '⚠ The one potentially missable trophy: ' + miss.name;
  const p = document.createElement('p');
  p.textContent = miss.missableNote;
  const p2 = document.createElement('p');
  p2.textContent = 'What to do: in Chapter 1, after the mission Down to Earth, talk to Lucia in the kitchen in the morning, follow her to the balcony and accept the meditation. Two minutes — and it may save a whole playthrough.';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tchip';
  btn.textContent = 'Open its full guide →';
  btn.addEventListener('click', () => {
    state.view = 'checklist';
    selectTrophy(miss.id);
    showView('checklist');
  });
  card.append(h, p, p2, btn);
  const cheat = document.createElement('div');
  cheat.className = 'misscard';
  const ch2 = document.createElement('h3');
  ch2.textContent = '⚠ Cheats disable trophies';
  const cp = document.createElement('p');
  cp.textContent = 'Cheats disable trophies and saving while active. There are 61 cheats, and none of them work before the credits. Keep cheats off for the whole run — one activation can cost you trophies with no way to undo it on that save.';
  cheat.append(ch2, cp);
  const ok = document.createElement('div');
  ok.className = 'okcard';
  const oh = document.createElement('h3');
  oh.textContent = '✓ Safe: everything else can wait until after the story';
  const op = document.createElement('p');
  op.textContent = 'All 12 story trophies unlock automatically. All character questlines stay available in free-roam after the story. Optional missions may disappear, but there are far more than the 100 the checklist needs. There is free-roam after the story, but no mission replay — keep manual saves at the start and end of every chapter.';
  ok.append(oh, op);
  body.append(card, cheat, ok);
  const demo = $('spoilerDemo');
  demo.replaceChildren();
  const chips = document.createElement('div');
  chips.className = 'chips';
  for (const t of trophies.filter((t) => t.story)) chips.append(chipFor(t));
  demo.append(chips);
  const note = document.createElement('p');
  note.className = 'viewintro';
  note.textContent = state.spoiler
    ? 'Spoilers are ON: the story trophies above show as hidden until earned.'
    : 'Spoilers are OFF: turn “Hide story spoilers” on (Checklist tab) and these names hide until earned.';
  demo.append(note);
}

function showView(v) {
  state.view = v;
  for (const btn of document.querySelectorAll('.views button')) {
    btn.classList.toggle('active', btn.dataset.view === v);
  }
  for (const name of ['checklist', 'roadmap', 'planner', 'missable']) {
    $('view-' + name).hidden = name !== v;
  }
  if (v === 'roadmap') renderRoadmap();
  if (v === 'planner') renderPlanner();
  if (v === 'missable') renderMissable();
  syncUrl();
}

function syncControls() {
  $('search').value = state.search;
  $('kind').value = state.kind;
  $('grade').value = state.grade;
  $('difficulty').value = state.difficulty;
  $('chapter').value = state.chapter;
  $('sort').value = state.sort;
  $('earnedOnly').checked = state.earnedOnly;
  $('spoiler').checked = state.spoiler;
}

function renderAll() {
  renderProgress();
  renderChecklist();
  renderDetail();
  if (state.view === 'roadmap') renderRoadmap();
  if (state.view === 'planner') renderPlanner();
  if (state.view === 'missable') renderMissable();
}

function exportProgress() {
  const payload = {
    app: 'leonida-trophy-atlas-v2',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function showStatus(msg) {
  $('importStatus').textContent = msg;
}

async function importProgress(file) {
  if (!file) return;
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    showStatus('That file is not valid JSON.');
    return;
  }
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) {
    showStatus('That file does not hold an earned-trophy list.');
    return;
  }
  const next = new Set();
  for (const id of ids) if (byId.has(Number(id))) next.add(Number(id));
  earned = next;
  saveEarned();
  renderAll();
  showStatus('Imported ' + earned.size + ' earned trophies.');
}

document.querySelectorAll('.views button').forEach((b) =>
  b.addEventListener('click', () => showView(b.dataset.view)));
$('search').addEventListener('input', (e) => { state.search = e.target.value; renderChecklist(); syncUrl(); });
$('kind').addEventListener('change', (e) => { state.kind = e.target.value; renderChecklist(); syncUrl(); });
$('grade').addEventListener('change', (e) => { state.grade = e.target.value; renderChecklist(); syncUrl(); });
$('difficulty').addEventListener('change', (e) => { state.difficulty = e.target.value; renderChecklist(); syncUrl(); });
$('chapter').addEventListener('change', (e) => { state.chapter = e.target.value; renderChecklist(); syncUrl(); });
$('sort').addEventListener('change', (e) => { state.sort = e.target.value; renderChecklist(); syncUrl(); });
$('earnedOnly').addEventListener('change', (e) => { state.earnedOnly = e.target.checked; renderChecklist(); syncUrl(); });
$('spoiler').addEventListener('change', (e) => {
  state.spoiler = e.target.checked;
  renderChecklist();
  renderDetail();
  if (state.view === 'missable') renderMissable();
  syncUrl();
});
$('exportBtn').addEventListener('click', exportProgress);
$('importFile').addEventListener('change', (e) => importProgress(e.target.files[0]));
$('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned ticks? This cannot be undone (unless you exported a backup).')) {
    earned = new Set();
    saveEarned();
    renderAll();
  }
});

syncControls();
showView(state.view);
renderAll();
if (state.selected && byId.has(state.selected)) selectTrophy(state.selected);
