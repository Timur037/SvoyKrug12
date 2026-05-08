"""Entry point: send pending report notifications to admin Telegram."""
import logging, sys
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

from bot.report_notifier import send_report_notifications

if __name__ == "__main__":
    count = send_report_notifications()
    print(f"Sent {count} report alerts")
    sys.exit(0)
