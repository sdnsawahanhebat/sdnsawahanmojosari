'use strict';
/* ====== Halaman admin ====== */

const root = $('#root');
let TOKEN = sessionStorage.getItem('tok') || '';
let USER = sessionStorage.getItem('usr') || '';
let CFG = {};
let VIEW = 'beranda';

const KATEGORI = ['Profil', 'Visi dan Misi', 'Data Guru dan Pegawai', 'Kesiswaan', 'Ekstrakurikuler', 'Pembiasaan', 'Prestasi Siswa', 'Berita'];
const ISI_WAJIB = ['Berita', 'Profil', 'Visi dan Misi'];
const HINT = {
  'Profil': { j: 'Judul profil', k: '', kk: false, i: 'Deskripsi singkat sekolah. Foto = foto gedung sekolah.' },
  'Visi dan Misi': { j: 'Judul (contoh: Visi dan Misi Sekolah)', k: '', kk: false, i: 'Tulis Visi lalu Misi (tiap poin pada baris baru).' },
  'Data Guru dan Pegawai': { j: 'Nama guru / pegawai', k: 'Jabatan dan mata pelajaran yang diampu (contoh: Guru Kelas V — Matematika)', kk: true, i: 'Boleh dikosongkan.' },
  'Kesiswaan': { j: 'Judul (contoh: Data Kesiswaan)', k: '', kk: false, i: 'Keterangan kesiswaan. Jumlah siswa dihitung otomatis dari data pendaftaran.' },
  'Ekstrakurikuler': { j: 'Nama kegiatan ekstrakurikuler', k: 'Waktu pelaksanaan (contoh: Setiap Sabtu, 07.00 WIB)', kk: true, i: 'Boleh dikosongkan.' },
  'Pembiasaan': { j: 'Nama kegiatan pembiasaan', k: 'Keterangan singkat / waktu pelaksanaan', kk: true, i: 'Boleh dikosongkan.' },
  'Prestasi Siswa': { j: 'Juara (contoh: Juara 1 — Nama Siswa)', k: 'Nama kejuaraan', kk: true, i: 'Boleh dikosongkan.' },
  'Berita': { j: 'Judul berita', k: '', kk: false, i: 'Isi berita lengkap.' }
};

const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h13a2 2 0 012 2v12H6a2 2 0 01-2-2V5z"/><path d="M8 9h7M8 13h7M8 17h4"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14.8c1.9.6 3.1 2.3 3.5 5.2"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
  del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeoff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 17.9A10.9 10.9 0 0112 19C5 19 1 12 1 12a18.5 18.5 0 015.1-5.9M9.9 5.1A10.4 10.4 0 0112 5c7 0 11 7 11 7a18.6 18.6 0 01-2.2 3.2"/><path d="M1 1l22 22"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/></svg>'
};

function logoSrc() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><circle cx='100' cy='100' r='96' fill='#e3f4ea'/><path d='M100 40c-30 20-44 48-30 84 10-6 18-14 24-24 2 10 2 22-2 34h16c-4-12-4-24-2-34 6 10 14 18 24 24 14-36 0-64-30-84z' fill='#198754'/></svg>`;
  return imgUrl(CFG.logo_url) || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

async function call(action, payload = {}) {
  try {
    return await api('POST', action, { token: TOKEN, ...payload });
  } catch (e) {
    if (e.code === 'AUTH') logout(true, e.message);
    throw e;
  }
}

/* ============================ LOGIN ============================ */
function showLogin(msg = '') {
  TOKEN = ''; USER = '';
  root.innerHTML = `
  <div class="login-wrap">
    <div class="login-side">
      <img src="${esc(logoSrc())}" alt="Logo sekolah">
      <h1>${esc(CFG.nama_sekolah || 'Sekolah')}</h1>
      <p>Panel Administrator</p>
    </div>
    <div class="login-form-side">
      <form class="login-card" id="login" autocomplete="on">
        <h2>Selamat Datang</h2>
        <p class="sub">Masuk untuk mengelola website sekolah</p>
        <div id="lerr">${msg ? `<div class="alert-err">⚠ <span>${esc(msg)}</span></div>` : ''}</div>
        <div class="fg"><label for="u">Username</label><input class="inp" id="u" name="username" autocomplete="username" required autofocus></div>
        <div class="fg"><label for="p">Password</label>
          <div class="pw-box"><input class="inp" id="p" name="password" type="password" autocomplete="current-password" required>
          <button type="button" id="tg">Lihat</button></div></div>
        <button class="btn btn-primary" style="width:100%;margin-top:6px" id="lb">Login</button>
        <a class="back-link" href="index.html">← Kembali ke website</a>
      </form>
    </div>
  </div>`;
  $('#tg').onclick = () => {
    const p = $('#p'); const show = p.type === 'password';
    p.type = show ? 'text' : 'password'; $('#tg').textContent = show ? 'Sembunyi' : 'Lihat';
  };
  $('#login').onsubmit = async e => {
    e.preventDefault();
    const btn = $('#lb'); btn.disabled = true; btn.textContent = 'Memeriksa…';
    try {
      const r = await api('POST', 'login', { username: $('#u').value.trim(), password: $('#p').value });
      TOKEN = r.token; USER = r.username;
      sessionStorage.setItem('tok', TOKEN); sessionStorage.setItem('usr', USER);
      showApp();
    } catch (ex) {
      btn.disabled = false; btn.textContent = 'Login';
      $('#lerr').innerHTML = `<div class="alert-err shake">⚠ <span>${esc(ex.message)}</span></div>`;
      $('#p').value = ''; $('#p').focus();
    }
  };
}

async function logout(silent = false, msg = '') {
  if (!silent && TOKEN) { try { await api('POST', 'logout', { token: TOKEN }); } catch { } }
  sessionStorage.removeItem('tok'); sessionStorage.removeItem('usr');
  showLogin(silent ? msg : '');
}

/* ============================ SHELL ============================ */
function showApp() {
  root.innerHTML = `
  <div class="shell">
    <header class="topbar">
      <div style="display:flex;align-items:center">
        <button class="burger" id="burger" aria-label="Menu">☰</button>
        <div class="tb-brand"><img src="${esc(logoSrc())}" alt="Logo"><div class="t"><b>${esc(CFG.nama_sekolah || 'Sekolah')}</b><small>Panel Administrator</small></div></div>
      </div>
      <div class="user">
        <button class="user-btn" id="ub"><span class="avatar">${esc(USER.charAt(0) || 'A')}</span>${esc(USER)} ▾</button>
        <div class="user-menu" id="um">
          <button data-go="akun">⚙ Ubah Akun</button>
          <button class="out" id="lo">⎋ Logout</button>
        </div>
      </div>
    </header>
    <aside class="sidebar" id="sb">
      <div class="side-label">Menu</div>
      <nav class="side-nav">
        <button data-go="beranda">${ICON.home} Beranda</button>
        <button data-go="berita">${ICON.news} Tambah Berita</button>
        <button data-go="pendaftaran">${ICON.users} Pendaftaran</button>
      </nav>
    </aside>
    <main class="content" id="content"></main>
  </div>`;

  $('#burger').onclick = () => $('#sb').classList.toggle('open');
  $('#ub').onclick = e => { e.stopPropagation(); $('#um').classList.toggle('open'); };
  document.addEventListener('click', () => { const m = $('#um'); if (m) m.classList.remove('open'); });
  $('#lo').onclick = async () => {
    if (await confirmBox('Logout', 'Anda yakin ingin keluar dari halaman admin?', { yes: 'Ya, keluar', no: 'Batal' })) logout();
  };
  $$('[data-go]').forEach(b => b.addEventListener('click', () => { go(b.dataset.go); $('#sb').classList.remove('open'); }));
  go(VIEW);
}

function go(v) {
  VIEW = v;
  $$('.side-nav button').forEach(b => b.classList.toggle('active', b.dataset.go === v));
  ({ beranda: viewBeranda, berita: viewBerita, pendaftaran: viewSiswa, akun: viewAkun }[v] || viewBeranda)();
}
const content = () => $('#content');
const busy = () => { content().innerHTML = '<div class="panel"><p class="dim">Memuat data…</p></div>'; };
const fail = e => { content().innerHTML = `<div class="panel"><div class="alert-err">⚠ <span>${esc(e.message)}</span></div></div>`; };

/* ============================ BERANDA ============================ */
async function viewBeranda() {
  busy();
  try {
    const d = await call('dashboard');
    CFG = { ...CFG, ...d.settings };
    const st = d.stats, vm = d.visimisi;
    content().innerHTML = `
      <div class="page-h"><h2>Beranda</h2></div>
      <div class="cards">
        <div class="s-card a"><span>Jumlah Seluruh Siswa</span><b>${+st.total || 0}</b></div>
        <div class="s-card b"><span>Jumlah Siswa (Laki-laki)</span><b>${+st.laki || 0}</b></div>
        <div class="s-card c"><span>Jumlah Siswi (Perempuan)</span><b>${+st.perempuan || 0}</b></div>
      </div>
      <div class="panel">
        <h3>Visi dan Misi Sekolah</h3>
        ${vm ? `<div class="vm-box"><h4>${esc(vm.judul)}</h4><div>${nl2br(vm.isi)}</div></div>`
        : '<p class="dim">Belum ada visi dan misi. Tambahkan lewat menu <b>Tambah Berita</b> dengan kategori <b>Visi dan Misi</b>.</p>'}
      </div>`;
  } catch (e) { fail(e); }
}

/* ============================ BERITA ============================ */
let BERITA = [];

async function viewBerita() {
  busy();
  try {
    BERITA = await call('listBerita');
    tampilBerita();
  } catch (e) { fail(e); }
}

function tampilBerita() {
  content().innerHTML = `
    <div class="page-h"><h2>Berita &amp; Konten Website</h2>
      <button class="btn btn-primary" id="add">＋ Tambah Berita</button></div>
    <div class="panel">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Kategori</th><th>Judul Berita</th><th>Isi Berita</th><th>Foto</th><th>Aksi</th></tr></thead>
        <tbody id="tb">${BERITA.length ? BERITA.map(rowBerita).join('') : '<tr><td colspan="5" class="dim" style="text-align:center;padding:30px">Belum ada berita. Klik “Tambah Berita”.</td></tr>'}</tbody>
      </table></div>
      <p class="dim" style="font-size:13px;margin:12px 0 0">Ikon mata: berita hanya tampil di website jika ikon mata aktif.</p>
    </div>`;
  $('#add').onclick = () => formBerita(null);
  $('#tb').onclick = onBeritaAction;
}

function rowBerita(b) {
  const on = b.tampil === 'ya';
  return `<tr>
    <td><span class="tag">${esc(b.kategori)}</span></td>
    <td><b>${esc(b.judul)}</b>${b.keterangan ? `<div class="dim" style="font-size:12.5px">${esc(potong(b.keterangan, 60))}</div>` : ''}</td>
    <td class="clip">${esc(potong(b.isi, 110)) || '<span class="dim">—</span>'}</td>
    <td>${img(b.foto, '', 'Foto', 'thumb')}</td>
    <td><div class="acts" data-id="${esc(b.id)}">
      <button class="ic" data-a="edit" title="Edit berita">${ICON.edit}</button>
      <button class="ic del" data-a="del" title="Hapus berita">${ICON.del}</button>
      <button class="ic ${on ? '' : 'off'}" data-a="eye" title="${on ? 'Tampil di website — klik untuk sembunyikan' : 'Disembunyikan — klik untuk tampilkan'}">${on ? ICON.eye : ICON.eyeoff}</button>
    </div></td></tr>`;
}

async function onBeritaAction(e) {
  const btn = e.target.closest('[data-a]');
  if (!btn) return;
  const id = btn.closest('[data-id]').dataset.id;
  const item = BERITA.find(x => x.id === id);
  const a = btn.dataset.a;
  if (a === 'edit') return formBerita(item);
  if (a === 'del') {
    if (!await confirmBox('Hapus berita?', `“${potong(item.judul, 60)}” akan dihapus permanen.`, { yes: 'Ya, hapus', no: 'Batal', danger: true })) return;
    loading(true, 'Menghapus…');
    try { await call('deleteBerita', { id }); loading(false); toast('Berita dihapus'); viewBerita(); }
    catch (ex) { loading(false); toast(ex.message, 'err'); }
  }
  if (a === 'eye') {
    loading(true, 'Menyimpan…');
    try {
      const r = await call('toggleBerita', { id });
      item.tampil = r.tampil; loading(false);
      toast(r.tampil === 'ya' ? 'Berita ditampilkan di website' : 'Berita disembunyikan dari website');
      tampilBerita();
    } catch (ex) { loading(false); toast(ex.message, 'err'); }
  }
}

function formBerita(item) {
  const edit = !!item;
  content().innerHTML = `
    <div class="page-h"><h2>${edit ? 'Edit' : 'Tambah'} Berita</h2></div>
    <div class="panel"><form class="aform" id="bf" novalidate>
      <div class="fg"><label for="kat">Kategori Berita <span class="req">*</span></label>
        <select class="inp" id="kat" required>
          <option value="">— Pilih kategori —</option>
          ${KATEGORI.map(k => `<option ${item && item.kategori === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}
        </select></div>
      <div class="fg"><label for="jd" id="jd-l">Judul Berita <span class="req">*</span></label>
        <input class="inp" id="jd" maxlength="200" value="${esc(item ? item.judul : '')}" required></div>
      <div class="fg" id="kt-g" style="display:none"><label for="kt" id="kt-l">Keterangan</label>
        <textarea class="inp" id="kt" maxlength="500" style="min-height:70px">${esc(item ? item.keterangan : '')}</textarea></div>
      <div class="fg"><label for="isi" id="isi-l">Isi Berita</label>
        <textarea class="inp" id="isi" style="min-height:200px">${esc(item ? item.isi : '')}</textarea>
        <span class="hint" id="isi-h"></span></div>
      <div class="fg"><label for="ft">Upload Foto Berita (gambar)</label>
        <div class="up"><img class="pv-big" id="pv" src="${esc(imgUrl(item && item.foto) || placeholder('Foto'))}" alt="">
        <input type="file" id="ft" accept="image/*"></div>
        ${edit ? '<span class="hint">Biarkan kosong jika tidak ingin mengganti foto.</span>' : ''}</div>
      <div class="act">
        <button type="button" class="btn btn-light" id="cancel">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form></div>`;

  const kat = $('#kat');
  const sync = () => {
    const h = HINT[kat.value] || { j: 'Judul berita', k: '', kk: false, i: '' };
    const wajib = ISI_WAJIB.includes(kat.value);
    $('#jd-l').innerHTML = `${esc(h.j)} <span class="req">*</span>`;
    $('#kt-g').style.display = h.kk ? 'flex' : 'none';
    $('#kt-l').textContent = h.k || 'Keterangan';
    $('#isi-l').innerHTML = `Isi Berita${wajib ? ' <span class="req">*</span>' : ''}`;
    $('#isi-h').textContent = h.i;
  };
  kat.onchange = sync; sync();

  $('#ft').onchange = e => {
    const f = e.target.files[0];
    if (f && f.type.startsWith('image/')) $('#pv').src = URL.createObjectURL(f);
    else if (f) { toast('File harus berupa gambar', 'err'); e.target.value = ''; }
  };

  // Batal -> form terhapus otomatis, kembali ke tabel
  $('#cancel').onclick = () => { $('#bf').reset(); tampilBerita(); };

  $('#bf').onsubmit = async e => {
    e.preventDefault();
    if (!kat.value) return toast('Pilih kategori berita', 'err');
    if (!$('#jd').value.trim()) return toast('Judul wajib diisi', 'err');
    if (ISI_WAJIB.includes(kat.value) && !$('#isi').value.trim()) return toast('Isi wajib diisi', 'err');

    if (!await confirmBox('Apakah Anda yakin menyimpan berita?', 'Pastikan data sudah benar.', { yes: 'Ya', no: 'Tidak' })) return;

    loading(true, 'Menyimpan berita…');
    try {
      const payload = {
        id: item ? item.id : '', kategori: kat.value, judul: $('#jd').value.trim(),
        keterangan: HINT[kat.value] && HINT[kat.value].kk ? $('#kt').value.trim() : '',
        isi: $('#isi').value.trim()
      };
      const f = $('#ft').files[0];
      if (f) payload.foto = await fileToDataUrl(f, 1200, 0.8);
      await call('saveBerita', payload);
      loading(false);
      await alertBox('Berhasil', 'Berita berhasil tersimpan.', 'ok');
      viewBerita();                       // menuju halaman tampil berita (tabel)
    } catch (ex) { loading(false); alertBox('Gagal Menyimpan', ex.message, 'err'); }
  };
  window.scrollTo({ top: 0 });
}

/* ============================ PENDAFTARAN ============================ */
let SISWA = [];

async function viewSiswa() {
  busy();
  try { SISWA = await call('listSiswa'); tampilSiswa(); } catch (e) { fail(e); }
}

function tampilSiswa(q = '') {
  const kw = q.trim().toLowerCase();
  const list = kw ? SISWA.filter(s => [s.nama, s.nik, s.no_kk, s.nama_ayah, s.nama_ibu].join(' ').toLowerCase().includes(kw)) : SISWA;
  const had = !!$('#q');
  if (!had) {
    content().innerHTML = `
      <div class="page-h"><h2>Data Pendaftaran Siswa</h2>
        <input class="inp search" id="q" placeholder="Cari nama / NIK…" value="${esc(q)}"></div>
      <div class="panel"><div class="tbl-wrap"><table class="tbl" style="min-width:1150px">
        <thead><tr><th>No</th><th>Nama Siswa</th><th>Tempat, Tgl Lahir</th><th>JK</th><th>Nama Ayah</th><th>Nama Ibu</th><th>Nama Wali</th><th>No KK</th><th>NIK</th><th>Foto</th><th>Aksi</th></tr></thead>
        <tbody id="sb2"></tbody></table></div>
        <p class="dim" id="cnt" style="font-size:13px;margin:12px 0 0"></p></div>`;
    $('#q').oninput = e => tampilSiswa(e.target.value);
    $('#sb2').onclick = onSiswaAction;
  }
  $('#sb2').innerHTML = list.length ? list.map((s, i) => `<tr>
      <td>${i + 1}</td><td><b>${esc(s.nama)}</b></td>
      <td>${esc(s.tempat_lahir)}, ${esc(tgl(s.tanggal_lahir))}</td><td>${esc(s.jk)}</td>
      <td>${esc(s.nama_ayah)}</td><td>${esc(s.nama_ibu)}</td><td>${esc(s.nama_wali) || '—'}</td>
      <td>${esc(s.no_kk)}</td><td>${esc(s.nik)}</td><td>${img(s.foto_siswa, s.nama, 'Foto', 'thumb')}</td>
      <td><div class="acts" data-id="${esc(s.id)}">
        <button class="ic" data-a="edit" title="Edit">${ICON.edit}</button>
        <button class="ic del" data-a="del" title="Hapus">${ICON.del}</button>
        <button class="ic" data-a="print" title="Cetak formulir (PDF)">${ICON.print}</button>
      </div></td></tr>`).join('')
    : '<tr><td colspan="11" class="dim" style="text-align:center;padding:30px">Belum ada data pendaftaran.</td></tr>';
  $('#cnt').textContent = `Menampilkan ${list.length} dari ${SISWA.length} pendaftar`;
}

async function onSiswaAction(e) {
  const btn = e.target.closest('[data-a]');
  if (!btn) return;
  const id = btn.closest('[data-id]').dataset.id;
  const s = SISWA.find(x => x.id === id);
  const a = btn.dataset.a;

  if (a === 'edit') return editSiswa(s);

  if (a === 'del') {
    if (!await confirmBox('Hapus data pendaftar?', `Data “${s.nama}” beserta berkas fotonya akan dihapus permanen.`, { yes: 'Ya, hapus', no: 'Batal', danger: true })) return;
    loading(true, 'Menghapus…');
    try { await call('deleteSiswa', { id }); loading(false); toast('Data dihapus'); SISWA = SISWA.filter(x => x.id !== id); tampilSiswa($('#q') ? $('#q').value : ''); }
    catch (ex) { loading(false); toast(ex.message, 'err'); }
  }

  if (a === 'print') {
    loading(true, 'Membuat PDF…');
    try {
      const r = await call('cetakSiswa', { id });
      const bin = atob(r.base64), arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
      const l = document.createElement('a'); l.href = url; l.download = r.filename; document.body.appendChild(l); l.click(); l.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      loading(false); toast('Formulir PDF berhasil dibuat');
    } catch (ex) { loading(false); toast(ex.message, 'err'); }
  }
}

function editSiswa(s) {
  const m = openModal(`
    <h3>Edit Data Pendaftar</h3>
    <form class="aform" id="ef" novalidate>
      <div class="fg"><label>Nama Lengkap</label><input class="inp" name="nama" value="${esc(s.nama)}" maxlength="150" required></div>
      <div class="row2">
        <div class="fg"><label>Tempat Lahir</label><input class="inp" name="tempat_lahir" value="${esc(s.tempat_lahir)}" maxlength="100"></div>
        <div class="fg"><label>Tanggal Lahir</label><input class="inp" type="date" name="tanggal_lahir" value="${esc(s.tanggal_lahir)}"></div>
      </div>
      <div class="fg"><label>Jenis Kelamin</label>
        <select class="inp" name="jk"><option ${s.jk === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option><option ${s.jk === 'Perempuan' ? 'selected' : ''}>Perempuan</option></select></div>
      <div class="row2">
        <div class="fg"><label>Nama Ayah</label><input class="inp" name="nama_ayah" value="${esc(s.nama_ayah)}" maxlength="150"></div>
        <div class="fg"><label>Nama Ibu</label><input class="inp" name="nama_ibu" value="${esc(s.nama_ibu)}" maxlength="150"></div>
      </div>
      <div class="fg"><label>Nama Wali</label><input class="inp" name="nama_wali" value="${esc(s.nama_wali)}" maxlength="150"></div>
      <div class="fg"><label>Alamat</label><textarea class="inp" name="alamat" maxlength="500">${esc(s.alamat)}</textarea></div>
      <div class="row2">
        <div class="fg"><label>No. KK</label><input class="inp" name="no_kk" value="${esc(s.no_kk)}" maxlength="16" inputmode="numeric"></div>
        <div class="fg"><label>NIK</label><input class="inp" name="nik" value="${esc(s.nik)}" maxlength="16" inputmode="numeric"></div>
      </div>
      <div class="act"><button type="button" class="btn btn-light" id="ec">Batal</button><button class="btn btn-primary">Simpan Perubahan</button></div>
    </form>`, { wide: true });

  $('#ec', m.box).onclick = m.close;
  $('#ef', m.box).onsubmit = async e => {
    e.preventDefault();
    const f = e.target, d = {};
    ['nama', 'tempat_lahir', 'tanggal_lahir', 'jk', 'nama_ayah', 'nama_ibu', 'nama_wali', 'alamat', 'no_kk', 'nik'].forEach(k => d[k] = f[k].value.trim());
    if (!d.nama) return toast('Nama wajib diisi', 'err');
    if (!/^\d{16}$/.test(d.no_kk) || !/^\d{16}$/.test(d.nik)) return toast('No KK dan NIK harus 16 digit angka', 'err');
    loading(true, 'Menyimpan…');
    try {
      await call('updateSiswa', { id: s.id, ...d });
      Object.assign(s, d);
      loading(false); m.close(); toast('Data berhasil diperbarui');
      tampilSiswa($('#q') ? $('#q').value : '');
    } catch (ex) { loading(false); toast(ex.message, 'err'); }
  };
}

/* ============================ UBAH AKUN ============================ */
function viewAkun() {
  $$('.side-nav button').forEach(b => b.classList.remove('active'));
  content().innerHTML = `
    <div class="page-h"><h2>Ubah Akun</h2></div>
    <div class="panel" style="max-width:520px"><form class="aform" id="af" novalidate autocomplete="off">
      <div class="fg"><label>Username</label><input class="inp" value="${esc(USER)}" disabled></div>
      <div class="fg"><label for="po">Password Lama <span class="req">*</span></label><input class="inp" type="password" id="po" autocomplete="current-password" required></div>
      <div class="fg"><label for="pn">Password Baru <span class="req">*</span></label><input class="inp" type="password" id="pn" autocomplete="new-password" minlength="6" required><span class="hint">Minimal 6 karakter</span></div>
      <div class="fg"><label for="pk">Konfirmasi Password Baru <span class="req">*</span></label><input class="inp" type="password" id="pk" autocomplete="new-password" required></div>
      <div class="act"><button type="button" class="btn btn-light" id="ac">Batal</button><button class="btn btn-primary">Simpan</button></div>
    </form></div>`;
  $('#ac').onclick = () => go('beranda');
  $('#af').onsubmit = async e => {
    e.preventDefault();
    const po = $('#po').value, pn = $('#pn').value, pk = $('#pk').value;
    if (!po || !pn) return toast('Lengkapi semua isian', 'err');
    if (pn.length < 6) return toast('Password baru minimal 6 karakter', 'err');
    if (pn !== pk) return toast('Konfirmasi password tidak sama', 'err');
    if (!await confirmBox('Apakah Anda yakin merubah password?', 'Password baru akan dipakai untuk login berikutnya.', { yes: 'Ya', no: 'Tidak' })) return;   // Tidak -> tetap di form ubah akun
    loading(true, 'Menyimpan password…');
    try {
      await call('changePassword', { password_lama: po, password_baru: pn });
      loading(false);
      await alertBox('Berhasil', 'Password terbaru berhasil tersimpan.', 'ok');
      e.target.reset();
    } catch (ex) { loading(false); alertBox('Gagal', ex.message, 'err'); }
  };
}

/* ============================ MULAI ============================ */
/* ============================ MULAI ============================ */
(async function init() {
  if (!TOKEN) {
    showLogin();   // tampil langsung, tanpa menunggu server
    api('GET', 'public').then(d => {
      CFG = d.settings || {};
      document.title = 'Admin — ' + (CFG.nama_sekolah || 'Sekolah');
      const u = $('#u'), p = $('#p');
      if (u && p && !u.value && !p.value) showLogin();   // muat ulang logo & nama sekolah
    }).catch(() => {});
    return;
  }
  try { const d = await api('GET', 'public'); CFG = d.settings || {}; } catch { }
  showApp();
})();
