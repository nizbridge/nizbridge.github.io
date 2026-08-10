#!/usr/bin/env python3
"""Export selected reference sheets to JSON for the local website."""

import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BOOK = ROOT / "data/raw/LMU_안정형_전체_셋업_DB_2026-07.xlsx"
OUTPUT = ROOT / "data/derived/raw-data.json"
NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

def column(cell_ref):
    return re.match(r"[A-Z]+", cell_ref).group(0)

def shared_strings(book):
    if "xl/sharedStrings.xml" not in book.namelist():
        return []
    root = ET.fromstring(book.read("xl/sharedStrings.xml"))
    return ["".join(item.itertext()) for item in root.findall(f"{NS}si")]

def read_sheet(book, path, strings):
    root = ET.fromstring(book.read(path))
    rows = []
    for row in root.findall(f".//{NS}row"):
        values = {}
        for cell in row.findall(f"{NS}c"):
            value = "".join(cell.itertext())
            if cell.get("t") == "s" and value:
                value = strings[int(value)]
            values[column(cell.get("r"))] = value
        rows.append(values)
    headers = [rows[0].get(chr(65 + index), "") for index in range(26)]
    headers = [header for header in headers if header]
    return [dict(zip(headers, [row.get(chr(65 + index), "") for index in range(len(headers))])) for row in rows[1:] if row.get("A")]

with zipfile.ZipFile(BOOK) as book:
    strings = shared_strings(book)
    payload = {
        "trackProfiles": read_sheet(book, "xl/worksheets/sheet2.xml", strings),
        "carTraits": read_sheet(book, "xl/worksheets/sheet3.xml", strings),
    }

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(payload['trackProfiles'])} track profiles and {len(payload['carTraits'])} car traits")
