#!/usr/bin/env python3
"""Build the website catalog from the preserved reference manifest."""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/reference-setups/2026-07/manifest.csv"
OUTPUT = ROOT / "data/derived/catalog.json"

with MANIFEST.open(encoding="utf-8-sig", newline="") as source:
    setups = list(csv.DictReader(source))

catalog = {
    "release": {
        "version": "1.4",
        "releasedOn": "2026-07-28",
        "reviewedOn": "2026-08-10",
        "setupValidation": "V1.4 재검증 필요",
    },
    "setupCount": len(setups),
    "classes": sorted({item["class"] for item in setups}),
    "tracks": sorted({item["track"] for item in setups}),
    "vehicles": sorted({item["vehicle"] for item in setups}),
    "setups": [{**setup, "validation_status": "REVIEW_V14"} for setup in setups],
}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(setups)} setups to {OUTPUT}")
