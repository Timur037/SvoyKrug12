"""
Claude API ranker for restaurant selection.

Takes a shortlist of restaurants + group profile,
returns scored and explained recommendations in Russian.
"""

from __future__ import annotations
import json
import logging
import os
from statistics import median

import anthropic

from .models import Restaurant, RankedRestaurant, BUDGET_TO_PRICE_LEVEL

log = logging.getLogger(__name__)

_MODEL = "claude-haiku-4-5-20251001"  # fast + cheap for this task


def _median_price_level(budgets: list[str]) -> int:
    levels = [BUDGET_TO_PRICE_LEVEL[b] for b in budgets if b in BUDGET_TO_PRICE_LEVEL]
    return round(median(levels)) if levels else 2


def _build_prompt(
    restaurants: list[Restaurant],
    district: str,
    group_size: int,
    vibes: list[str],
    works: list[str],
    price_level: int,
) -> str:
    price_labels = {1: "до 1 000 ₽", 2: "до 3 000 ₽", 3: "до 5 000 ₽", 4: "5 000+ ₽"}

    group_desc = []
    if vibes:
        from collections import Counter
        top_vibes = [v for v, _ in Counter(vibes).most_common(5)]
        group_desc.append(f"Вайб группы: {', '.join(top_vibes)}")
    if works:
        from collections import Counter
        top_works = [w for w, _ in Counter(works).most_common(3)]
        group_desc.append(f"Сферы работы: {', '.join(top_works)}")
    group_desc.append(f"Бюджет: {price_labels.get(price_level, 'средний')} на человека")
    group_desc.append(f"Размер группы: {group_size} человек")
    group_desc.append(f"Район встречи: {district}")

    rest_json = json.dumps(
        [
            {
                "id": str(i),
                "name": r.name,
                "address": r.address,
                "rating": r.rating,
                "price_level": r.price_level,
                "phone": r.phone,
                "tags": r.tags,
            }
            for i, r in enumerate(restaurants)
        ],
        ensure_ascii=False,
        indent=2,
    )

    return f"""Ты помогаешь подобрать ресторан для небольшого круга знакомств (5–6 человек).
Концепция «Свой Круг»: тёплые неформальные вечера с незнакомцами, главное — разговор, не еда.

Профиль группы:
{chr(10).join('- ' + d for d in group_desc)}

Оцени каждый ресторан по шкале 0–10, учитывая:
- Атмосфера: тихо ли, уютно ли, можно ли спокойно говорить
- Соответствие вайбу группы и бюджету
- Рейтинг и наличие телефона для брони
- Насколько место подходит для знакомства с новыми людьми

Рестораны (JSON):
{rest_json}

Верни ТОЛЬКО валидный JSON-массив, без пояснений вне массива:
[
  {{"id": "0", "score": 8.5, "reason": "одно предложение на русском почему подходит"}},
  ...
]
Включи все рестораны из списка. Сортировка не важна."""


def rank_restaurants(
    restaurants: list[Restaurant],
    district: str,
    group_size: int,
    vibes: list[str],
    works: list[str],
    budgets: list[str],
) -> list[RankedRestaurant]:
    """
    Ask Claude to score the restaurant list.
    Returns RankedRestaurant list sorted by final_score descending.
    """
    if not restaurants:
        return []

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.warning("ANTHROPIC_API_KEY not set — returning unranked restaurants")
        return [
            RankedRestaurant(restaurant=r, db_id=None, claude_score=5.0, reason="без ранжирования")
            for r in restaurants
        ]

    price_level = _median_price_level(budgets)
    prompt = _build_prompt(restaurants, district, group_size, vibes, works, price_level)

    client = anthropic.Anthropic(api_key=api_key)
    try:
        message = client.messages.create(
            model=_MODEL,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
    except Exception as e:
        log.error("Claude API error: %s", e)
        return [
            RankedRestaurant(restaurant=r, db_id=None, claude_score=5.0, reason="ошибка ранжирования")
            for r in restaurants
        ]

    # Parse Claude's JSON response
    try:
        # Claude sometimes wraps with ```json ... ```
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        scores: list[dict] = json.loads(raw)
    except json.JSONDecodeError as e:
        log.error("Failed to parse Claude response: %s\nRaw: %s", e, raw[:300])
        return [
            RankedRestaurant(restaurant=r, db_id=None, claude_score=5.0, reason="ошибка парсинга")
            for r in restaurants
        ]

    score_map = {item["id"]: item for item in scores}
    ranked: list[RankedRestaurant] = []

    for i, restaurant in enumerate(restaurants):
        entry = score_map.get(str(i)) or {}
        claude_score = float(entry.get("score", 5.0))
        reason = entry.get("reason", "")

        # Final weighted score:
        # 50% Claude judgment + 30% 2GIS rating + 20% price fit
        rating_norm = ((restaurant.rating or 4.0) - 4.0) / 1.0  # 4.0→0, 5.0→1
        rating_norm = max(0.0, min(1.0, rating_norm))

        price_fit = 1.0
        if restaurant.price_level and price_level:
            diff = abs(restaurant.price_level - price_level)
            price_fit = max(0.0, 1.0 - diff * 0.4)

        final = (
            0.50 * (claude_score / 10.0)
            + 0.30 * rating_norm
            + 0.20 * price_fit
        )

        ranked.append(RankedRestaurant(
            restaurant=restaurant,
            db_id=None,
            claude_score=claude_score,
            reason=reason,
            final_score=round(final, 4),
        ))

    ranked.sort(key=lambda x: x.final_score, reverse=True)
    return ranked
