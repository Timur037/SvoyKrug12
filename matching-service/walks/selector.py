"""
Walk location selector.

Picks a park + meeting point for a given district.
Priority: Supabase walk_locations table → hardcoded fallback.
Returns a single WalkLocation (the least-recently-used one).
"""

from __future__ import annotations
import logging
import random

from .models import WalkLocation, FALLBACK_LOCATIONS

log = logging.getLogger(__name__)


def select_walk_location(district: str) -> WalkLocation | None:
    """
    Return a WalkLocation for the given district.
    Tries Supabase first; falls back to hardcoded list.
    Returns None if district is unknown and table is empty.
    """
    location = _from_supabase(district)
    if location:
        log.info("Walk location from Supabase: %s — %s", location.park_name, location.meeting_point)
        return location

    location = _from_fallback(district)
    if location:
        log.info("Walk location from fallback: %s — %s", location.park_name, location.meeting_point)
    else:
        log.warning("No walk location found for district=%s", district)
    return location


def _from_supabase(district: str) -> WalkLocation | None:
    try:
        from supabase_client import get_client
        db = get_client()
        resp = (
            db.table("walk_locations")
            .select("*")
            .eq("district", district)
            .eq("is_active", True)
            .execute()
        )
        rows = resp.data or []
        if not rows:
            return None
        # Pick a random one to vary the experience
        row = random.choice(rows)
        return WalkLocation.from_db_row(row)
    except Exception as e:
        log.warning("Supabase walk_locations query failed: %s", e)
        return None


def _from_fallback(district: str) -> WalkLocation | None:
    options = FALLBACK_LOCATIONS.get(district)
    if not options:
        # Try "mixed" or cross-district — pick Центр as safe default
        options = FALLBACK_LOCATIONS.get("Центр", [])
    if not options:
        return None
    return random.choice(options)
