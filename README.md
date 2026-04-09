# CertifyVery

> Modern, lightweight certificate issuance and verification platform — frontend with Vite + React, backend Node.js API, and optional Docker Compose for local dev.

---

## Highlights

- Clean multi-tenant UI for citizens and officers
- PDF certificate generation from HTML templates
- Role-based backend (user, officer, senior, higher) with verification
- RAG-enabled components for intelligent assistance (AI folder present)
- Docker Compose ready for fast local setup

---

## Demo

Open `certifyvery` for the frontend and `certifyverybackend` for the API. The repo contains certificate templates under `certifyvery/src/certificate-templates`.

---

## Tech Stack

- Frontend: React + TypeScript, Vite, Tailwind CSS
- Backend: Node.js + TypeScript, Express
- Dev tooling: Docker, Docker Compose, Postgres / local storage (see backend config)
- Utilities: html2pdf-like helpers for PDF export, axios with interceptors

---

## Quickstart (recommended)

Prerequisites: `git`, `docker`, `docker-compose`, `node` (for local-only runs).

1) From repo root, start both services with Docker Compose:

```bash
docker-compose up --build
```

2) Access the frontend at `http://localhost:5173` (or the port mapped by compose) and the API at the backend port (see `docker-compose.yml`).

---

## Local dev — frontend only

```bash
# frontend
cd certifyvery
pnpm install   # or npm install / yarn
pnpm dev
```

Open the printed URL (Vite dev server).

## Local dev — backend only

```bash
cd certifyverybackend
pnpm install   # or npm install
pnpm dev       # or `ts-node-dev src/index.ts` depending on setup
```

Make sure environment variables for DB and JWT are set (see ENV section below).

---

## Environment variables

Place backend environment variables in a `.env` file (or configure your Docker secret/environ):

- `PORT` — API port
- `DATABASE_URL` — database connection string
- `JWT_SECRET` — JWT signing secret
- `MONGO_URL` or `PG_URL` — depending on chosen DB in `certifyverybackend`

Check `certifyverybackend/src` for references to specific env names used by controllers and models.

---

## Project layout (high level)

- `certifyvery/` — frontend app
  - `src/certificate-templates/` — HTML templates & certificate styles
  - `src/pages/` — routes and views
  - `src/components/` — UI building blocks
- `certifyverybackend/` — API server
  - `src/controller/` — route controllers (user, officer, ai)
  - `src/model/` — data models
  - `src/middleware/` — auth/middleware per role

---

## Certificates & PDF generation

Certificate HTML templates are ready to edit in `certifyvery/src/certificate-templates`. The frontend contains `generateCertificatePDF.ts` to produce PDFs from templates and styles.

---

## Contributing

- Fork and open a PR; please include tests or a reproducible demo for new features.
- Linting: follow the existing ESLint / TypeScript config (see `eslint.config.js`, `tsconfig.json`).

---

## Next steps / suggestions

- Add a `docker-compose.override.yml` for developer-only services (db, mock SMTP).
- Add GitHub Actions for lint/test/build and a preview deployment for PRs.

---

## License & Contact

This repo doesn't include an explicit license file. If you want an OSS license, consider adding `MIT` or `Apache-2.0`.

For questions or pairing on deployment & CI, open an issue or ping a maintainer.
