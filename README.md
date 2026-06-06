# Gaston Scoreboard v18

Aplikasi web scoreboard bulu tangkis berbasis GitHub Pages + Firebase Realtime Database.

## Perubahan v8

- Input logo/bendera dihapus.
- Tampilan logo/bendera sebelum nama pemain dihapus.
- Timer menjadi durasi pertandingan.
- Timer mulai ketika admin menekan **Save Match Info & Start Timer**.
- Server bisa dipilih per orang: A1, A2, B1, B2.
- Nama orang yang sedang serve akan di-highlight langsung di area utama.
- Ikon serve dibuat dengan CSS sebagai shuttlecock saja, tanpa raket.
- Tombol **Menu Utama** dibuat terpisah di header dan admin action.
- Tombol **Pertandingan Baru** menyiapkan pertandingan baru: reset skor, kembali ke Game 1, mengganti nama pemain, dan timer tetap 00:00:00.
- **Match Time** baru berjalan setelah tombol **Save Match Info & Start Timer** diklik.
- Preview awal Scoreboard dan Admin Panel dibuat netral tanpa nama pemain dan tanpa skor contoh.
- Admin Match Overview dan Match Info mendukung mode netral ketika pertandingan baru disiapkan tanpa nama.
- Saat klik **Pertandingan Baru**, muncul pilihan **Gunakan Nama Sebelumnya** atau **Masukkan Nama Baru**.

## Halaman

- `index.html` — pilih court dan mode tampilan.
- `scoreboard.html?court=1` — tampilan LCD / TV.
- `admin.html?court=1` — kontrol admin dari HP.

## Cara update GitHub

Upload isi ZIP ini ke root repository, lalu commit. Pastikan file berikut menimpa file lama:

- `index.html`
- `scoreboard.html`
- `admin.html`
- folder `css`
- folder `js`

Setelah GitHub Pages update, gunakan hard refresh: Ctrl + F5.


## Perbaikan v9

- Memperbaiki error JavaScript pada tombol Finish Match yang membuat script admin berhenti.
- Pada mode **Tunggal / 1 Nama**, input **Orang 2** otomatis disembunyikan.
- Saat mode Tunggal dipilih, nilai Orang 2 otomatis dikosongkan.
- Tombol **Save Match Info & Start Timer** kembali menyimpan nama pemain dan menjalankan timer.


## Perubahan v9

- Server otomatis berpindah ketika poin didapat oleh tim lawan.
- Jika tim yang sedang serve mendapat poin, server tetap orang yang sama.
- Untuk pertandingan tunggal, perpindahan server otomatis ke orang 1 tim lawan.
- Untuk pertandingan ganda, ketika service berpindah ke lawan:
  - skor tim baru genap → orang 1 menjadi server
  - skor tim baru ganjil → orang 2 menjadi server
- Tombol pilihan server manual tetap tersedia untuk koreksi cepat oleh admin.


## Perubahan v10

- Tampilan pemain yang sedang serve dibuat seperti tulisan yang distabilo.
- Highlight server dibuat jauh lebih kontras agar mudah terlihat dari jauh pada layar LCD/proyektor.
- Highlight juga diterapkan pada Match Overview admin.


## Perubahan v11

- Highlight server kini berbentuk stabilo panjang dari area nama pemain sampai kolom skor game yang sedang dimainkan.
- Jika sedang Game 1, stabilo hanya sampai skor Game 1.
- Jika pindah ke Game 2, stabilo bergeser sampai skor Game 2 dan stabilo pada skor Game 1 hilang.
- Jika pindah ke Game 3, stabilo sampai skor Game 3.
- Nama pemain yang serve tetap menjadi fokus, tetapi highlight tidak berhenti pada panjang nama saja.


## Perubahan v12

- Highlight server tidak lagi berupa stabilo menyambung.
- Stabilo nama hanya muncul pada pemain yang benar-benar sedang serve.
- Untuk pertandingan ganda, partner yang tidak sedang serve tidak ikut distabilo.
- Stabilo score dibuat sama dengan stabilo nama pemain.
- Ada jarak/pemisah yang jelas antara stabilo nama pemain dan stabilo score.
- Stabilo score tetap mengikuti game yang sedang dimainkan.


## Perubahan v13

- Stabilo score sekarang hanya mengikuti **tim yang sedang mendapat giliran serve**.
- Jadi pada game yang sedang dimainkan, hanya **satu score** yang distabilo, bukan dua-duanya.
- Perubahan ini diterapkan pada:
  - tampilan scoreboard LCD
  - match overview admin


## Perubahan v14

- Saat admin klik **Next Game**, server otomatis kembali ke **Tim A - Orang 1**.
- Berlaku untuk perpindahan:
  - Game 1 → Game 2
  - Game 2 → Game 3
- Sebelum pindah game, muncul konfirmasi agar admin tidak salah klik.


## Perubahan v15

- Warna tim dibedakan:
  - Tim 1 = `#F28E1C`
  - Tim 2 = `#009F3C`
- Nama pemain mengikuti warna tim masing-masing.
- Saat pemain sedang serve, nama tetap distabilo dengan warna timnya.
- Score yang sedang aktif dan sedang serve juga mengikuti warna tim yang sedang serve.
- Tampilan admin compact overview juga mengikuti warna tim 1 dan tim 2.


## Perubahan v16

- Warna hijau dibuat lebih cerah agar seimbang dengan warna kuning/oranye.
- Panel admin sekarang disamakan nuansa warnanya dengan panel scoreboard.
- Tim 2 memakai hijau yang lebih terang pada:
  - nama pemain
  - highlight serve
  - highlight score aktif
  - compact overview admin
  - control card admin
  - tombol score admin


## Perubahan v17

- Warna kuning dan hijau dibuat lebih cerah.
- Panel admin disamakan lagi dengan panel scoreboard agar konsisten.
- Perbaikan khusus pada **Match Overview** admin:
  - teks pada area yang distabilo sekarang dibuat gelap agar mudah dibaca
  - stabilo dan warna huruf tidak lagi bertabrakan


## Perubahan v18

- Score Game 3 pada scoreboard dibuat netral seperti Game 2 saat tidak aktif:
  - angka putih
  - latar hitam
  - tanpa highlight tipis
- Match Overview admin pada kolom Game 3 juga dibuat netral seperti kolom lain saat tidak aktif.
- Bagian **Event Status** pada halaman utama dihilangkan.
- Panel utama halaman awal sekarang melebar penuh.
