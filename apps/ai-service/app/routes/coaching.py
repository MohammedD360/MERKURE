import anthropic
from fastapi import APIRouter, HTTPException

from ..models.coaching import CoachingRequest, CoachingResponse
from ..services.coaching import get_coaching_analysis

router = APIRouter()


@router.post("", response_model=CoachingResponse)
async def coaching(req: CoachingRequest) -> CoachingResponse:
    # Un except Exception unique traitait identiquement une clé API invalide,
    # un rate-limit retryable et un timeout réseau — le code HTTP renvoyé à
    # l'API Node doit distinguer "réessaie plus tard" de "config cassée".
    try:
        result = await get_coaching_analysis(
            trader_context=req.trader_context.model_dump(),
            kpis=req.kpis.model_dump(),
            recent_trades_summary=req.recent_trades_summary,
            question=req.question,
        )
    except anthropic.RateLimitError as exc:
        raise HTTPException(status_code=429, detail="Claude API rate limit atteint") from exc
    except (anthropic.APITimeoutError, anthropic.APIConnectionError) as exc:
        raise HTTPException(status_code=504, detail="Claude API injoignable ou trop lente") from exc
    except anthropic.AuthenticationError as exc:
        raise HTTPException(status_code=500, detail="Configuration Claude API invalide") from exc
    except anthropic.APIStatusError as exc:
        raise HTTPException(status_code=502, detail=f"Claude API error: {exc}") from exc

    return CoachingResponse(**result)
