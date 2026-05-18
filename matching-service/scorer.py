"""
Pair-level compatibility scoring.

Two dimensions:
  1. hobbies  — Jaccard similarity on the hobbies arrays
  2. work     — category compatibility bonus

Final pair score = HOBBY_WEIGHT * hobby_score + WORK_WEIGHT * work_score
Group score      = mean of all pairwise scores within the group
"""

from __future__ import annotations
from config import HOBBY_WEIGHT, WORK_WEIGHT

# Industries grouped by "vibe category".
# People in the same category have more to talk about professionally.
_WORK_CATEGORIES: dict[str, str] = {
    "технологии / IT":              "tech",
    "финансы и банки":              "business",
    "маркетинг / медиа":            "creative",
    "дизайн и творчество":          "creative",
    "юриспруденция":                "business",
    "продажи / консалтинг":         "business",
    "медицина":                     "helping",
    "образование / наука":          "helping",
    "психология":                   "helping",
    "строительство / недвижимость": "industry",
    "рестораны / еда":              "industry",
    "студент":                      "student",
    "другое":                       "other",
}


def _work_category(work: str | None) -> str:
    if not work:
        return "other"
    return _WORK_CATEGORIES.get(work, "other")


def hobby_jaccard(a: list[str], b: list[str]) -> float:
    """Jaccard similarity between two hobby lists."""
    if not a or not b:
        return 0.0
    set_a, set_b = set(a), set(b)
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union else 0.0


def work_score(work_a: str | None, work_b: str | None) -> float:
    """
    1.0  — exact same industry
    0.6  — same broad category
    0.0  — different category
    """
    if not work_a or not work_b:
        return 0.0
    if work_a == work_b:
        return 1.0
    if _work_category(work_a) == _work_category(work_b):
        return 0.6
    return 0.0


def pair_score(
    hobbies_a: list[str],
    hobbies_b: list[str],
    work_a: str | None,
    work_b: str | None,
) -> float:
    h = hobby_jaccard(hobbies_a, hobbies_b)
    w = work_score(work_a, work_b)
    return HOBBY_WEIGHT * h + WORK_WEIGHT * w


def group_score(users: list[dict]) -> float:
    """Mean pairwise score for a list of user dicts."""
    if len(users) < 2:
        return 0.0
    scores: list[float] = []
    for i in range(len(users)):
        for j in range(i + 1, len(users)):
            u, v = users[i], users[j]
            scores.append(pair_score(
                u.get("hobbies") or [],
                v.get("hobbies") or [],
                u.get("work"),
                v.get("work"),
            ))
    return sum(scores) / len(scores) if scores else 0.0
