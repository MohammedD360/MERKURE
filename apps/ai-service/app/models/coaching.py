from typing import Optional
from pydantic import BaseModel, Field


class TraderContext(BaseModel):
    style: str = "inconnu"
    markets: list[str] = []
    experience_years: int = 0


class KpisContext(BaseModel):
    win_rate: float = 0.0
    profit_factor: float = 0.0
    sharpe_ratio: float = 0.0
    max_drawdown: float = 0.0
    total_trades: int = 0
    avg_rr: float = 0.0
    total_pnl: float = 0.0


class CoachingRequest(BaseModel):
    trader_context: TraderContext
    kpis: KpisContext
    # Bornes défensives : sans elles, un bug côté Node (ou un abus si le secret
    # inter-services fuite) peut faire exploser le coût Anthropic en entrée sans
    # jamais dépasser la limite de sortie (max_tokens côté service Claude).
    recent_trades_summary: str = Field(default="", max_length=8000)
    question: Optional[str] = Field(default=None, max_length=2000)


class CoachingResponse(BaseModel):
    analysis: str
    input_tokens: int
    output_tokens: int
    cache_read_tokens: int
