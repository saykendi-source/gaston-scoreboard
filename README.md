# Gaston Scoreboard v4

Aplikasi web scoreboard bulu tangkis berbasis GitHub Pages + Firebase Realtime Database.

## Perubahan v4

- Input logo/bendera dihapus.
- Tampilan logo/bendera sebelum nama pemain dihapus.
- Timer menjadi durasi pertandingan.
- Timer mulai ketika admin menekan **Save Match Info & Start Timer**.
- Server bisa dipilih per orang: A1, A2, B1, B2.
- Nama orang yang sedang serve akan di-highlight langsung di area utama.
- Ikon serve dibuat dengan CSS sebagai shuttlecock saja, tanpa raket.
- Tombol **Menu Utama** dibuat terpisah di header dan admin action.

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
