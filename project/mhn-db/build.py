"""Rebuild JSON and SQLite from the saved public MHN.Quest data modules.
Requires Python 3 and Node.js. No network requests are made.
"""
import datetime
import hashlib
import json
from pathlib import Path
import sqlite3
import subprocess

ROOT = Path(__file__).resolve().parent
EXTRACT = r'''
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(process.argv[1], 'utf8');
const match = source.match(/export\{([^}]+)\};?\s*$/);
if (!match) throw new Error('Unsupported module export format');
const pairs = match[1].split(',').map(x => x.trim().split(/\s+as\s+/));
if (!pairs.every(p => p.every(x => /^[\w$]+$/.test(x)))) throw new Error('Invalid export');
const expression = '{' + pairs.map(([a,b]) => JSON.stringify(b || a) + ':' + a).join(',') + '}';
const value = vm.runInNewContext(source.slice(0, match.index) + ';(' + expression + ')',
  Object.create(null), {timeout: 2000, contextCodeGeneration: {strings: false, wasm: false}});
process.stdout.write(JSON.stringify(value.default));
'''

def encode(value):
    return json.dumps(value, ensure_ascii=False)

payloads = {}
for name in ('data', 'ko', 'motions', 'smelt'):
    output = subprocess.check_output(['node', '-e', EXTRACT, str(ROOT / 'raw' / f'mhn-{name}.mjs')], text=True)
    payloads[name] = json.loads(output)
    (ROOT / 'json' / f'{name}.json').write_text(json.dumps(payloads[name], ensure_ascii=False, indent=2) + '\n')

db_path = ROOT / 'mhn.sqlite3'
# This generated database belongs to this script; rebuild it atomically.
temp = ROOT / 'mhn.sqlite3.tmp'
if temp.exists():
    temp.unlink()
with sqlite3.connect(temp) as db:
    db.executescript('''
    CREATE TABLE datasets (name TEXT PRIMARY KEY, payload TEXT NOT NULL);
    CREATE TABLE sections (dataset TEXT, section TEXT, payload TEXT NOT NULL, PRIMARY KEY(dataset,section));
    CREATE TABLE monsters (id TEXT PRIMARY KEY, name_ko TEXT, payload TEXT NOT NULL);
    CREATE TABLE equipment_sets (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
    CREATE TABLE skills (id TEXT PRIMARY KEY, name_ko TEXT, description_ko TEXT);
    ''')
    for name, data in payloads.items():
        db.execute('INSERT INTO datasets VALUES (?,?)', (name, encode(data)))
        for key, value in data.items():
            db.execute('INSERT INTO sections VALUES (?,?,?)', (name, key, encode(value)))
    data, ko = payloads['data'], payloads['ko']
    for key, value in data['guide'].items():
        db.execute('INSERT INTO monsters VALUES (?,?,?)', (key, ko.get('monster-name', {}).get(key), encode(value)))
    for key, value in data['set'].items():
        db.execute('INSERT INTO equipment_sets VALUES (?,?)', (key, encode(value)))
    for key in data['skills']:
        description = ko.get('skill', {}).get(key)
        db.execute('INSERT INTO skills VALUES (?,?,?)', (key, ko.get('skill-name', {}).get(key), encode(description) if description is not None else None))
    assert db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
    for name, value in payloads.items():
        assert json.loads(db.execute('SELECT payload FROM datasets WHERE name=?', (name,)).fetchone()[0]) == value
    print({table: db.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0] for table in ('monsters','equipment_sets','skills','sections')})
temp.replace(db_path)
