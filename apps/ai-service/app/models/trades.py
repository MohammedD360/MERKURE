from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TradeIn(BaseModel):
    id: Optional[str] = None
    pnl: Optional[float] = None
    open_time: Optional[datetime] = None
    close_time: Optional[datetime] = None
    direction: Optional[str] = None
    symbol: Optional[str] = None


class KpisRequest(BaseModel):
    trades: list[TradeIn]


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
