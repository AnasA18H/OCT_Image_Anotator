#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<'EOF'
Usage:
  ./run.sh                 Start dev (backend + frontend)
  ./run.sh setup           Install deps (frontend + backend + optional python venv)
  ./run.sh frontend        Start Vite dev server (frontend/)
  ./run.sh frontend:build  Lint + build Vite app
  ./run.sh backend         Start API dev server (backend/)
  ./run.sh backend:migrate Run Prisma migrate (backend/)
  ./run.sh py              Create venv + install requirements.txt

Notes:
  - Frontend runs at http://localhost:5173 (Vite default)
  - Backend runs at http://localhost:8787
  - Python tooling is optional for this project stage.
EOF
}

cmd="${1:-dev}"

setup_frontend() {
  cd "$ROOT_DIR/frontend"
  if [[ ! -f package.json ]]; then
    echo "ERROR: frontend/package.json not found"
    exit 1
  fi
  if [[ ! -d node_modules ]]; then
    echo "Installing frontend dependencies..."
    npm install
  fi
}

setup_backend() {
  cd "$ROOT_DIR/backend"
  if [[ ! -f package.json ]]; then
    echo "ERROR: backend/package.json not found"
    exit 1
  fi
  if [[ ! -d node_modules ]]; then
    echo "Installing backend dependencies..."
    npm install
  fi
}

setup_py() {
  cd "$ROOT_DIR"
  if [[ ! -f requirements.txt ]]; then
    echo "ERROR: requirements.txt not found"
    exit 1
  fi
  if [[ ! -d venv ]]; then
    echo "Creating python venv..."
    python3 -m venv venv
  fi
  echo "Installing python requirements..."
  ./venv/bin/python -m pip install --upgrade pip
  ./venv/bin/pip install -r requirements.txt
}

case "$cmd" in
  -h|--help|help)
    usage
    ;;
  setup)
    setup_frontend
    setup_backend
    setup_py || true
    echo "Setup complete."
    ;;
  dev)
    setup_frontend
    setup_backend
    (cd "$ROOT_DIR/backend" && npm run dev) &
    backend_pid=$!
    trap 'kill "$backend_pid" 2>/dev/null || true' EXIT
    cd "$ROOT_DIR/frontend"
    exec npm run dev
    ;;
  frontend)
    setup_frontend
    cd "$ROOT_DIR/frontend"
    exec npm run dev
    ;;
  frontend:build)
    setup_frontend
    cd "$ROOT_DIR/frontend"
    npm run lint
    npm run build
    ;;
  backend)
    setup_backend
    cd "$ROOT_DIR/backend"
    exec npm run dev
    ;;
  backend:migrate)
    setup_backend
    cd "$ROOT_DIR/backend"
    exec npx prisma migrate dev
    ;;
  py)
    setup_py
    ;;
  *)
    echo "Unknown command: $cmd"
    echo
    usage
    exit 2
    ;;
esac

