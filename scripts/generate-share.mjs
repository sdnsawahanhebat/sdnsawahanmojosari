// Membuat halaman "share" statis (dengan tag Open Graph) untuk tiap berita & halaman menu.
// Data diambil dari API Apps Script yang sama dengan website. Tidak mengubah kode website.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

/* ---------- URL situs & API ---------- */
function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  if (fs.existsSync(path.join(ROOT, 'CNAME'))) return 'https://' + rd('CNAME').trim();
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '/').split('/');
  const base = `https://${owner.toLowerCase()}.github.io`;
  return repo.toLowerCase() === `${owner.toLowerCase()}.github.io` ? base : `${base}/${repo}`;
}
const SITE = siteUrl();
const API = process.env.API_URL || (rd('js/config.js').match(/API_URL\s*=\s*['"]([^'"]+)['"]/) || [])[1];
if (!API) throw new Error('API_URL tidak ditemukan di js/config.js');

/* ---------- Helper ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const oneLine = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
const safeId = s => /^[\w-]+$/.test(s);

// Gambar -> URL absolut yang bisa dibaca crawler (WhatsApp/Facebook/Telegram). Data base64 tidak bisa dipakai.
function imgAbs(u) {
  u = String(u || '').trim();
  if (!u || u.startsWith('data:')) return '';
  const m = u.match(/(?:\/d\/|[?&]id=)([\w-]{20,})/);
  if (m && /(drive|docs)\.google\.com/.test(u)) return `https://lh3.googleusercontent.com/d/${m[1]}=w1200`;
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE}/${u.replace(/^\.?\//, '')}`;
}

function head({ title, desc, image, url, type = 'website', basic = true }) {
  return `${basic ? `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
` : ''}<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:locale" content="id_ID">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">${image ? `
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:alt" content="${esc(title)}">` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">${image ? `
<meta name="twitter:image" content="${esc(image)}">` : ''}`;
}

function sharePage(meta, target) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
${head(meta)}
<meta name="robots" content="noindex">
<noscript><meta http-equiv="refresh" content="0;url=${esc(target)}"></noscript>
<script>location.replace(${JSON.stringify(target)});</script>
</head>
<body style="font-family:sans-serif;text-align:center;padding:40px">
<p>Membuka halaman… <a href="${esc(target)}">Klik di sini jika tidak berpindah otomatis</a></p>
</body>
</html>
`;
}

/* ---------- Ambil data ---------- */
const res = await fetch(`${API}?action=public`);
const j = await res.json();
if (!j.ok) throw new Error('API error: ' + j.error);
const { settings: S, berita } = j.data;

const SITE_NAME = S.nama_sekolah || 'Website Sekolah';
const LOGO = imgAbs(S.logo_url);
const HOME_DESC = `${SITE_NAME} berkomitmen mencetak generasi yang cerdas, berkarakter, dan berprestasi.`;

/* ---------- 1. Blok OG di index.html (antara penanda) ---------- */
const idxPath = path.join(ROOT, 'index.html');
let idx = fs.readFileSync(idxPath, 'utf8');
const A = '<!-- OG:START -->', B = '<!-- OG:END -->';
if (idx.includes(A) && idx.includes(B)) {
  const block = `${A}\n${head({ title: SITE_NAME, desc: HOME_DESC, image: LOGO, url: SITE + '/', basic: false })}\n${B}`;
  const next = idx.replace(new RegExp(A + '[\\s\\S]*?' + B), () => block);
  if (next !== idx) fs.writeFileSync(idxPath, next);
} else {
  console.warn('PERINGATAN: penanda <!-- OG:START --> / <!-- OG:END --> belum ada di index.html, bagian beranda dilewati.');
}

/* ---------- 2. Halaman share per menu & per berita ---------- */
const OUT = path.join(ROOT, 's');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const write = (slug, html) => {
  fs.mkdirSync(path.join(OUT, slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, slug, 'index.html'), html);
};

const MENU = {
  'profil': ['Profil Sekolah', 'Mengenal lebih dekat profil'],
  'visi-misi': ['Visi dan Misi', 'Visi dan misi'],
  'guru': ['Data Guru dan Pegawai', 'Data guru dan pegawai'],
  'kesiswaan': ['Data Kesiswaan', 'Data kesiswaan'],
  'ekstrakurikuler': ['Ekstrakurikuler', 'Kegiatan ekstrakurikuler'],
  'pembiasaan': ['Kegiatan Pembiasaan Sekolah', 'Kegiatan pembiasaan'],
  'prestasi': ['Prestasi Siswa', 'Prestasi siswa'],
  'kurikulum': ['Kurikulum', 'Kurikulum dan modul ajar'],
  'berita': ['Berita Sekolah', 'Berita dan informasi terbaru'],
  'pendaftaran': ['Pendaftaran Online', 'Pendaftaran peserta didik baru']
};
const list = [];
for (const [slug, [t, d]] of Object.entries(MENU)) {
  const url = `${SITE}/s/${slug}/`;
  write(slug, sharePage({ title: `${t} - ${SITE_NAME}`, desc: `${d} ${SITE_NAME}.`, image: LOGO, url }, `${SITE}/#/${slug}`));
  list.push({ label: t, url });
}

let n = 0;
for (const b of berita) {
  const id = String(b.id || '');
  if (!safeId(id)) continue;
  const url = `${SITE}/s/${id}/`;
  const desc = oneLine(b.keterangan || b.isi, 200) || HOME_DESC;
  write(id, sharePage({
    title: `${b.judul} - ${SITE_NAME}`, desc, image: imgAbs(b.foto) || LOGO, url, type: 'article'
  }, `${SITE}/#/berita/${encodeURIComponent(id)}`));
  list.push({ label: `${b.kategori ? b.kategori + ': ' : ''}${b.judul}`, url });
  n++;
}

/* ---------- 3. Daftar link share (untuk disalin) ---------- */
fs.writeFileSync(path.join(OUT, 'index.html'), `<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Link Share - ${esc(SITE_NAME)}</title>
<style>body{font-family:sans-serif;max-width:820px;margin:30px auto;padding:0 16px;color:#0b3d2e}li{margin:10px 0;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
span{flex:1;min-width:200px}button{background:#146c43;color:#fff;border:0;border-radius:8px;padding:6px 14px;cursor:pointer}</style></head>
<body><h1>Link Share</h1><p>Salin link di bawah ini untuk dibagikan ke WhatsApp/Facebook agar muncul thumbnail.</p><ul>
${list.map(x => `<li><span>${esc(x.label)}</span><button data-u="${esc(x.url)}">Salin link</button></li>`).join('\n')}
</ul><script>document.addEventListener('click',function(e){var b=e.target.closest('button[data-u]');if(!b)return;
navigator.clipboard.writeText(b.dataset.u).then(function(){b.textContent='Tersalin ✓';setTimeout(function(){b.textContent='Salin link'},1500)})});</script>
</body></html>`);

console.log(`Selesai: ${Object.keys(MENU).length} halaman menu, ${n} berita. Situs: ${SITE}`);
