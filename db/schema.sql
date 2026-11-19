-- SHANATECH · skema database
-- Jalankan dengan: npm run db:setup

CREATE TABLE IF NOT EXISTS courses (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('Komputer', 'Bahasa Inggris')),
  level         TEXT NOT NULL,
  summary       TEXT NOT NULL,
  description   TEXT NOT NULL,
  highlights    TEXT[] NOT NULL DEFAULT '{}',
  duration_label TEXT NOT NULL,
  sessions      INTEGER NOT NULL CHECK (sessions > 0),
  price         INTEGER NOT NULL CHECK (price >= 0),
  mode          TEXT NOT NULL CHECK (mode IN ('Offline', 'Online', 'Hybrid')),
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedules (
  id             SERIAL PRIMARY KEY,
  course_id      INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  batch          TEXT NOT NULL,
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  schedule_label TEXT NOT NULL,
  instructor     TEXT NOT NULL,
  room           TEXT NOT NULL,
  mode           TEXT NOT NULL CHECK (mode IN ('Offline', 'Online', 'Hybrid')),
  quota          INTEGER NOT NULL CHECK (quota > 0),
  status         TEXT NOT NULL DEFAULT 'Dibuka' CHECK (status IN ('Dibuka', 'Ditutup', 'Selesai')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, batch)
);

CREATE TABLE IF NOT EXISTS registrations (
  id          SERIAL PRIMARY KEY,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE SET NULL,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  education   TEXT,
  note        TEXT,
  status      TEXT NOT NULL DEFAULT 'Baru' CHECK (status IN ('Baru', 'Dihubungi', 'Terdaftar', 'Batal')),
  source      TEXT NOT NULL DEFAULT 'Website',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS registrations_unique_active_seat
  ON registrations (LOWER(email), schedule_id)
  WHERE status <> 'Batal' AND schedule_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS registrations_schedule_idx ON registrations (schedule_id);
CREATE INDEX IF NOT EXISTS registrations_course_idx ON registrations (course_id);
CREATE INDEX IF NOT EXISTS registrations_status_created_idx ON registrations (status, created_at DESC);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  company    TEXT,
  service    TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'Baru' CHECK (status IN ('Baru', 'Diproses', 'Selesai')),
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_status_created_idx ON contact_messages (status, created_at DESC);

-- Kolom audit untuk panel admin (idempoten untuk database yang sudah ada).
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ---------------------------------------------------------------------------
-- Ekosistem produk & LMS (butir 1). Semua pernyataan idempoten.
-- ---------------------------------------------------------------------------

-- Perluasan courses: kelas batch tatap muka tetap berjalan, kelas online mandiri
-- memakai tabel kurikulum di bawah. Kolom lama tidak diubah.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_key TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_name TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS delivery TEXT NOT NULL DEFAULT 'Batch'
  CHECK (delivery IN ('Batch', 'Mandiri'));

-- Katalog produk perangkat lunak
CREATE TABLE IF NOT EXISTS products (
  id                SERIAL PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  tagline           TEXT NOT NULL,
  category          TEXT NOT NULL
                    CHECK (category IN ('Sistem Informasi Sekolah', 'Enterprise Web', 'Mobile App')),
  description       TEXT NOT NULL,
  features          TEXT[] NOT NULL DEFAULT '{}',
  tech_stack        TEXT[] NOT NULL DEFAULT '{}',
  pricing_models    TEXT[] NOT NULL DEFAULT '{}'
                    CHECK (pricing_models <@ ARRAY['SaaS', 'Beli Putus', 'Custom']::TEXT[]),
  pricing_note      TEXT,
  demo_url          TEXT,
  demo_credentials  JSONB NOT NULL DEFAULT '[]'::JSONB
                    CHECK (jsonb_typeof(demo_credentials) = 'array'),
  demo_note         TEXT,
  case_study        TEXT,
  impact_points     TEXT[] NOT NULL DEFAULT '{}',
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  status            TEXT NOT NULL DEFAULT 'Draf' CHECK (status IN ('Draf', 'Terbit', 'Arsip')),
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_public_idx ON products (status, category, sort_order);

CREATE TABLE IF NOT EXISTS product_media (
  id           SERIAL PRIMARY KEY,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_url    TEXT NOT NULL,
  storage_key  TEXT,
  media_type   TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption      TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_media_product_idx ON product_media (product_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS product_media_storage_key_unique
  ON product_media (storage_key) WHERE storage_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS product_image_uploads (
  staging_key  TEXT PRIMARY KEY,
  final_key    TEXT NOT NULL UNIQUE,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  expires_at   TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS product_image_uploads_product_idx ON product_image_uploads (product_id);
CREATE INDEX IF NOT EXISTS product_image_uploads_expiry_idx ON product_image_uploads (expires_at);

-- Akun peserta (terpisah dari akun admin berbasis env)
CREATE TABLE IF NOT EXISTS users (
  id                 SERIAL PRIMARY KEY,
  email              TEXT NOT NULL,
  full_name          TEXT NOT NULL,
  phone              TEXT,
  password_hash      TEXT NOT NULL,
  session_version    INTEGER NOT NULL DEFAULT 1,
  email_verified_at  TIMESTAMPTZ,
  last_login_at      TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens (user_id);

-- Kurikulum kelas online
CREATE TABLE IF NOT EXISTS course_sections (
  id          SERIAL PRIMARY KEY,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS course_sections_course_idx ON course_sections (course_id, sort_order);

CREATE TABLE IF NOT EXISTS course_lessons (
  id                SERIAL PRIMARY KEY,
  section_id        INTEGER NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  content_type      TEXT NOT NULL DEFAULT 'video' CHECK (content_type IN ('video', 'article', 'quiz')),
  video_url         TEXT,
  body              JSONB,
  duration_seconds  INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  is_free_preview   BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS course_lessons_section_idx ON course_lessons (section_id, sort_order);

CREATE TABLE IF NOT EXISTS enrollments (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_id       INTEGER NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  payment_status  TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('free', 'pending', 'paid')),
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS enrollments_course_idx ON enrollments (course_id);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id                   SERIAL PRIMARY KEY,
  enrollment_id        INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id            INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  is_completed         BOOLEAN NOT NULL DEFAULT FALSE,
  last_watched_second  INTEGER NOT NULL DEFAULT 0 CHECK (last_watched_second >= 0),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS lesson_progress_lesson_idx ON lesson_progress (lesson_id);

-- Transaksi pembayaran (Midtrans). Satu baris per percobaan checkout; ID transaksi
-- gateway unik agar notifikasi webhook ganda tidak memproses akses dua kali.
CREATE TABLE IF NOT EXISTS orders (
  id                      SERIAL PRIMARY KEY,
  order_code              TEXT NOT NULL UNIQUE,
  user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_id               INTEGER NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  enrollment_id           INTEGER REFERENCES enrollments(id) ON DELETE SET NULL,
  amount                  INTEGER NOT NULL CHECK (amount >= 0),
  currency                TEXT NOT NULL DEFAULT 'IDR',
  status                  TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'paid', 'expired', 'failed', 'cancelled', 'refunded')),
  gateway                 TEXT NOT NULL DEFAULT 'midtrans',
  gateway_transaction_id  TEXT UNIQUE,
  payment_type            TEXT,
  raw_notification        JSONB,
  paid_at                 TIMESTAMPTZ,
  expires_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status, created_at DESC);

CREATE TABLE IF NOT EXISTS certificates (
  id              SERIAL PRIMARY KEY,
  enrollment_id   INTEGER NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE RESTRICT,
  code            TEXT NOT NULL UNIQUE,
  recipient_name  TEXT NOT NULL,
  course_title    TEXT NOT NULL,
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ
);
