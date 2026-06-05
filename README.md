# Gaston Scoreboard

Aplikasi web scoreboard bulu tangkis berbasis GitHub Pages + Firebase Realtime Database.

## Halaman

- `index.html` — pilih court dan mode tampilan.
- `scoreboard.html?court=1` — tampilan LCD / TV.
- `admin.html?court=1` — kontrol admin dari HP.

## Cara pakai cepat

1. Upload semua file ke repository GitHub.
2. Aktifkan GitHub Pages dari Settings > Pages.
3. Buka halaman utama:
   `https://USERNAME.github.io/NAMA-REPO/`
4. Pilih court dan pilih Scoreboard atau Admin.
5. Admin dari HP membuka `admin.html?court=1`.
6. LCD/TV membuka `scoreboard.html?court=1`.

## Catatan Firebase

Config Firebase sudah dimasukkan di `js/firebase-config.js`.

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
