# ClinicFlow

Patient and appointment management web app for a small clinic (PERN stack).

- Authentication with JWT and two roles (`admin`, `staff`)
- Patients: create, edit, search (name or CIN), pagination, delete (admin only)
- Appointments: create, filter by date and status, update status
- Business rule: a patient cannot have two **confirmed** appointments less than 30 minutes apart
- Dashboard: total patients, appointments today, pending count, confirmed count

Database design and justifications: [docs/CONCEPTION.md](docs/CONCEPTION.md)

## Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL 16 (UUID keys, ENUM types, `pg_trgm` index) |
| Backend | Node.js, Express 4, `pg`, Zod (validation), bcryptjs, jsonwebtoken |
| Frontend | React 19, Vite, React Router, Axios |

## Architecture

```
backend/
  db/migrations/001_init.sql   schema, enums, indexes
  scripts/                     migrate.js, seed.js
  src/
    routes/                    URL -> controller (+ auth, role and validation middlewares)
    controllers/               HTTP layer (req/res only)
    services/                  business logic and SQL
    validators/                Zod schemas
    middlewares/               auth (JWT), role check, validation, error handler
    utils/                     AppError, asyncHandler
frontend/
  src/pages/                   Login, Dashboard, Patients, PatientDetails, Appointments
  src/api.js                   Axios instance (adds the JWT, handles 401)
  src/AuthContext.jsx          login state shared by the app
```

## Prerequisites

- Node.js 20.19+ (or 22+)
- Docker (for PostgreSQL), or a local PostgreSQL 14+ with the `contrib` extensions (`pg_trgm`)

## Installation

### 1. Database

```bash
docker run --name clinicflow-db \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=clinicflow \
  -p 5432:5432 -d postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # then set JWT_SECRET to a long random value
npm install
npm run migrate             # creates tables, enums and indexes
npm run seed                # inserts test data
npm run dev                 # API on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # app on http://localhost:5173
```

## Environment variables

**backend/.env**

| Variable | Example | Description |
|---|---|---|
| `PORT` | `4000` | API port |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/clinicflow` | PostgreSQL connection string |
| `JWT_SECRET` | `<long random string>` | Secret used to sign tokens (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `8h` | Token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

**frontend/.env**

| Variable | Example |
|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` |

## Commands

| Where | Command | What it does |
|---|---|---|
| backend | `npm run dev` | Start API with auto-reload |
| backend | `npm start` | Start API |
| backend | `npm run migrate` | Run the SQL migration (run once on an empty database) |
| backend | `npm run seed` | Reset and fill test data (**deletes existing data**) |
| frontend | `npm run dev` | Start the dev server |
| frontend | `npm run build` | Production build |

To start again from an empty database:

```bash
docker exec clinicflow-db psql -U postgres -d clinicflow \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cd backend && npm run migrate && npm run seed
```

## Test accounts (seed)

All passwords: `Password123!`

| Email | Role |
|---|---|
| admin@clinic.com | admin |
| staff1@clinic.com | staff |
| staff2@clinic.com | staff |

The seed also creates 5 patients and 10 appointments (mix of pending, confirmed and cancelled).

## API endpoints

All routes except login require `Authorization: Bearer <token>`.

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | public | Login with email and password, returns a JWT |
| GET | `/api/auth/me` | auth | Current user |
| POST | `/api/patients` | auth | Create a patient |
| GET | `/api/patients?search=&page=&limit=` | auth | Paginated list, search by full name or CIN |
| GET | `/api/patients/:id` | auth | Patient details |
| PUT | `/api/patients/:id` | auth | Update a patient |
| DELETE | `/api/patients/:id` | **admin** | Delete a patient (and their appointments) |
| POST | `/api/appointments` | auth | Create an appointment |
| GET | `/api/appointments?date=&status=&patientId=` | auth | List with filters (`date` is `YYYY-MM-DD`) |
| PATCH | `/api/appointments/:id/status` | auth | Change status (`pending`, `confirmed`, `cancelled`) |
| GET | `/api/dashboard/stats` | auth | Dashboard counters |

### HTTP status codes

| Code | Meaning |
|---|---|
| 400 | Invalid input (Zod validation, malformed UUID) |
| 401 | Missing, invalid or expired token, or wrong credentials |
| 403 | Authenticated but not allowed (staff trying to delete a patient) |
| 404 | Resource not found |
| 409 | Conflict: duplicate CIN, or the 30-minute rule |
| 500 | Unexpected server error |

## Business rule: 30-minute window

A patient cannot have two confirmed appointments less than 30 minutes apart (exactly 30 minutes apart is allowed).

- It is checked in the service layer when an appointment is **created** as confirmed, and when a status is **changed to** confirmed (the appointment itself is excluded from the check).
- The check runs inside a transaction that locks the patient row (`SELECT ... FOR UPDATE`), so two simultaneous requests cannot both succeed.
- Pending and cancelled appointments are never in conflict.

## Security

- Passwords hashed with bcrypt, never returned by the API
- JWT signed with `JWT_SECRET`, verified by an auth middleware; a role middleware protects admin-only routes
- All SQL uses parameterized queries (no string concatenation)
- Input validated with Zod before reaching the services
- Generic login error message (does not reveal whether the email exists)

## Known limitations and possible improvements

- No automated tests yet (Jest + Supertest would be the next step)
- No refresh tokens: a JWT cannot be revoked before it expires
- Token stored in `localStorage` in the frontend (simple, but exposed to XSS)
- Hard delete of patients; a soft delete (`deleted_at`) and an audit log would be safer for medical data
- No rate limiting on the login route
- The 30-minute rule could also be enforced in the database with an `EXCLUDE` constraint
