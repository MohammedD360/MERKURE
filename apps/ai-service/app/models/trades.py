from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TradeIn(BaseModel):
    id: Optional[str] = None
    pnl: Optional[float] = None
    open_time: Optional[datetime] = None
    close_time: Optional[datetime] = None
    direction: Optional[str] = None
    symbol: Optional[str] = None


class KpisRequest(BaseModel):
    # Borne défensive : un DataFrame pandas construit à partir d'une liste non
    # bornée peut saturer la RAM d'un conteneur VPS à ressources limitées.
    trades: list[TradeIn] = Field(max_length=5000)


class BestDay(BaseModel):
    pnl: float
    date: str


class KpisResponse(BaseModel):
    win_rate: float
    profit_factor: float
    sharpe_ratio: float
    max_drawdown: float
    avg_rr: float
    total_trades: int
    total_pnl: float
    avg_pnl: float
    best_trade: float
    worst_trade: float
    best_day: Optional[BestDay] = None
