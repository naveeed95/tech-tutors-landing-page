"""
Reads leads from an Apollo.io CSV export.

Expected columns (Apollo default export):
  first_name, last_name, company, title, email, industry, website

Any extra columns are ignored. Rows missing email or company are skipped.
"""
import csv
from pathlib import Path


REQUIRED = {"email", "company"}
OPTIONAL  = {"first_name", "last_name", "title", "industry", "website"}


def read_leads(csv_path: str) -> list[dict]:
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"Leads file not found: {csv_path}")

    leads = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        # Normalise header names to lowercase with underscores
        fieldnames = [h.strip().lower().replace(" ", "_") for h in (reader.fieldnames or [])]
        reader.fieldnames = fieldnames

        for i, row in enumerate(reader, start=2):  # row 1 = header
            row = {k.strip().lower().replace(" ", "_"): v.strip() for k, v in row.items()}

            missing = REQUIRED - set(row.keys())
            if missing:
                print(f"[warn] Row {i}: missing columns {missing} — skipping")
                continue

            if not row.get("email") or not row.get("company"):
                print(f"[warn] Row {i}: empty email or company — skipping")
                continue

            leads.append({
                "first_name": row.get("first_name", ""),
                "last_name":  row.get("last_name",  ""),
                "company":    row.get("company",    ""),
                "title":      row.get("title",      ""),
                "email":      row.get("email",      "").lower(),
                "industry":   row.get("industry",   ""),
                "website":    row.get("website",    ""),
            })

    print(f"[leads] Loaded {len(leads)} valid leads from {csv_path}")
    return leads
