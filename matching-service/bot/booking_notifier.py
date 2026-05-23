"""Polls bookings table for new entries and notifies admin."""
from __future__ import annotations
import logging
import os
from datetime import datetime, timezone

import httpx

from supabase_client import get_client

log = logging.getLogger(__name__)

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
ADMIN_ID  = int(os.environ["ADMIN_TELEGRAM_ID"])
_API      = f"https://api.telegram.org/bot{BOT_TOKEN}"

_last_checked: str = datetime.now(timezone.utc).isoformat()


def _tg(method: str, **payload) -> dict:
    try:
        r = httpx.post(f"{_API}/{method}", json=payload, timeout=15)
        return r.json()
    except Exception as e:
        log.error("Telegram API %s: %s", method, e)
        return {}


def check_new_bookings() -> int:
    global _last_checked
    db = get_client()
    now = datetime.now(timezone.utc).isoformat()

    rows = (
        db.table("bookings")
        .select("id, created_at, user:user_id(name, telegram_id), meetup:meetup_id(title, place, seats, taken, status)")
        .gt("created_at", _last_checked)
        .order("created_at")
        .limit(20)
        .execute()
    ).data or []

    for row in rows:
        _notify_booking(row)

    _last_checked = now
    return len(rows)


def _notify_booking(row: dict) -> None:
    user = row.get("user") or {}
    if isinstance(user, list):
        user = user[0] if user else {}
    meetup = row.get("meetup") or {}
    if isinstance(meetup, list):
        meetup = meetup[0] if meetup else {}

    name     = user.get("name") or "неизвестен"
    tg_id    = user.get("telegram_id")
    title    = meetup.get("title") or "без названия"
    place    = meetup.get("place") or ""
    seats    = meetup.get("seats") or 0
    taken    = meetup.get("taken") or 0
    remaining = max(0, seats - taken)

    tg_link = f' · <a href="tg://user?id={tg_id}">{name}</a>' if tg_id else f" · {name}"
    place_str = f" · {place}" if place else ""

    text = (
        f"🎟 <b>Новое бронирование</b>\n\n"
        f"👤{tg_link}\n"
        f"📍 <b>{title}</b>{place_str}\n"
        f"💺 Осталось мест: <b>{remaining}</b> из {seats}"
    )

    _tg("sendMessage", chat_id=ADMIN_ID, text=text, parse_mode="HTML",
        disable_web_page_preview=True)
