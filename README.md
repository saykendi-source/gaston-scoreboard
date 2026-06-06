# Gaston Scoreboard v8

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


## Perbaikan v8

- Memperbaiki error JavaScript pada tombol Finish Match yang membuat script admin berhenti.
- Pada mode **Tunggal / 1 Nama**, input **Orang 2** otomatis disembunyikan.
- Saat mode Tunggal dipilih, nilai Orang 2 otomatis dikosongkan.
- Tombol **Save Match Info & Start Timer** kembali menyimpan nama pemain dan menjalankan timer.
