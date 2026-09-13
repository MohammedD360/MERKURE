from fastapi import FastAPI, Depends

from .core.config import settings
from .core.security import verify_service_secret
from .routes import kpis, coaching

app = FastAPI(
    title="MERKURE AI Service",
    version="0.1.0",
    docs_url="/docs" if settings.APP_ENV == "development" else None,
    redoc_url=None,
)

# Pas de CORSMiddleware : ce service n'est jamais appelé depuis un navigateur
# (CORS ne s'applique qu'aux requêtes cross-origin émises par du JS client),
# uniquement server-to-server par l'API Node via X-AI-Service-Secret. En
# garder un ici ne protège rien et documente un scénario qui n'existe pas.

app.include_router(
    kpis.router,
    prefix="/api/v1/kpis",
    dependencies=[Depends(verify_service_secret)],
    tags=["kpis"],
)
app.include_router(
    coaching.router,
    prefix="/api/v1/coaching",
    dependencies=[Depends(verify_service_secret)],
    tags=["coaching"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "merkure-ai"}
