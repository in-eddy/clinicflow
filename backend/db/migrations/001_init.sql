CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL DEFAULT 'staff',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  VARCHAR(150) NOT NULL,
  cin        VARCHAR(20)  NOT NULL UNIQUE,
  phone      VARCHAR(20)  NOT NULL,
  birth_date DATE NOT NULL,
  address    VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ NOT NULL,
  status           appointment_status NOT NULL DEFAULT 'pending',
  reason           VARCHAR(255) NOT NULL,
  notes            TEXT,
  created_by       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_full_name_trgm ON patients USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_appointments_date       ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status     ON appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient    ON appointments (patient_id, appointment_date);
