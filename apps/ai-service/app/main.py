from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.security import verify_service_secret

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
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "merkure-ai"}


# Routes — activées module par module
# from .routes import score, coaching, matching, journal
# app.include_router(score.router, prefix="/api/v1/score", dependencies=[Depends(verify_service_secret)])
# app.include_router(coaching.router, prefix="/api/v1/coaching", dependencies=[Depends(verify_service_secret)])
# app.include_router(matching.router, prefix="/api/v1/match", dependencies=[Depends(verify_service_secret)])
# app.include_router(journal.router, prefix="/api/v1/journal", dependencies=[Depends(verify_service_secret)])
