from fastapi import APIRouter, HTTPException

from ..models.coaching import CoachingRequest, CoachingResponse
from ..services.coaching import get_coaching_analysis

router = APIRouter()


@router.post("", response_model=CoachingResponse)
async def coaching(req: CoachingRequest) -> CoachingResponse:
    try:
        result = await get_coaching_analysis(
            trader_context=req.trader_context.model_dump(),
            kpis=req.kpis.model_dump(),
            recent_trades_summary=req.recent_trades_summary,
            question=req.question,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Claude API error: {exc}") from exc

    return CoachingResponse(**result)
