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

import logging
import os
from datetime import datetime, timezone, timedelta
import random

import httpx

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


_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
_ADMIN_ID  = int(os.environ.get("ADMIN_TELEGRAM_ID", "0"))
_API       = f"https://api.telegram.org/bot{_BOT_TOKEN}"

_PROPOSED_TIMES = ["19:00", "19:30", "20:00"]
_PROPOSED_DAYS  = ["пятница", "суббота", "воскресенье"]


def _tg(method: str, **payload) -> dict:
    try:
        r = httpx.post(f"{_API}/{method}", json=payload, timeout=15)
        return r.json()
    except Exception as e:
        log.error("Telegram API %s: %s", method, e)
        return {}


def _next_friday_label() -> tuple[str, str]:
    """Return (date_label, scheduled_at ISO) for next Friday 19:30 MSK."""
    now = datetime.now(timezone.utc)
    days_ahead = (4 - now.weekday()) % 7 or 7  # 4 = Friday
    dt = (now + timedelta(days=days_ahead)).replace(hour=16, minute=30, second=0, microsecond=0)
    label = dt.strftime("%-d %B").replace(
        "January","января").replace("February","февраля").replace(
        "March","марта").replace("April","апреля").replace(
        "May","мая").replace("June","июня").replace(
        "July","июля").replace("August","августа").replace(
        "September","сентября").replace("October","октября").replace(
        "November","ноября").replace("December","декабря")
    return f"пятница, {label} · 19:30", dt.isoformat()


def _notify_admin_groups(db, groups: list[MatchGroup]) -> None:
    if not _BOT_TOKEN or not _ADMIN_ID:
        log.warning("TELEGRAM_BOT_TOKEN or ADMIN_TELEGRAM_ID not set — skipping admin notify")
        return

    for mg in groups:
        try:
            date_label, scheduled_at = _next_friday_label()

            # Create a pending meetup for admin to confirm
            resp = db.table("meetups").insert({
                "title":        f"Свой круг · {mg.district}",
                "place":        f"район {mg.district} — место уточняется",
                "date_label":   date_label,
                "scheduled_at": scheduled_at,
                "seats":        mg.size,
                "taken":        mg.size,
                "status":       "pending_admin",
                "district":     mg.district,
                "gender_filter": "mixed",
            }).execute()

            meetup_id = resp.data[0]["id"]

            # Update match_group to link the meetup
            db.table("match_groups").update({"status": "meetup_created"}).eq(
                "job_id", mg.job_id if hasattr(mg, "job_id") else ""
            ).eq("district", mg.district).execute()

            people_lines = "\n".join(
                f"  • {u.get('name','?')}, {u.get('age','?')} лет"
                + (f" — {u.get('work','')}" if u.get("work") else "")
                for u in mg.users
            )

            text = (
                f"🌙 <b>Новый круг готов к организации</b>\n\n"
                f"📍 <b>Район:</b> {mg.district}\n"
                f"👥 <b>Участники ({mg.size} чел.):</b>\n{people_lines}\n\n"
                f"📅 <b>Предлагаемая дата:</b> {date_label}\n\n"
                f"Забронируйте ресторан на <b>{mg.size} человек</b> в районе «{mg.district}», "
                f"затем нажмите <b>Подтвердить</b>.\n\n"
                f"Или введите другую дату: <code>дд.мм чч:мм</code>"
            )

            keyboard = {
                "inline_keyboard": [
                    [
                        {"text": "✅ Подтвердить", "callback_data": f"confirm:{meetup_id}"},
                        {"text": "✏️ Изменить дату", "callback_data": f"change_date:{meetup_id}"},
                    ],
                    [
                        {"text": "🚶 Прогулка", "callback_data": f"switch_walk:{meetup_id}"},
                        {"text": "❌ Отклонить",  "callback_data": f"reject:{meetup_id}"},
                    ],
                ]
            }

            _tg("sendMessage", chat_id=_ADMIN_ID, text=text,
                parse_mode="HTML", reply_markup=keyboard)

            log.info("Admin notified for group district=%s meetup=%s", mg.district, meetup_id)

        except Exception as e:
            log.error("Failed to notify admin for group district=%s: %s", mg.district, e)


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
        _notify_admin_groups(db, groups)
        _finish_job(db, job_id, groups)

        log.info("Job %s completed. Groups saved: %d", job_id, len(groups))

    except Exception as exc:
        log.exception("Matching job failed")
        _finish_job(db, job_id, [], error=str(exc))
        raise


if __name__ == "__main__":
    run()
