# ClinicFlow

Patient and appointment management web app for a small clinic (PERN stack).

- Authentication with JWT and two roles (`admin`, `staff`)
- Patients: create, edit, search (name or CIN), pagination, delete (admin only)
- Appointments: create, filter by date and status, update status
- Business rule: a patient cannot have two **confirmed** appointments less than 30 minutes apart
- Dashboard: total patients, appointments today, pending count, confirmed count
- Users: only an admin can create and delete accounts (no public sign-up, on purpose: this app holds patient data)

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

## Quick start (Docker, one command)

```bash
docker compose up --build
```

Open http://localhost:5173 and sign in with a test account (see below, e.g. `admin@clinic.com` / `Admin123!`). On first start the database is migrated and seeded automatically; existing data is never overwritten on later starts.

```bash
docker compose down        # stop
docker compose down -v     # stop and delete the database data
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build   # custom JWT secret
```

## Development without Docker for the apps (hot reload)

PostgreSQL still runs in Docker (or use your own PostgreSQL).

```bash
npm run setup                                   # install root, backend and frontend dependencies
cp backend/.env.example backend/.env            # then set JWT_SECRET
cp frontend/.env.example frontend/.env
npm run db:up                                   # PostgreSQL in Docker
npm run db:reset                                # migrate + seed
npm run dev                                     # API (4000) and frontend (5173) together
```

## Manual installation (step by step)

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
| backend | `npm run migrate` | Run the SQL migration (safe to run several times) |
| backend | `npm run seed` | Reset and fill test data (**deletes existing data**) |
| backend | `npm run seed:if-empty` | Fill test data only if the database is empty |
| frontend | `npm run dev` | Start the dev server |
| frontend | `npm run build` | Production build |
| root | `npm run setup` | Install all dependencies |
| root | `npm run db:up` | Start PostgreSQL in Docker |
| root | `npm run db:reset` | Migrate and reseed the database |
| root | `npm run dev` | Start API and frontend together |
| root | `npm run docker` | Same as `docker compose up --build` |

To start again from an empty database (without Docker Compose):

```bash
docker exec clinicflow-db psql -U postgres -d clinicflow \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cd backend && npm run migrate && npm run seed
```

## Test accounts (seed)

Each account has its own password (and its own bcrypt hash):

| Email | Password | Role |
|---|---|---|
| admin@clinic.com | `Admin123!` | admin |
| staff1@clinic.com | `Staff123!` | staff |
| staff2@clinic.com | `Staff456!` | staff |

### Roles

| Action | staff | admin |
|---|---|---|
| Login, dashboard | yes | yes |
| Create, edit, search patients | yes | yes |
| Create appointments, change their status | yes | yes |
| Delete a patient | no (403) | yes |
| Create and list user accounts | no (403) | yes |
| Delete a user account | no (403) | yes (never their own account) |

The role is stored in the JWT. The API enforces it with a role middleware; hiding buttons in the React app is only a convenience.

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
| POST | `/api/users` | **admin** | Create an account (`fullName`, `email`, `password`, `role`) |
| GET | `/api/users` | **admin** | List accounts (never returns password hashes) |
| DELETE | `/api/users/:id` | **admin** | Delete an account (409 if it created appointments, 400 for your own account) |

### Birth date

`birthDate` accepts `YYYY-MM-DD` or `DD/MM/YYYY` and is always stored and returned as `YYYY-MM-DD`. It must be a real calendar date (no 31 February), after 1900 and not in the future; otherwise the API answers 400. The frontend displays it as `DD/MM/YYYY`.

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

## Business rule: no appointment in the past

- An appointment can only be created for a date in the future (400 otherwise); the date picker also blocks past dates.
- A pending appointment whose date has passed cannot be confirmed (400), but it can still be cancelled.

## Security

- Passwords hashed with bcrypt (one salted hash per user), never returned by the API
- Password policy when creating an account: at least 8 characters, one letter and one digit
- JWT signed with `JWT_SECRET`, verified by an auth middleware; a role middleware protects admin-only routes
- All SQL uses parameterized queries (no string concatenation)
- Input validated with Zod before reaching the services
- Generic login error message (does not reveal whether the email exists)
- The account and its role are re-read from the database on every request: a deleted account or a changed role takes effect immediately, not when the token expires

## Known limitations and possible improvements

- No automated tests yet (Jest + Supertest would be the next step)
- No refresh tokens: a session lasts up to 8h (a deleted account is refused immediately, but a user cannot be logged out on demand)
- Token stored in `localStorage` in the frontend (simple, but exposed to XSS)
- Hard delete of patients; a soft delete (`deleted_at`) and an audit log would be safer for medical data
- No rate limiting on the login route
- No "change my password" or "forgot password" flow yet
- The 30-minute rule could also be enforced in the database with an `EXCLUDE` constraint