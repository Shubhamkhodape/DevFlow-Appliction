# ☸ DevFlow CI/CD Platform

Enterprise DevSecOps platform — React frontend · Node.js/Express API · PostgreSQL · Redis · Docker · Kubernetes

---

## Architecture

```
devflow/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx         # Root layout + sidebar + routing
│   │   ├── constants.js    # Theme tokens, static seed data
│   │   ├── utils.js        # Colour helpers, log generator, genId
│   │   ├── components/     # Reusable UI primitives
│   │   │   ├── UI.jsx          # Chip, Pill, Dot, StatCard, SevBadge, CvssBar
│   │   │   ├── LogViewer.jsx   # Streaming log panel
│   │   │   ├── PipelineFlow.jsx# Stage-by-stage flow diagram
│   │   │   ├── Gantt.jsx       # Timeline / Gantt chart
│   │   │   ├── Toasts.jsx      # Toast notification stack
│   │   │   ├── ApprovalModal.jsx
│   │   │   ├── CveDrawer.jsx   # CVE detail side-drawer
│   │   │   └── YamlEditor.jsx  # Pipeline-as-code editor
│   │   └── views/          # Full-page views (one per nav item)
│   │       ├── LoginView.jsx
│   │       ├── DashboardView.jsx
│   │       ├── ProjectsView.jsx
│   │       ├── PipelinesView.jsx
│   │       ├── SecurityView.jsx
│   │       ├── ArtifactsView.jsx
│   │       ├── KubernetesView.jsx
│   │       └── ObservabilityView.jsx
│   ├── nginx.conf          # Nginx config for container
│   ├── Dockerfile          # Multi-stage build
│   └── package.json
│
├── backend/                # Node.js Express REST API
│   ├── src/
│   │   ├── index.js        # App bootstrap, middleware, routes, metrics
│   │   ├── db.js           # PostgreSQL connection pool
│   │   ├── redis.js        # Redis client
│   │   ├── routes/
│   │   │   ├── auth.js         # POST /login, /register, GET /me
│   │   │   ├── projects.js     # CRUD /api/projects
│   │   │   ├── pipelines.js    # Trigger, list, update runs
│   │   │   ├── artifacts.js    # Artifact registry
│   │   │   └── security.js     # Vulnerability ingestion & query
│   │   └── middleware/
│   │       ├── auth.js         # JWT verification
│   │       └── rbac.js         # Role-based access (Admin / Developer)
│   ├── migrations/
│   │   └── 001_init.sql    # Full PostgreSQL schema (5 tables + indexes)
│   ├── Dockerfile
│   └── package.json
│
├── k8s/                    # Kubernetes manifests (AKS)
│   ├── namespace.yaml
│   ├── postgres.yaml       # StatefulSet + headless Service
│   ├── redis.yaml          # Deployment + Service
│   ├── backend.yaml        # Deployment + Service
│   └── frontend.yaml       # Deployment + Service + Ingress
│
├── .github/workflows/
│   └── deploy.yml          # CI: test → scan → build → deploy
│
├── docker-compose.yml      # Full local stack (pg + redis + backend + frontend)
├── .env.example            # Environment variable template
└── .gitignore
```

---

## Quick start (local)

```bash
# 1. Clone and enter the project
git clone <your-repo>
cd devflow

# 2. Copy and fill in environment variables
cp .env.example backend/.env
# Edit backend/.env — at minimum set DB_PASSWORD and JWT_SECRET

# 3. Start all services
docker compose up --build

# 4. Open the app
open http://localhost:3000
# Login: admin / admin123  or  dev / dev123
```

---

## Development (without Docker)

```bash
# Prerequisites: Node 20+, PostgreSQL 15, Redis 7

# 1. Apply database schema
psql -U devflow_user -d devflow -f backend/migrations/001_init.sql

# 2. Backend
cd backend && cp ../.env.example .env   # fill in values
npm install && npm run dev              # runs on :4000

# 3. Frontend (new terminal)
cd frontend && npm install && npm run dev   # runs on :3000
```

---

## API reference

| Method | Path                        | Auth     | Description                      |
|--------|-----------------------------|----------|----------------------------------|
| POST   | /api/auth/register          | —        | Create account                   |
| POST   | /api/auth/login             | —        | Returns JWT                      |
| GET    | /api/auth/me                | JWT      | Current user info                |
| GET    | /api/projects               | JWT      | List all projects                |
| POST   | /api/projects               | JWT      | Create project                   |
| PATCH  | /api/projects/:id           | JWT      | Update project                   |
| DELETE | /api/projects/:id           | Admin    | Delete project                   |
| GET    | /api/pipelines              | JWT      | List runs (filter by project)    |
| POST   | /api/pipelines/trigger      | JWT      | Trigger a new run                |
| PATCH  | /api/pipelines/:id          | JWT      | Update run status/stages         |
| POST   | /api/pipelines/:id/approve  | Admin    | Approve production deploy        |
| GET    | /api/artifacts              | JWT      | List artifacts                   |
| POST   | /api/artifacts              | JWT      | Register artifact                |
| DELETE | /api/artifacts/:id          | Admin    | Delete artifact                  |
| GET    | /api/security               | JWT      | List vulnerabilities             |
| GET    | /api/security/summary       | JWT      | Count by severity                |
| POST   | /api/security               | JWT      | Ingest findings from scanner     |
| GET    | /health                     | —        | Health check                     |
| GET    | /metrics                    | —        | Prometheus scrape endpoint       |

---

## Kubernetes deployment

```bash
kubectl apply -f k8s/namespace.yaml

kubectl create secret generic postgres-secret \
  --from-literal=username=devflow_user \
  --from-literal=password=<strong-password> \
  -n devflow

kubectl create secret generic backend-secret \
  --from-env-file=backend/.env \
  -n devflow

kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl wait --for=condition=ready pod/postgres-0 -n devflow --timeout=120s
kubectl exec -n devflow postgres-0 -- psql -U devflow_user -d devflow \
  -f /migrations/001_init.sql
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

kubectl get pods -n devflow
```

---

## GitHub Actions secrets required

| Secret              | Description                        |
|---------------------|------------------------------------|
| `AZURE_CREDENTIALS` | Service principal JSON for AKS     |
| `SNYK_TOKEN`        | Snyk API token for dep scanning    |

---

## Tech stack

| Layer          | Technology              |
|----------------|-------------------------|
| Frontend       | React 18, Vite          |
| Backend        | Node.js 20, Express 4   |
| Database       | PostgreSQL 15           |
| Cache/Sessions | Redis 7                 |
| Container      | Docker, Nginx           |
| Orchestration  | Kubernetes (AKS)        |
| Monitoring     | Prometheus, prom-client |
| CI/CD          | GitHub Actions          |
| Security       | Veracode SAST, Snyk     |
| Registry       | JFrog Artifactory       |
# DevFlow-Appliction
