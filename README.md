# Spanish Learning App

Monorepo: `backend` (Express + TS + Postgres), `frontend` (React + TS + Vite + Tailwind), `shared` (shared TS types).

This first vertical implements: auth, A1 curriculum (5 units / 10 lessons), lesson player, and SM-2 spaced repetition vocabulary review. The voice AI conversation partner and pronunciation trainer are not yet implemented.

## Local setup (without Docker)

1. Start Postgres locally (or via `docker compose up postgres -d`).
2. Backend:
   ```
   cd backend
   cp .env.example .env   # edit DATABASE_URL / JWT_SECRET as needed
   npm install
   npm run migrate
   npm run seed
   npm run dev            # http://localhost:4000
   ```
3. Frontend:
   ```
   cd frontend
   cp .env.example .env
   npm install
   npm run dev            # http://localhost:5173
   ```

## Local setup (Docker)

```
docker compose up --build
```

Then run migrate/seed once against the containerized Postgres:
```
cd backend && DATABASE_URL=postgres://postgres:postgres@localhost:5432/spanish_app npm run migrate
DATABASE_URL=postgres://postgres:postgres@localhost:5432/spanish_app npm run seed
```

## Tests

```
cd backend && npm test
```
