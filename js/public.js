'use strict';
/* ====== Website publik — router + halaman ====== */

let D = null;            // { settings, stats, berita }
let sliderTimer = null;

const KAT = {
  profil: 'Profil', visi: 'Visi dan Misi', guru: 'Data Guru dan Pegawai', kesiswaan: 'Kesiswaan',
  ekskul: 'Ekstrakurikuler', pembiasaan: 'Pembiasaan', prestasi: 'Prestasi Siswa', berita: 'Berita'
};
const byKat = k => D.berita.filter(b => b.kategori === k);
const S = () => D.settings;
const app = $('#app');

function logoPlaceholder() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><circle cx='100' cy='100' r='96' fill='#e3f4ea'/><path d='M100 40c-30 20-44 48-30 84 10-6 18-14 24-24 2 10 2 22-2 34h16c-4-12-4-24-2-34 6 10 14 18 24 24 14-36 0-64-30-84z' fill='#198754'/></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ---------- Header & footer ---------- */
function renderChrome() {
  const s = S();
  const nama = s.nama_sekolah || 'Sekolah';
  document.title = nama;
  $('#top-name').textContent = nama;
  $('#top-logo').src = imgUrl(s.logo_url) || logoPlaceholder();

  $('#f-about').textContent = `${nama} berkomitmen mencetak generasi yang cerdas, berkarakter, dan berprestasi.`;

  const c = [];
  if (s.alamat) c.push(`<li><span>📍</span><span>${esc(s.alamat)}</span></li>`);
  if (s.telepon) c.push(`<li><span>📞</span><a href="tel:${esc(s.telepon.replace(/[^\d+]/g, ''))}">${esc(s.telepon)}</a></li>`);
  if (s.email) c.push(`<li><span>✉️</span><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li>`);
  $('#f-contact').innerHTML = c.join('') || '<li>Belum ada data kontak</li>';

  const so = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['tiktok', 'TikTok']]
    .filter(([k]) => /^https?:\/\//i.test(s[k] || ''))
    .map(([k, n]) => `<a href="${esc(s[k])}" target="_blank" rel="noopener noreferrer">${n}</a>`);
  $('#f-social').innerHTML = so.join('') || '<span>Belum ada tautan</span>';

  $('#f-copy').textContent = `© ${new Date().getFullYear()} ${nama}. All rights reserved.`;
}

/* ---------- Komponen ---------- */
function banner(title, sub = '') {
  return `<section class="page-banner"><div class="container"><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div></section>`;
}
function secTitle(t, p = '') {
  return `<div class="sec-title"><h2>${esc(t)}</h2><div class="bar"></div>${p ? `<p>${esc(p)}</p>` : ''}</div>`;
}
function emptyBox(t = 'Belum ada data yang ditampilkan.') { return `<div class="empty">${esc(t)}</div>`; }

function beritaCard(b) {
  return `<article class="card">
    <a class="ph" href="#/berita/${esc(b.id)}">${img(b.foto, b.judul, 'Berita')}</a>
    <div class="body">
      <span class="meta">${esc(tgl(b.tanggal))}</span>
      <h3>${esc(b.judul)}</h3>
      <a class="more" href="#/berita/${esc(b.id)}">Read more →</a>
    </div></article>`;
}
function infoCard(b) {
  return `<article class="card center">
    <div class="ph">${img(b.foto, b.judul, 'Foto')}</div>
    <div class="body"><h3>${esc(b.judul)}</h3>
    ${b.keterangan ? `<div class="sub">${nl2br(b.keterangan)}</div>` : ''}</div></article>`;
}

/* ---------- Slider ---------- */
function sliderItems() {
  const urls = String(S().slider_foto || '').split(/[\s,]+/).filter(u => /^https?:\/\//i.test(u));
  if (urls.length) return urls.map(u => ({ foto: u, cap: '' }));
  return D.berita.filter(b => b.foto && ['Berita', 'Pembiasaan', 'Ekstrakurikuler', 'Prestasi Siswa'].includes(b.kategori))
    .slice(0, 6).map(b => ({ foto: b.foto, cap: b.judul }));
}
function initSlider(root) {
  const slides = $$('.slide', root), dots = $$('.dots button', root);
  if (slides.length < 2) return;
  let i = 0;
  const go = n => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  };
  const start = () => { clearInterval(sliderTimer); sliderTimer = setInterval(() => go(i + 1), 4500); };
  $('.sl-prev', root).onclick = () => { go(i - 1); start(); };
  $('.sl-next', root).onclick = () => { go(i + 1); start(); };
  dots.forEach((d, k) => d.onclick = () => { go(k); start(); });
  start();
}

/* ---------- Halaman ---------- */
function pageHome() {
  const s = S();
  const items = sliderItems();
  const slides = items.length
    ? items.map((it, k) => `<div class="slide${k === 0 ? ' active' : ''}">${img(it.foto, it.cap || 'Kegiatan sekolah', 'Kegiatan Sekolah')}${it.cap ? `<div class="cap">${esc(it.cap)}</div>` : ''}</div>`).join('')
    : `<div class="slide active">${img('', '', 'Foto Kegiatan Sekolah')}</div>`;
  const dots = items.length > 1 ? `<div class="dots">${items.map((_, k) => `<button aria-label="Slide ${k + 1}" class="${k === 0 ? 'on' : ''}"></button>`).join('')}</div>` : '';
  const arrows = items.length > 1 ? '<button class="sl-btn sl-prev" aria-label="Sebelumnya">‹</button><button class="sl-btn sl-next" aria-label="Berikutnya">›</button>' : '';

  const berita = byKat('Berita').slice(0, 6);
  app.innerHTML = `
  <section class="hero"><div class="container hero-grid fade">
    <div class="slider" id="slider">${slides}${arrows}${dots}</div>
    <aside class="kepsek">
      ${img(s.foto_kepala_sekolah, s.nama_kepala_sekolah, 'Foto Kepala Sekolah')}
      <div><div class="role">Kepala Sekolah</div><div class="nm">${esc(s.nama_kepala_sekolah)}</div></div>
    </aside>
  </div></section>
  <section class="section"><div class="container">
    ${secTitle('Berita Sekolah', 'Informasi dan kegiatan terbaru dari sekolah kami')}
    <div class="grid3">${berita.length ? berita.map(beritaCard).join('') : emptyBox('Belum ada berita.')}</div>
    ${byKat('Berita').length > 6 ? '<p style="text-align:center;margin-top:30px"><a class="btn btn-outline" href="#/berita">Lihat Semua Berita</a></p>' : ''}
  </div></section>`;
  initSlider($('#slider'));
}

function pageProfil() {
  const s = S(), p = byKat('Profil')[0];
  const peta = /^https?:\/\//i.test(s.maps_embed || '')
    ? `<div class="map-wrap"><iframe src="${esc(s.maps_embed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen title="Peta lokasi sekolah"></iframe></div>` : '';
  app.innerHTML = `${banner('Profil Sekolah')}
  <section class="section"><div class="container fade">
    <div class="two">
      <div class="frame">${img(p && p.foto, 'Gedung sekolah', 'Foto Gedung Sekolah')}</div>
      <div>
        <h2>${esc(s.nama_sekolah)}</h2>
        <ul class="info-list">
          <li><span class="k">Nama Sekolah</span><span>${esc(s.nama_sekolah)}</span></li>
          <li><span class="k">Alamat</span><span>${esc(s.alamat)}</span></li>
          <li><span class="k">Akreditasi</span><span><span class="badge">${esc(s.akreditasi || '-')}</span></span></li>
        </ul>
        ${p && p.isi ? `<p class="prose" style="margin-top:18px">${nl2br(p.isi)}</p>` : ''}
      </div>
    </div>
    ${secTitle('Lokasi Sekolah').replace('class="sec-title"', 'class="sec-title" style="margin-top:50px;margin-bottom:0"')}
    ${peta || emptyBox('Peta lokasi belum diatur (isi maps_embed pada sheet Pengaturan).')}
  </div></section>`;
}

function pageVisi() {
  const v = byKat('Visi dan Misi')[0];
  app.innerHTML = `${banner('Visi dan Misi')}
  <section class="section"><div class="container fade">
  ${v ? `<div class="two">
      <div class="frame">${img(v.foto, v.judul, 'Visi dan Misi')}</div>
      <div><h2>${esc(v.judul)}</h2><div class="prose">${nl2br(v.isi)}</div></div>
    </div>` : emptyBox('Visi dan misi belum diisi.')}
  </div></section>`;
}

function pageGuru() {
  const l = byKat('Data Guru dan Pegawai');
  app.innerHTML = `${banner('Data Guru dan Pegawai')}
  <section class="section"><div class="container fade">
    <div class="grid3">${l.length ? l.map(infoCard).join('') : emptyBox('Data guru dan pegawai belum diisi.')}</div>
  </div></section>`;
}

function pageKesiswaan() {
  const k = byKat('Kesiswaan')[0], st = D.stats, s = S();
  app.innerHTML = `${banner('Kesiswaan')}
  <section class="section"><div class="container fade">
    <div class="two">
      <div class="frame">${img(k && k.foto, 'Siswa', 'Foto Kesiswaan')}</div>
      <div>
        ${k ? `<h2>${esc(k.judul)}</h2>` : '<h2>Data Kesiswaan</h2>'}
        <div class="stats">
          <div class="stat"><b>${+st.total || 0}</b><span>Jumlah Seluruh Siswa</span></div>
          <div class="stat"><b>${+st.laki || 0}</b><span>Siswa Laki-laki</span></div>
          <div class="stat"><b>${+st.perempuan || 0}</b><span>Siswi Perempuan</span></div>
        </div>
        ${k && k.isi ? `<p class="prose">${nl2br(k.isi)}</p>` : ''}
        ${s.motto ? `<div class="motto">“${esc(s.motto)}”<div style="font:500 12px var(--font);color:var(--muted);margin-top:4px">Motto Sekolah</div></div>` : ''}
      </div>
    </div>
  </div></section>`;
}

function pageGrid(kat, title, sub) {
  const l = byKat(kat);
  app.innerHTML = `${banner(title, sub)}
  <section class="section"><div class="container fade">
    <div class="grid3">${l.length ? l.map(infoCard).join('') : emptyBox('Belum ada data.')}</div>
  </div></section>`;
}

function pageBerita() {
  const l = byKat('Berita');
  app.innerHTML = `${banner('Berita Sekolah', 'Kabar dan kegiatan terbaru')}
  <section class="section"><div class="container fade">
    <div class="grid3">${l.length ? l.map(beritaCard).join('') : emptyBox('Belum ada berita.')}</div>
  </div></section>`;
}

function pageDetail(id) {
  const b = D.berita.find(x => x.id === id);
  if (!b) { app.innerHTML = `${banner('Berita')}<section class="section"><div class="container">${emptyBox('Berita tidak ditemukan.')}<p style="text-align:center"><a class="btn btn-light" href="#/berita">← Kembali</a></p></div></section>`; return; }
  app.innerHTML = `${banner('Berita Sekolah')}
  <section class="section"><div class="container"><article class="article fade">
    <a href="#/berita">← Kembali ke berita</a>
    <h2 style="margin-top:12px">${esc(b.judul)}</h2>
    <div class="date">${esc(tgl(b.tanggal))}</div>
    ${b.foto ? `<div class="cover">${img(b.foto, b.judul)}</div>` : ''}
    ${b.keterangan ? `<p><b>${nl2br(b.keterangan)}</b></p>` : ''}
    <div class="prose">${nl2br(b.isi)}</div>
  </article></div></section>`;
  window.scrollTo({ top: 0 });
}

/* ---------- Pendaftaran ---------- */
function pagePendaftaran() {
  const s = S();
  app.innerHTML = `
  <section class="section" style="background:var(--grad-soft)"><div class="container fade" style="max-width:920px">
    <div class="reg-card">
      <div class="reg-head">
        <div><h1>Pendaftaran Online ${esc(s.nama_sekolah)}</h1><p>Lengkapi data calon peserta didik dengan benar</p></div>
        <div class="reg-brand"><img src="${esc(imgUrl(s.logo_url) || logoPlaceholder())}" alt="Logo"><b>${esc(s.nama_sekolah)}</b></div>
      </div>
      <form id="reg" class="form" novalidate autocomplete="off">
        <div class="fg full"><label for="nama">Nama Lengkap Siswa <span class="req">*</span></label><input class="inp" id="nama" name="nama" maxlength="150" required></div>
        <div class="fg"><label for="tempat_lahir">Tempat Lahir <span class="req">*</span></label><input class="inp" id="tempat_lahir" name="tempat_lahir" maxlength="100" required></div>
        <div class="fg"><label for="tanggal_lahir">Tanggal Lahir <span class="req">*</span></label><input class="inp" type="date" id="tanggal_lahir" name="tanggal_lahir" required></div>
        <div class="fg full"><span class="lbl">Jenis Kelamin <span class="req">*</span></span>
          <div class="radios">
            <label><input type="radio" name="jk" value="Laki-laki" required> Laki-laki</label>
            <label><input type="radio" name="jk" value="Perempuan"> Perempuan</label>
          </div></div>
        <div class="fg"><label for="nama_ayah">Nama Ayah <span class="req">*</span></label><input class="inp" id="nama_ayah" name="nama_ayah" maxlength="150" required></div>
        <div class="fg"><label for="nama_ibu">Nama Ibu <span class="req">*</span></label><input class="inp" id="nama_ibu" name="nama_ibu" maxlength="150" required></div>
        <div class="fg full"><label for="nama_wali">Nama Wali Siswa</label><input class="inp" id="nama_wali" name="nama_wali" maxlength="150" placeholder="Kosongkan jika tidak ada wali"></div>
        <div class="fg full"><label for="alamat">Alamat Siswa <span class="req">*</span></label><textarea class="inp" id="alamat" name="alamat" maxlength="500" required></textarea></div>
        <div class="fg"><label for="no_kk">No. KK <span class="req">*</span></label><input class="inp" id="no_kk" name="no_kk" inputmode="numeric" maxlength="16" pattern="\\d{16}" required><span class="hint">16 digit angka</span></div>
        <div class="fg"><label for="nik">NIK Siswa <span class="req">*</span></label><input class="inp" id="nik" name="nik" inputmode="numeric" maxlength="16" pattern="\\d{16}" required><span class="hint">16 digit angka</span></div>
        ${upField('foto_kk', 'Upload KK (gambar)')}
        ${upField('foto_akta', 'Upload Akta Kelahiran (gambar)')}
        ${upField('foto_siswa', 'Upload Foto Siswa (gambar)')}
        <div class="form-act">
          <button type="button" class="btn btn-light" id="btn-batal">Batal</button>
          <button type="submit" class="btn btn-primary" id="btn-simpan">Simpan</button>
        </div>
      </form>
    </div>
  </div></section>`;

  const form = $('#reg');
  const PH = placeholder('Foto');

  // Hanya angka untuk NIK dan KK
  ['no_kk', 'nik'].forEach(n => form[n].addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16); }));

  // Pratinjau gambar
  ['foto_kk', 'foto_akta', 'foto_siswa'].forEach(n => {
    form[n].addEventListener('change', e => {
      const f = e.target.files[0], pv = $('#pv-' + n);
      if (f && f.type.startsWith('image/')) pv.src = URL.createObjectURL(f);
      else { pv.src = PH; if (f) { toast('File harus berupa gambar', 'err'); e.target.value = ''; } }
    });
  });

  // Batal -> hapus isian
  $('#btn-batal').onclick = () => {
    form.reset();
    ['foto_kk', 'foto_akta', 'foto_siswa'].forEach(n => { $('#pv-' + n).src = PH; });
    toast('Isian formulir dikosongkan');
  };

  // Simpan -> konfirmasi -> kirim
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const err = validateReg(form);
    if (err) { toast(err, 'err'); return; }

    const yakin = await confirmBox('Apakah Anda sudah yakin mendaftar?', 'Cek kembali data dengan benar sebelum menyimpan.', { yes: 'Ya', no: 'Tidak' });
    if (!yakin) return;                      // "Tidak" -> kembali ke form pendaftaran

    loading(true, 'Menyimpan data pendaftaran…');
    try {
      const fd = new FormData(form);
      const data = {};
      ['nama', 'tempat_lahir', 'tanggal_lahir', 'jk', 'nama_ayah', 'nama_ibu', 'nama_wali', 'alamat', 'no_kk', 'nik']
        .forEach(k => data[k] = String(fd.get(k) || '').trim());
      data.foto_kk = await fileToDataUrl(form.foto_kk.files[0], 1100, 0.75);
      data.foto_akta = await fileToDataUrl(form.foto_akta.files[0], 1100, 0.75);
      data.foto_siswa = await fileToDataUrl(form.foto_siswa.files[0], 800, 0.8);
      await api('POST', 'daftar', data);
      loading(false);
      await alertBox('Pendaftaran Berhasil', `Data berhasil disimpan dan Anda terdaftar sebagai siswa ${s.nama_sekolah}.`, 'ok');
      $('#btn-batal').click();
    } catch (ex) {
      loading(false);
      alertBox('Gagal Menyimpan', ex.message, 'err');
    }
  });
}

function upField(name, label) {
  return `<div class="fg"><label for="${name}">${label} <span class="req">*</span></label>
    <div class="up"><img class="pv" id="pv-${name}" src="${placeholder('Foto')}" alt="">
    <input type="file" id="${name}" name="${name}" accept="image/*" required></div></div>`;
}

function validateReg(f) {
  const v = n => (f[n].value || '').trim();
  if (!v('nama')) return 'Nama lengkap wajib diisi';
  if (!v('tempat_lahir')) return 'Tempat lahir wajib diisi';
  if (!v('tanggal_lahir')) return 'Tanggal lahir wajib diisi';
  if (!f.querySelector('input[name=jk]:checked')) return 'Pilih jenis kelamin';
  if (!v('nama_ayah')) return 'Nama ayah wajib diisi';
  if (!v('nama_ibu')) return 'Nama ibu wajib diisi';
  if (!v('alamat')) return 'Alamat wajib diisi';
  if (!/^\d{16}$/.test(v('no_kk'))) return 'No. KK harus 16 digit angka';
  if (!/^\d{16}$/.test(v('nik'))) return 'NIK harus 16 digit angka';
  if (!f.foto_kk.files[0]) return 'Upload gambar KK';
  if (!f.foto_akta.files[0]) return 'Upload gambar akta kelahiran';
  if (!f.foto_siswa.files[0]) return 'Upload foto siswa';
  return '';
}

/* ---------- Router ---------- */
const ROUTES = {
  '': pageHome, home: pageHome, profil: pageProfil, 'visi-misi': pageVisi, guru: pageGuru, kesiswaan: pageKesiswaan,
  ekstrakurikuler: () => pageGrid('Ekstrakurikuler', 'Ekstrakurikuler', 'Kegiatan pengembangan bakat dan minat siswa'),
  pembiasaan: () => pageGrid('Pembiasaan', 'Kegiatan Pembiasaan Sekolah', 'Membangun karakter melalui kebiasaan baik'),
  prestasi: () => pageGrid('Prestasi Siswa', 'Prestasi Siswa', 'Kebanggaan kami'),
  berita: pageBerita, pendaftaran: pagePendaftaran
};

function route() {
  clearInterval(sliderTimer);
  if (!D) return;
  const [p, id] = location.hash.replace(/^#\/?/, '').split('/');
  const key = p || 'home';
  if (key === 'berita' && id) pageDetail(decodeURIComponent(id));
  else (ROUTES[key] || pageHome)();

  // Tandai menu aktif
  $$('#menu a').forEach(a => a.classList.toggle('active', (a.dataset.r || '').split(',').includes(key === 'berita' && id ? 'berita' : key)));
  $('#menu').classList.remove('open');
  $$('.has-dd').forEach(x => x.classList.remove('open'));
  if (!(key === 'berita' && id)) window.scrollTo({ top: 0 });
}

/* ---------- Menu mobile ---------- */
$('#nav-toggle').onclick = () => $('#menu').classList.toggle('open');
$$('.has-dd > a').forEach(a => a.addEventListener('click', e => {
  if (window.matchMedia('(max-width: 960px)').matches && !a.parentElement.classList.contains('open')) {
    e.preventDefault();
    $$('.has-dd').forEach(x => x.classList.remove('open'));
    a.parentElement.classList.add('open');
  }
}));

/* ---------- Mulai ---------- */
(async function init() {
  app.innerHTML = '<div class="loading" style="position:static;height:60vh"><div class="spin"></div><span>Memuat data…</span></div>';
  try {
    D = await api('GET', 'public');
    renderChrome();
    route();
  } catch (e) {
    app.innerHTML = `<section class="section"><div class="container"><div class="empty">
      <h3>Data belum dapat dimuat</h3><p>${esc(e.message)}</p>
      <button class="btn btn-primary" onclick="location.reload()">Coba Lagi</button></div></div></section>`;
  }
})();
window.addEventListener('hashchange', route);
