"""
Restaurant Selector — main orchestrator.

Flow:
  1. Check Supabase cache (admin-approved restaurants for this district)
  2. If cache insufficient → query 2GIS (+ Yandex as fallback)
  3. Save new restaurants to Supabase (admin_approved=NULL, pending review)
  4. Apply rotation filter (exclude recently used)
  5. Rank via Claude
  6. Return top-3 with reasons for admin review
"""

from __future__ import annotations
import logging

from .models import Restaurant, RankedRestaurant, BUDGET_TO_PRICE_LEVEL
from .twogis import search_restaurants as twogis_search
from .yandex import search_restaurants as yandex_search
from .ranker import rank_restaurants
from . import db as restaurant_db

log = logging.getLogger(__name__)

# If fewer than this many restaurants after filtering → also query external APIs
MIN_CACHE_SIZE = 5


def _collect_from_apis(
    district: str,
    price_level: int | None,
    group_size: int,
) -> list[Restaurant]:
    """Query 2GIS (primary) + Yandex (fallback if < 5 results)."""
    restaurants = twogis_search(
        district=district,
        price_level=price_level,
        group_size=group_size,
    )

    if len(restaurants) < MIN_CACHE_SIZE:
        log.info("2GIS returned only %d results — trying Yandex", len(restaurants))
        yandex = yandex_search(district=district)

        # Deduplicate by name (simple fuzzy: exact match on first word)
        existing_names = {r.name.split()[0].lower() for r in restaurants}
        for yr in yandex:
            first_word = yr.name.split()[0].lower() if yr.name else ""
            if first_word not in existing_names:
                restaurants.append(yr)
                existing_names.add(first_word)

    return restaurants


def _median_price_level(budgets: list[str]) -> int:
    from statistics import median
    levels = [BUDGET_TO_PRICE_LEVEL[b] for b in budgets if b in BUDGET_TO_PRICE_LEVEL]
    return round(median(levels)) if levels else 2


def select_restaurants(
    district: str,
    group_size: int,
    vibes: list[str],
    works: list[str],
    budgets: list[str],
    top_n: int = 3,
) -> list[RankedRestaurant]:
    """
    Main entry point for restaurant selection.

    Returns up to top_n RankedRestaurant objects, sorted best-first.
    Each has: restaurant data, claude_score, reason, final_score, db_id.
    """
    price_level = _median_price_level(budgets)
    log.info(
        "Selecting restaurants | district=%s | price_level=%d | group_size=%d",
        district, price_level, group_size,
    )

    # 1. Check admin-approved cache first
    approved_rows = restaurant_db.get_admin_approved_for_district(district)
    recently_used_ids = restaurant_db.get_recently_used_ids(district)
    log.info(
        "Cache: %d approved restaurants, %d recently used",
        len(approved_rows), len(recently_used_ids),
    )

    if len(approved_rows) >= MIN_CACHE_SIZE:
        # Use only cached approved restaurants — no API calls needed
        restaurants = _rows_to_restaurants(approved_rows, district)
        source = "cache"
    else:
        # 2. Query external APIs
        restaurants = _collect_from_apis(district, price_level, group_size)
        source = "api"

        if not restaurants:
            log.warning("No restaurants found for district=%s", district)
            return _fallback_from_cache(approved_rows, district, recently_used_ids)

        # 3. Save to Supabase (admin_approved=NULL, pending review)
        for r in restaurants:
            try:
                db_id = restaurant_db.upsert_restaurant(r)
                log.debug("Upserted restaurant: %s (id=%s)", r.name, db_id)
            except Exception as e:
                log.warning("Failed to upsert %s: %s", r.name, e)

    log.info("Restaurants from %s: %d total", source, len(restaurants))

    # 4. Apply rotation — move recently used to the back
    ranked_unfiltered = rank_restaurants(
        restaurants=restaurants,
        district=district,
        group_size=group_size,
        vibes=vibes,
        works=works,
        budgets=budgets,
    )

    # Attach db_ids where we know them (approved cache)
    if source == "cache":
        id_by_name = {row["name"]: row["id"] for row in approved_rows}
        for rr in ranked_unfiltered:
            rr.db_id = id_by_name.get(rr.restaurant.name)

    ranked = restaurant_db.filter_by_rotation(ranked_unfiltered, recently_used_ids)

    top = ranked[:top_n]
    log.info(
        "Top %d restaurants: %s",
        len(top),
        [f"{rr.restaurant.name} ({rr.final_score:.2f})" for rr in top],
    )
    return top


def _rows_to_restaurants(rows: list[dict], district: str) -> list[Restaurant]:
    result = []
    for row in rows:
        result.append(Restaurant(
            name=row.get("name", ""),
            district=district,
            address=row.get("address", ""),
            phone=row.get("phone"),
            rating=row.get("rating_2gis"),
            price_level=row.get("price_level"),
            photos=row.get("photos") or [],
            tags=row.get("tags") or [],
        ))
    return result


def _fallback_from_cache(
    approved_rows: list[dict],
    district: str,
    recently_used_ids: set[str],
) -> list[RankedRestaurant]:
    """Emergency fallback: return any approved restaurant, ignoring rotation."""
    if not approved_rows:
        return []
    log.warning("Using fallback cache (ignoring rotation) for district=%s", district)
    restaurants = _rows_to_restaurants(approved_rows, district)
    return [
        RankedRestaurant(
            restaurant=r,
            db_id=approved_rows[i].get("id"),
            claude_score=5.0,
            reason="резервный вариант из кэша",
            final_score=0.5,
        )
        for i, r in enumerate(restaurants)
    ]
