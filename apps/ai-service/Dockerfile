# ─────────────────────────────────────────────
# Stage 1 — builder : compilation des dépendances nécessitant gcc
# ─────────────────────────────────────────────
FROM python:3.11-slim@sha256:9534e5a8e315485d4061ed659af0fd78a284c015f9b73661b41d6bab25604534 AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ─────────────────────────────────────────────
# Stage 2 — runtime : image minimale, sans gcc, utilisateur non-root
# ─────────────────────────────────────────────
FROM python:3.11-slim@sha256:9534e5a8e315485d4061ed659af0fd78a284c015f9b73661b41d6bab25604534 AS runtime

RUN groupadd --system --gid 1001 aiservice && \
    useradd --system --uid 1001 --gid aiservice aiservice

WORKDIR /app

COPY --from=builder --chown=aiservice:aiservice /root/.local /home/aiservice/.local
COPY --chown=aiservice:aiservice . .
RUN chmod +x entrypoint.sh

USER aiservice

ENV PATH=/home/aiservice/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=3)" || exit 1

CMD ["./entrypoint.sh"]
