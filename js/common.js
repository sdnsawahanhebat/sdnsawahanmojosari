'use strict';
/* ====== Fungsi bersama (website publik & admin) ====== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
function tgl(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${+m[3]} ${BLN[+m[2] - 1]} ${m[1]}` : (s || '');
}
function potong(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n).trimEnd() + '…' : s; }

/* ---- Gambar ---- */
function driveId(u) {
  const m = String(u || '').match(/(?:\/d\/|[?&]id=)([\w-]{20,})/);
  return m ? m[1] : null;
}
function imgUrl(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (u.startsWith('data:')) return u;
  const id = driveId(u);
  if (id && /(drive|docs)\.google\.com/.test(u) && !/thumbnail/.test(u)) return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
  return u;
}
function placeholder(text = 'Foto') {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#d8f0e2'/><stop offset='1' stop-color='#a9dcc0'/></linearGradient></defs><rect width='600' height='400' fill='url(#g)'/><text x='50%' y='50%' fill='#2f7d58' font-family='sans-serif' font-size='26' text-anchor='middle' dominant-baseline='middle'>${text}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function img(u, alt = '', ph = 'Foto', cls = '') {
  return `<img class="${cls}" src="${esc(imgUrl(u) || placeholder(ph))}" alt="${esc(alt)}" loading="lazy">`;
}
// Jika gambar gagal dimuat, ganti dengan placeholder
document.addEventListener('error', e => {
  const t = e.target;
  if (t && t.tagName === 'IMG' && !t.dataset.fb) { t.dataset.fb = '1'; t.src = placeholder('Foto'); }
}, true);

/* ---- Kompres gambar di browser sebelum diunggah ---- */
function fileToDataUrl(file, max = 1200, q = 0.8) {
  return new Promise((res, rej) => {
    if (!file || !file.type.startsWith('image/')) return rej(new Error('File harus berupa gambar (JPG/PNG/WEBP)'));
    const fr = new FileReader();
    fr.onerror = () => rej(new Error('Gagal membaca file'));
    fr.onload = () => {
      const im = new Image();
      im.onerror = () => rej(new Error('Gambar tidak valid'));
      im.onload = () => {
        const r = Math.min(1, max / Math.max(im.width, im.height));
        const w = Math.round(im.width * r), h = Math.round(im.height * r);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const x = c.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
        x.drawImage(im, 0, 0, w, h);
        res(c.toDataURL('image/jpeg', q));
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

/* ---- API ---- */
async function api(method, action, payload = {}) {
  if (!API_URL || API_URL.startsWith('GANTI')) throw new Error('API_URL belum diatur di js/config.js');
  let res;
  if (method === 'GET') {
    res = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`);
  } else {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload })
    });
  }
  let j;
  try { j = await res.json(); } catch { throw new Error('Server tidak merespons dengan benar'); }
  if (!j.ok) { const e = new Error(j.error || 'Terjadi kesalahan'); e.code = j.code; throw e; }
  return j.data;
}

/* ---- Modal, toast, loading ---- */
function openModal(html, { wide = false } = {}) {
  const ov = document.createElement('div');
  ov.className = 'ov';
  ov.innerHTML = `<div class="mdl${wide ? ' wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('show'));
  const close = () => { ov.classList.remove('show'); setTimeout(() => ov.remove(), 180); };
  return { ov, box: ov.firstElementChild, close };
}

function confirmBox(title, text, { yes = 'Ya', no = 'Tidak', danger = false } = {}) {
  return new Promise(resolve => {
    const m = openModal(`
      <div class="mdl-ic ${danger ? 'warn' : 'q'}">${danger ? '!' : '?'}</div>
      <h3>${esc(title)}</h3><p>${esc(text)}</p>
      <div class="mdl-act">
        <button type="button" class="btn btn-light" data-v="0">${esc(no)}</button>
        <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-v="1">${esc(yes)}</button>
      </div>`);
    m.box.addEventListener('click', e => {
      const b = e.target.closest('[data-v]');
      if (!b) return;
      m.close(); resolve(b.dataset.v === '1');
    });
  });
}

function alertBox(title, text, type = 'ok') {
  return new Promise(resolve => {
    const ic = type === 'ok' ? '✓' : '!';
    const m = openModal(`
      <div class="mdl-ic ${type === 'ok' ? 'ok' : 'warn'}">${ic}</div>
      <h3>${esc(title)}</h3><p>${esc(text)}</p>
      <div class="mdl-act"><button type="button" class="btn btn-primary" data-v="1">OK</button></div>`);
    m.box.addEventListener('click', e => { if (e.target.closest('[data-v]')) { m.close(); resolve(); } });
  });
}

function toast(msg, type = 'ok') {
  let w = $('#toasts');
  if (!w) { w = document.createElement('div'); w.id = 'toasts'; document.body.appendChild(w); }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  w.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 250); }, 3200);
}

let _loadEl = null;
function loading(show, text = 'Memproses…') {
  if (show) {
    if (_loadEl) return;
    _loadEl = document.createElement('div');
    _loadEl.className = 'loading';
    _loadEl.innerHTML = `<div class="spin"></div><span>${esc(text)}</span>`;
    document.body.appendChild(_loadEl);
  } else if (_loadEl) { _loadEl.remove(); _loadEl = null; }
}
