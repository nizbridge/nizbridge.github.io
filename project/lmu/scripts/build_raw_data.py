#!/usr/bin/env python3
"""Export selected canonical JSON sheets to website RAW data."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/normalized/lmu-setup-db-2026-07.json"
OUTPUT = ROOT / "data/derived/raw-data.json"

def ordered_columns(cells):
    def position(column):
        number = 0
        for letter in column:
            number = number * 26 + ord(letter) - 64
        return number
    return sorted(cells, key=position)

def read_sheet(dataset, name):
    sheet = next(item for item in dataset["sheets"] if item["name"] == name)
    headers = sheet["rows"][0]["cells"]
    columns = [column for column in ordered_columns(headers) if headers[column]["value"]]
    labels = [headers[column]["value"] for column in columns]
    return [
        {
            label: row["cells"].get(column, {}).get("value", "")
            for column, label in zip(columns, labels)
        }
        for row in sheet["rows"][1:]
        if row["cells"].get("A", {}).get("value")
    ]

dataset = json.loads(SOURCE.read_text(encoding="utf-8"))
payload = {
    "trackProfiles": read_sheet(dataset, "서킷_특성"),
    "carTraits": read_sheet(dataset, "차량_특성"),
}

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(payload['trackProfiles'])} track profiles and {len(payload['carTraits'])} car traits")
