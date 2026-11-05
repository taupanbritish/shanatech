# SHANATECH — Company Profile & Shanatech Academy

Website company profile SHANATECH sekaligus LKP (Lembaga Kursus dan Pelatihan) Shanatech Academy.
Dibangun dengan Next.js 16 (App Router, Server Components, Cache Components), Tailwind CSS v4,
Framer Motion, dan PostgreSQL.

## Halaman

| Route | Isi | Rendering |
| --- | --- | --- |
| `/` | Hero, layanan unggulan, dua jalur layanan, sorotan Academy, testimoni | Static (SSG) |
| `/about` | Cerita, filosofi nama (SHA — Shatara, NA — Shazia), visi-misi, nilai, perjalanan | Static (SSG) |
| `/services` | 6 layanan, model kerja sama, proses 5 langkah, tech stack | Static (SSG) |
| `/why-us` | Alasan memilih SHANATECH (tab interaktif) + jaminan tertulis | Static (SSG) |
| `/academy` | Katalog program, jadwal batch real-time, formulir pendaftaran | Partial Prerender (data PostgreSQL) |
| `/contact` | Formulir konsultasi proyek + kanal kontak | Static shell + Server Action |
| `/admin/login` | Login panel admin | Dynamic |
| `/admin` | Dashboard pendaftaran, pesan, program, dan batch | Dynamic (auth) |
| `/admin/pendaftaran` | Filter, cari, dan ubah status pendaftar Academy | Dynamic (auth) |
| `/admin/pesan` | Kelola pesan konsultasi klien | Dynamic (auth) |
| `/admin/program` | CRUD program Academy (aktif/nonaktif, unggulan) | Dynamic (auth) |
| `/admin/jadwal` | CRUD batch/jadwal, kuota, dan status pendaftaran | Dynamic (auth) |

## Prasyarat

- Node.js 20+ (mesin ini memakai Node 24 di `~/.local/node`)
- PostgreSQL 14+ (mesin ini memakai PostgreSQL 18, port `5433`)

### Menjalankan PostgreSQL

Database proyek ini menumpang klaster PostgreSQL di `~/pgdata/sekolah` pada port `5433`.
Klaster tidak menyala otomatis setelah restart, jadi nyalakan dulu sebelum `npm run dev`:

```bash
/Library/PostgreSQL/18/bin/pg_ctl -D "$HOME/pgdata/sekolah" -l /tmp/pg-sekolah.log -o "-p 5433" start
/Library/PostgreSQL/18/bin/pg_isready -h 127.0.0.1 -p 5433
```

Hentikan dengan `pg_ctl -D "$HOME/pgdata/sekolah" stop`.
Jika halaman `/academy` menampilkan `connect ECONNREFUSED 127.0.0.1:5433`,
artinya PostgreSQL belum menyala — jalankan perintah di atas lalu muat ulang halaman.
`npm run build` tidak memerlukan PostgreSQL aktif; katalog Academy diambil saat request
pertama lalu disimpan di cache.

Semua perintah npm di mesin ini perlu PATH tambahan:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

## Setup

1. Salin environment:

   ```bash
   cp .env.example .env.local
   ```

   Isi `.env.local`:

   ```env
   DATABASE_URL=postgres://shanatech:shanatech@127.0.0.1:5433/shanatech
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   RESEND_API_KEY=
   RESEND_FROM="SHANATECH <onboarding@resend.dev>"
   NOTIFY_EMAIL=hello@shanatech.web.id

   # Panel admin
   ADMIN_EMAIL=admin@shanatech.id
   ADMIN_PASSWORD_HASH=scrypt:salt:hash
   SESSION_SECRET=hex-64-karakter
   ```

   Buat hash password dan session secret:

   ```bash
   npm run admin:hash -- "password-minimal-8-karakter"
   openssl rand -hex 32
   ```

   Format hash memakai titik dua (`scrypt:salt:hash`), bukan `$`, karena loader `.env`
   Next.js melakukan ekspansi variabel dan akan memotong nilai yang mengandung `$`.
   Panel admin hanya mendukung satu akun yang ditentukan lewat environment.

2. Siapkan database dan data demo (12 program, 9 batch, contoh pendaftar):

   ```bash
   npm run db:setup
   ```

   Perintah ini menjalankan `scripts/migrate.mjs` (skema idempoten) lalu `scripts/seed.mjs`
   (reset data contoh). Skema lengkap ada di `db/schema.sql`.

3. Jalankan development server:

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Panel admin

Panel tersedia di [http://localhost:3000/admin](http://localhost:3000/admin) dan dilindungi
login. Untuk demo lokal, `.env.local` menyertakan akun:

- Email: `admin@shanatech.id`
- Password: `shanatech2026`

Ganti keduanya sebelum dipakai di server nyata:

```bash
npm run admin:hash -- "password-baru-minimal-8-karakter"
openssl rand -hex 32
```

lalu perbarui `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, dan `SESSION_SECRET`, kemudian restart server.

Fitur:

- **Dashboard** — jumlah pendaftar baru, pesan baru, program aktif, batch dibuka, pendaftaran
  terbaru, dan progres kuota batch terdekat.
- **Pendaftaran** — filter status (Baru, Dihubungi, Terdaftar, Batal), pencarian nama/email/telepon,
  tautan email & telepon, catatan peserta, dan ubah status langsung dari kartu. Pendaftaran yang
  sudah berstatus **Batal** dapat dihapus permanen dengan konfirmasi.
- **Pesan** — filter status (Baru, Diproses, Selesai), pencarian, balas via email/WhatsApp,
  indikator email terkirim.
- **Program** — tambah, ubah, hapus, aktif/nonaktifkan, dan tandai program unggulan. Program yang
  sudah punya pendaftar tidak bisa dihapus (nonaktifkan saja).
- **Jadwal** — tambah, ubah, hapus batch; kuota tidak boleh lebih kecil dari peserta aktif, dan
  batch dengan peserta aktif tidak bisa dihapus.

Keamanan:

- Password disimpan sebagai hash scrypt di environment; verifikasi memakai `timingSafeEqual`.
- Sesi berupa cookie httpOnly `SameSite=Lax` bertanda tangan HMAC-SHA256, berlaku 8 jam, dan
  `Secure` pada production.
- Login dibatasi 6 percobaan per 10 menit per alamat IP.
- Setiap Server Action admin memverifikasi ulang sesi; `proxy.ts` hanya melakukan pengalihan
  optimistis. Halaman admin memakai `noindex` dan diblokir di `robots.txt`.

## Skema database

- `courses` — program Komputer & Bahasa Inggris (harga, durasi, sesi, mode, highlights).
- `schedules` — batch aktif per program (tanggal, jam, instruktur, ruang, kuota, status).
- `registrations` — pendaftaran siswa dari formulir Academy; unik per email + batch aktif
  (`registrations_unique_active_seat`), sehingga email yang sama tidak bisa mendaftar dua kali
  pada batch yang sama.
- `contact_messages` — konsultasi proyek dari halaman Contact, termasuk status `email_sent`.

Pendaftaran memakai transaksi dengan `SELECT … FOR UPDATE` agar kuota batch tidak terjual
melebihi kapasitas saat ada pendaftaran bersamaan.

## Email notifikasi

Formulir mengirim notifikasi ke tim sales/admin melalui Resend REST API (`src/lib/email.ts`).
Tanpa `RESEND_API_KEY`, data tetap tersimpan di PostgreSQL dan pengiriman email dilewati
(`contact_messages.email_sent = false`) — aplikasi tidak gagal.

Untuk mengaktifkan pengiriman:

1. Buat API key di [resend.com](https://resend.com).
2. Verifikasi domain pengirim, lalu isi `RESEND_API_KEY` dan `RESEND_FROM`.
3. Isi `NOTIFY_EMAIL` dengan alamat tim yang menerima pendaftaran/konsultasi.

## Backup & restore

Menu **Backup & Restore** di panel admin (`/admin/backup`) membuat dump PostgreSQL format
custom, mengunduh, menghapus, dan memulihkan database.

- Berkas disimpan di `./backups` atau mengikuti `BACKUP_DIR`. Folder ini tidak ikut Git.
- Retensi otomatis: 7 backup terbaru; berkas lebih lama dihapus saat backup baru dibuat.
- Proses membutuhkan biner `pg_dump` dan `pg_restore` pada server. Jika tidak ada di `PATH`,
  isi `PG_DUMP_PATH` dan `PG_RESTORE_PATH` (misalnya `/usr/lib/postgresql/18/bin/pg_dump`).
- Restore membuat backup keamanan terlebih dahulu, lalu menjalankan `pg_restore` dalam satu
  transaksi. Jika gagal, data lama tidak berubah.
- Hanya menerima `.dump` format custom (`pg_dump --format=custom`) maksimal 200 MB.
- Deploy wajib memakai disk persisten. Filesystem serverless/Vercel bersifat sementara,
  sehingga berkas backup akan hilang dan biner PostgreSQL tidak tersedia.

## Deploy ke VPS (Docker)

Repositori menyertakan `Dockerfile`, `docker-compose.yml`, dan `DEPLOY.md`. Ringkasnya:

```bash
cp .env.production.example .env.production
# isi .env.production (lihat DEPLOY.md langkah 4)
docker compose --env-file .env.production build app
docker compose --env-file .env.production up -d db
docker compose --env-file .env.production run --rm app node scripts/migrate.mjs
docker compose --env-file .env.production run --rm app node scripts/seed.mjs  # hanya database baru
docker compose --env-file .env.production up -d app
docker compose --env-file .env.production --profile tls up -d  # HTTPS via Caddy
```

Ikuti urutan lengkap beserta gerbang verifikasinya di [DEPLOY.md](DEPLOY.md).

## Skrip

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # jalankan hasil build
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run db:migrate # terapkan db/schema.sql
npm run db:seed    # reset & isi data contoh
npm run db:setup   # migrate + seed
npm run admin:hash -- "password"  # buat hash password admin
```

## Catatan implementasi

- Halaman statis memakai Server Components; data Academy dibaca saat request pertama di dalam
  `<Suspense>` lalu disimpan di cache, sehingga build tidak bergantung pada database.
- Validasi formulir memakai Zod di server (`src/lib/validation.ts`) dengan pesan Bahasa Indonesia,
  honeypot anti-spam, normalisasi nomor telepon, dan batas panjang input.
- Animasi Framer Motion menghormati `prefers-reduced-motion`.
