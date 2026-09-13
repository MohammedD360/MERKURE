import asyncio

import pandas as pd
from fastapi import APIRouter

from ..models.trades import KpisRequest, KpisResponse
from ..services.quant import compute_full_kpis

router = APIRouter()


def _compute(req: KpisRequest) -> dict:
    df = pd.DataFrame([t.model_dump() for t in req.trades])

    required_cols = ["pnl", "open_time", "close_time", "direction", "symbol"]
    for col in required_cols:
        if col not in df.columns:
            df[col] = None

    return compute_full_kpis(df)


@router.post("", response_model=KpisResponse)
async def compute_kpis(req: KpisRequest) -> KpisResponse:
    # pandas est synchrone/CPU-bound : le décharger dans un threadpool évite de
    # bloquer la boucle asyncio (donc les autres requêtes coaching concurrentes)
    # sur un service qui tourne avec un seul worker uvicorn.
    result = await asyncio.to_thread(_compute, req)
    return KpisResponse(**result)
