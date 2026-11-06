# Gerbang Permainan

Hub otonom (tanpa SIMPETERI) untuk game Clash of Git: **satu alamat, satu PIN guru, semua permainan**. Berisi lima game (`games/`), hub (`hub/`), dan perekat (`scripts/`).

| Alamat | Isi |
| --- | --- |
| `/` | Hub: PIN guru, dunia (game), Multi Permainan, Hall of Fame, Kelas |
| `/games/route-rush/` `/games/claim80/` `/games/glacia/` `/games/logic-rush/` `/games/transit-rush/` | Game, dibangun dan dijalankan dengan `BASE_PATH` yang sama; hub meneruskan HTTP + WebSocket (satu origin) |

## Menjalankan

**Pasang di jalur pendek** (mis. `C:\gerbang-permainan`): di Windows, jalur >~200 karakter membuat pasca-pasang/spawn esbuild gagal `ENOENT`.

```bash
npm install                # hub (font, eslint)
npm run install:semua      # dependensi tiap game (npm ci; cadangan --ignore-scripts + rebuild better-sqlite3)
npm run build              # klien tiap game dengan BASE_PATH=/games/<kunci>
npm start                  # hub + semua game yang sudah dibangun; mencetak PIN guru
```

**PIN guru bawaan: `1234`.** Ubah lewat tab *PIN* di hub (disimpan di `data/pin.txt`, game dimulai ulang otomatis dengan PIN baru) dan segera ganti sebelum dipakai di jaringan kelas. `GERBANG_PIN=...` menimpa dan mengunci PIN (tidak bisa diubah dari hub). Aturan PIN: 4–32 karakter ASCII tanpa spasi. Env lain: `GERBANG_PORT` (8000), `GERBANG_HOST`, `<KODE>_PORT` / `<KODE>_TARGET` (RR, C80, GL, LR, TR) bila game dijalankan di tempat lain, `node scripts/start.mjs --hub-saja | --game route-rush,claim80`. `npm run dev` = start dengan `--watch`.
GLACIA butuh bank soal: `cd games/glacia && npm run import-bank` (menghasilkan `data/questions.json`, ±25 MB, tidak di git). Tes tiap game: `npm run test:game [kunci]`.

## Cara kerja

1. **PIN**: `POST /api/pin` memeriksa PIN (perbandingan waktu-konstan, 5 gagal/menit/IP → 429). Semua API lain butuh header `x-host-token` = PIN. Hub menyalakan tiap game dengan `HOST_PIN`/`HOST_TOKEN` = PIN yang sama, jadi guru tidak perlu PIN lagi per game. Route Rush menerima PIN lewat pesan roster (token per sesi).
2. **Serah-terima**: klik dunia → `window.open('/games/<kunci>/host')`; game mengirim `*:host-ready` ke `window.opener`; hub menjawab `*:roster` (`kelas`, `roster[{id,name,absen}]`, `pin`, `kembali`, `multiSesi`). PIN hanya lewat postMessage, tidak pernah di URL.
3. **Kelas**: disimpan di hub (`data/kelas.json`, id siswa stabil selama nama sama). Tab *Kelas*: satu nama per baris.
4. **Multi Permainan**: 2–6 dunia berurutan + aturan (poin peringkat / skor ternormal). Tiap game selesai → game membuka `kembali?selesai=1&gameSesi=<id>` → hub mengambil `/games/<kunci>/api/sessions/<id>/summary.json` di sisi server (dengan token), mencocokkan siswa lewat id, menyimpan di `data/multi.json`, dan memperbarui Hall of Fame. Cadangan: kode sesi manual atau tempel JSON.
5. **Hall of Fame**: per sesi (podium + tabel) dan akumulasi per kelas lintas sesi.
6. Proxy menjaga header `Host` asli (pemeriksaan asal Socket.IO game cocok), menulis ulang `X-Forwarded-*`, dan menolak `/api/host-token` CLAIM 80 dari luar.

## Tes dan lint

`npm test` (hub: skor, ringkasan, serah-terima, PIN, proxy, API dengan server game palsu), `npm run lint`. Uji dengan game asli: lihat `docs/LAPORAN.md`.

## Yang masih bergantung pada SIMPETERI

Tidak ada saat dijalankan. Hanya fitur yang tidak ada di Gerbang: daftar siswa dari database SIMPETERI (di sini diisi manual di tab Kelas), sinkron nilai ke rapor SIMPETERI, dan profil per game di Hall of Fame (Gerbang hanya memakai skor dan waktu). Folder `simpeteri13-main/games/*` tidak diubah/dihapus.

## Font dan lisensi

Plus Jakarta Sans (OFL) dipasang lewat `@fontsource-variable/plus-jakarta-sans`. **Product Sans** (Google) tidak dibundel karena lisensinya belum jelas: CSS memakainya hanya bila terpasang di perangkat (`font-family: "Product Sans", "Plus Jakarta Sans"`). Antarmuka hub tidak memutar suara.
