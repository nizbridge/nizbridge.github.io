#!/usr/bin/env python3
"""Build the website catalog from the preserved reference manifest."""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE_MANIFEST = ROOT / "data/reference-setups/2026-07/manifest.csv"
CANDIDATE_MANIFEST = ROOT / "data/reference-setups/2026-08-v1.4.1/manifest.csv"
OUTPUT = ROOT / "data/derived/catalog.json"

with BASE_MANIFEST.open(encoding="utf-8-sig", newline="") as source:
    base_setups = [{**item, "release": "1.4", "validation_status": "REVIEW_V141"} for item in csv.DictReader(source)]

with CANDIDATE_MANIFEST.open(encoding="utf-8-sig", newline="") as source:
    candidate_setups = list(csv.DictReader(source))

def identity(setup):
    return setup["class"], setup["track"], setup["vehicle"]

candidate_by_identity = {identity(item): item for item in candidate_setups}
setups = [candidate_by_identity.get(identity(item), item) for item in base_setups]

catalog = {
    "release": {
        "version": "1.4.1",
        "releasedOn": "2026-08-10",
        "reviewedOn": "2026-09-07",
        "setupValidation": "V1.4.1 재검증 필요 (공식 최신화 확인: 2026-09-07)",
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
