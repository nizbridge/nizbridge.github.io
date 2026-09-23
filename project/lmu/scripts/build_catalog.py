#!/usr/bin/env python3
"""Build the website catalog from the preserved reference manifest."""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE_MANIFEST = ROOT / "data/reference-setups/2026-07/manifest.csv"
CANDIDATE_MANIFEST = ROOT / "data/reference-setups/2026-09-v1.4.2/manifest.csv"
OUTPUT = ROOT / "data/derived/catalog.json"

with BASE_MANIFEST.open(encoding="utf-8-sig", newline="") as source:
    base_setups = list(csv.DictReader(source))

with CANDIDATE_MANIFEST.open(encoding="utf-8-sig", newline="") as source:
    candidate_setups = list(csv.DictReader(source))

def identity(setup):
    return setup["class"], setup["track"], setup["vehicle"]

candidate_by_identity = {identity(item): item for item in candidate_setups}
if len(candidate_by_identity) != len(base_setups) or {identity(item) for item in base_setups} != set(candidate_by_identity):
    raise ValueError("V1.4.2 candidate manifest must cover every base setup exactly once")
setups = [candidate_by_identity[identity(item)] for item in base_setups]

catalog = {
    "release": {
        "version": "1.4.2",
        "releasedOn": "2026-09-22",
        "reviewedOn": "2026-09-23",
        "setupValidation": "V1.4.2 전 트랙 재검증 필요",
    },
    "setupCount": len(setups),
    "classes": sorted({item["class"] for item in setups}),
    "tracks": sorted({item["track"] for item in setups}),
    "vehicles": sorted({item["vehicle"] for item in setups}),
    "setups": setups,
}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(setups)} setups to {OUTPUT}")
