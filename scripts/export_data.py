#!/usr/bin/env python3
from __future__ import annotations
import csv, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT.parents[0] / 'data' / 'nikkei-micro-paper'
PUBLIC = ROOT / 'public'


def read_csv(path: Path):
    if not path.exists():
        return []
    with path.open('r', encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))


def to_num(v):
    if v is None or v == '':
        return None
    try:
        if '.' in v:
            return float(v)
        return int(v)
    except Exception:
        return v

price = [{k: to_num(v) for k, v in row.items()} for row in read_csv(DATA / 'price.csv')]
board = [{k: to_num(v) for k, v in row.items()} for row in read_csv(DATA / 'board.csv')]
decisions = [{k: to_num(v) for k, v in row.items()} for row in read_csv(DATA / 'decisions.csv')]

PUBLIC.mkdir(parents=True, exist_ok=True)
(PUBLIC / 'paper-data.json').write_text(json.dumps({
    'price': price,
    'board': board,
    'decisions': decisions,
}, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(PUBLIC / 'paper-data.json'))
