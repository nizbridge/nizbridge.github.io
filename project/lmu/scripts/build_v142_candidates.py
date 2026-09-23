#!/usr/bin/env python3
"""Create V1.4.2 review candidates from the latest available setup per car/track."""

import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE_ROOT = ROOT / "data/reference-setups/2026-07"
V141_ROOT = ROOT / "data/reference-setups/2026-08-v1.4.1"
OUTPUT_ROOT = ROOT / "data/reference-setups/2026-09-v1.4.2"


def read_manifest(root):
    with (root / "manifest.csv").open(encoding="utf-8-sig", newline="") as source:
        return list(csv.DictReader(source))


def identity(setup):
    return setup["class"], setup["track"], setup["vehicle"]


base_rows = read_manifest(BASE_ROOT)
v141_rows = {identity(row): row for row in read_manifest(V141_ROOT)}
if OUTPUT_ROOT.exists():
    raise SystemExit(f"Refusing to overwrite existing release directory: {OUTPUT_ROOT}")

candidate_rows = []
for base in base_rows:
    prior = v141_rows.get(identity(base))
    source_root = V141_ROOT if prior else BASE_ROOT
    source_row = prior or base
    source_file = source_root / source_row["file"]
    output_file = OUTPUT_ROOT / base["file"]
    contents = source_file.read_text(encoding="utf-8")
    if contents.count("[GENERAL]") != 1 or len(re.findall(r"^Notes=.*$", contents, re.MULTILINE)) != 1:
        raise ValueError(f"Unexpected SVM structure: {source_file}")
    contents = re.sub(r"^//(?:LMU_RELEASE=.*|VALIDATION=.*|BOP=GAME_APPLIED_V141)\n", "", contents, flags=re.MULTILINE)
    contents = contents.replace("//BOP=INFERRED\n", "//SOURCE_BOP=INFERRED\n", 1)
    contents = contents.replace(
        "[GENERAL]\n",
        "//LMU_RELEASE=1.4.2\n//VALIDATION=REVIEW_V142\n//BOP=GAME_APPLIED_V142\n[GENERAL]\n",
        1,
    )
    note = f'Notes="LMU V1.4.2 review | {base["track"]} | setup values carried forward"'
    contents = re.sub(r"^Notes=.*$", note, contents, count=1, flags=re.MULTILINE)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(contents, encoding="utf-8")
    candidate_rows.append({
        **base,
        "release": "1.4.2",
        "validation_status": "REVIEW_V142",
        "update_scope": "All-track BoP; GT3 brake pads; Daytona Hypercar tyres; on-track review required",
        "source_release": "1.4.1" if prior else "2026-07",
    })

with (OUTPUT_ROOT / "manifest.csv").open("w", encoding="utf-8", newline="") as output:
    writer = csv.DictWriter(output, fieldnames=[
        "class", "track", "vehicle", "file", "template_vehicle", "template_status",
        "confidence", "release", "validation_status", "update_scope", "source_release",
    ])
    writer.writeheader()
    writer.writerows(candidate_rows)

print(f"Wrote {len(candidate_rows)} V1.4.2 review candidates to {OUTPUT_ROOT}")
