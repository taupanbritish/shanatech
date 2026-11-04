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
