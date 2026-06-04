# Stage 1: Build Next.js static export
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend
FROM python:3.12-slim AS backend
WORKDIR /backend

RUN pip install uv --no-cache-dir

# Copy project files and sync from lockfile (reproducible builds)
COPY backend/ ./
RUN uv sync --frozen --no-dev

# Copy built frontend from previous stage
COPY --from=frontend-builder /frontend/out ./static

EXPOSE 8000

ENV PATH="/backend/.venv/bin:$PATH"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
