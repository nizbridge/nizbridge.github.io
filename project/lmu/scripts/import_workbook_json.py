#!/usr/bin/env python3
"""Import an LMU reference workbook into the canonical JSON dataset.

The exported JSON preserves every populated cell, including formulas, so the
website and future data tooling do not need the original Excel workbook.
"""

import json
import re
import zipfile
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BOOK = ROOT / "data/raw/LMU_안정형_전체_셋업_DB_2026-07.xlsx"
OUTPUT = ROOT / "data/normalized/lmu-setup-db-2026-07.json"
MAIN_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
REL_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
PACKAGE_REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"


def column(ref):
    return re.match(r"[A-Z]+", ref).group(0)


def shared_strings(book):
    if "xl/sharedStrings.xml" not in book.namelist():
        return []
    root = ET.fromstring(book.read("xl/sharedStrings.xml"))
    return ["".join(item.itertext()) for item in root.findall(f"{MAIN_NS}si")]


def cell_data(cell, strings):
    kind = cell.get("t")
    formula = cell.findtext(f"{MAIN_NS}f")
    value = cell.findtext(f"{MAIN_NS}v", default="")
    if kind == "s" and value:
        value = strings[int(value)]
    elif kind == "inlineStr":
        value = "".join(cell.find(f"{MAIN_NS}is").itertext())
    entry = {"value": value}
    if formula is not None:
        entry["formula"] = formula
    if kind and kind not in {"s", "inlineStr"}:
        entry["type"] = kind
    return entry


def worksheet_entries(book, strings):
    workbook = ET.fromstring(book.read("xl/workbook.xml"))
    relationships = ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))
    targets = {
        relation.get("Id"): relation.get("Target")
        for relation in relationships.findall(f"{PACKAGE_REL_NS}Relationship")
    }
    sheets = []
    for sheet in workbook.findall(f"{MAIN_NS}sheets/{MAIN_NS}sheet"):
        target = targets[sheet.get(f"{REL_NS}id")].lstrip("/")
        path = target if target.startswith("xl/") else f"xl/{target}"
        root = ET.fromstring(book.read(path))
        rows = []
        for row in root.findall(f".//{MAIN_NS}sheetData/{MAIN_NS}row"):
            cells = {
                column(cell.get("r")): cell_data(cell, strings)
                for cell in row.findall(f"{MAIN_NS}c")
            }
            if cells:
                rows.append({"index": int(row.get("r")), "cells": cells})
        sheets.append({"name": sheet.get("name"), "rows": rows})
    return sheets


with zipfile.ZipFile(BOOK) as book:
    payload = {
        "schemaVersion": 1,
        "dataset": {
            "id": "lmu-setup-db-2026-07",
            "migratedFrom": BOOK.name,
            "migratedOn": date.today().isoformat(),
            "sourceFormat": "xlsx",
        },
        "sheets": worksheet_entries(book, shared_strings(book)),
    }

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(payload['sheets'])} sheets to {OUTPUT}")
