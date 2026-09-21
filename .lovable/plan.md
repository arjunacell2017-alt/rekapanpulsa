# Perbaikan Error "Gagal menyimpan" saat Admin membuat Client

## Hasil debugging (sudah dipastikan dari log)

Fungsi yang dipanggil: `admin-api`, aksi `create`.

Log jaringan saat Anda menekan Simpan:

```text
POST .../functions/v1/admin-api
body   : {"action":"create","payload":{"nama":"TESTER","email":"aji.s.pambudi@gmail.com","password":"123456","status":"active"}}
status : 400
respons: {"error":"Password is known to be weak and easy to guess, please choose a different one."}
```

Log autentikasi mencatat hal yang sama (`/admin/users` → 422, password lemah).

**Penyebab sebenarnya:** password `123456` ditolak sistem keamanan akun karena termasuk daftar password bocor/mudah ditebak. Jadi ini bukan masalah izin, bukan RLS, bukan kredensial, dan bukan struktur database.

**Penyebab pesan yang membingungkan:** di halaman Manajemen Client, pemanggilan fungsi tidak membaca isi balasan saat status bukan 2xx, sehingga alasan asli ("password terlalu lemah") hilang dan yang tampil hanya pesan teknis "Edge Function returned a non-2xx status code".

Hal lain yang diperiksa dan **tidak bermasalah**: kunci server-side tersedia dan dipakai dengan benar, pengecekan peran admin berjalan (aksi `list` sukses 200), tabel clients/profiles/user_roles serta aturan keamanannya sudah benar, dan sudah ada pembatalan otomatis bila pembuatan akun gagal (baris client yang terlanjur dibuat dihapus kembali) — inilah sebabnya daftar client tetap kosong, tanpa data setengah jadi.

## Yang akan diperbaiki

1. **Tampilkan alasan gagal yang sebenarnya.** Halaman Manajemen Client akan membaca isi balasan error dari server, sehingga pesan seperti "Password terlalu lemah" atau "Email sudah terdaftar" muncul apa adanya.
2. **Terjemahkan pesan ke Bahasa Indonesia** yang jelas, misalnya:
   - "Kata sandi terlalu lemah / mudah ditebak. Gunakan minimal 8 karakter dengan kombinasi huruf dan angka."
   - "Email sudah terdaftar. Gunakan email lain."
3. **Cegah error sejak di form.** Kolom password diberi syarat minimal 8 karakter beserta keterangan singkat, dan tombol Simpan tidak aktif sebelum syarat terpenuhi. Ini hanya bantuan tampilan — pemeriksaan sesungguhnya tetap di server.
4. **Cek email ganda lebih awal di server.** Sebelum membuat apa pun, server memeriksa apakah email sudah dipakai; jika ya, langsung menolak dengan pesan "Email sudah terdaftar." tanpa membuat baris client sama sekali.
5. **Perkuat penanganan gagal separuh jalan.** Jika pembuatan profil atau peran client gagal setelah akun terbentuk, akun dan baris client dihapus kembali agar tidak ada sisa data. (Saat ini rollback hanya menangani kegagalan pembuatan akun.)
6. **Urutan pembuatan dirapikan** agar akun dibuat lebih dulu, baru baris client, profil, dan peran — mengurangi peluang data menggantung.

Desain dashboard tidak diubah, tidak ada data yang dihapus, tidak ada perubahan struktur database, dan aturan keamanan (RLS) tetap seperti sekarang.

## Pengujian setelah perbaikan

- Buat client "TESTER" dengan password kuat → akun dibuat, kode client otomatis (CLIENT_00X), muncul di daftar.
- Login sebagai client tersebut → masuk ke dashboard miliknya sendiri.
- Coba lagi dengan email yang sama → muncul "Email sudah terdaftar.", tanpa akun ganda.
- Coba password lemah → muncul pesan password lemah yang jelas, dan daftar client tetap bersih.
- Client uji dihapus kembali setelah pengujian; data lama Anda tidak disentuh.

## Detail teknis

- `src/pages/admin/AdminClients.tsx`: fungsi `panggil` membaca `error.context.json()` dari `FunctionsHttpError` untuk mengambil field `error` dari body; tambahkan pemetaan pesan ke Bahasa Indonesia; validasi panjang password pada dialog Tambah Client dan Buat Akun.
- `supabase/functions/admin-api/index.ts`: pada aksi `create` dan `create_user`, cek email lewat `admin.auth.admin.listUsers` (atau tangani error duplikat) sebelum insert; pindahkan `createUser` sebelum insert `clients`; bungkus insert `profiles`/`user_roles` dengan pengecekan error + rollback (`deleteUser`, hapus baris client).
- Tidak ada migrasi database.
