# Deploy SHANATECH ke VPS dengan Docker

Runbook ini memasang aplikasi, PostgreSQL, dan Caddy (HTTPS otomatis) memakai Docker Compose
di satu VPS Linux. Jalankan langkah secara berurutan dan jangan lanjut sebelum gerbang
verifikasi pada setiap langkah lolos.

Arsitektur akhir:

- `app` — Next.js standalone di port `3000`, hanya terikat ke `127.0.0.1`.
- `db` — PostgreSQL 18, tanpa port publik.
- `caddy` — reverse proxy + sertifikat HTTPS (profil `tls`).
- Volume: `shanatech_pgdata`, `shanatech_backups`, `shanatech_caddy_data`, `shanatech_caddy_config`.

## 0. Prasyarat

- VPS Ubuntu 24.04 LTS, minimal **2 vCPU / 2 GB RAM / 20 GB SSD**.
- Akses SSH dengan sudo.
- Domain (opsional untuk uji awal, wajib untuk HTTPS).
- Repositori: `https://github.com/taupanbritish/shanatech`.

Jika RAM hanya 2 GB, tambahkan swap agar build Next.js tidak kehabisan memori:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Gerbang:** `free -h` menampilkan swap 2 GB dan `nproc` minimal 2.

## 1. Arahkan domain

Di pengelola DNS domain:

- `A` untuk `@` → IP publik VPS.
- `CNAME` untuk `www` → nama domain utama.

**Gerbang:** `dig +short shanatech.web.id` menampilkan IP VPS. Jika memakai domain lain,
ganti di seluruh langkah berikutnya.

## 2. Pasang Docker dan firewall

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker
```

Buka hanya port yang diperlukan:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

**Gerbang:** `docker --version`, `docker compose version`, dan
`docker run --rm hello-world` berhasil tanpa `sudo`.

## 3. Ambil kode

```bash
sudo mkdir -p /opt/shanatech
sudo chown "$USER":"$USER" /opt/shanatech
git clone https://github.com/taupanbritish/shanatech.git /opt/shanatech
cd /opt/shanatech
```

**Gerbang:** `git log -1 --oneline` menampilkan commit terbaru.

## 4. Siapkan environment produksi

```bash
cp .env.production.example .env.production
chmod 600 .env.production
openssl rand -hex 24
openssl rand -hex 32
docker run --rm -v "$PWD":/app -w /app node:24-bookworm-slim \
  node scripts/hash-password.mjs "PASSWORD-ADMIN-ANDA"
```

Isi `.env.production`:

- `POSTGRES_PASSWORD` → hasil `openssl rand -hex 24` (hex agar aman di URL).
- `SESSION_SECRET` → hasil `openssl rand -hex 32`.
- `ADMIN_PASSWORD_HASH` → keluaran `hash-password.mjs` (diawali `scrypt:`).
- `SITE_DOMAIN` dan `NEXT_PUBLIC_SITE_URL` → domain final, mis. `shanatech.web.id`
  dan `https://shanatech.web.id`.
- `RESEND_API_KEY` dan `RESEND_FROM` → diperlukan untuk email reset password peserta di produksi.
  Tanpa API key, pesan konsultasi tetap tersimpan, tetapi peserta tidak menerima tautan reset.
- `R2_*` → diperlukan untuk unggah gambar produk; ikuti bagian Cloudflare R2 di bawah.
  Compose meneruskan variabel ini melalui `env_file`, tanpa argumen build.

Jangan pernah commit `.env.production` dan jangan membagikan isinya.

### Cloudflare R2: gambar produk

1. Buat bucket khusus gambar publik produk. Jangan menyimpan berkas privat peserta di bucket ini.
2. Buat token R2 **Object Read & Write**, batasi ke bucket tersebut. Isi `R2_ACCOUNT_ID`,
   `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, dan `R2_BUCKET` pada environment server.
3. Hubungkan custom domain publik HTTPS untuk produksi. `r2.dev` hanya untuk uji coba.
   Isi `R2_PUBLIC_BASE_URL` dengan URL tersebut tanpa slash akhir, bukan endpoint S3.
4. Buka pengaturan CORS bucket dan terapkan aturan berikut. Sesuaikan `AllowedOrigins`
   dengan origin persis aplikasi; tambahkan `http://localhost:3000` hanya bila perlu uji lokal.

   ```json
   [
     {
       "AllowedOrigins": ["https://shanatech.web.id"],
       "AllowedMethods": ["PUT", "GET", "HEAD"],
       "AllowedHeaders": ["Content-Type"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. Tambahkan aturan lifecycle bucket untuk menghapus objek dengan prefix **`staging/` setelah
   1 hari**. Jangan terapkan aturan ini ke `products/final/`. URL PUT berlaku 5 menit dan dapat
   dipakai ulang sampai kedaluwarsa; lifecycle membersihkan unggahan batal atau sisa unggahan ulang.
6. Setelah environment berubah, buat ulang container aplikasi (`up -d app`). Masuk ke
   **Produk → Ubah → Galeri media**, unggah JPEG/PNG/WebP/AVIF maksimal 5 MB, lalu periksa
   gambar pada halaman produk publik. Coba ubah caption, urutan, dan hapus gambar uji.

**Gerbang R2:** upload PUT ke `staging/` berhasil; server menyalin ke `products/final/`,
memverifikasi ukuran/tipe/isi gambar final, lalu menyimpan media dan mengonsumsi tiket unggahan.
Gambar harus tampil melalui domain publik dan penghapusan menghilangkan objek final.
Pastikan aturan lifecycle hanya mencakup `staging/`. Jangan menganggap R2 aktif hanya karena
environment terisi. Tanpa R2, CRUD teks dan embed video tetap tersedia.
Token R2 tidak dikirim ke browser; browser tidak pernah mendapat URL PUT untuk objek final.
Backup PostgreSQL hanya menyimpan URL/key media, **bukan objek R2**; cadangkan bucket terpisah.
Menghapus produk/media juga menghapus objek R2, sehingga restore database tidak memulihkannya.

Video produk memakai URL embed Bunny Stream atau YouTube, bukan upload ke R2.
Integrasi kelas Bunny Stream dan pembayaran Midtrans belum diaktifkan pada butir 1–5.
Rujukan konfigurasi: [Cloudflare R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/).

**Gerbang environment:**

```bash
awk -F= '/^(POSTGRES_PASSWORD|SESSION_SECRET|ADMIN_PASSWORD_HASH)=/ && length($2) < 20 { print "BELUM DIISI: " $1 }' .env.production
docker compose --env-file .env.production config --quiet
```

Keduanya tidak boleh menghasilkan pesan error atau baris `BELUM DIISI`.

## 5. Build image aplikasi

```bash
docker compose --env-file .env.production build app
```

Build bersifat hermetic: tidak memerlukan database aktif karena data Academy diambil
saat request pertama.

**Gerbang:** perintah selesai dengan kode `0` dan `docker image ls | grep shanatech`
menampilkan image aplikasi.

## 6. Nyalakan database, migrasi, dan data awal

```bash
docker compose --env-file .env.production up -d db
docker compose --env-file .env.production ps db
docker compose --env-file .env.production logs --tail=30 db
```

**Gerbang:** kolom status `db` menunjukkan `healthy`.

Terapkan skema:

```bash
docker compose --env-file .env.production run --rm app node scripts/migrate.mjs
```

**Gerbang:** keluaran `✓ Skema database siap.`

Untuk **deployment pertama** pada database kosong, isi data contoh:

```bash
docker compose --env-file .env.production run --rm app node scripts/seed.mjs
```

> **Peringatan:** `seed.mjs` mengosongkan seluruh tabel sebelum mengisi data contoh.
> Jalankan **hanya sekali** pada database baru. Jangan pernah menjalankannya setelah
> ada data pendaftaran atau pesan asli.

**Gerbang:**

```bash
docker compose --env-file .env.production exec -T db \
  sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select count(*) as courses from courses;"'
```

Jumlah `courses` harus lebih dari nol.

## 7. Jalankan aplikasi

```bash
docker compose --env-file .env.production up -d app
docker compose --env-file .env.production ps app
curl -fsS http://127.0.0.1:3000/api/health
```

**Gerbang:** status `app` menjadi `healthy` dan health check mengembalikan
`{"status":"ok"}`.

Untuk melihat situs dari komputer Anda sebelum DNS/HTTPS siap, buat SSH tunnel:

```bash
ssh -L 3000:127.0.0.1:3000 user@IP-VPS
```

lalu buka `http://localhost:3000`.

## 8. Aktifkan HTTPS dengan Caddy

Pastikan DNS pada langkah 1 sudah aktif dan `SITE_DOMAIN` sudah terisi.

```bash
docker compose --env-file .env.production --profile tls up -d
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs --tail=50 caddy
```

Jika `NEXT_PUBLIC_SITE_URL` berubah setelah image dibangun, build ulang:

```bash
docker compose --env-file .env.production build app
docker compose --env-file .env.production up -d app
```

**Gerbang:** `curl -I https://DOMAIN-ANDA` menghasilkan `HTTP/2 200` (atau `307` ke
`/admin` bila mengakses path admin) dan sertifikat valid. Caddy mengambil sertifikat
otomatis; kegagalan biasanya karena DNS belum mengarah atau port 80/443 tertutup.

## 9. Verifikasi panel admin dan backup

1. Buka `https://DOMAIN-ANDA/admin`, masuk dengan `ADMIN_EMAIL` dan password yang
   di-hash pada langkah 4.
2. Buka **Backup & Restore**, klik **Buat backup sekarang**.
3. Unduh satu berkas `.dump` dan pastikan ukurannya wajar (belasan KB untuk data contoh).
4. Uji restore hanya jika data boleh diganti.

**Gerbang:** backup muncul di daftar dan dapat diunduh; health check tetap `ok`.

Volume backup dapat diperiksa dengan:

```bash
docker volume ls | grep backups
docker compose --env-file .env.production exec app ls -lh /app/backups
```

## 10. Alur update

```bash
cd /opt/shanatech
git pull --ff-only
docker compose --env-file .env.production build app
docker compose --env-file .env.production run --rm app node scripts/migrate.mjs
docker compose --env-file .env.production up -d app
curl -fsS https://DOMAIN-ANDA/api/health
```

- Jalankan `migrate.mjs` hanya bila `db/schema.sql` berubah.
- Jangan menjalankan `seed.mjs` pada database produksi.
- Jika ada perubahan skema yang tidak kompatibel, buat backup dari panel admin lebih dulu.

Rollback: `git checkout <commit-lama>`, build ulang, lalu `up -d app`.

## 11. Operasional rutin

```bash
docker compose --env-file .env.production logs -f app
docker compose --env-file .env.production restart app
docker system df
df -h
```

Backup offsite database (selain fitur backup di panel):

```bash
docker compose --env-file .env.production exec -T db \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' \
  > "/root/shanatech-$(date +%F).dump"
```

Salin berkas `/root/shanatech-*.dump` ke penyimpanan lain secara berkala. Fitur backup
di panel menyimpan maksimal 7 berkas terbaru di volume `shanatech_backups`.

Bersihkan image lama bila disk menipis:

```bash
docker image prune -f
```

## 12. Keamanan

- `.env.production` hanya boleh dibaca pemilik (`chmod 600`).
- Port publik hanya 22, 80, 443. Port `3000` terikat `127.0.0.1`; database tidak
  membuka port ke host.
- Ganti `SESSION_SECRET` untuk membatalkan semua sesi admin yang aktif.
- Perbarui image dasar dan Docker secara berkala, lalu build ulang.
- Simpan salinan backup di luar VPS.

## Troubleshooting

| Gejala | Penyebab umum | Tindakan |
| --- | --- | --- |
| `db` tidak `healthy` | Password env berubah setelah volume dibuat | Samakan `POSTGRES_PASSWORD` atau hapus volume hanya jika data boleh hilang |
| `app` unhealthy / 502 | Database belum siap atau kredensial salah | `docker compose logs app`, cek `DATABASE_URL` dan status `db` |
| Build mati (OOM) | RAM VPS kurang | Tambah swap seperti langkah 0 atau pakai VPS 4 GB |
| Caddy gagal menerbitkan sertifikat | DNS belum mengarah / port 80-443 tertutup | Periksa `dig`, `ufw`, dan log `caddy` |
| `pg_dump: server version mismatch` | Klien lama | Image ini memakai `postgresql-client-18`; build ulang image |
| Backup gagal menulis | Volume tidak bisa ditulis user `nextjs` | Pastikan `BACKUP_DIR=/app/backups` dan container dijalankan lewat entrypoint bawaan |
| `DATABASE_URL` tidak valid | Karakter khusus pada password | Gunakan password hex seperti pada langkah 4 |
