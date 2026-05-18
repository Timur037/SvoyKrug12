"""
Fetch users eligible for matching from Supabase.

Eligibility criteria:
  - is_active = TRUE
  - onboarding_completed = TRUE
  - last_seen_at within USER_INACTIVE_DAYS
  - no matching_paused_until in the future
  - no confirmed/upcoming booking in the next 14 days
  - not included in any match_group within NO_REPEAT_GROUP_DAYS
"""

from __future__ import annotations
from datetime import datetime, timedelta, timezone

from supabase_client import get_client
from config import CITY, USER_INACTIVE_DAYS, NO_REPEAT_GROUP_DAYS


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def fetch_candidates() -> list[dict]:
    db = get_client()
    cutoff_active = (_now_utc() - timedelta(days=USER_INACTIVE_DAYS)).isoformat()

    # 1. Base query — active, onboarded, recently seen, not paused
    resp = (
        db.table("users")
        .select("id, name, district, hobbies, work, qualities, age")
        .eq("city", CITY)
        .eq("is_active", True)
        .eq("onboarding_completed", True)
        .gte("last_seen_at", cutoff_active)
        .execute()
    )
    users: list[dict] = resp.data or []

    # 2. Filter out users paused for matching
    now = _now_utc()
    users = [
        u for u in users
        if not u.get("matching_paused_until")
        or datetime.fromisoformat(u["matching_paused_until"]) < now
    ]

    if not users:
        return []

    user_ids = [u["id"] for u in users]

    # 3. Exclude users with an active/upcoming booking in the next 14 days
    horizon = (_now_utc() + timedelta(days=14)).isoformat()
    booked_resp = (
        db.table("bookings")
        .select("user_id, meetup:meetup_id(status, scheduled_at)")
        .in_("user_id", user_ids)
        .execute()
    )
    booked_ids: set[str] = set()
    for row in booked_resp.data or []:
        meetup = row.get("meetup") or {}
        if isinstance(meetup, list):
            meetup = meetup[0] if meetup else {}
        status = meetup.get("status", "")
        scheduled = meetup.get("scheduled_at", "")
        if status in ("upcoming", "confirmed", "pending_admin") and scheduled and scheduled <= horizon:
            booked_ids.add(row["user_id"])

    # 4. Exclude users matched recently (anti-spam)
    repeat_cutoff = (_now_utc() - timedelta(days=NO_REPEAT_GROUP_DAYS)).isoformat()
    matched_resp = (
        db.table("match_groups")
        .select("user_ids")
        .gte("created_at", repeat_cutoff)
        .execute()
    )
    recent_matched_ids: set[str] = set()
    for row in matched_resp.data or []:
        recent_matched_ids.update(row.get("user_ids") or [])

    excluded = booked_ids | recent_matched_ids
    return [u for u in users if u["id"] not in excluded]
