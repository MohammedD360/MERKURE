from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.security import verify_service_secret
from .routes import kpis, coaching

app = FastAPI(
    title="MERKURE AI Service",
    version="0.1.0",
    docs_url="/docs" if settings.APP_ENV == "development" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Backend Node.js uniquement
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

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
