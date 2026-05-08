"""
Polls Supabase for unnotified reports and sends them to the admin via Telegram.
Run every 5–10 minutes via cron:
    */10 * * * * cd /app && python -m matching_service.check_reports
"""
from __future__ import annotations
import logging
import os

import httpx

from ..supabase_client import get_client

log = logging.getLogger(__name__)

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
ADMIN_ID  = int(os.environ["ADMIN_TELEGRAM_ID"])
_API      = f"https://api.telegram.org/bot{BOT_TOKEN}"


def _tg(method: str, **payload) -> dict:
    try:
        r = httpx.post(f"{_API}/{method}", json=payload, timeout=15)
        return r.json()
    except Exception as exc:
        log.error("Telegram API %s: %s", method, exc)
        return {}


def send_report_notifications() -> int:
    sb = get_client()

    rows = (
        sb.table("reports")
        .select("id, message, source, created_at, user_id, meetup_id, reported_user_id, users!reports_user_id_fkey(name, telegram_id)")
        .eq("sent_to_telegram", False)
        .order("created_at", desc=False)
        .limit(20)
        .execute()
    ).data or []

    sent = 0
    for r in rows:
        if _send_alert(r):
            sb.table("reports").update({"sent_to_telegram": True}).eq("id", r["id"]).execute()
            sent += 1

    return sent


def _send_alert(r: dict) -> bool:
    user_info = r.get("users") or {}
    name      = user_info.get("name") or "неизвестен"
    tg_id     = user_info.get("telegram_id")
    source    = "после встречи" if r.get("source") == "post_event" else "главная страница"
    meetup_id = r.get("meetup_id") or "—"
    target_id = r.get("reported_user_id") or "—"
    message   = r.get("message", "")

    text = (
        "🚨🚨🚨 *ЖАЛОБА / ОБРАЩЕНИЕ В ПОДДЕРЖКУ*\n\n"
        f"👤 *От:* {name}"
        + (f" (tg://user?id={tg_id})" if tg_id else "") + "\n"
        f"📍 *Источник:* {source}\n"
        f"🎟 *Встреча ID:* `{meetup_id}`\n"
        f"⚠️ *На участника ID:* `{target_id}`\n\n"
        f"💬 *Сообщение:*\n_{message}_"
    )

    resp = _tg("sendMessage",
               chat_id=ADMIN_ID,
               text=text,
               parse_mode="Markdown",
               disable_web_page_preview=True)
    return bool(resp.get("ok"))
