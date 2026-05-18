"""
Callback handlers for admin inline buttons.

Each handler receives the callback query, parses the meetup_id,
updates Supabase, and edits the original message.
"""

from __future__ import annotations
import logging
import os
from datetime import datetime, timezone

import httpx

from supabase_client import get_client
from .keyboards import after_confirm_keyboard, next_restaurant_keyboard, walk_keyboard, main_keyboard
from .messages import (
    format_confirmed, format_rejected, format_cancelled,
    format_next_restaurant, format_date_prompt, format_date_updated,
    format_user_invitation, user_rsvp_keyboard, format_walk_proposal,
)

log = logging.getLogger(__name__)

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

# In-memory state: meetup_id → index of current restaurant alternative shown
_restaurant_cursor: dict[str, int] = {}
# meetup_id → list of RankedRestaurant dicts (stored after selection)
_restaurant_options: dict[str, list[dict]] = {}
# meetup_id → waiting for date input from admin
_awaiting_date: set[str] = set()
# meetup_id → WalkLocation alternatives for this meetup
_walk_options: dict[str, list] = {}
_walk_cursor: dict[str, int] = {}


def _tg(method: str, **payload) -> dict:
    resp = httpx.post(f"{_API}/{method}", json=payload, timeout=10)
    return resp.json()


def _edit_message(chat_id: int, message_id: int, text: str, reply_markup: dict | None = None) -> None:
    payload: dict = {
        "chat_id": chat_id,
        "message_id": message_id,
        "text": text,
        "parse_mode": "HTML",
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    _tg("editMessageText", **payload)


def _send(chat_id: int, text: str, reply_markup: dict | None = None) -> dict:
    payload: dict = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return _tg("sendMessage", **payload)


def _answer_callback(callback_id: str, text: str = "") -> None:
    _tg("answerCallbackQuery", callback_query_id=callback_id, text=text)


# ─── Handlers ─────────────────────────────────────────────────────────────────

def handle_confirm(callback_id: str, chat_id: int, message_id: int, meetup_id: str) -> None:
    """Admin confirmed the meetup → update Supabase, notify users."""
    _answer_callback(callback_id, "Подтверждаю!")
    db = get_client()

    # 1. Update meetup status
    db.table("meetups").update({
        "status": "confirmed",
        "confirmed_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", meetup_id).execute()

    # 2. Fetch meetup + participants
    meetup_resp = db.table("meetups").select(
        "title, place, scheduled_at, seats"
    ).eq("id", meetup_id).maybeSingle().execute()
    meetup = meetup_resp.data or {}

    bookings_resp = db.table("bookings").select(
        "user:user_id(telegram_id, name)"
    ).eq("meetup_id", meetup_id).execute()

    scheduled = meetup.get("scheduled_at", "")
    try:
        dt = datetime.fromisoformat(scheduled)
        date_str = dt.strftime("%-d %B").replace(
            "January","января").replace("February","февраля").replace(
            "March","марта").replace("April","апреля").replace(
            "May","мая").replace("June","июня").replace(
            "July","июля").replace("August","августа").replace(
            "September","сентября").replace("October","октября").replace(
            "November","ноября").replace("December","декабря")
        time_str = dt.strftime("%H:%M")
    except Exception:
        date_str = "дата уточняется"
        time_str = ""

    place = meetup.get("place", "место уточняется")
    participants_count = len(bookings_resp.data or [])

    # 3. Edit admin message
    _edit_message(
        chat_id, message_id,
        text=format_confirmed(place, date_str, time_str, participants_count),
        reply_markup=after_confirm_keyboard(meetup_id),
    )

    # 4. Notify each participant
    district = ""
    for row in bookings_resp.data or []:
        user = row.get("user") or {}
        if isinstance(user, list):
            user = user[0] if user else {}
        tg_id = user.get("telegram_id")
        name = user.get("name", "друг")
        if not tg_id:
            continue
        _send(
            chat_id=tg_id,
            text=format_user_invitation(name, district, place, date_str, time_str),
            reply_markup=user_rsvp_keyboard(meetup_id),
        )

    # 5. Update users_notified_at
    db.table("meetups").update({
        "users_notified_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", meetup_id).execute()

    log.info("Meetup %s confirmed, %d users notified", meetup_id, participants_count)


def handle_reject(callback_id: str, chat_id: int, message_id: int, meetup_id: str) -> None:
    """Admin rejected the meetup."""
    _answer_callback(callback_id, "Отклонено")
    db = get_client()
    db.table("meetups").update({"status": "rejected"}).eq("id", meetup_id).execute()
    _edit_message(chat_id, message_id, text=format_rejected(), reply_markup=None)
    log.info("Meetup %s rejected by admin", meetup_id)


def handle_cancel(callback_id: str, chat_id: int, message_id: int, meetup_id: str) -> None:
    """Admin cancelled a previously confirmed meetup."""
    _answer_callback(callback_id, "Встреча отменена")
    db = get_client()
    db.table("meetups").update({"status": "cancelled"}).eq("id", meetup_id).execute()

    # Notify participants
    bookings_resp = db.table("bookings").select(
        "user:user_id(telegram_id, name)"
    ).eq("meetup_id", meetup_id).execute()
    for row in bookings_resp.data or []:
        user = row.get("user") or {}
        if isinstance(user, list):
            user = user[0] if user else {}
        tg_id = user.get("telegram_id")
        if tg_id:
            _send(tg_id, "😔 К сожалению, встреча отменена. Мы найдём для тебя новый круг совсем скоро.")

    _edit_message(chat_id, message_id, text=format_cancelled(), reply_markup=None)
    log.info("Meetup %s cancelled by admin", meetup_id)


def handle_next_restaurant(
    callback_id: str, chat_id: int, message_id: int, meetup_id: str
) -> None:
    """Show next restaurant alternative from the ranked list."""
    options = _restaurant_options.get(meetup_id, [])
    cursor = _restaurant_cursor.get(meetup_id, 0) + 1
    _restaurant_cursor[meetup_id] = cursor

    if cursor >= len(options):
        _answer_callback(callback_id, "Больше вариантов нет")
        _edit_message(
            chat_id, message_id,
            text="😔 Все варианты ресторанов исчерпаны. Введите название вручную или отклоните круг.",
            reply_markup={"inline_keyboard": [
                [{"text": "❌ Отклонить круг", "callback_data": f"reject:{meetup_id}"}]
            ]},
        )
        return

    r = options[cursor]
    is_last = (cursor == len(options) - 1)

    _answer_callback(callback_id)
    _edit_message(
        chat_id, message_id,
        text=format_next_restaurant(
            restaurant_name=r.get("name", ""),
            restaurant_address=r.get("address", ""),
            restaurant_phone=r.get("phone", ""),
            restaurant_rating=r.get("rating"),
            claude_reason=r.get("reason", ""),
            is_last=is_last,
        ),
        reply_markup=next_restaurant_keyboard(meetup_id, has_more=not is_last),
    )

    # Update meetup with new restaurant
    db = get_client()
    db.table("meetups").update({"place": r.get("name", "")}).eq("id", meetup_id).execute()
    log.info("Meetup %s: showing restaurant option %d", meetup_id, cursor)


def handle_change_date(callback_id: str, chat_id: int, message_id: int, meetup_id: str) -> None:
    """Prompt admin to enter a new date."""
    _answer_callback(callback_id)
    _awaiting_date.add(meetup_id)
    _send(chat_id, format_date_prompt())


def handle_date_input(chat_id: int, text: str) -> bool:
    """
    Try to parse a date input from admin.
    Returns True if successfully parsed and saved.
    """
    if not _awaiting_date:
        return False

    try:
        dt = datetime.strptime(text.strip(), "%d.%m %H:%M")
        dt = dt.replace(year=datetime.now().year, tzinfo=timezone.utc)
    except ValueError:
        _send(chat_id, "❌ Неверный формат. Попробуйте ещё раз: <code>дд.мм чч:мм</code>")
        return True  # consumed the message

    # Find which meetup is awaiting date update
    meetup_id = next(iter(_awaiting_date))
    _awaiting_date.discard(meetup_id)

    db = get_client()
    db.table("meetups").update({
        "scheduled_at": dt.isoformat(),
    }).eq("id", meetup_id).execute()

    date_str = dt.strftime("%-d %B")
    time_str = dt.strftime("%H:%M")
    _send(chat_id, format_date_updated(date_str, time_str))
    log.info("Meetup %s: date updated to %s", meetup_id, dt.isoformat())
    return True


def register_restaurants(meetup_id: str, ranked: list) -> None:
    """Store ranked restaurant list so admin can cycle through alternatives."""
    _restaurant_options[meetup_id] = [
        {
            "name": rr.restaurant.name,
            "address": rr.restaurant.address,
            "phone": rr.restaurant.phone,
            "rating": rr.restaurant.rating,
            "reason": rr.reason,
            "db_id": rr.db_id,
        }
        for rr in ranked
    ]
    _restaurant_cursor[meetup_id] = 0


def handle_switch_to_walk(
    callback_id: str, chat_id: int, message_id: int, meetup_id: str
) -> None:
    """Switch the proposal from restaurant to walk format."""
    from walks.selector import select_walk_location
    from walks.models import WalkLocation

    _answer_callback(callback_id, "Переключаю на прогулку...")
    db = get_client()

    meetup_resp = db.table("meetups").select(
        "title, place, scheduled_at, district, circle_id"
    ).eq("id", meetup_id).maybeSingle().execute()
    meetup = meetup_resp.data or {}

    district = meetup.get("district", "Центр")

    # Load all locations for this district for cycling
    try:
        resp = db.table("walk_locations").select("*").eq("district", district).eq("is_active", True).execute()
        rows = resp.data or []
        locations: list[WalkLocation] = [WalkLocation.from_db_row(r) for r in rows] if rows else []
    except Exception:
        locations = []

    if not locations:
        from walks.models import FALLBACK_LOCATIONS
        locations = FALLBACK_LOCATIONS.get(district, FALLBACK_LOCATIONS.get("Центр", []))

    if not locations:
        _answer_callback(callback_id, "Нет данных о парках для этого района")
        return

    _walk_options[meetup_id] = locations
    _walk_cursor[meetup_id] = 0
    walk = locations[0]

    bookings_resp = db.table("bookings").select(
        "user:user_id(name, age, work)"
    ).eq("meetup_id", meetup_id).execute()
    participants = []
    for row in bookings_resp.data or []:
        user = row.get("user") or {}
        if isinstance(user, list):
            user = user[0] if user else {}
        participants.append(user)

    scheduled = meetup.get("scheduled_at", "")
    try:
        dt = datetime.fromisoformat(scheduled)
        proposed_date = dt.strftime("%-d %B")
        proposed_time = dt.strftime("%H:%M")
    except Exception:
        proposed_date = "дата уточняется"
        proposed_time = ""

    db.table("meetups").update({"place": f"{walk.park_name} — {walk.meeting_point}"}).eq("id", meetup_id).execute()

    _edit_message(
        chat_id, message_id,
        text=format_walk_proposal(district, participants, walk, proposed_date, proposed_time),
        reply_markup=walk_keyboard(meetup_id),
    )
    log.info("Meetup %s: switched to walk — %s", meetup_id, walk.park_name)


def handle_next_walk(
    callback_id: str, chat_id: int, message_id: int, meetup_id: str
) -> None:
    """Show next walk location alternative."""
    options = _walk_options.get(meetup_id, [])
    cursor = _walk_cursor.get(meetup_id, 0) + 1
    _walk_cursor[meetup_id] = cursor

    if cursor >= len(options):
        _answer_callback(callback_id, "Больше вариантов нет — показываю первый")
        _walk_cursor[meetup_id] = 0
        cursor = 0

    walk = options[cursor]
    db = get_client()

    meetup_resp = db.table("meetups").select("scheduled_at, district").eq("id", meetup_id).maybeSingle().execute()
    meetup = meetup_resp.data or {}
    district = meetup.get("district", "")

    bookings_resp = db.table("bookings").select(
        "user:user_id(name, age, work)"
    ).eq("meetup_id", meetup_id).execute()
    participants = []
    for row in bookings_resp.data or []:
        user = row.get("user") or {}
        if isinstance(user, list):
            user = user[0] if user else {}
        participants.append(user)

    scheduled = meetup.get("scheduled_at", "")
    try:
        dt = datetime.fromisoformat(scheduled)
        proposed_date = dt.strftime("%-d %B")
        proposed_time = dt.strftime("%H:%M")
    except Exception:
        proposed_date = "дата уточняется"
        proposed_time = ""

    db.table("meetups").update({"place": f"{walk.park_name} — {walk.meeting_point}"}).eq("id", meetup_id).execute()

    _answer_callback(callback_id)
    _edit_message(
        chat_id, message_id,
        text=format_walk_proposal(district, participants, walk, proposed_date, proposed_time),
        reply_markup=walk_keyboard(meetup_id),
    )
    log.info("Meetup %s: walk option %d — %s", meetup_id, cursor, walk.park_name)


def handle_switch_to_restaurant(
    callback_id: str, chat_id: int, message_id: int, meetup_id: str
) -> None:
    """Switch back from walk to restaurant proposal."""
    _answer_callback(callback_id, "Возвращаю ресторан...")
    options = _restaurant_options.get(meetup_id, [])
    if not options:
        _answer_callback(callback_id, "Нет сохранённых ресторанов — отклоните и создайте заново")
        return

    cursor = _restaurant_cursor.get(meetup_id, 0)
    r = options[cursor]

    db = get_client()
    db.table("meetups").update({"place": r.get("name", "")}).eq("id", meetup_id).execute()

    _edit_message(
        chat_id, message_id,
        text=format_next_restaurant(
            restaurant_name=r.get("name", ""),
            restaurant_address=r.get("address", ""),
            restaurant_phone=r.get("phone", ""),
            restaurant_rating=r.get("rating"),
            claude_reason=r.get("reason", ""),
            is_last=False,
        ),
        reply_markup=main_keyboard(meetup_id),
    )
    log.info("Meetup %s: switched back to restaurant", meetup_id)
