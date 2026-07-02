"""
Coaching IA — utilise Claude API avec prompt caching.
"""

import anthropic
from ..core.config import settings


client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """Tu es MERKURE AI, un coach de trading expert, précis et bienveillant.
Tu analyses les performances d'un trader et fournis des conseils actionnables et personnalisés.

Règles absolues :
- Tu n'es PAS un conseiller en investissement au sens légal
- Tu analyses UNIQUEMENT des performances passées, jamais de prédictions de marché
- Sois concis, structuré, actionnable — pas de blabla générique
- Adapte-toi à la langue de l'utilisateur (FR/EN)
- Format : Markdown avec sections claires

Expertise : analyse comportementale, gestion du risque, psychologie du trading, métriques quantitatives."""


def build_coaching_prompt(
    style: str,
    markets: list[str],
    experience_years: int,
    win_rate: float,
    profit_factor: float,
    sharpe: float,
    max_drawdown: float,
    nb_trades: int,
    recent_trades_summary: str,
    question: str | None = None,
) -> str:
    return f"""## Profil Trader
- Style : {style}
- Marchés : {", ".join(markets)}
- Expérience : {experience_years} ans

## Performances (30 derniers jours)
- Win Rate : {win_rate:.1%}
- Profit Factor : {profit_factor:.2f}
- Sharpe Ratio : {sharpe:.2f}
- Max Drawdown : {max_drawdown:.1%}
- Nombre de trades : {nb_trades}

## Résumé des derniers trades
{recent_trades_summary}

## Demande
{question or "Fournis une analyse complète : points forts, axes d'amélioration, et 3 actions concrètes pour la semaine prochaine."}"""


async def get_coaching_analysis(
    trader_context: dict,
    kpis: dict,
    recent_trades_summary: str,
    question: str | None = None,
) -> dict:
    """
    Appel Claude avec prompt caching pour minimiser les coûts.
    Le system prompt est mis en cache (économie ~90% tokens input).
    """
    prompt = build_coaching_prompt(
        style=trader_context.get("style", "inconnu"),
        markets=trader_context.get("markets", []),
        experience_years=trader_context.get("experience_years", 0),
        win_rate=kpis.get("win_rate", 0),
        profit_factor=kpis.get("profit_factor", 0),
        sharpe=kpis.get("sharpe_ratio", 0),
        max_drawdown=kpis.get("max_drawdown", 0),
        nb_trades=kpis.get("total_trades", 0),
        recent_trades_summary=recent_trades_summary,
        question=question,
    )

    response = await client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=1024,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},  # Prompt caching
            }
        ],
        messages=[{"role": "user", "content": prompt}],
    )

    return {
        "analysis": response.content[0].text,
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "cache_read_tokens": getattr(response.usage, "cache_read_input_tokens", 0),
    }
