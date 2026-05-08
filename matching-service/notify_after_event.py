"""
Entry point: run post-event notifications.
Add to cron every 30 minutes:
    */30 * * * * cd /app && python -m notify_after_event
"""
import logging
import sys

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

from bot.notifier import send_post_event_notifications

if __name__ == "__main__":
    count = send_post_event_notifications()
    print(f"Sent {count} post-event notifications")
    sys.exit(0)
