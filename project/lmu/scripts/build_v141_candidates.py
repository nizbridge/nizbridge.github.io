#!/usr/bin/env python3
"""Create versioned V1.4.1 setup candidates without overwriting 2026-07 sources."""

import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "data/reference-setups/2026-07"
SOURCE_MANIFEST = SOURCE_ROOT / "manifest.csv"
OUTPUT_ROOT = ROOT / "data/reference-setups/2026-08-v1.4.1"
TARGET_TRACKS = {"Daytona", "Laguna Seca", "Circuit de la Sarthe"}

with SOURCE_MANIFEST.open(encoding="utf-8-sig", newline="") as source:
    source_rows = list(csv.DictReader(source))

if OUTPUT_ROOT.exists():
    raise SystemExit(f"Refusing to overwrite existing release directory: {OUTPUT_ROOT}")

candidate_rows = []
for setup in source_rows:
    if setup["track"] not in TARGET_TRACKS:
        continue
    source_file = SOURCE_ROOT / setup["file"]
    output_file = OUTPUT_ROOT / setup["file"]
    output_file.parent.mkdir(parents=True, exist_ok=True)
    contents = source_file.read_text(encoding="utf-8")
    notes = f'Notes="LMU V1.4.1 candidate | {setup["track"]} | brake duct revalidation required"'
    contents = contents.replace("[GENERAL]\n", "//LMU_RELEASE=1.4.1\n//VALIDATION=REVIEW_V141\n//BOP=GAME_APPLIED_V141\n[GENERAL]\n", 1)
    contents = re.sub(r"^Notes=.*$", notes, contents, count=1, flags=re.MULTILINE)
    output_file.write_text(contents, encoding="utf-8")
    candidate_rows.append({
        **setup,
        "release": "1.4.1",
        "validation_status": "REVIEW_V141",
        "update_scope": "BoP game-applied; brake duct revalidation required",
    })

with (OUTPUT_ROOT / "manifest.csv").open("w", encoding="utf-8", newline="") as output:
    writer = csv.DictWriter(output, fieldnames=[
        "class", "track", "vehicle", "file", "template_vehicle", "template_status",
        "confidence", "release", "validation_status", "update_scope",
    ])
    writer.writeheader()
    writer.writerows(candidate_rows)

print(f"Wrote {len(candidate_rows)} V1.4.1 candidate setups to {OUTPUT_ROOT}")
