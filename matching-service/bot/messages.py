"""Message formatters for admin bot (plain text + HTML)."""

from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from walks.models import WalkLocation


def format_circle_proposal(
    district: str,
    participants: list[dict],
    restaurant_name: str,
    restaurant_address: str,
    restaurant_phone: str,
    restaurant_rating: float | None,
    claude_reason: str,
    proposed_date: str,   # e.g. "пятница, 9 мая"
    proposed_time: str,   # e.g. "19:30"
) -> str:
    rating_str = f"⭐ {restaurant_rating:.1f}" if restaurant_rating else "рейтинг неизвестен"

    people_lines = "\n".join(
        f"  • {p.get('name', '?')}, {p.get('age', '?')} лет"
        + (f" — {p.get('work', '')}" if p.get("work") else "")
        for p in participants
    )

    return (
        f"🌙 <b>Новый круг готов к организации</b>\n\n"
        f"📍 <b>Район:</b> {district}\n"
        f"👥 <b>Участники ({len(participants)} чел):</b>\n{people_lines}\n\n"
        f"🍽 <b>Ресторан:</b> «{restaurant_name}»\n"
        f"   {restaurant_address}\n"
        f"   {rating_str} · 📞 {restaurant_phone or 'нет телефона'}\n"
        f"   <i>{claude_reason}</i>\n\n"
        f"📅 <b>Предлагаемая дата:</b> {proposed_date}, {proposed_time}\n\n"
        f"Позвоните в ресторан и забронируйте стол на <b>{len(participants)} человек</b>, "
        f"затем нажмите <b>Подтвердить</b>."
    )


def format_confirmed(
    restaurant_name: str,
    proposed_date: str,
    proposed_time: str,
    participants_count: int,
) -> str:
    return (
        f"✅ <b>Круг подтверждён!</b>\n\n"
        f"Пользователи получат уведомления.\n"
        f"«{restaurant_name}» · {proposed_date}, {proposed_time} · {participants_count} чел\n\n"
        f"Если планы изменятся:"
    )


def format_rejected() -> str:
    return "❌ Круг отклонён. Группа будет включена в следующий матчинг."


def format_cancelled() -> str:
    return (
        "🚫 <b>Встреча отменена.</b>\n"
        "Все участники получат уведомление об отмене."
    )


def format_next_restaurant(
    restaurant_name: str,
    restaurant_address: str,
    restaurant_phone: str,
    restaurant_rating: float | None,
    claude_reason: str,
    is_last: bool,
) -> str:
    rating_str = f"⭐ {restaurant_rating:.1f}" if restaurant_rating else "рейтинг неизвестен"
    suffix = "\n\n⚠️ Это последний вариант из найденных." if is_last else ""
    return (
        f"🔄 <b>Следующий вариант:</b>\n\n"
        f"🍽 «{restaurant_name}»\n"
        f"   {restaurant_address}\n"
        f"   {rating_str} · 📞 {restaurant_phone or 'нет телефона'}\n"
        f"   <i>{claude_reason}</i>"
        f"{suffix}"
    )


def format_date_prompt() -> str:
    return (
        "✏️ Введите новую дату и время в формате:\n"
        "<code>дд.мм чч:мм</code>\n\n"
        "Например: <code>16.05 19:30</code>"
    )


def format_date_updated(new_date: str, new_time: str) -> str:
    return f"📅 Дата обновлена: <b>{new_date}, {new_time}</b>"


def format_user_invitation(
    user_name: str,
    district: str,
    restaurant_name: str,
    proposed_date: str,
    proposed_time: str,
) -> str:
    return (
        f"Привет, {user_name}! 🌙\n\n"
        f"Для тебя нашёлся круг в районе «{district}».\n\n"
        f"📅 {proposed_date} в {proposed_time}\n"
        f"📍 «{restaurant_name}» (адрес придёт за 6 часов до начала)\n\n"
        f"Тебя ждут ещё несколько человек — примерно твой возраст, близкие интересы.\n\n"
        f"Идёшь?"
    )


def format_walk_proposal(
    district: str,
    participants: list[dict],
    walk: "WalkLocation",
    proposed_date: str,
    proposed_time: str,
) -> str:
    people_lines = "\n".join(
        f"  • {p.get('name', '?')}, {p.get('age', '?')} лет"
        + (f" — {p.get('work', '')}" if p.get("work") else "")
        for p in participants
    )

    rain_line = ""
    if walk.rain_backup_name:
        addr = f", {walk.rain_backup_address}" if walk.rain_backup_address else ""
        rain_line = f"\n☕ <b>Резерв на дождь:</b> «{walk.rain_backup_name}»{addr}"

    return (
        f"🚶 <b>Новый круг — Прогулка</b>\n\n"
        f"📍 <b>Район:</b> {district}\n"
        f"👥 <b>Участники ({len(participants)} чел):</b>\n{people_lines}\n\n"
        f"🌳 <b>Место:</b> {walk.park_name}\n"
        f"   Точка встречи: {walk.meeting_point}\n"
        f"   {walk.address or ''}"
        f"{rain_line}\n\n"
        f"📅 <b>Предлагаемая дата:</b> {proposed_date}, {proposed_time}\n\n"
        f"Подтвердите прогулку или выберите другое место."
    )


def user_rsvp_keyboard(meetup_id: str) -> dict:
    return {
        "inline_keyboard": [
            [
                {"text": "✅ Иду!", "callback_data": f"rsvp_yes:{meetup_id}"},
                {"text": "❌ Не смогу", "callback_data": f"rsvp_no:{meetup_id}"},
            ]
        ]
    }
