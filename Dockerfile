# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY frontend/ ./

# Build Svelte/Vite app
RUN pnpm build

# Stage 2: Runtime Environment
FROM python:3.13-slim

# Install uv (Python package manager)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Setup Backend Directory
WORKDIR /app/backend

# Configure uv
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Install Python dependencies first (caching)
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# Copy Backend Source
COPY backend/ .

# Copy Frontend Build Artifacts to Backend Static Directory
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port 7860 (ModelScope Requirement)
EXPOSE 7860

# Run FastAPI (serving dynamic API + static files)
CMD ["/bin/uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
