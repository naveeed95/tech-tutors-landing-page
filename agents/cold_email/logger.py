"""
Tracks sent emails in sent_log.csv to prevent duplicates.
Columns: email, sent_at, status, subject
"""
import csv
from datetime import datetime, timezone
from pathlib import Path

LOG_FILE = Path(__file__).parent / "sent_log.csv"
COLUMNS  = ["email", "sent_at", "status", "subject"]


def _load_sent() -> set[str]:
    if not LOG_FILE.exists():
        return set()
    with open(LOG_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return {row["email"].lower() for row in reader if row.get("email")}


def already_sent(email: str) -> bool:
    return email.lower() in _load_sent()


def mark_sent(email: str, status: str = "sent", subject: str = "") -> None:
    new_file = not LOG_FILE.exists()
    with open(LOG_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        if new_file:
            writer.writeheader()
        writer.writerow({
            "email":   email.lower(),
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "status":  status,
            "subject": subject,
        })
