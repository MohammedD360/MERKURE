import pandas as pd
from fastapi import APIRouter

from ..models.trades import KpisRequest, KpisResponse
from ..services.quant import compute_full_kpis

router = APIRouter()


@router.post("", response_model=KpisResponse)
async def compute_kpis(req: KpisRequest) -> KpisResponse:
    df = pd.DataFrame([t.model_dump() for t in req.trades])

    required_cols = ["pnl", "open_time", "close_time", "direction", "symbol"]
    for col in required_cols:
        if col not in df.columns:
            df[col] = None

    result = compute_full_kpis(df)
    return KpisResponse(**result)
