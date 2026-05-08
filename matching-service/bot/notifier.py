"""
Post-event notification sender.

Finds meetups that ended 1.5–4 hours ago and sends review messages
to all participants via Telegram Bot.

Usage:
    python -m matching_service.notify_after_event
    # or via cron every 30 minutes
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone, timedelta

import httpx

from ..supabase_client import get_client

log = logging.getLogger(__name__)

BOT_TOKEN  = os.environ["TELEGRAM_BOT_TOKEN"]
MINI_APP_URL = os.environ.get("MINI_APP_URL", "")   # e.g. https://t.me/SvoyKrugBot/app
_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

# Notification window: send between 1.5h and 4h after meetup start
_WINDOW_MIN = timedelta(hours=1, minutes=30)
_WINDOW_MAX = timedelta(hours=4)


def _tg(method: str, **payload) -> dict:
    try:
        r = httpx.post(f"{_API}/{method}", json=payload, timeout=15)
        return r.json()
    except Exception as exc:
        log.error("Telegram API %s error: %s", method, exc)
        return {}


def send_post_event_notifications() -> int:
    """
    Find ended meetups not yet notified, send review messages.
    Returns number of messages sent.
    """
    sb = get_client()
    now = datetime.now(timezone.utc)
    window_start = (now - _WINDOW_MAX).isoformat()
    window_end   = (now - _WINDOW_MIN).isoformat()

    meetups = (
        sb.table("meetups")
        .select("id, title, scheduled_at")
        .gte("scheduled_at", window_start)
        .lte("scheduled_at", window_end)
        .eq("post_event_sent", False)
        .execute()
    ).data or []

    if not meetups:
        log.info("No meetups to notify")
        return 0

    sent = 0
    for m in meetups:
        sent += _notify_meetup(sb, m["id"], m["title"])
        sb.table("meetups").update({"post_event_sent": True}).eq("id", m["id"]).execute()

    log.info("Post-event notifications sent: %d", sent)
    return sent


def _notify_meetup(sb, meetup_id: str, title: str) -> int:
    bookings = (
        sb.table("bookings")
        .select("users(telegram_id, name)")
        .eq("meetup_id", meetup_id)
        .execute()
    ).data or []

    sent = 0
    for b in bookings:
        user = b.get("users") or {}
        tg_id = user.get("telegram_id")
        if not tg_id:
            continue
        first_name = (user.get("name") or "друг").split()[0]
        if _send_message(int(tg_id), first_name, title, meetup_id):
            sent += 1
    return sent


def _send_message(tg_id: int, name: str, title: str, meetup_id: str) -> bool:
    text = (
        f"🌙 *Как прошёл вечер, {name}?*\n\n"
        f"Вы только что побывали на «{title}».\n"
        f"Поделитесь впечатлениями — это займёт минуту.\n\n"
        f"_Отметьте кого из участников хотите увидеть снова — "
        f"если взаимно, мы вас сведём._"
    )
    keyboard = {"inline_keyboard": [[{
        "text": "Оценить вечер →",
        "web_app": {"url": f"{MINI_APP_URL}?startapp=review_{meetup_id}"},
    }]]}

    r = _tg("sendMessage",
            chat_id=tg_id,
            text=text,
            parse_mode="Markdown",
            reply_markup=keyboard)
    return bool(r.get("ok"))
