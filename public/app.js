const exampleJob = `Senior Product Manager, AI Platform

We are looking for a product leader to own the strategy and roadmap for our AI developer platform. You will partner with engineering, design, data science, and go-to-market teams to identify customer problems and ship measurable improvements.

What you'll do
• Define product strategy, roadmap, and success metrics
• Translate customer research into clear requirements
• Lead cross-functional execution from discovery through launch
• Analyze product data and run experiments to improve adoption
• Communicate tradeoffs to technical and executive audiences

What we're looking for
• 5+ years of product management experience
• Experience with APIs, developer tools, or machine learning products
• Strong analytical skills, SQL, experimentation, and stakeholder management
• Track record of shipping products that drive user growth`;

const samples = [];

const storageKeys = {
  profile: 'tailorProfile',
  resumes: 'tailorResumes',
  history: 'tailorHistory',
};

function storedJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

let state = {
  profile: storedJson(storageKeys.profile, null),
  resumes: storedJson(storageKeys.resumes, samples).filter(resume => resume.type === 'tex'),
  history: storedJson(storageKeys.history, []),
  selected: null, zoom: .82, file: null, result: null
};
state.selected = state.resumes[0]?.id || null;

const texPdfCache = new Map();
let pdfjsPromise;
let latexSupportPromise;
let previewToken = 0;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(message) {
  const el = $('#toast'); el.textContent = message; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

function save() {
  try {
    localStorage.setItem(storageKeys.resumes, JSON.stringify(state.resumes));
    localStorage.setItem(storageKeys.history, JSON.stringify(state.history));
    if (state.profile) localStorage.setItem(storageKeys.profile, JSON.stringify(state.profile));
  } catch {
    toast('Tailor could not save to browser storage. Check your browser privacy settings.');
  }
}

function current() { return state.resumes.find(r => r.id === state.selected) || state.resumes[0] || null; }

async function loadPdfJs() {
  if (!pdfjsPromise) pdfjsPromise = import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs').then(mod => {
    mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
    return mod;
  });
  return pdfjsPromise;
}

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value), bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function latexDocumentBody(source = '') {
  const match = source.match(/\\begin\s*\{document\}([\s\S]*?)\\end\s*\{document\}/i);
  return match ? match[1] : source;
}

function latexPlain(value = '') {
  let text = value;
  for (let pass = 0; pass < 4; pass++) {
    text = text.replace(/\\href\s*\{[^{}]*\}\s*\{([^{}]*)\}/g, '$1');
    text = text.replace(/\\(?:textbf|textit|emph|underline|small|scshape|url)\s*\{([^{}]*)\}/g, '$1');
  }
  return text.replace(/\\\\(?:\s*\[[^\]]*\])?/g, ' | ').replace(/\\[a-zA-Z@]+\*?(?:\[[^\]]*\])?/g, ' ').replace(/[{}$]/g, ' ').replace(/\\%/g, '%').replace(/\\&/g, '&').replace(/~/g, ' ').replace(/\s*\|\s*(?:\|\s*)+/g, ' | ').replace(/\s+/g, ' ').trim();
}

function macroCalls(source, name, argCount = 1) {
  const calls = []; let cursor = 0, needle = `\\${name}`;
  while ((cursor = source.indexOf(needle, cursor)) !== -1) {
    let pos = cursor + needle.length, args = [], ok = true;
    while (/\s/.test(source[pos] || '')) pos++;
    const argRanges = [];
    for (let a = 0; a < argCount; a++) {
      while (/\s/.test(source[pos] || '')) pos++;
      if (source[pos] !== '{') { ok = false; break; }
      const start = ++pos; let depth = 1;
      while (pos < source.length && depth) { if (source[pos] === '{' && source[pos - 1] !== '\\') depth++; else if (source[pos] === '}' && source[pos - 1] !== '\\') depth--; pos++; }
      if (depth) { ok = false; break; }
      args.push(source.slice(start, pos - 1)); argRanges.push({ start, end: pos - 1 });
    }
    if (ok) calls.push({ start: cursor, end: pos, args, argRanges });
    cursor = Math.max(pos, cursor + needle.length);
  }
  return calls;
}

function cleanLatex(source) {
  const body = latexDocumentBody(source).replace(/(^|[^\\])%.*$/gm, '$1');
  return body.replace(/\\section\s*\{([^}]*)\}/g, '\n$1\n').replace(/\\(?:resumeItem|item)\s*\{/g, '\n• {').replace(/\\item\b/g, '\n• ').split('\n').map(latexPlain).filter(Boolean).join('\n');
}

function profileFromLatex(source = '', fallbackName = 'Resume') {
  const body = latexDocumentBody(source).replace(/(^|[^\\])%.*$/gm, '$1'), sectionCalls = macroCalls(body, 'section', 1);
  const nameMatch = body.match(/\\textbf\s*\{\s*\\Huge\s+\\scshape\s+([^{}]+)\}/i) || body.match(/\\name\s*\{([^{}]+)\}/i);
  const title = latexPlain(nameMatch?.[1] || fallbackName);
  const centered = (body.match(/\\begin\s*\{center\}([\s\S]*?)\\end\s*\{center\}/i) || [])[1] || '';
  const contact = latexPlain(centered).replace(title, '').replace(/^\s*\|\s*(?:\d+(?:\.\d+)?pt\s*)?/, '').trim();
  const sections = [];
  const boundaries = sectionCalls.length ? sectionCalls : [{ start: 0, end: 0, args: ['Resume'] }];
  boundaries.forEach((sectionCall, index) => {
    const chunk = body.slice(sectionCall.end, boundaries[index + 1]?.start ?? body.length), name = latexPlain(sectionCall.args[0]), entries = [];
    const headings = [
      ...macroCalls(chunk, 'resumeSubheading', 4).map(call => ({ ...call, kind: 'work' })),
      ...macroCalls(chunk, 'resumeEducationSubheading', 4).map(call => ({ ...call, kind: 'education' })),
      ...macroCalls(chunk, 'resumeProjectHeading', 2).map(call => ({ ...call, kind: 'project' })),
    ].sort((a, b) => a.start - b.start);
    if (headings.length) {
      headings.forEach((head, i) => {
        const itemChunk = chunk.slice(head.end, headings[i + 1]?.start ?? chunk.length), items = macroCalls(itemChunk, 'resumeItem', 1).map(c => latexPlain(c.args[0])).filter(Boolean);
        if (head.kind === 'project') entries.push({ title: latexPlain(head.args[0]), sub: latexPlain(head.args[1]), bullets: items });
        else entries.push({ title: `${latexPlain(head.args[0])} — ${latexPlain(head.args[2])}`, sub: [latexPlain(head.args[1]), latexPlain(head.args[3])].filter(Boolean).join(' · '), bullets: items });
      });
    } else {
      const items = macroCalls(chunk, 'resumeItem', 1).map(c => latexPlain(c.args[0])).filter(Boolean);
      const ordinaryItems = [...chunk.matchAll(/\\item\s+([^\n]+)/g)].map(m => latexPlain(m[1])).filter(Boolean);
      if (items.length || ordinaryItems.length) entries.push({ title: '', sub: '', bullets: [...items, ...ordinaryItems] });
    }
    if (/skill/i.test(name)) {
      const skillGroups = [...chunk.matchAll(/\\textbf\s*\{([^{}]+)\}\s*\{\s*:\s*([^{}]+)\}/g)].map(match => `${latexPlain(match[1])}: ${latexPlain(match[2])}`);
      const skillText = skillGroups.length ? skillGroups.join(' · ') : latexPlain(chunk.replace(/\\resumeSubHeadingListStart|\\resumeSubHeadingListEnd|\\begin\s*\{itemize\}|\\end\s*\{itemize\}/g, ''));
      sections.push({ name, text: skillText });
    } else if (entries.length) sections.push({ name, entries });
  });
  if (!sections.length) return profileFromText(cleanLatex(source), fallbackName);
  return { title, contact, sections };
}

function profileFromText(source = '', fallbackName = 'Resume') {
  const lines = source.split(/\n+/).map(x => x.replace(/^\s*[•●▪*-]\s*/, '• ').trim()).filter(Boolean);
  const known = /^(experience|work experience|professional experience|education|skills|technical skills|projects|leadership|certifications|summary|profile)$/i;
  const title = lines[0] && lines[0].length < 70 && !known.test(lines[0]) ? lines.shift() : fallbackName;
  let contact = '';
  if (lines[0] && /@|linkedin|github|\d{3}[-.) ]\d{3}/i.test(lines[0])) contact = lines.shift();
  const sections = [];
  let section = { name: 'Experience', entries: [{ title: '', sub: '', bullets: [] }] };
  sections.push(section);
  for (const line of lines) {
    if (known.test(line) || (/^[A-Z][A-Z &/]{2,30}$/.test(line) && line.length < 34)) {
      section = { name: line.replace(/\b\w/g, c => c.toUpperCase()), entries: [{ title: '', sub: '', bullets: [] }] };
      sections.push(section); continue;
    }
    if (/skills/i.test(section.name)) { section.text = (section.text ? section.text + ' · ' : '') + line.replace(/^• /, ''); delete section.entries; continue; }
    const entry = section.entries[0];
    if (!entry.title && !line.startsWith('• ')) entry.title = line;
    else entry.bullets.push(line.replace(/^• /, ''));
  }
  return { title, contact, sections: sections.filter(s => s.text || s.entries?.some(e => e.title || e.bullets.length)) };
}

function profileFromSource(source = '', name = 'Resume', type = 'txt') {
  return type === 'tex' ? profileFromLatex(source, name) : profileFromText(source, name);
}

function updateCounts() {
  $('#resumeCount').textContent = state.resumes.length;
  $('#historyCount').textContent = state.history.length;
  $$('.mobileResumeCount').forEach(el => el.textContent = state.resumes.length);
  $$('.mobileHistoryCount').forEach(el => el.textContent = state.history.length);
}

function renderSelect() {
  const sel = $('#resumeSelect');
  sel.disabled = !state.resumes.length;
  sel.innerHTML = state.resumes.length ? state.resumes.map(r => `<option value="${r.id}" ${r.id === state.selected ? 'selected' : ''}>${esc(r.name)} · ${r.type.toUpperCase()}</option>`).join('') : '<option>No base resumes yet</option>';
  $('#generateBtn').disabled = !state.resumes.length;
  updateCounts(); renderPaper(current());
}

async function renderPdfBytes(bytes, el, token) {
  const pdfjs = await loadPdfJs(), doc = await pdfjs.getDocument({ data: bytes.slice() }).promise, page = await doc.getPage(1);
  if (token !== previewToken) return;
  const viewport = page.getViewport({ scale: 1.55 }), canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
  canvas.width = viewport.width; canvas.height = viewport.height;
  el.innerHTML = ''; el.appendChild(canvas); el.className = 'resume-paper pdf-paper';
  await page.render({ canvasContext: ctx, viewport }).promise;
  $('#pageCount').textContent = `${doc.numPages} ${doc.numPages === 1 ? 'page' : 'pages'}`;
}

async function renderLatexCanvas(resume, el, token) {
  try {
    let bytes = texPdfCache.get(resume.id);
    if (!bytes) {
      bytes = await compileLatexToPdf(resume.source || '');
      texPdfCache.set(resume.id, bytes);
    }
    await renderPdfBytes(bytes, el, token);
  } catch (error) {
    if (token !== previewToken) return;
    el.className = 'resume-paper';
    el.innerHTML = `<div class="reupload-note"><b>Original LaTeX did not compile</b><p>${esc(error.message)}</p></div>`;
    $('#pageCount').textContent = 'Not compiled';
  }
}

function resumeMarkup(profile) {
  return `<h3>${esc(profile.title)}</h3><div class="contact">${esc(profile.contact)}</div>${profile.sections.map(s => `<h4>${esc(s.name)}</h4>${s.entries ? s.entries.map(e => `<div class="entry-head"><span>${esc(e.title)}</span></div><div class="entry-sub">${esc(e.sub || '')}</div>${e.bullets?.length ? `<ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}`).join('') : `<p>${esc(s.text)}</p>`}`).join('')}`;
}

function renderPaper(resume, target = '#resumePaper') {
  const el = $(target); if (!el) return; const token = ++previewToken;
  if (!resume) {
    el.className = 'resume-paper'; el.innerHTML = '<div class="paper-empty"><span>+</span><b>Add a base resume</b><small>Upload a LaTeX .tex file to begin.</small></div>';
    $('#sourceType').textContent = 'No source selected'; return;
  }
  $('#sourceType').textContent = 'Compiled LaTeX PDF';
  $('#pageCount').textContent = `${resume.pages || 1} ${(resume.pages || 1) === 1 ? 'page' : 'pages'}`;
  if (resume.type === 'tex' && target === '#resumePaper') {
    el.className = 'resume-paper pdf-paper'; el.innerHTML = '<div class="preview-loading">Compiling original LaTeX…</div>';
    renderLatexCanvas(resume, el, token); return;
  }
  const profile = resume.profile || profileFromSource(resume.source, resume.name, resume.type);
  el.className = 'resume-paper'; el.innerHTML = resumeMarkup(profile); el.style.transform = `scale(${state.zoom})`;
  $('#zoomLabel').textContent = Math.round(state.zoom * 100) + '%';
}

function renderLibrary() {
  $('#resumeList').innerHTML = state.resumes.length ? state.resumes.map(r => `<article class="resume-card"><div class="file-icon">TEX</div><div><h3>${esc(r.name)}</h3><p>Editable LaTeX source + exact compiled preview · Updated ${esc(r.updated || 'today')}</p></div><div class="card-actions"><button class="secondary use-resume" data-id="${r.id}">Use</button><button class="secondary delete-resume" data-id="${r.id}">Delete</button></div></article>`).join('') : '<div class="empty"><b>No base resumes saved</b><p>Add a LaTeX .tex resume to start tailoring.</p><button class="primary small empty-add">+ Add your first resume</button></div>';
}

function renderHistory() {
  updateCounts();
  $('#historyList').innerHTML = state.history.length ? state.history.map(h => `<article class="history-card"><div class="file-icon">${h.score}</div><div><h3>${esc(h.role)}</h3><p>${esc(h.resume)} · ${esc(h.date)} · ${h.changes} accepted changes${h.beforeScore != null ? ` · match ${h.beforeScore} → ${h.score}` : ''}</p></div><button class="secondary history-download" data-id="${h.id}">Download</button></article>`).join('') : '<div class="empty">Your tailored versions will appear here.</div>';
}

function showView(name) {
  $$('.workspace').forEach(v => v.hidden = true); $('#' + name + 'View').hidden = false;
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'library') renderLibrary(); if (name === 'history') renderHistory();
}

function allText(resume) { return `${resume.source || ''} ${JSON.stringify(resume.profile || {})}`.toLowerCase(); }

function applyChanges() {
  const out = state.result;
  out.profile = JSON.parse(JSON.stringify(out.resume.profile || profileFromSource(out.resume.source, out.resume.name, out.resume.type)));
  for (const section of out.profile.sections) for (const entry of section.entries || []) {
    for (const change of out.changes.filter(c => c.accepted)) if (entry.title === change.entry) entry.bullets = entry.bullets.map(b => b === change.text ? change.after : b);
    for (const phrase of out.approvedPhrases || []) entry.bullets = entry.bullets.map(b => {
      const normalChange = out.changes.find(change => change.accepted && change.text === phrase.sourceText);
      const current = normalChange ? normalChange.after : phrase.sourceText;
      return b === current || b === phrase.sourceText ? TailorEngine.applyExperiencePhrase(current, phrase.key) : b;
    });
  }
  const skillsSection = out.profile.sections.find(section => /skill/i.test(section.name));
  if (skillsSection?.text) for (const skill of out.approvedSkills || []) if (!skillsSection.text.toLowerCase().includes(skill.label.toLowerCase())) skillsSection.text += ` · ${skill.label}`;
}

function latexEscape(value) {
  return value.replace(/\\/g, '\\textbackslash{}').replace(/([%&#_])/g, '\\$1');
}

function tailoredLatexSource(result) {
  let source = result.resume.source || '';
  const accepted = result.changes.filter(c => c.accepted);
  const calls = macroCalls(source, 'resumeItem', 1), edits = [];
  for (const call of calls) {
    const plain = latexPlain(call.args[0]), change = accepted.find(c => c.text === plain);
    let value = change ? change.after : plain;
    for (const phrase of result.approvedPhrases || []) if (phrase.sourceText === plain) value = TailorEngine.applyExperiencePhrase(value, phrase.key);
    if (value !== plain) edits.push({ start: call.argRanges[0].start, end: call.argRanges[0].end, value: latexEscape(value) });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
  for (const skill of result.approvedSkills || []) {
    const category = skill.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(\\\\textbf\\{${category}\\}\\s*\\{\\s*:\\s*)([^}]*)`, 'i');
    source = source.replace(pattern, (whole, prefix, values) => {
      if (values.toLowerCase().includes(skill.label.toLowerCase())) return whole;
      return `${prefix}${values.trim()}, ${latexEscape(skill.label)}`;
    });
  }
  return source;
}

async function compileLatexToPdf(source) {
  const { SiglumCompiler } = await import('./vendor/siglum-engine.js');
  if (!latexSupportPromise) latexSupportPromise = Promise.all(['enumitem.sty', 'titlesec.sty', 'marvosym.sty', 'ulem.sty', 'sourcesanspro.sty', 'glyphtounicode.tex'].map(async name => {
    const response = await fetch(`./latex/${name}`);
    if (!response.ok) throw new Error(`Missing LaTeX support file: ${name}`);
    return [name, new Uint8Array(await response.arrayBuffer())];
  })).then(entries => Object.fromEntries(entries));
  const additionalFiles = await latexSupportPromise;
  const compilerLogs = [];
  const compiler = new SiglumCompiler({
    bundlesUrl: 'https://cdn.siglum.org/tl2025/bundles',
    wasmUrl: 'https://cdn.siglum.org/tl2025/busytex.wasm',
    jsUrl: 'https://cdn.siglum.org/tl2025/busytex.js',
    workerUrl: new URL('vendor/siglum-worker.js', location.href).href,
    enableCtan: false,
    enableDocCache: true,
    eagerBundles: ['local-packages', 'graphics', 'hyperref', 'tex-latex-misc', 'babel', 'tables'],
    verbose: true,
    onLog: message => { compilerLogs.push(String(message)); if (compilerLogs.length > 120) compilerLogs.shift(); },
    onProgress: (stage, detail) => { const label = $('#pageDelta'); if (label && state.result?.outputPages == null) label.textContent = `${stage}${detail ? ` · ${detail}` : ''}`; },
  });
  try {
    await compiler.init();
    const result = await compiler.compile(source, { engine: 'pdflatex', useCache: true, additionalFiles });
    if (!result.success || !result.pdf) throw new Error(result.error || (result.log || compilerLogs.join('\n') || 'LaTeX compilation failed.').split('\n').slice(-18).join('\n'));
    return result.pdf;
  } finally {
    try { compiler.unload(); } catch {}
  }
}

async function inspectPdf(bytes) {
  const pdfjs = await loadPdfJs(), doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  return { doc, pages: doc.numPages };
}

async function ensureResultPdf() {
  const result = state.result;
  if (result.compiledPdf) return result.compiledPdf;
  if (result.resume.type !== 'tex') throw new Error('Tailor requires the original LaTeX source to preserve formatting.');
  result.compiledPdf = await compileLatexToPdf(tailoredLatexSource(result));
  const inspected = await inspectPdf(result.compiledPdf);
  result.outputPages = inspected.pages;
  return result.compiledPdf;
}

async function renderAccurateResultPreview() {
  const panel = $('#fullPreviewPanel');
  $('#downloadBtn').disabled = true; $('#saveResultBtn').disabled = true;
  panel.innerHTML = '<div class="full-preview"><article class="resume-paper pdf-paper" id="resultPaper"><div class="preview-loading">Compiling the original layout…</div></article></div>';
  const paper = $('#resultPaper');
  try {
    const bytes = await ensureResultPdf(), { doc, pages } = await inspectPdf(bytes), page = await doc.getPage(1), viewport = page.getViewport({ scale: 1.45 }), canvas = document.createElement('canvas'), context = canvas.getContext('2d');
    canvas.width = viewport.width; canvas.height = viewport.height; paper.innerHTML = ''; paper.appendChild(canvas); await page.render({ canvasContext: context, viewport }).promise;
    const status = $('.page-check b');
    if (pages === 1) { status.textContent = 'Compiled one-page check passed'; status.parentElement.parentElement.querySelector('.ok-dot').style.background = '#3a9b71'; $('#downloadBtn').disabled = false; $('#saveResultBtn').disabled = false; }
    else { status.textContent = `Compiled output is ${pages} pages`; status.parentElement.parentElement.querySelector('.ok-dot').style.background = '#d95d39'; }
    $('#pageDelta').textContent = resultLengthLabel(state.result, pages);
  } catch (error) {
    paper.className = 'resume-paper'; paper.innerHTML = `<div class="reupload-note"><b>Exact preview unavailable</b><p>${esc(error.message)}</p></div>`;
    $('.page-check b').textContent = 'Output not verified'; $('.page-check .ok-dot').style.background = '#d95d39'; $('#pageDelta').textContent = 'Download is disabled until the original layout compiles successfully.';
  }
}

function resultLengthLabel(result, pages) {
  const changed = result.changes.filter(c => c.accepted).length + (result.approvedSkills?.length || 0) + (result.approvedPhrases?.length || 0);
  return `${pages} compiled ${pages === 1 ? 'page' : 'pages'} · ${changed} accepted ${changed === 1 ? 'change' : 'changes'}`;
}

function tailor() {
  const resume = current(), jd = $('#jobDescription').value.trim();
  if (!resume) { toast('Add a base resume first'); openUpload(); return; }
  if (!jd) { toast('Add a job description first'); $('#jobDescription').focus(); return; }
  const analysis = TailorEngine.analyze(jd, resume.profile, allText(resume));
  state.result = { resume, jd, approvedSkills: [], approvedPhrases: [], ...analysis };
  applyChanges(); renderResults(); $('#resultsModal').hidden = false;
}

function renderResults() {
  const r = state.result;
  const acceptedSkills = r.approvedSkills || [], acceptedPhrases = r.approvedPhrases || [], acceptedWording = r.changes.filter(change => change.accepted), totalChanges = acceptedWording.length + acceptedSkills.length + acceptedPhrases.length;
  const rescored = TailorEngine.scoreMatch(r.jd, r.profile, JSON.stringify(r.profile || {}));
  const afterScore = TailorEngine.estimateTailoredScore(r.score, rescored.score), delta = afterScore - r.score;
  r.afterScore = afterScore;
  $('#beforeScore').textContent = r.score; $('#matchScore').textContent = afterScore; $('#scoreDelta').textContent = `${delta >= 0 ? '+' : ''}${delta}`; $('#scoreDelta').classList.toggle('negative', delta < 0);
  $('.score-ring').style.background = `conic-gradient(var(--blue) 0 ${afterScore}%,#dfddd5 ${afterScore}%)`; $('#changeCount').textContent = totalChanges;
  const wordingChanges = r.changes.map((c, i) => `<article class="change-item"><div class="change-meta"><span>${esc(c.section)} · targeted edit</span><label><input class="accept-change" data-i="${i}" type="checkbox" ${c.accepted ? 'checked' : ''}> Include</label></div><div class="diff"><p>${esc(c.text)}</p><span class="to">→</span><p class="after">${esc(c.after)}</p></div><p class="change-reason">${esc(c.reason)}</p></article>`).join('');
  const skillChanges = acceptedSkills.map(skill => `<article class="change-item confirmed-skill-change"><div class="change-meta"><span>Technical Skills · user confirmed</span><span>Included</span></div><div class="skill-addition"><b>+ ${esc(skill.label)}</b><small>Added to ${esc(skill.category)}</small></div><p class="change-reason">Added only because you confirmed this experience.</p></article>`).join('');
  const phraseChanges = acceptedPhrases.map(phrase => `<article class="change-item confirmed-skill-change"><div class="change-meta"><span>Experience wording · user confirmed</span><span>Included</span></div><div class="skill-addition"><b>+ ${esc(phrase.label)}</b><small>Added to an evidence-backed bullet</small></div><p class="change-reason">Added only because you confirmed that the existing evidence reflects this experience.</p></article>`).join('');
  const pendingSkills = (r.skillCandidates || []).filter(skill => !acceptedSkills.some(item => item.key === skill.key));
  const pendingPhrases = (r.experienceCandidates || []).filter(phrase => !acceptedPhrases.some(item => item.key === phrase.key));
  const pendingApprovals = pendingSkills.length + pendingPhrases.length;
  const approvalPrompt = pendingApprovals ? `<button class="skill-review" type="button"><span><b>${pendingApprovals} evidence-backed ${pendingApprovals === 1 ? 'addition needs' : 'additions need'} your confirmation</b><small>Review the resume evidence before approving each addition.</small></span><i>Review →</i></button>` : '';
  $('#changesPanel').innerHTML = approvalPrompt + wordingChanges + skillChanges + phraseChanges || '<div class="empty"><b>No wording changes needed</b><p>The source wording and order will remain unchanged.</p></div>';
  const priorityHtml = r.priorities.slice(0, 6).map((p, i) => { const evidence = p.matches?.[0]?.text || ''; return `<div class="priority-row"><span>${i + 1}</span><div><b>${esc(p.label)}</b><p>${esc(p.evidence.slice(0, 150))}${evidence ? `<small class="resume-evidence">Related resume evidence: ${esc(evidence.slice(0, 150))}</small>` : ''}</p></div><em class="${p.supported ? '' : 'gap-label'}">${p.supported ? 'related evidence' : 'gap — left out'}</em></div>`; }).join('');
  const scoreBreakdown = `<div class="score-breakdown"><article><span>Exact job terms</span><strong>${rescored.breakdown.keywords.score}%</strong><small>${rescored.breakdown.keywords.matched} of ${rescored.breakdown.keywords.total} detected · ${rescored.breakdown.keywords.weight}% of match score</small></article><article><span>Evidence-backed responsibilities</span><strong>${rescored.breakdown.evidence.score}%</strong><small>${rescored.breakdown.evidence.supported} of ${rescored.breakdown.evidence.total} role themes supported · ${rescored.breakdown.evidence.weight}% of match score</small></article></div>`;
  const candidateKeys = new Set((r.skillCandidates || []).map(skill => skill.key));
  const phraseKeys = new Set((r.experienceCandidates || []).map(phrase => phrase.key));
  const surfacedKeys = new Set(r.surfacedTerms || []);
  const experienceGaps = r.miss.filter(term => !candidateKeys.has(term) && !phraseKeys.has(term) && !surfacedKeys.has(term));
  const skillConfirmation = (r.skillCandidates || []).length ? `<section class="skill-confirm"><h4>Confirm skills or tools you genuinely have</h4><p>Unchecked by default. Confirming one adds it to the indicated Technical Skills category—never to your work history.</p><div class="skill-confirm-grid">${r.skillCandidates.map(skill => `<label><input class="confirm-skill" type="checkbox" data-key="${esc(skill.key)}" ${acceptedSkills.some(item => item.key === skill.key) ? 'checked' : ''}><span><b>${esc(skill.label)}</b><small>Add to ${esc(skill.category)}</small></span></label>`).join('')}</div></section>` : '';
  const phraseConfirmation = (r.experienceCandidates || []).length ? `<section class="skill-confirm experience-confirm"><h4>Confirm experience wording supported by your resume</h4><p>These phrases are not written verbatim, but Tailor found related evidence. Approve only if the proposed wording accurately describes what you did.</p><div class="phrase-confirm-grid">${r.experienceCandidates.map(phrase => `<label><input class="confirm-phrase" type="checkbox" data-key="${esc(phrase.key)}" ${acceptedPhrases.some(item => item.key === phrase.key) ? 'checked' : ''}><span><b>${esc(phrase.label)}</b><small><strong>Existing evidence:</strong> ${esc(phrase.evidence)}</small><small><strong>Proposed wording:</strong> ${esc(phrase.previewAfter)}</small></span></label>`).join('')}</div></section>` : '';
  const surfaced = (r.surfacedTerms || []).length ? `<div class="keyword-box"><h4>Made explicit by tailored edits · ${r.surfacedTerms.length}</h4><div class="chips">${r.surfacedTerms.map(k => `<span class="chip hit">${esc(k)}</span>`).join('')}</div></div>` : '';
  $('#keywordsPanel').innerHTML = `<h4>What this role is really optimizing for</h4><p class="analysis-note">Automatic depth: up to ${r.automaticLimit} edits · ${r.score}% before → ${afterScore}% after${acceptedSkills.length + acceptedPhrases.length ? ` · ${acceptedSkills.length + acceptedPhrases.length} user-confirmed` : ''}<small>This ATS-style estimate combines exact job-term coverage with evidence-bearing resume statements. It is not an employer ATS score or a prediction of an interview.</small></p>${scoreBreakdown}<div class="priority-list">${priorityHtml || '<p class="input-help">Add a fuller job description for deeper role analysis.</p>'}</div>${phraseConfirmation}${skillConfirmation}<div class="keyword-grid"><div class="keyword-box"><h4>Exact job terms already present · ${rescored.hits.length}</h4><div class="chips">${rescored.hits.map(k => `<span class="chip hit">${esc(k)}</span>`).join('') || '<span class="chip">No exact terms found — related evidence may still be matched above.</span>'}</div></div>${surfaced}<div class="keyword-box"><h4>Unsupported requirements left out · ${experienceGaps.length}</h4><div class="chips">${experienceGaps.map(k => `<span class="chip miss">${esc(k)}</span>`).join('') || '<span class="chip hit">No unsupported requirement phrases detected</span>'}</div><p class="input-help">Only phrases with no resume evidence are blocked here.</p></div></div>`;
  r.compiledPdf = null; r.outputPages = null; $('.page-check b').textContent = 'Compiling original layout…'; $('#pageDelta').textContent = 'The page check now uses the actual compiled PDF.'; renderAccurateResultPreview();
}

function filenamePart(value, fallback) { return (value || fallback).trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || fallback; }
function pdfFilename(company) { return `Resume_${filenamePart(state.profile?.name, 'Candidate')}_${filenamePart(company, 'Company')}.pdf`; }
function download(name, content, type = 'application/pdf') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500); }

function profileInitials(name = '') { return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?'; }
function renderProfile() {
  $('#profileBtn').textContent = profileInitials(state.profile?.name);
  $('#profileBtn').title = state.profile ? `${state.profile.name} · ${state.profile.email}` : 'Set up your local profile';
}
function openProfile(required = false) {
  $('#profileName').value = state.profile?.name || '';
  $('#profileEmail').value = state.profile?.email || '';
  $('#profileClose').hidden = required;
  $('#profileModal').dataset.required = required ? 'true' : 'false';
  $('#profileModal').hidden = false;
  setTimeout(() => $('#profileName').focus(), 0);
}

function openUpload() { $('#uploadModal').hidden = false; state.file = null; $('#saveResumeBtn').disabled = true; $('#resumeNameInput').value = ''; $('#dropzone b').textContent = 'Drop a LaTeX .tex file'; $('#dropzone small').textContent = 'or click to browse · max 10 MB'; }
function chooseFile(file) {
  if (!file) return;
  if (!/\.tex$/i.test(file.name)) { state.file = null; $('#saveResumeBtn').disabled = true; toast('Tailor requires a LaTeX .tex source file'); return; }
  if (file.size > 10e6) { toast('That file is larger than 10 MB'); return; }
  state.file = file; $('#dropzone b').textContent = file.name; $('#dropzone small').textContent = `${(file.size / 1024).toFixed(0)} KB · ready to import`; $('#resumeNameInput').value = file.name.replace(/\.tex$/i, ''); $('#saveResumeBtn').disabled = false;
}

function addLatexResume(name, source) {
  if (!/\\begin\s*\{document\}/i.test(source)) throw new Error('This file does not contain a LaTeX document environment.');
  const id = 'r' + Date.now(), profile = profileFromLatex(source, name);
  state.resumes.push({ id, name, type: 'tex', updated: 'Today', source, profile, pages: 1 }); state.selected = id;
  save(); renderSelect(); renderLibrary(); $('#uploadModal').hidden = true; showView('library');
}

async function saveResume() {
  const file = state.file; if (!file || !/\.tex$/i.test(file.name)) { toast('Choose a LaTeX .tex source file'); return; }
  const button = $('#saveResumeBtn'), name = $('#resumeNameInput').value.trim() || file.name.replace(/\.tex$/i, '');
  button.disabled = true; button.firstChild.textContent = 'Saving… ';
  try {
    const source = await file.text();
    addLatexResume(name, source); toast('LaTeX resume added to your library');
  } catch (error) { console.error(error); toast(error.message || 'Could not read that LaTeX file.'); }
  finally { button.disabled = false; button.firstChild.textContent = 'Save to library '; }
}

$$('.nav-item').forEach(b => b.onclick = () => showView(b.dataset.view));
$('#resumeSelect').onchange = e => { state.selected = e.target.value; renderPaper(current()); };
$('#jobDescription').oninput = e => { $('#wordCount').textContent = (e.target.value.trim().match(/\S+/g) || []).length + ' words'; };
$('#useExample').onclick = () => { $('#jobDescription').value = exampleJob; $('#jobDescription').dispatchEvent(new Event('input')); toast('Example role added — enter the actual company for the PDF filename'); };
$('#generateBtn').onclick = () => { if (!state.profile) { openProfile(true); return; } if (!$('#companyName').value.trim()) { toast('Add the company name for your PDF filename'); $('#companyName').focus(); return; } if (!$('#jobDescription').value.trim()) { toast('Paste the complete job description'); $('#jobDescription').focus(); return; } const b = $('#generateBtn'); b.classList.add('loading'); b.querySelector('span').textContent = 'Reading role priorities…'; setTimeout(() => { b.classList.remove('loading'); b.querySelector('span').textContent = 'Tailor my resume'; tailor(); }, 500); };
$('#zoomIn').onclick = () => { state.zoom = Math.min(1.05, state.zoom + .05); renderPaper(current()); }; $('#zoomOut').onclick = () => { state.zoom = Math.max(.65, state.zoom - .05); renderPaper(current()); };
$('#addResumeInline').onclick = $('#addResumeBtn').onclick = openUpload;
$$('[data-close]').forEach(b => b.onclick = () => { const modal = $('#' + b.dataset.close); if (modal.dataset.required !== 'true') modal.hidden = true; });
$$('.modal-backdrop').forEach(m => m.addEventListener('click', e => { if (e.target === m && m.dataset.required !== 'true') m.hidden = true; }));
$('#profileBtn').onclick = () => openProfile(false);
$('#profileForm').onsubmit = e => {
  e.preventDefault();
  const name = $('#profileName').value.trim(), email = $('#profileEmail').value.trim();
  if (!name || !$('#profileEmail').checkValidity()) { toast('Add your full name and a valid email address'); return; }
  state.profile = { name, email }; save(); renderProfile(); $('#profileModal').dataset.required = 'false'; $('#profileModal').hidden = true; toast('Local profile saved');
};
$('#dropzone').onclick = () => $('#fileInput').click(); $('#fileInput').onchange = e => chooseFile(e.target.files[0]); ['dragover', 'dragleave', 'drop'].forEach(event => $('#dropzone').addEventListener(event, e => { e.preventDefault(); $('#dropzone').classList.toggle('drag', event === 'dragover'); if (event === 'drop') chooseFile(e.dataTransfer.files[0]); })); $('#saveResumeBtn').onclick = saveResume;
$$('.load-example').forEach(button => button.onclick = async () => {
  const original = button.textContent; button.disabled = true; button.textContent = 'Loading…';
  try {
    const response = await fetch(`./examples/${button.dataset.file}`); if (!response.ok) throw new Error('Example resume could not be loaded.');
    addLatexResume(button.dataset.name, await response.text()); toast(`${original} example added to your library`);
  } catch (error) { toast(error.message); }
  finally { button.disabled = false; button.textContent = original; }
});
$$('[data-resulttab]').forEach(b => b.onclick = () => { $$('[data-resulttab]').forEach(x => x.classList.toggle('active', x === b)); ['changes', 'keywords', 'preview'].forEach(n => $('#' + (n === 'preview' ? 'fullPreview' : n) + 'Panel').hidden = n !== b.dataset.resulttab); });
$('#changesPanel').onchange = e => { if (e.target.classList.contains('accept-change')) { state.result.changes[+e.target.dataset.i].accepted = e.target.checked; applyChanges(); renderResults(); } };
$('#changesPanel').onclick = e => { if (e.target.closest('.skill-review')) $('[data-resulttab="keywords"]').click(); };
$('#keywordsPanel').onchange = e => {
  if (e.target.classList.contains('confirm-skill')) {
    const skill = state.result.skillCandidates.find(item => item.key === e.target.dataset.key); if (!skill) return;
    state.result.approvedSkills = e.target.checked ? [...state.result.approvedSkills.filter(item => item.key !== skill.key), skill] : state.result.approvedSkills.filter(item => item.key !== skill.key);
    applyChanges(); renderResults(); toast(e.target.checked ? `${skill.label} confirmed and added to the PDF` : `${skill.label} removed from the PDF`);
  }
  if (e.target.classList.contains('confirm-phrase')) {
    const phrase = state.result.experienceCandidates.find(item => item.key === e.target.dataset.key); if (!phrase) return;
    state.result.approvedPhrases = e.target.checked ? [...state.result.approvedPhrases.filter(item => item.key !== phrase.key), phrase] : state.result.approvedPhrases.filter(item => item.key !== phrase.key);
    applyChanges(); renderResults(); toast(e.target.checked ? `${phrase.label} confirmed and added to the PDF` : `${phrase.label} removed from the PDF`);
  }
};
$('#downloadBtn').onclick = async () => { const company = $('#companyName').value.trim(), button = $('#downloadBtn'); button.disabled = true; button.textContent = 'Compiling…'; try { const bytes = await ensureResultPdf(); if (state.result.outputPages !== 1) throw new Error(`The compiled resume is ${state.result.outputPages} pages. Reduce or reject changes before downloading.`); download(pdfFilename(company), bytes); toast(`Downloaded ${pdfFilename(company)}`); } catch (error) { toast(error.message); } finally { button.disabled = false; button.textContent = 'Download PDF'; } };
$('#saveResultBtn').onclick = async () => { const r = state.result, company = $('#companyName').value.trim(), role = (r.jd.split('\n')[0] || 'Tailored role').slice(0, 80); try { const bytes = await ensureResultPdf(); if (r.outputPages !== 1) throw new Error(`The compiled resume is ${r.outputPages} pages; it was not saved.`); state.history.unshift({ id: 'h' + Date.now(), role, resume: r.resume.name, company, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), changes: r.changes.filter(c => c.accepted).length + (r.approvedSkills?.length || 0) + (r.approvedPhrases?.length || 0), score: r.afterScore ?? r.score, beforeScore: r.score, pdfData: bytes.length < 3_000_000 ? bytesToBase64(bytes) : null, ext: 'pdf' }); save(); renderHistory(); $('#resultsModal').hidden = true; toast('Compiled PDF saved to history'); } catch (error) { toast(error.message); } };
$('#historyList').onclick = e => { const b = e.target.closest('.history-download'); if (!b) return; const h = state.history.find(x => x.id === b.dataset.id); if (!h.pdfData) { toast('Regenerate this older version to create an exact compiled PDF'); return; } download(pdfFilename(h.company), base64ToBytes(h.pdfData)); };
$('#resumeList').onclick = e => { const add = e.target.closest('.empty-add'), use = e.target.closest('.use-resume'), del = e.target.closest('.delete-resume'); if (add) { openUpload(); return; } if (use) { state.selected = use.dataset.id; renderSelect(); showView('tailor'); toast('Base resume selected'); } if (del) { const doomed = state.resumes.find(r => r.id === del.dataset.id); if (!doomed || !confirm(`Delete “${doomed.name}” from your resume library?`)) return; state.resumes = state.resumes.filter(r => r.id !== del.dataset.id); texPdfCache.delete(del.dataset.id); if (state.selected === del.dataset.id) state.selected = state.resumes[0]?.id || null; save(); renderLibrary(); renderSelect(); toast('Base resume deleted'); } };
$('#helpBtn').onclick = () => toast('Choose a base, add the role, then review every evidence-backed change.');

let migratedLatexProfiles = false;
for (const resume of state.resumes) if (resume.type === 'tex' && !['swe', 'pm'].includes(resume.id) && /\\begin\s*\{document\}/i.test(resume.source || '')) { resume.profile = profileFromLatex(resume.source, resume.name); migratedLatexProfiles = true; }
if (migratedLatexProfiles) save();
renderProfile(); renderSelect(); renderLibrary(); renderHistory();
if (!state.profile) openProfile(true);
