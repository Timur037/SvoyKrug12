"""
Supabase operations for the restaurants module.

Responsibilities:
- Cache restaurants from external APIs
- Check rotation (don't reuse same restaurant within ROTATION_DAYS)
- Save usage history after confirmed meetup
"""

from __future__ import annotations
import logging
from datetime import datetime, timedelta, timezone

from supabase_client import get_client
from .models import Restaurant, RankedRestaurant

log = logging.getLogger(__name__)

ROTATION_DAYS = 14  # don't reuse a restaurant in the same district within this window
MIN_RATING_CACHED = 4.0  # don't cache clearly bad restaurants


def upsert_restaurant(restaurant: Restaurant) -> str:
    """
    Save restaurant to Supabase. Returns the UUID.
    Uses external_id_2gis or external_id_yandex for deduplication.
    """
    db = get_client()
    row = restaurant.as_supabase_row()

    # Try to find existing by external ID
    existing_id: str | None = None
    if restaurant.external_id_2gis:
        resp = (
            db.table("restaurants")
            .select("id")
            .eq("external_id_2gis", restaurant.external_id_2gis)
            .maybeSingle()
            .execute()
        )
        if resp.data:
            existing_id = resp.data["id"]

    if existing_id:
        db.table("restaurants").update(row).eq("id", existing_id).execute()
        return existing_id
    else:
        resp = db.table("restaurants").insert(row).execute()
        return resp.data[0]["id"]


def get_recently_used_ids(district: str) -> set[str]:
    """Return restaurant IDs used in this district within ROTATION_DAYS."""
    db = get_client()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=ROTATION_DAYS)).isoformat()

    resp = (
        db.table("restaurant_meetup_history")
        .select("restaurant_id")
        .eq("district", district)
        .gte("created_at", cutoff)
        .execute()
    )
    return {row["restaurant_id"] for row in resp.data or []}


def get_admin_approved_for_district(district: str) -> list[dict]:
    """Return restaurants in this district that admin already approved."""
    db = get_client()
    resp = (
        db.table("restaurants")
        .select("id, name, address, phone, rating_2gis, price_level, tags, atmosphere_note, photos")
        .eq("district", district)
        .eq("admin_approved", True)
        .execute()
    )
    return resp.data or []


def filter_by_rotation(
    ranked: list[RankedRestaurant],
    recently_used: set[str],
) -> list[RankedRestaurant]:
    """
    Apply rotation penalty: deprioritise recently used restaurants.
    They're not removed entirely — admin can still override.
    """
    result = []
    penalised = []
    for r in ranked:
        if r.db_id and r.db_id in recently_used:
            penalised.append(r)
        else:
            result.append(r)
    # Append penalised at the end
    return result + penalised


def save_usage(restaurant_id: str, meetup_id: str, district: str, scheduled_at: str) -> None:
    """Record that a restaurant was used for a meetup (call after admin confirms)."""
    db = get_client()
    db.table("restaurant_meetup_history").insert({
        "restaurant_id": restaurant_id,
        "meetup_id":     meetup_id,
        "district":      district,
        "scheduled_at":  scheduled_at,
    }).execute()

    db.table("restaurants").update({
        "last_used_at": datetime.now(timezone.utc).isoformat(),
        "use_count":    None,   # will increment via SQL function
    }).eq("id", restaurant_id).execute()
