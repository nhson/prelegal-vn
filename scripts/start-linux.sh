#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. See https://docs.docker.com/engine/install/"
  exit 1
fi

if [ ! -f "$PROJECT_ROOT/.env" ]; then
  echo "ERROR: .env file not found. Copy .env.example to .env and fill in your keys."
  exit 1
fi

echo "Building and starting Prelegal..."
docker compose up --build -d

echo ""
echo "Prelegal is running at http://localhost:8000"
echo "Run scripts/stop-linux.sh to stop."
