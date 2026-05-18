"""
Admin Telegram Bot — polling-based runner.

Listens for:
  - Callback queries from inline buttons (confirm, reject, next_restaurant, etc.)
  - Text messages (date input after change_date)
  - /status command — show system status

Run: python -m bot.admin_bot
Or import run_bot() and call it from main.
"""

from __future__ import annotations
import logging
import os
import time

import httpx

from .handlers import (
    handle_confirm,
    handle_reject,
    handle_cancel,
    handle_next_restaurant,
    handle_change_date,
    handle_date_input,
    handle_switch_to_walk,
    handle_next_walk,
    handle_switch_to_restaurant,
)

log = logging.getLogger(__name__)

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
ADMIN_ID = int(os.environ["ADMIN_TELEGRAM_ID"])
_API = f"https://api.telegram.org/bot{BOT_TOKEN}"


def _tg(method: str, **payload) -> dict:
    try:
        resp = httpx.post(f"{_API}/{method}", json=payload, timeout=15)
        return resp.json()
    except Exception as e:
        log.error("Telegram API error (%s): %s", method, e)
        return {}


def _process_callback(query: dict) -> None:
    callback_id = query["id"]
    chat_id = query["from"]["id"]
    message_id = query["message"]["message_id"]
    data = query.get("data", "")

    # Only accept from admin
    if chat_id != ADMIN_ID:
        _tg("answerCallbackQuery", callback_query_id=callback_id, text="Нет доступа")
        return

    try:
        action, meetup_id = data.split(":", 1)
    except ValueError:
        return

    dispatch = {
        "confirm":            handle_confirm,
        "reject":             handle_reject,
        "cancel":             handle_cancel,
        "next_restaurant":    handle_next_restaurant,
        "change_date":        handle_change_date,
        "switch_walk":        handle_switch_to_walk,
        "next_walk":          handle_next_walk,
        "switch_restaurant":  handle_switch_to_restaurant,
    }

    handler = dispatch.get(action)
    if handler:
        try:
            handler(callback_id, chat_id, message_id, meetup_id)
        except Exception as e:
            log.exception("Handler %s failed: %s", action, e)
            _tg("answerCallbackQuery", callback_query_id=callback_id, text="Ошибка, попробуйте ещё раз")


MINI_APP_URL = os.environ.get("MINI_APP_URL", "https://svoy-krug.vercel.app/")


def _send_user_welcome(chat_id: int) -> None:
    first_name = ""
    text = (
        "Привет! 👋\n\n"
        "Свой Круг — это тёплые вечера с интересными людьми.\n\n"
        "Мы подбираем группу из 5–6 человек и организуем встречу: "
        "ужин в хорошем месте, прогулку или что-то ещё. "
        "Тебе остаётся только прийти.\n\n"
        "Не дейтинг. Не нетворкинг. Просто хороший вечер."
    )
    keyboard = {"inline_keyboard": [[{
        "text": "Открыть Свой Круг →",
        "web_app": {"url": MINI_APP_URL},
    }]]}
    _tg("sendMessage", chat_id=chat_id, text=text, reply_markup=keyboard)


def _process_message(message: dict) -> None:
    chat_id = message.get("from", {}).get("id")
    text = message.get("text", "").strip()

    if chat_id != ADMIN_ID:
        if text.startswith("/start"):
            _send_user_welcome(chat_id)
        return

    if text == "/status":
        _send_status(chat_id)
        return

    # Try to handle as date input
    handle_date_input(chat_id, text)


def _send_status(chat_id: int) -> None:
    from supabase_client import get_client
    db = get_client()
    try:
        jobs = db.table("match_jobs").select("status, started_at, groups_formed").order(
            "started_at", desc=True
        ).limit(1).execute()
        pending = db.table("meetups").select("id", count="exact").eq("status", "pending_admin").execute()
        confirmed = db.table("meetups").select("id", count="exact").eq("status", "confirmed").execute()

        last = jobs.data[0] if jobs.data else {}
        text = (
            f"📊 <b>Статус системы</b>\n\n"
            f"Последний матчинг: {last.get('started_at', 'нет')[:16]}\n"
            f"Статус: {last.get('status', '—')}\n"
            f"Групп создано: {last.get('groups_formed', 0)}\n\n"
            f"Ожидают подтверждения: {pending.count or 0}\n"
            f"Подтверждённых встреч: {confirmed.count or 0}"
        )
    except Exception as e:
        text = f"Ошибка получения статуса: {e}"

    _tg("sendMessage", chat_id=chat_id, text=text, parse_mode="HTML")


def run_bot() -> None:
    """Start polling loop. Runs forever until interrupted."""
    log.info("Admin bot started (ADMIN_ID=%d)", ADMIN_ID)

    # Send startup message to admin
    _tg("sendMessage",
        chat_id=ADMIN_ID,
        text="🤖 <b>Свой Круг Admin Bot запущен</b>\n\nКоманды:\n/status — статус системы",
        parse_mode="HTML")

    offset = 0
    while True:
        try:
            resp = _tg("getUpdates", offset=offset, timeout=30, allowed_updates=["message", "callback_query"])
            updates = resp.get("result") or []

            for update in updates:
                offset = update["update_id"] + 1

                if "callback_query" in update:
                    _process_callback(update["callback_query"])
                elif "message" in update:
                    _process_message(update["message"])

        except KeyboardInterrupt:
            log.info("Bot stopped by user")
            break
        except Exception as e:
            log.error("Polling error: %s", e)
            time.sleep(5)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    run_bot()
