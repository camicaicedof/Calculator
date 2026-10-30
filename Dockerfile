FROM node:24-alpine AS frontend
WORKDIR /app/frontend
RUN corepack enable
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm test:coverage && pnpm build

FROM python:3.12-slim AS backend-test
WORKDIR /app/backend
COPY backend/ ./
RUN pip install --no-cache-dir -r requirements.txt && python -m unittest discover -s tests -v

FROM backend-test AS runtime
RUN useradd --uid 10001 --create-home calculator
COPY --from=frontend /app/frontend/dist /app/public
ENV PORT=8080 STATIC_DIR=/app/public PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
EXPOSE 8080
USER calculator
CMD ["python", "server.py"]
