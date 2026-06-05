# Gaston Scoreboard

Aplikasi web scoreboard bulu tangkis berbasis GitHub Pages + Firebase Realtime Database.

## Halaman

- `index.html` — pilih court dan mode tampilan.
- `scoreboard.html?court=1` — tampilan LCD / TV.
- `admin.html?court=1` — kontrol admin dari HP.

## Update fitur

- Match Info mendukung pertandingan tunggal dan ganda.
- Nama ganda dapat diisi 2 nama untuk masing-masing tim/pemain.
- Logo/bendera sebelum nama pemain dapat diisi dengan emoji, path gambar di repository, atau URL gambar.
- Indikator serve memakai ikon shuttlecock saja.
- Tombol `Menu Utama` tersedia di header dan panel admin.

## Cara pakai cepat

1. Upload semua file ke repository GitHub.
2. Aktifkan GitHub Pages dari Settings > Pages.
3. Buka halaman utama: `https://USERNAME.github.io/NAMA-REPO/`
4. Pilih court dan pilih Scoreboard atau Admin.
5. Admin dari HP membuka `admin.html?court=1`.
6. LCD/TV membuka `scoreboard.html?court=1`.

## Logo atau bendera

Pada halaman Admin > Match Info, kolom Logo/Bendera bisa diisi:

- emoji, contoh: `🇮🇩`, `🇲🇾`, `🏸`
- file gambar di repo, contoh: `assets/logo-a.png`
- URL gambar, contoh: `https://domain.com/logo.png`

## Catatan Firebase

Config Firebase ada di `js/firebase-config.js`.

Untuk uji coba awal, Realtime Database Rules dapat menggunakan:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Setelah aplikasi berjalan, rules perlu diamankan lagi.


## Update v3

Paket ini berisi file langsung di root ZIP agar mudah ditimpa ke root repository GitHub Pages.
Perubahan utama:
- Match Info mendukung Tunggal/Ganda.
- Input logo/bendera untuk Tim A dan Tim B.
- Ikon serve memakai shuttlecock saja.
- Tombol Menu Utama tersedia di header dan panel admin.
- Cache busting `?v=3` ditambahkan agar browser tidak memakai file lama.
