"""
Calculs quantitatifs financiers — deterministes, 0 LLM.
Sharpe, Drawdown, Win Rate, Profit Factor, Lot Size, etc.
"""

import numpy as np
import pandas as pd
from typing import Optional


def calculate_sharpe_ratio(
    returns: pd.Series,
    risk_free_rate: float = 0.04,
    periods_per_year: int = 252,
) -> float:
    """Sharpe ratio annualisé sur série de rendements journaliers."""
    if returns.empty or returns.std() == 0:
        return 0.0
    excess = returns - (risk_free_rate / periods_per_year)
    return float((excess.mean() / excess.std()) * np.sqrt(periods_per_year))


def calculate_max_drawdown(equity_curve: pd.Series) -> float:
    """Drawdown maximum en pourcentage (valeur négative)."""
    if equity_curve.empty:
        return 0.0
    rolling_max = equity_curve.expanding(min_periods=1).max()
    drawdown = (equity_curve - rolling_max) / rolling_max
    return float(drawdown.min())


def calculate_profit_factor(trades_df: pd.DataFrame) -> float:
    """Ratio gains bruts / pertes brutes. > 1 = profitable."""
    if trades_df.empty or "pnl" not in trades_df.columns:
        return 0.0
    gross_profit = trades_df[trades_df["pnl"] > 0]["pnl"].sum()
    gross_loss = abs(trades_df[trades_df["pnl"] < 0]["pnl"].sum())
    if gross_loss == 0:
        return float("inf") if gross_profit > 0 else 0.0
    return float(gross_profit / gross_loss)


def calculate_win_rate(trades_df: pd.DataFrame) -> float:
    """Pourcentage de trades gagnants."""
    if trades_df.empty or "pnl" not in trades_df.columns:
        return 0.0
    closed = trades_df[trades_df["pnl"].notna()]
    if len(closed) == 0:
        return 0.0
    wins = len(closed[closed["pnl"] > 0])
    return float(wins / len(closed))


def calculate_average_rr(trades_df: pd.DataFrame) -> float:
    """Risk/Reward moyen (avg_win / avg_loss)."""
    if trades_df.empty or "pnl" not in trades_df.columns:
        return 0.0
    wins = trades_df[trades_df["pnl"] > 0]["pnl"]
    losses = trades_df[trades_df["pnl"] < 0]["pnl"]
    if losses.empty or wins.empty:
        return 0.0
    avg_win = wins.mean()
    avg_loss = abs(losses.mean())
    return float(avg_win / avg_loss) if avg_loss > 0 else 0.0


def calculate_optimal_lot_size(
    account_balance: float,
    risk_percent: float,
    stop_loss_pips: int,
    pip_value_per_lot: float,
) -> float:
    """
    Calcule le lot size optimal selon le risque paramétré.
    risk_percent : ex 0.02 pour 2%
    pip_value_per_lot : valeur en devise compte d'1 pip pour 1 lot standard
    """
    if stop_loss_pips <= 0 or pip_value_per_lot <= 0:
        return 0.0
    risk_amount = account_balance * risk_percent
    raw_lots = risk_amount / (stop_loss_pips * pip_value_per_lot)
    return round(max(0.01, raw_lots), 2)


def compute_full_kpis(
    trades_df: pd.DataFrame,
    equity_curve: Optional[pd.Series] = None,
) -> dict:
    """
    Calcule tous les KPIs à partir du DataFrame de trades.
    trades_df colonnes attendues: pnl, open_time, close_time, direction, symbol
    """
    closed = trades_df[trades_df["pnl"].notna()].copy()

    if equity_curve is None and not closed.empty:
        equity_curve = closed.sort_values("close_time")["pnl"].cumsum()

    return {
        "win_rate": calculate_win_rate(closed),
        "profit_factor": calculate_profit_factor(closed),
        "sharpe_ratio": (
            calculate_sharpe_ratio(equity_curve)
            if equity_curve is not None and not equity_curve.empty
            else 0.0
        ),
        "max_drawdown": (
            calculate_max_drawdown(equity_curve)
            if equity_curve is not None and not equity_curve.empty
            else 0.0
        ),
        "avg_rr": calculate_average_rr(closed),
        "total_trades": len(closed),
        "total_pnl": float(closed["pnl"].sum()) if not closed.empty else 0.0,
        "avg_pnl": float(closed["pnl"].mean()) if not closed.empty else 0.0,
        "best_trade": float(closed["pnl"].max()) if not closed.empty else 0.0,
        "worst_trade": float(closed["pnl"].min()) if not closed.empty else 0.0,
    }
