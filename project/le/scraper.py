#!/usr/bin/env python3
"""
LMU RaceControl Schedule Scraper
실행: python3 scraper.py
"""

import requests
from bs4 import BeautifulSoup
import json, re, math, os
from datetime import date

URL = "https://community.lemansultimate.com/index.php?threads/%E2%8C%9B%E2%8F%B2-racecontrol-events-schedule-%E2%8F%B2%E2%8C%9B.3158/"
API_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "api")

MONTHS = {
    'january':1,'february':2,'march':3,'april':4,'may':5,'june':6,
    'july':7,'august':8,'september':9,'october':10,'november':11,'december':12
}
GRADE_MAP = {'beginner':'SR B1', 'intermediate':'SR S1', 'advanced':'SR G1'}
CLASS_PATTERNS = [
    (r'hypercar','HYP'),(r'lmp2','LMP2'),(r'lmp3','LMP3'),
    (r'lmgt3|gt3','GT3'),(r'genesis|gmr','GMR'),
]
START_UTC = "15:20"  # KST 00:20 기준


# ── 유틸 ────────────────────────────────────────────────────────────────────

def fetch_post_text():
    r = requests.get(URL, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, 'html.parser')
    wrapper = soup.find('div', class_='bbWrapper')
    if not wrapper:
        raise RuntimeError("게시글을 찾을 수 없습니다. 로그인 필요 or 선택자 변경")
    return wrapper.get_text('\n')

def join_split_lines(text):
    """
    XenForo가 이벤트 이름과 설명을 별도 줄로 분리하는 것을 합칩니다.
    예:
      Silver Arrow Showdown\n: Portimao...  →  Silver Arrow Showdown: Portimao...
      WEC Weekly \n[SR S1]\n: Monza...      →  WEC Weekly [SR S1]: Monza...
    """
    lines = text.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        # 다음 줄이 ": ..." 형태인지 확인 (이벤트 설명)
        j = i + 1
        # [SR X] 또는 [Open Entry] 태그를 중간에 건너뛰기
        while j < len(lines) and re.match(r'^\[(SR\s+\w+|Open Entry)\]\s*$', lines[j].strip(), re.I):
            tag = lines[j].strip()
            line = line.rstrip() + ' ' + tag
            j += 1

        if j < len(lines) and lines[j].strip().startswith(':'):
            line = line.rstrip() + lines[j].strip()
            i = j + 1
        else:
            i += 1

        result.append(line)
    return '\n'.join(result)

def parse_from_date(line):
    m = re.search(r'From:\s*(\d+)(?:st|nd|rd|th)?\s+(\w+)\s+(\d{4})', line, re.I)
    if m:
        month = MONTHS.get(m.group(2).lower(), 0)
        if month:
            return date(int(m.group(3)), month, int(m.group(1)))
    return None

def effective_cycle(race_min, interval_min):
    """사이클 = (⌈race/interval⌉ + 1) × interval"""
    return (math.ceil(race_min / interval_min) + 1) * interval_min

def generate_times(cycle_min, start_utc=START_UTC):
    h, m = map(int, start_utc.split(':'))
    start = h * 60 + m
    count = max(1, round(24 * 60 / cycle_min))
    times = []
    for i in range(count):
        t = (start + i * cycle_min) % (24 * 60)
        times.append(f"{t//60:02d}:{t%60:02d}")
    return times

def parse_utc_schedule(line):
    m = re.search(r'UTC\s+Days?\s*(?:&|and)?\s*Times?:\s*(.+?)\s*@\s*(.+)', line, re.I)
    if not m:
        return None
    days = m.group(1).strip().split()
    times = re.findall(r'\d{2}:\d{2}', m.group(2))
    return {d: list(times) for d in days}

def extract_class(text):
    parts = []
    for pattern, label in CLASS_PATTERNS:
        if re.search(pattern, text, re.I) and label not in parts:
            parts.append(label)
    return ' '.join(parts) if parts else 'GT3'

def parse_settings(line):
    result = {}
    m = re.search(r'every\s+(\d+)\s*min', line, re.I)
    if m: result['interval'] = int(m.group(1))
    m = re.search(r'(\d+)m\s+races?', line, re.I)
    if m: result['race_min'] = int(m.group(1))
    m = re.search(r'(\d+)\s+car\s+splits?', line, re.I)
    if m: result['car'] = m.group(1)
    return result

def detect_grade(line):
    line_l = line.lower()
    for grade in ('beginner', 'intermediate', 'advanced'):
        if grade in line_l:
            for sr in ('bronze', 'silver', 'gold', 'sr b', 'sr s', 'sr g'):
                if sr in line_l:
                    return grade
    return None

def get_current_period(periods):
    today = date.today()
    valid = [d for d in periods if d <= today]
    return max(valid) if valid else (max(periods) if periods else None)


# ── 파서 ────────────────────────────────────────────────────────────────────

def parse_post(text):
    text = join_split_lines(text)
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    grades = {}
    weekly = {}

    current_grade = None
    current_period_date = None
    current_settings = {}
    current_events = []
    in_weekly = False
    current_weekly_ev = None

    def flush_period():
        nonlocal current_events, current_weekly_ev
        if in_weekly:
            if current_weekly_ev and current_period_date is not None:
                weekly.setdefault(current_period_date, []).append(current_weekly_ev)
                current_weekly_ev = None
        elif current_grade and current_period_date is not None:
            grades.setdefault(current_grade, {})[current_period_date] = {
                'settings': dict(current_settings),
                'events': list(current_events),
            }
        current_events = []

    for line in lines:
        # 섹션 헤더
        grade = detect_grade(line)
        if grade:
            flush_period()
            in_weekly = False
            current_grade = grade
            current_period_date = None
            current_settings = {}
            current_events = []
            current_weekly_ev = None
            continue

        if 'weekly races' in line.lower():
            flush_period()
            in_weekly = True
            current_grade = None
            current_period_date = None
            current_events = []
            current_weekly_ev = None
            continue

        # From: 날짜
        from_date = parse_from_date(line)
        if from_date:
            flush_period()
            current_period_date = from_date
            current_events = []
            current_weekly_ev = None
            continue

        # 설정 줄
        if re.search(r'starts\s+every|every\s+\d+\s*min', line, re.I):
            s = parse_settings(line)
            if s:
                current_settings.update(s)
            continue

        if in_weekly:
            # 이벤트 헤더: "Name [SR X]: Track, Class"
            if re.search(r'\[(SR\s+\w+|Open Entry)\]', line, re.I) and ':' in line:
                if current_weekly_ev and current_period_date is not None:
                    weekly.setdefault(current_period_date, []).append(current_weekly_ev)

                # 이름 파싱: bracket 앞부분
                name_m = re.match(r'^(.+?)\s*\[', line)
                rest_m = re.search(r'\]\s*:\s*(.+)', line)
                track_class = rest_m.group(1).strip() if rest_m else ''
                parts = [p.strip() for p in track_class.split(',', 1)]

                current_weekly_ev = {
                    'name': name_m.group(1).strip() if name_m else '',
                    'track': parts[0] if parts else '',
                    'class_desc': parts[1] if len(parts) > 1 else '',
                    'car': None, 'race_min': None, 'schedule': None,
                }
            elif current_weekly_ev:
                s = parse_settings(line)
                if 'car' in s and not current_weekly_ev['car']:
                    current_weekly_ev['car'] = s['car']
                if 'race_min' in s and not current_weekly_ev['race_min']:
                    current_weekly_ev['race_min'] = s['race_min']
                sched = parse_utc_schedule(line)
                if sched:
                    current_weekly_ev['schedule'] = sched

        else:
            # Daily 이벤트: "Name [SR?]: Track, Class[, Xm races]" 형태 (join 후)
            if ':' in line and current_period_date is not None:
                colon = line.index(':')
                name = line[:colon].strip()
                rest = line[colon+1:].strip()
                # 너무 짧거나 긴 이름, URL, 설정 줄 제외
                if (2 < len(name) < 80
                        and not re.search(r'^(From|UTC|http|starts)', name, re.I)
                        and not re.search(r'every\s+\d+', name, re.I)):
                    race_m = re.search(r'(\d+)m\s+races?', rest, re.I)
                    current_events.append({
                        'name': re.sub(r'\s*\[.*?\]\s*$', '', name).strip(),
                        'desc': rest,
                        'race_min': int(race_m.group(1)) if race_m else None,
                    })

    flush_period()
    if current_weekly_ev and current_period_date is not None:
        weekly.setdefault(current_period_date, []).append(current_weekly_ev)

    return grades, weekly


# ── JSON 빌더 ────────────────────────────────────────────────────────────────

def build_daily_json(grade_name, slot_num, event, settings):
    interval = settings.get('interval', 20)
    race_min = event.get('race_min') or settings.get('race_min', 20)
    car = settings.get('car', '24')
    cycle = effective_cycle(race_min, interval)
    return {
        'name': f"{grade_name.title()} Race-{slot_num}",
        'grade': GRADE_MAP.get(grade_name, 'SR S1'),
        'class': extract_class(event['desc']),
        'car': str(car),
        'time': str(race_min),
        'times': generate_times(cycle),
    }

def build_weekly_json(slot_num, event):
    return {
        'name': f"Weekly Race-{slot_num}",
        'grade': 'SR S1',
        'class': extract_class(event.get('class_desc', '')),
        'car': str(event.get('car') or '38'),
        'time': str(event.get('race_min') or '100'),
        'schedule': event.get('schedule') or {},
    }

def save_json(filename, data):
    path = os.path.join(API_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ── 메인 ────────────────────────────────────────────────────────────────────

def main():
    print("포럼 페이지 가져오는 중...")
    text = fetch_post_text()

    print("파싱 중...\n")
    grades, weekly = parse_post(text)

    for grade_name in ('beginner', 'intermediate', 'advanced'):
        periods = grades.get(grade_name, {})
        if not periods:
            print(f"[{grade_name.upper()}] 데이터 없음")
            continue
        cur_date = get_current_period(periods)
        period = periods[cur_date]
        settings = period['settings']
        events = period['events']
        print(f"[{grade_name.upper()}] From: {cur_date}  설정: {settings}")
        for slot, event in enumerate(events[:2], 1):
            race_min = event.get('race_min') or settings.get('race_min', 20)
            interval = settings.get('interval', 20)
            cycle = effective_cycle(race_min, interval)
            data = build_daily_json(grade_name, slot, event, settings)
            filename = f"{grade_name}-race{slot}.json"
            save_json(filename, data)
            print(f"  → {filename}  '{event['name']}'  {race_min}m / {cycle}min cycle / {len(data['times'])}개")

    print()
    if not weekly:
        print("[WEEKLY] 데이터 없음")
    else:
        cur_date = get_current_period(weekly)
        events = weekly[cur_date]
        print(f"[WEEKLY] From: {cur_date}  총 {len(events)}개")
        for slot, event in enumerate(events[:2], 1):
            data = build_weekly_json(slot, event)
            filename = f"weekly{slot}.json"
            save_json(filename, data)
            days = list(data['schedule'].keys()) if data['schedule'] else []
            print(f"  → {filename}  '{event['name']}'  요일: {days}")

    print("\n완료!")


if __name__ == '__main__':
    main()
