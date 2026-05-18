"""
Quick sanity tests for scorer and matcher (no Supabase needed).
Run: python test_scorer.py
"""

import os
os.environ.setdefault("SUPABASE_URL", "http://localhost")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test")

from scorer import hobby_jaccard, work_score, pair_score, group_score
from matcher import run_matching, MatchGroup


# ── scorer ────────────────────────────────────────────────────────────────────

def test_jaccard_identical():
    a = ["музыка", "кино", "книги"]
    assert hobby_jaccard(a, a) == 1.0

def test_jaccard_disjoint():
    assert hobby_jaccard(["музыка"], ["кино"]) == 0.0

def test_jaccard_partial():
    score = hobby_jaccard(["музыка", "кино"], ["кино", "книги"])
    assert round(score, 3) == 0.333

def test_jaccard_empty():
    assert hobby_jaccard([], ["кино"]) == 0.0

def test_work_same_industry():
    assert work_score("технологии / IT", "технологии / IT") == 1.0

def test_work_same_category():
    # финансы и дизайн — different categories
    assert work_score("финансы и банки", "дизайн и творчество") == 0.0
    # финансы и юриспруденция — both "business"
    assert work_score("финансы и банки", "юриспруденция") == 0.6

def test_work_none():
    assert work_score(None, "технологии / IT") == 0.0

def test_pair_score_high():
    score = pair_score(
        ["музыка", "кино", "книги"],
        ["музыка", "кино", "путешествия"],
        "технологии / IT",
        "технологии / IT",
    )
    # jaccard(2/4)=0.5, work=1.0 → 0.65*0.5 + 0.35*1.0 = 0.675
    assert score > 0.65

def test_pair_score_low():
    score = pair_score(["музыка"], ["спорт"], "медицина", "технологии / IT")
    assert score < 0.3


# ── matcher ───────────────────────────────────────────────────────────────────

def _make_user(uid, district, hobbies, work, past=0, age=28):
    return {
        "id": uid,
        "name": f"User{uid}",
        "district": district,
        "hobbies": hobbies,
        "work": work,
        "qualities": [],
        "age": age,
        "_past_bookings": past,
    }


class _FakeDB:
    """Stub — returns empty bookings so enrich doesn't crash."""
    def table(self, _):
        return self
    def select(self, _):
        return self
    def in_(self, *a):
        return self
    def execute(self):
        class R:
            data = []
        return R()


def test_matching_groups_by_district():
    users = [
        _make_user("1", "Центр", ["музыка", "кино", "книги"], "технологии / IT", past=3),
        _make_user("2", "Центр", ["музыка", "кино", "йога"],  "технологии / IT"),
        _make_user("3", "Центр", ["кино", "книги", "театр"],  "маркетинг / медиа"),
        _make_user("4", "Центр", ["музыка", "книги", "кофе и чай"], "финансы и банки"),
        _make_user("5", "Север", ["спорт", "природа и походы"], "медицина"),
        _make_user("6", "Север", ["спорт", "йога", "кофе и чай"], "образование / наука"),
        _make_user("7", "Север", ["природа и походы", "фотография"], "медицина"),
        _make_user("8", "Север", ["спорт", "природа и походы", "йога"], "образование / наука"),
    ]
    groups = run_matching(users, _FakeDB())

    # Should form at least one group per district
    districts = {g.district for g in groups}
    assert "Центр" in districts, "Expected Центр group"
    assert "Север" in districts, "Expected Север group"

    for g in groups:
        assert g.size >= 4, f"Group too small: {g.size}"
        assert g.total_score >= 0.0

def test_small_district_deferred():
    # Only 2 users in Юг — below MIN_DISTRICT_SIZE=3 → cross-district or skipped
    users = [
        _make_user("1", "Центр", ["музыка", "кино"], "технологии / IT"),
        _make_user("2", "Центр", ["музыка", "книги"], "технологии / IT"),
        _make_user("3", "Центр", ["кино", "театр"],  "маркетинг / медиа"),
        _make_user("4", "Центр", ["кофе и чай", "книги"], "финансы и банки"),
        _make_user("5", "Юг",    ["музыка"], "технологии / IT"),
        _make_user("6", "Юг",    ["кино"],  "дизайн и творчество"),
    ]
    groups = run_matching(users, _FakeDB())
    # Юг has only 2 people — they will not form their own group
    for g in groups:
        assert g.district != "Юг", "Юг had too few users to form a group"


def test_age_filter_blocks_outlier():
    # Ages: 25, 27, 28, 29 → spread=4 OK. User with age=35 → spread=10 → blocked.
    users = [
        _make_user("1", "Центр", ["музыка", "кино"], "технологии / IT", age=25),
        _make_user("2", "Центр", ["музыка", "книги"], "технологии / IT", age=27),
        _make_user("3", "Центр", ["кино", "театр"],  "маркетинг / медиа", age=28),
        _make_user("4", "Центр", ["музыка", "кино", "книги"], "финансы и банки", age=29),
        _make_user("5", "Центр", ["музыка", "кино"], "технологии / IT", age=35),  # too old
    ]
    groups = run_matching(users, _FakeDB())
    for g in groups:
        ages = [u["age"] for u in g.users if u.get("age")]
        assert max(ages) - min(ages) <= 7, f"Age spread too large: {ages}"

def test_age_filter_allows_compatible():
    # All within 7 years → should form a group normally
    users = [
        _make_user("1", "Центр", ["музыка", "кино"], "технологии / IT", age=24),
        _make_user("2", "Центр", ["музыка", "книги"], "технологии / IT", age=26),
        _make_user("3", "Центр", ["кино", "театр"],  "маркетинг / медиа", age=28),
        _make_user("4", "Центр", ["музыка", "кино", "книги"], "финансы и банки", age=30),
    ]
    groups = run_matching(users, _FakeDB())
    assert len(groups) >= 1, "Expected at least one group"
    ages = [u["age"] for u in groups[0].users if u.get("age")]
    assert max(ages) - min(ages) <= 7


if __name__ == "__main__":
    tests = [
        test_jaccard_identical,
        test_jaccard_disjoint,
        test_jaccard_partial,
        test_jaccard_empty,
        test_work_same_industry,
        test_work_same_category,
        test_work_none,
        test_pair_score_high,
        test_pair_score_low,
        test_matching_groups_by_district,
        test_small_district_deferred,
        test_age_filter_blocks_outlier,
        test_age_filter_allows_compatible,
    ]
    passed = failed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS  {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL  {t.__name__}: {e}")
            failed += 1
    print(f"\n{passed} passed, {failed} failed")
