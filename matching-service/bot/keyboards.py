"""Inline keyboard builders for admin bot."""

from __future__ import annotations


def main_keyboard(meetup_id: str) -> dict:
    """Main keyboard shown with new circle proposal."""
    return {
        "inline_keyboard": [
            [
                {"text": "✅ Подтвердить", "callback_data": f"confirm:{meetup_id}"},
                {"text": "🔄 Другой ресторан", "callback_data": f"next_restaurant:{meetup_id}"},
            ],
            [
                {"text": "🚶 Прогулка", "callback_data": f"switch_walk:{meetup_id}"},
                {"text": "✏️ Изменить дату", "callback_data": f"change_date:{meetup_id}"},
            ],
            [
                {"text": "❌ Отклонить", "callback_data": f"reject:{meetup_id}"},
            ],
        ]
    }


def walk_keyboard(meetup_id: str) -> dict:
    """Keyboard shown after switching to walk format."""
    return {
        "inline_keyboard": [
            [
                {"text": "✅ Подтвердить прогулку", "callback_data": f"confirm:{meetup_id}"},
                {"text": "🔄 Другое место", "callback_data": f"next_walk:{meetup_id}"},
            ],
            [
                {"text": "🍽 Вернуть ресторан", "callback_data": f"switch_restaurant:{meetup_id}"},
                {"text": "✏️ Изменить дату", "callback_data": f"change_date:{meetup_id}"},
            ],
            [
                {"text": "❌ Отклонить", "callback_data": f"reject:{meetup_id}"},
            ],
        ]
    }


def after_confirm_keyboard(meetup_id: str) -> dict:
    """Keyboard after admin confirms — only cancel option remains."""
    return {
        "inline_keyboard": [
            [{"text": "🚫 Отменить встречу", "callback_data": f"cancel:{meetup_id}"}],
        ]
    }


def next_restaurant_keyboard(meetup_id: str, has_more: bool) -> dict:
    """Shown after admin requests another restaurant."""
    rows = [
        [
            {"text": "✅ Этот подходит", "callback_data": f"confirm:{meetup_id}"},
            {"text": "❌ Отклонить круг", "callback_data": f"reject:{meetup_id}"},
        ]
    ]
    if has_more:
        rows.insert(0, [{"text": "🔄 Ещё вариант", "callback_data": f"next_restaurant:{meetup_id}"}])
    return {"inline_keyboard": rows}
