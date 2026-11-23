import { jsPDF } from 'jspdf';
import './style.css';

const officeDefaults = {
  name: 'MOOND LAW OFFICES', advocate: 'Advocate Yashasva Moond', qualification: 'B.A. LL.B.  |  Advocate, Bar Council of Rajasthan',
  enrolment: 'R/6555/2025', cop: 'COP/2026/20/23007543', address: 'Chamber Nos. 107–110, Court Campus, Bhadra, Dist. Hanumangarh, Rajasthan – 335501',
  phone: '+91 8078618414', email: 'yashasva@moondlawoffices.in / yashasvamoond@gmail.com'
};
const examples = [
  {
    id: 'bengaluru', ref: 'MLO/QUOT/2026/1101', date: '2026-11-01', title: 'Bengaluru account de-freezing', client: 'M/s. Jagjit Ventures Private Limited', contact: '',
    court: 'Electronic City Police Station, Bengaluru City, Karnataka', ack: '31608260152863', crime: '287/2026',
    accounts: 'Federal Bank A/c No. 23020200002997 (Lien: Rs. 8,78,354/-)\nKotak Mahindra Bank A/c No. 5451335596 (Debit freeze + liens: Rs. 5,00,000/- & Rs. 2,000/-)',
    amount: 'Rs. 8,78,354/- and Rs. 5,02,000/-',
    milestones: [
      { name: '1. Advance', amount: 25000, detail: 'For certified copies, drafting, and initial expenses' },
      { name: '2. At filing', amount: 25000, detail: 'On the day of filing' },
      { name: '3. Post relief', amount: 50000, detail: 'Post relief' }
    ], note: 'This initial quotation was prepared assuming the client would be available in person to sign the Court bond. Since personal appearance in Bengaluru is not possible, local surety arrangement charges for both accounts could not be factored into this initial estimate and will be applicable separately, if required by the Court.',
    scope: 'Professional assistance in seeking de-freezing / relief for the bank accounts identified above, including preparation and filing of the required application and related follow-up.', validity: '30 days from the date of issue', expenses: 'Court fees, certified-copy charges, travel, local surety and other third-party expenses are excluded unless expressly included above.'
  },
  {
    id: 'pimpri', ref: 'MLO/QUOT/2026/1102', date: '2026-11-01', title: 'Pimpri Chinchwad account de-freezing', client: 'Mandeep Singh (Sahil Digra Trader)', contact: '',
    court: 'Cyber Police Station, Pimpri Chinchwad', ack: '21905240043801/2025', crime: '',
    accounts: 'Yes Bank A/c No. 009061900002339', amount: 'Rs. 15,39,000/-',
    milestones: [
      { name: '1. Advance', amount: 50000, detail: 'For certified copies, filing, and all other expenses' },
      { name: '2. At order pronouncement', amount: 30000, detail: 'For surety on the day the order is pronounced' },
      { name: '3. Post NOC & Court order', amount: 120000, detail: 'Post NOC and Court order' }
    ], note: 'Surety and third-party arrangement charges will be confirmed with the client before they are incurred.',
    scope: 'Professional assistance in seeking de-freezing / relief for the bank account identified above, including preparation and filing of the required application and related follow-up.', validity: '30 days from the date of issue', expenses: 'Court fees, certified-copy charges, travel and other third-party expenses are excluded unless expressly included above.'
  }
];
const clone = (v) => JSON.parse(JSON.stringify(v));
const saved = (() => { try { return JSON.parse(localStorage.getItem('mlo-quotation-app') || 'null'); } catch { return null; } })();
let state = saved || { office: clone(officeDefaults), quotes: clone(examples), activeId: 'bengaluru' };
state.office = { ...officeDefaults, ...(state.office || {}) };
let deferredInstall = null;
let toastTimer;
const app = document.querySelector('#app');
const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}/-`;
const total = (q) => (q.milestones || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
const esc = (x = '') => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const active = () => state.quotes.find((q) => q.id === state.activeId) || state.quotes[0];
const save = () => { localStorage.setItem('mlo-quotation-app', JSON.stringify(state)); document.querySelector('#save-state')?.classList.add('saved'); };
const todayDisplay = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function render() {
  const q = active();
  if (!q) return;
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#" aria-label="Quotation Generator home"><span class="brand-mark">M</span><span><b>MOOND LAW OFFICES</b><small>QUOTATION GENERATOR</small></span></a>
      <div class="top-actions"><span class="save-state" id="save-state"><i></i> Saved on this device</span><button class="icon-button" id="office-button" aria-label="Office profile" title="Office profile"><svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z"/></svg></button><button class="button button-dark download-top" id="download-top"><svg viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3"/></svg><span>Download PDF</span></button></div>
    </header>
    <main class="workspace">
      <section class="editor-column">
        <div class="welcome"><div><div class="eyebrow"><span class="eyebrow-dot"></span> YOUR DOCUMENT STUDIO</div><h1>Make it official.</h1><p>Prepare a clear, professional fee quotation in minutes.</p></div><button class="button button-outline new-quote" id="new-quote"><span class="plus">＋</span> New quotation</button></div>
        <div class="quote-picker"><div class="picker-icon">▤</div><div class="picker-copy"><label for="quote-select">WORKING DRAFT</label><select id="quote-select">${state.quotes.map((item) => `<option value="${esc(item.id)}" ${q.id === item.id ? 'selected' : ''}>${esc(item.title || 'Untitled quotation')}</option>`).join('')}</select></div><button class="more-button" id="duplicate-quote" title="Duplicate quotation" aria-label="Duplicate quotation">⧉</button></div>
        <div class="editor-card">
          <div class="section-title"><span class="step-number">01</span><div><h2>Quotation details</h2><p>Client and matter information</p></div></div>
          <div class="form-grid">
            ${field('Reference number', 'ref', q.ref, 'MLO/QUOT/2026/1101')}${field('Issue date', 'date', q.date, '', 'date')}
            ${field('Quotation title', 'title', q.title, 'Matter / service title', 'text', 'wide')}
            ${field('Client / party name', 'client', q.client, 'Full name or legal entity', 'text', 'wide')}
            ${field('Contact details (optional)', 'contact', q.contact, 'Address, phone or email', 'text', 'wide')}
            ${field('Police station / authority', 'court', q.court, 'Court, police station or authority', 'text', 'wide')}
            ${field('Acknowledgement / reference no.', 'ack', q.ack, 'Acknowledgement number')}${field('Crime no. (optional)', 'crime', q.crime, 'Crime number')}
            ${field('Account / matter details', 'accounts', q.accounts, 'Add each account or matter on a new line', 'textarea', 'wide')}
            ${field('Freeze / lien amount (optional)', 'amount', q.amount, 'e.g. Rs. 15,39,000/-', 'text', 'wide')}
          </div>
          <div class="divider"></div>
          <div class="section-title section-title-small"><span class="step-number">02</span><div><h2>Professional fees</h2><p>Set a transparent payment schedule</p></div><button class="text-button add-milestone" id="add-milestone">＋ Add milestone</button></div>
          <div class="milestone-list" id="milestone-list">${(q.milestones || []).map((item, i) => milestoneRow(item, i)).join('')}</div>
          <div class="total-strip"><span>Total professional fee</span><strong>${fmt(total(q))}</strong></div>
          <div class="form-grid compact-grid">
            ${field('Additional note / exclusions', 'note', q.note, 'Clarify assumptions and any excluded costs', 'textarea', 'wide')}
          </div>
          <div class="divider"></div>
          <div class="section-title section-title-small"><span class="step-number">03</span><div><h2>Engagement terms</h2><p>Make the scope and acceptance clear</p></div></div>
          <div class="form-grid">
            ${field('Scope of work', 'scope', q.scope, 'Describe the agreed professional services', 'textarea', 'wide')}
            ${field('Quotation validity', 'validity', q.validity, 'e.g. 30 days from issue')}
            ${field('Out-of-pocket expenses', 'expenses', q.expenses, 'Explain what is included or excluded', 'textarea', 'wide')}
          </div>
          <div class="editor-footer"><span>Changes are saved automatically on this device.</span><button class="button button-dark" id="download-bottom"><svg viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3"/></svg> Download legal-size PDF</button></div>
        </div>
        <p class="privacy-note"><span>▣</span> Private by design · Your drafts stay in this browser, not on a server.</p>
      </section>
      <section class="preview-column"><div class="preview-heading"><div><div class="eyebrow">LIVE PREVIEW</div><h2>Your quotation</h2></div><span class="paper-badge">LEGAL · 8.5 × 14 IN</span></div><div class="paper-wrap"><article class="paper" id="paper-preview">${previewMarkup(q)}</article></div><div class="preview-hint"><span>↗</span><span>Ready to print, sign or share.<br/><b>Legal-size portrait · PDF download</b></span></div></section>
    </main>
    <div id="modal-root"></div><div class="toast" id="toast" role="status"></div>
    <button class="install-prompt" id="install-button" hidden>＋ Install app</button>
  `;
  bindEvents();
}
function field(label, key, value, placeholder = '', type = 'text', size = '') {
  const input = type === 'textarea' ? `<textarea data-field="${key}" placeholder="${esc(placeholder)}" rows="${key === 'accounts' ? 3 : 2}">${esc(value || '')}</textarea>` : `<input data-field="${key}" type="${type}" value="${esc(value || '')}" placeholder="${esc(placeholder)}" />`;
  return `<label class="field ${size}"><span>${label}</span>${input}</label>`;
}
function milestoneRow(item, i) { return `<div class="milestone-row" data-index="${i}"><label class="milestone-name"><span class="mobile-label">Payment milestone</span><input data-milestone="name" value="${esc(item.name)}" placeholder="Milestone name" /></label><label class="milestone-amount"><span class="mobile-label">Amount (INR)</span><div class="amount-input"><span>Rs.</span><input data-milestone="amount" inputmode="numeric" type="number" min="0" value="${Number(item.amount) || 0}" /></div></label><label class="milestone-detail"><span class="mobile-label">Schedule / particulars</span><input data-milestone="detail" value="${esc(item.detail)}" placeholder="Schedule / particulars" /></label><button class="remove-milestone" data-remove="${i}" aria-label="Remove milestone" title="Remove milestone">×</button></div>`; }
function previewMarkup(q) {
  const office = state.office;
  return `<div class="doc-topline"><div class="doc-crest">M</div><div class="doc-office"><h3>${esc(office.name)}</h3><b>${esc(office.advocate)}</b><span>${esc(office.qualification)}</span><span>Enrolment No.: ${esc(office.enrolment)} &nbsp;|&nbsp; COP ID: ${esc(office.cop)}</span><span>${esc(office.address)}</span><span>${esc(office.phone)} &nbsp;|&nbsp; ${esc(office.email)}</span></div></div><div class="doc-rule"></div><div class="doc-ref"><span>Ref. No.: <b>${esc(q.ref || '—')}</b></span><span>Date: <b>${todayDisplay(q.date)}</b></span></div><div class="doc-title">PROFESSIONAL FEE QUOTATION</div><div class="doc-subtitle">${esc(q.title || 'Matter / service title').toUpperCase()}</div><div class="doc-details">${docRow('Client', q.client)}${q.contact ? docRow('Contact', q.contact) : ''}${docRow('Police station / authority', q.court)}${docRow('Ack. / reference no.', q.ack)}${q.crime ? docRow('Crime no.', q.crime) : ''}${docRow('Account / matter', q.accounts)}${q.amount ? docRow('Freeze / lien amount', q.amount) : ''}</div><div class="doc-table"><div class="table-head"><span>Payment milestone</span><span>Amount (INR)</span><span>Schedule / particulars</span></div>${(q.milestones || []).map((m) => `<div class="table-row"><span>${esc(m.name)}</span><b>${fmt(m.amount)}</b><span>${esc(m.detail)}</span></div>`).join('')}<div class="table-total"><b>Total Cost</b><strong>${fmt(total(q))}</strong><span>Professional fee</span></div></div>${q.note ? `<div class="doc-note"><b>Note:</b> ${esc(q.note)}</div>` : ''}<div class="doc-terms"><h4>TERMS OF ENGAGEMENT</h4><p><b>Scope:</b> ${esc(q.scope)}</p><p><b>Validity:</b> ${esc(q.validity)}. Acceptance of this quotation confirms the scope and fee schedule stated above.</p><p><b>Expenses:</b> ${esc(q.expenses)}</p><p>Any change to the scope or additional work will be discussed and agreed in writing before it is undertaken.</p></div><div class="doc-accept"><div><b>For ${esc(office.name)}</b><br/><br/><br/>____________________________<br/>${esc(office.advocate)}<br/>Advocate</div><div><b>Accepted and agreed</b><br/><br/><br/>____________________________<br/>Client / authorised signatory<br/>Name: ______________________<br/>Date: _______________________</div></div><div class="doc-footer">${esc(office.address)} &nbsp;·&nbsp; ${esc(office.phone)}</div>`;
}
function docRow(k, v) { return `<div class="doc-detail-row"><b>${esc(k)}</b><span>${esc(v || '—').replace(/\n/g, '<br/>')}</span></div>`; }

function bindEvents() {
  document.querySelectorAll('[data-field]').forEach((el) => el.addEventListener('input', () => {
    active()[el.dataset.field] = el.value;
    updatePreview(); save();
  }));
  document.querySelectorAll('[data-milestone]').forEach((el) => el.addEventListener('input', () => {
    const row = el.closest('.milestone-row'); const item = active().milestones[Number(row.dataset.index)];
    item[el.dataset.milestone] = el.dataset.milestone === 'amount' ? Number(el.value) : el.value;
    updatePreview(); updateTotal(); save();
  }));
  document.querySelectorAll('[data-remove]').forEach((el) => el.addEventListener('click', () => { if (active().milestones.length < 2) return toast('Keep at least one payment milestone.'); active().milestones.splice(Number(el.dataset.remove), 1); save(); render(); }));
  document.querySelector('#quote-select').addEventListener('change', (e) => { state.activeId = e.target.value; save(); render(); });
  document.querySelector('#new-quote').addEventListener('click', addQuote);
  document.querySelector('#duplicate-quote').addEventListener('click', () => { const q = clone(active()); q.id = crypto.randomUUID(); q.ref = nextRef(); q.title = `${q.title || 'Quotation'} — copy`; state.quotes.unshift(q); state.activeId = q.id; save(); render(); toast('Quotation duplicated.'); });
  document.querySelector('#add-milestone').addEventListener('click', () => { active().milestones.push({ name: `${active().milestones.length + 1}. Milestone`, amount: 0, detail: '' }); save(); render(); document.querySelector('.milestone-row:last-child input')?.focus(); });
  document.querySelector('#office-button').addEventListener('click', openOfficeModal);
  document.querySelector('#download-top').addEventListener('click', downloadPdf);
  document.querySelector('#download-bottom').addEventListener('click', downloadPdf);
}
function updatePreview() { document.querySelector('#paper-preview').innerHTML = previewMarkup(active()); }
function updateTotal() { document.querySelector('.total-strip strong').textContent = fmt(total(active())); }
function nextRef() { const d = new Date(); return `MLO/QUOT/${d.getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`; }
function addQuote() {
  const d = new Date();
  const q = { id: crypto.randomUUID(), ref: nextRef(), date: d.toISOString().slice(0, 10), title: '', client: '', contact: '', court: '', ack: '', crime: '', accounts: '', amount: '', milestones: [{ name: '1. Advance', amount: 0, detail: 'On acceptance of quotation' }, { name: '2. On completion', amount: 0, detail: 'As agreed' }], note: '', scope: '', validity: '30 days from the date of issue', expenses: 'Court fees and third-party expenses are excluded unless expressly included above.' };
  state.quotes.unshift(q); state.activeId = q.id; save(); render(); document.querySelector('[data-field="title"]')?.focus();
}
function openOfficeModal() {
  document.querySelector('#modal-root').innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" aria-label="Close">×</button><div class="eyebrow">YOUR LETTERHEAD</div><h2 id="modal-title">Office profile</h2><p>Update these details once to use them on every quotation.</p><div class="form-grid">${Object.entries({ name: 'Office name', advocate: 'Advocate name', qualification: 'Credentials / qualification', enrolment: 'Enrolment number', cop: 'COP ID', address: 'Chambers address', phone: 'Phone', email: 'Email' }).map(([key, label]) => field(label, key, state.office[key], '', key === 'address' ? 'textarea' : 'text', key === 'address' ? 'wide' : '')).join('')}</div><div class="modal-actions"><button class="button button-outline reset-office">Restore sample details</button><button class="button button-dark save-office">Save profile</button></div></section></div>`;
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  document.querySelector('.modal-backdrop').addEventListener('click', (e) => { if (e.target.classList.contains('modal-backdrop')) closeModal(); });
  document.querySelector('.reset-office').addEventListener('click', () => { state.office = clone(officeDefaults); openOfficeModal(); });
  document.querySelector('.save-office').addEventListener('click', () => { document.querySelectorAll('#modal-root [data-field]').forEach((el) => state.office[el.dataset.field] = el.value); save(); closeModal(); render(); toast('Office profile saved.'); });
}
function closeModal() { document.querySelector('#modal-root').innerHTML = ''; }
function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400); }

function downloadPdf() {
  const q = active(); const o = state.office;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [612, 1008], compress: true });
  const W = 612, M = 48, right = W - M; let y = 48;
  const green = [28, 58, 47], gold = [178, 148, 91], ink = [35, 43, 39], muted = [99, 106, 101], line = [220, 223, 216], pale = [245, 246, 242];
  const text = (str, x, yy, size = 9, style = 'normal', color = ink, opts = {}) => { pdf.setFont('helvetica', style); pdf.setFontSize(size); pdf.setTextColor(...color); pdf.text(String(str || ''), x, yy, opts); };
  const wrap = (str, max, size = 9, style = 'normal') => { pdf.setFont('helvetica', style); pdf.setFontSize(size); return pdf.splitTextToSize(String(str || '—'), max); };
  const ensure = (needed) => { if (y + needed > 954) { footer(); pdf.addPage([612, 1008], 'portrait'); y = 48; text(o.name, M, y, 9, 'bold', green); text('PROFESSIONAL FEE QUOTATION · CONTINUED', right, y, 8, 'normal', muted, { align: 'right' }); y += 16; pdf.setDrawColor(...line); pdf.line(M, y, right, y); y += 18; } };
  const footer = () => { pdf.setDrawColor(...line); pdf.line(M, 970, right, 970); text(`${o.address}  |  ${o.phone}`, M, 985, 7, 'normal', muted); text(`${q.ref || ''}`, right, 985, 7, 'normal', muted, { align: 'right' }); };
  const block = (label, value) => { if (!value) return; const lines = wrap(value, 360, 8.5); const h = Math.max(19, lines.length * 11 + 8); ensure(h); text(label, M + 9, y + 12, 8, 'bold', muted); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(...ink); pdf.text(lines, M + 156, y + 12); y += h; pdf.setDrawColor(...line); pdf.line(M, y, right, y); };

  pdf.setFillColor(...green); pdf.rect(M, y, 42, 42, 'F'); text('M', M + 13, y + 29, 23, 'bold', [255,255,255]);
  text(o.name, M + 56, y + 12, 15, 'bold', green); text(o.advocate, M + 56, y + 26, 9, 'bold');
  text(o.qualification, M + 56, y + 39, 8, 'normal', muted);
  y += 56;
  text(`Enrolment No.: ${o.enrolment}  |  BCI Certificate of Practice (COP) ID: ${o.cop}`, M, y, 8, 'normal', muted); y += 12;
  for (const lineText of [o.address, `${o.phone}  |  ${o.email}`]) { const ls = wrap(lineText, 510, 8); text(ls, M, y, 8, 'normal', muted); y += ls.length * 10; }
  y += 5; pdf.setDrawColor(...gold); pdf.setLineWidth(1.4); pdf.line(M, y, right, y); y += 17;
  text(`Ref. No.: ${q.ref || '—'}`, M, y, 8, 'normal', muted); text(`Date: ${todayDisplay(q.date)}`, right, y, 8, 'normal', muted, { align: 'right' }); y += 31;
  text('PROFESSIONAL FEE QUOTATION', M, y, 16, 'bold', green); y += 18;
  const titleLines = wrap((q.title || 'Matter / service title').toUpperCase(), 510, 10, 'bold'); text(titleLines, M, y, 10, 'bold', gold); y += titleLines.length * 14 + 10;
  pdf.setFillColor(...pale); pdf.rect(M, y, 516, 19, 'F'); text('MATTER & CLIENT DETAILS', M + 9, y + 13, 7.5, 'bold', green); y += 19;
  block('Client', q.client); if (q.contact) block('Contact', q.contact); block('Police station / authority', q.court); block('Ack. / reference no.', q.ack); if (q.crime) block('Crime no.', q.crime); block('Account / matter', q.accounts); if (q.amount) block('Freeze / lien amount', q.amount); y += 18;
  ensure(50); text('PROFESSIONAL FEE & PAYMENT SCHEDULE', M, y, 9, 'bold', green); y += 12;
  const cols = [M, M + 160, M + 275, right];
  pdf.setFillColor(...green); pdf.rect(M, y, 516, 25, 'F'); text('Payment milestone', M + 8, y + 16, 7.5, 'bold', [255,255,255]); text('Amount (INR)', cols[2] - 8, y + 16, 7.5, 'bold', [255,255,255], { align: 'right' }); text('Schedule / particulars', cols[2] + 7, y + 16, 7.5, 'bold', [255,255,255]); y += 25;
  (q.milestones || []).forEach((item, i) => { const nameLines = wrap(item.name, 142, 8); const detailLines = wrap(item.detail, 196, 8); const h = Math.max(29, Math.max(nameLines.length, detailLines.length) * 10 + 14); ensure(h + 26); if (i % 2 === 0) { pdf.setFillColor(...pale); pdf.rect(M, y, 516, h, 'F'); } text(nameLines, M + 8, y + 13, 8); text(fmt(item.amount), cols[2] - 8, y + 13, 8, 'bold', ink, { align: 'right' }); text(detailLines, cols[2] + 7, y + 13, 8); y += h; pdf.setDrawColor(...line); pdf.line(M, y, right, y); });
  ensure(35); pdf.setFillColor(238, 240, 233); pdf.rect(M, y, 516, 29, 'F'); text('TOTAL PROFESSIONAL FEE', M + 8, y + 19, 8, 'bold', green); text(fmt(total(q)), right - 8, y + 19, 10, 'bold', green, { align: 'right' }); y += 42;
  const paragraph = (label, value) => { if (!value) return; const lines = wrap(`${label} ${value}`, 498, 8.2); const h = lines.length * 11 + 7; ensure(h); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.2); pdf.setTextColor(...ink); pdf.text(lines, M, y); y += h; };
  paragraph('Note:', q.note); ensure(35); pdf.setFillColor(...pale); pdf.rect(M, y, 516, 19, 'F'); text('TERMS OF ENGAGEMENT', M + 8, y + 13, 7.5, 'bold', green); y += 26;
  paragraph('Scope of work:', q.scope); paragraph('Validity and acceptance:', `${q.validity}. Acceptance of this quotation confirms the scope and fee schedule stated above.`); paragraph('Out-of-pocket expenses:', q.expenses); paragraph('Changes to scope:', 'Any change to the scope or additional work will be discussed and agreed in writing before it is undertaken.');
  ensure(155); y += 8; const colW = 245; text(`For ${o.name}`, M, y, 8.5, 'bold', green); text('Accepted and agreed', M + 270, y, 8.5, 'bold', green); y += 64; pdf.setDrawColor(...muted); pdf.line(M, y, M + colW - 22, y); pdf.line(M + 270, y, right, y); y += 14; text(o.advocate, M, y, 8, 'bold'); text('Client / authorised signatory', M + 270, y, 8, 'bold'); y += 13; text('Advocate', M, y, 8, 'normal', muted); text('Name: __________________________', M + 270, y, 8, 'normal', muted); y += 13; text('Enrolment No.: ' + o.enrolment, M, y, 7.5, 'normal', muted); text('Date: ___________________________', M + 270, y, 8, 'normal', muted);
  footer();
  const safe = (q.client || q.title || 'quotation').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'quotation';
  pdf.save(`${safe}-fee-quotation.pdf`); toast('Your legal-size PDF is ready.');
}

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; const button = document.querySelector('#install-button'); if (button) button.hidden = false; });
window.addEventListener('appinstalled', () => { toast('Quotation Generator installed.'); deferredInstall = null; });
document.addEventListener('click', async (e) => { if (e.target.closest('#install-button') && deferredInstall) { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; document.querySelector('#install-button').hidden = true; } });
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
render();
