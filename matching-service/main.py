"""
Matching service entry point.

Usage:
  python main.py

Environment variables required:
  SUPABASE_URL
  SUPABASE_SERVICE_KEY

Optional:
  MATCHING_CITY, MATCHING_MIN_GROUP_SIZE, MATCHING_TARGET_GROUP_SIZE, ...
  (see config.py)
"""

import json
import logging
from datetime import datetime, timezone

from supabase_client import get_client
from candidates import fetch_candidates
from matcher import run_matching, MatchGroup

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)


def _create_job(db) -> str:
    resp = db.table("match_jobs").insert({"status": "running"}).execute()
    return resp.data[0]["id"]


def _finish_job(db, job_id: str, groups: list[MatchGroup], error: str | None = None) -> None:
    db.table("match_jobs").update({
        "status": "failed" if error else "completed",
        "groups_formed": len(groups),
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "error_log": {"error": error} if error else None,
    }).eq("id", job_id).execute()


def _save_groups(db, job_id: str, groups: list[MatchGroup]) -> None:
    if not groups:
        return
    rows = [
        {
            "job_id": job_id,
            "district": mg.district,
            "user_ids": mg.user_ids,
            "size": mg.size,
            "hobby_score": round(mg.hobby_score, 4),
            "work_score": round(mg.work_score, 4),
            "total_score": round(mg.total_score, 4),
            "status": "pending",
        }
        for mg in groups
    ]
    db.table("match_groups").insert(rows).execute()


def run() -> None:
    db = get_client()
    job_id = _create_job(db)
    log.info("Match job started: %s", job_id)

    try:
        candidates = fetch_candidates()
        log.info("Candidates: %d", len(candidates))

        db.table("match_jobs").update({"candidates_count": len(candidates)}).eq("id", job_id).execute()

        if not candidates:
            log.info("No candidates — job finished early.")
            _finish_job(db, job_id, [])
            return

        groups = run_matching(candidates, db)
        log.info("Groups formed: %d", len(groups))

        for i, mg in enumerate(groups):
            names = [u.get("name", "?") for u in mg.users]
            log.info(
                "  Group %d | district=%s | size=%d | score=%.2f | %s",
                i + 1, mg.district, mg.size, mg.total_score, names,
            )

        _save_groups(db, job_id, groups)
        _finish_job(db, job_id, groups)

        log.info("Job %s completed. Groups saved: %d", job_id, len(groups))

    except Exception as exc:
        log.exception("Matching job failed")
        _finish_job(db, job_id, [], error=str(exc))
        raise


if __name__ == "__main__":
    run()
