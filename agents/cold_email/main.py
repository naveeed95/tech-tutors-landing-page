#!/usr/bin/env python3
"""
Cold Email Outreach Agent — The Tech Tutors

Usage:
  python main.py --leads leads.csv --limit 30 --delay 45
  python main.py --leads leads.csv --dry-run       # preview emails, don't send
"""
import argparse
import time
import sys
from pathlib import Path

from dotenv import load_dotenv

import lead_reader
import email_writer
import email_sender
import logger


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Cold Email Outreach Agent")
    p.add_argument("--leads",   default="leads.csv",   help="Path to Apollo CSV export")
    p.add_argument("--limit",   type=int, default=30,  help="Max emails to send per run (default: 30)")
    p.add_argument("--delay",   type=int, default=45,  help="Seconds between sends (default: 45)")
    p.add_argument("--dry-run", action="store_true",   help="Generate emails but don't send them")
    return p.parse_args()


def main() -> None:
    load_dotenv()
    args = parse_args()

    if args.dry_run:
        print("[mode] DRY RUN — emails will be generated but NOT sent\n")

    leads = lead_reader.read_leads(args.leads)

    # Filter out already-sent addresses
    new_leads = [l for l in leads if not logger.already_sent(l["email"])]
    skipped   = len(leads) - len(new_leads)
    if skipped:
        print(f"[dedup] Skipped {skipped} already-contacted leads")

    # Apply per-run limit
    to_process = new_leads[: args.limit]
    total = len(to_process)

    if total == 0:
        print("[done] No new leads to process.")
        return

    print(f"[start] Processing {total} leads (limit={args.limit}, delay={args.delay}s)\n")
    sent = 0
    failed = 0

    for i, lead in enumerate(to_process, start=1):
        email = lead["email"]
        company = lead["company"]
        prefix = f"[{i}/{total}]"

        try:
            print(f"{prefix} Writing email for {email} ({company})...", end=" ", flush=True)
            composed = email_writer.write_email(lead)
            subject  = composed["subject"]
            body     = composed["body"]
            print(f'"{subject}"')

            if args.dry_run:
                print(f"{'':>10}--- EMAIL PREVIEW ---")
                print(f"{'':>10}To: {email}")
                print(f"{'':>10}Subject: {subject}")
                print()
                for line in body.strip().split("\n"):
                    print(f"{'':>10}{line}")
                print(f"{'':>10}--- END PREVIEW ---\n")
                logger.mark_sent(email, status="dry-run", subject=subject)
            else:
                email_sender.send_email(email, subject, body)
                logger.mark_sent(email, status="sent", subject=subject)
                sent += 1
                print(f"{prefix} Sent OK")

        except Exception as exc:
            failed += 1
            print(f"{prefix} FAILED — {exc}")
            logger.mark_sent(email, status=f"error: {exc}", subject="")

        # Delay between sends (skip after last)
        if i < total and not args.dry_run:
            print(f"{'':>10}Waiting {args.delay}s...")
            time.sleep(args.delay)

    print(f"\n[done] Sent: {sent}  Failed: {failed}  Total: {total}")
    if not args.dry_run:
        print(f"[log]  Results saved to sent_log.csv")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[interrupted] Stopped by user. Progress saved to sent_log.csv")
        sys.exit(0)
