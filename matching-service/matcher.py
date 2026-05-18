"""
Core matching algorithm.

Step 1 — cluster by district.
Step 2 — within each district, greedily build groups of TARGET_GROUP_SIZE
         maximising mean pairwise compatibility score (hobbies + work).

Returns a list of MatchGroup dicts ready to insert into match_groups table.
"""

from __future__ import annotations
from collections import defaultdict
from dataclasses import dataclass, field

from config import (
    MIN_DISTRICT_SIZE,
    MIN_GROUP_SIZE,
    TARGET_GROUP_SIZE,
    MAX_GROUP_SIZE,
    HOBBY_THRESHOLD,
    MAX_AGE_DIFF,
)
from scorer import pair_score, group_score


@dataclass
class MatchGroup:
    district: str
    users: list[dict] = field(default_factory=list)
    hobby_score: float = 0.0
    work_score: float = 0.0
    total_score: float = 0.0

    @property
    def user_ids(self) -> list[str]:
        return [u["id"] for u in self.users]

    @property
    def size(self) -> int:
        return len(self.users)


def _age_compatible(candidate: dict, group: list[dict]) -> bool:
    """
    Returns True if adding candidate keeps the group age spread <= MAX_AGE_DIFF.
    Users without age are always allowed (we don't penalise missing data).
    """
    candidate_age = candidate.get("age")
    if candidate_age is None:
        return True

    ages = [u["age"] for u in group if u.get("age") is not None]
    if not ages:
        return True

    all_ages = ages + [candidate_age]
    return (max(all_ages) - min(all_ages)) <= MAX_AGE_DIFF


def _avg_score_with_group(candidate: dict, group: list[dict]) -> float:
    """Mean pair score between candidate and every current group member."""
    if not group:
        return 0.0
    scores = [
        pair_score(
            candidate.get("hobbies") or [],
            member.get("hobbies") or [],
            candidate.get("work"),
            member.get("work"),
        )
        for member in group
    ]
    return sum(scores) / len(scores)


def _build_groups_for_district(users: list[dict]) -> list[MatchGroup]:
    """
    Greedy group builder for a single district pool.

    - Sort by number of past bookings descending (experienced users are anchors).
    - Pick the first un-grouped user as anchor.
    - Greedily add whoever maximises avg score with current group.
    - Stop when group reaches TARGET_GROUP_SIZE or no candidate clears HOBBY_THRESHOLD.
    - Yield group if size >= MIN_GROUP_SIZE.
    """
    remaining = sorted(users, key=lambda u: u.get("_past_bookings", 0), reverse=True)
    groups: list[MatchGroup] = []

    while remaining:
        anchor = remaining.pop(0)
        group: list[dict] = [anchor]
        candidates = list(remaining)

        while len(group) < MAX_GROUP_SIZE and candidates:
            # Filter by age compatibility first (hard constraint)
            age_ok = [c for c in candidates if _age_compatible(c, group)]
            if not age_ok:
                break

            # Score every age-compatible candidate against current group
            scored = [
                (c, _avg_score_with_group(c, group))
                for c in age_ok
            ]
            scored.sort(key=lambda x: x[1], reverse=True)

            best_candidate, best_sc = scored[0]
            if best_sc < HOBBY_THRESHOLD:
                break  # nobody compatible enough — stop filling

            group.append(best_candidate)
            candidates.remove(best_candidate)
            remaining.remove(best_candidate)

            # Prefer groups of exactly TARGET_GROUP_SIZE
            if len(group) >= TARGET_GROUP_SIZE:
                break

        if len(group) >= MIN_GROUP_SIZE:
            mg = MatchGroup(district=anchor.get("district", "неизвестно"), users=group)
            mg.total_score = group_score(group)
            groups.append(mg)
        else:
            # Too few compatible people — put them back for possible cross-district later
            remaining = group[1:] + remaining  # anchor is lost; others get another chance

    return groups


def _enrich_with_booking_counts(users: list[dict], db) -> list[dict]:
    """
    Add _past_bookings count so experienced users can be anchors.
    Gracefully degrades to 0 if query fails.
    """
    try:
        ids = [u["id"] for u in users]
        resp = db.table("bookings").select("user_id").in_("user_id", ids).execute()
        counts: dict[str, int] = defaultdict(int)
        for row in resp.data or []:
            counts[row["user_id"]] += 1
        for u in users:
            u["_past_bookings"] = counts.get(u["id"], 0)
    except Exception:
        for u in users:
            u.setdefault("_past_bookings", 0)
    return users


def run_matching(candidates: list[dict], db) -> list[MatchGroup]:
    """
    Main entry point.

    1. Enrich candidates with booking history.
    2. Cluster by district.
    3. Build groups per district.
    4. Handle small districts: merge neighbours or defer.
    """
    if not candidates:
        return []

    candidates = _enrich_with_booking_counts(candidates, db)

    # --- Step 1: cluster by district ---
    by_district: dict[str, list[dict]] = defaultdict(list)
    deferred: list[dict] = []

    for user in candidates:
        district = user.get("district")
        if district:
            by_district[district].append(user)
        else:
            deferred.append(user)  # no district set — skip for now

    # --- Step 2: build groups per district ---
    all_groups: list[MatchGroup] = []
    small_district_overflow: list[dict] = []

    for district, pool in by_district.items():
        if len(pool) < MIN_DISTRICT_SIZE:
            # Too few — defer to cross-district pool
            small_district_overflow.extend(pool)
            continue

        groups = _build_groups_for_district(pool)
        all_groups.extend(groups)

    # --- Step 3: try cross-district group from overflow ---
    if len(small_district_overflow) >= MIN_GROUP_SIZE:
        cross_groups = _build_groups_for_district(small_district_overflow)
        for mg in cross_groups:
            mg.district = "mixed"  # signals cross-district group
        all_groups.extend(cross_groups)

    return all_groups
