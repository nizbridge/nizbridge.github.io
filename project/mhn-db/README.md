# MHN.Quest 공개 데이터 스냅샷

출처: https://mhn.quest/ . 수집 시각과 원본 URL·SHA-256은 `manifest.json` 참조.
서버 내부 DB 덤프가 아니라 웹사이트가 공개 배포한 클라이언트용 데이터입니다.

## 파일

- `mhn.sqlite3`: 조회용 SQLite DB
- `json/data.json`: 장비, 몬스터, 스킬 목록, 강화 비용, 능력치 등 원래 데이터 구조
- `json/ko.json`: 한국어 명칭, 설명, UI 번역
- `json/motions.json`: 무기 모션 데이터
- `json/smelt.json`: 표류연성 데이터
- `raw/`: 변환에 사용한 원본 JavaScript 모듈과 HTML
- `build.py`: 저장한 원본을 JSON 및 SQLite로 다시 변환 (`python3 build.py`, Node.js 필요)

## SQLite 테이블

- `monsters`: 몬스터 가이드 69건 (`id`, `name_ko`, `payload`)
- `equipment_sets`: 장비 계열 89건 (`id`, `payload`); 개별 무기·방어구 개수가 아닙니다.
- `skills`: 스킬 목록 110건 (`id`, `name_ko`, `description_ko`)
- `datasets`: 원본 모듈의 default export 전체를 JSON으로 보존
- `sections`: 네 데이터셋의 최상위 항목 282개를 JSON으로 보존

```sql
SELECT id, name_ko, json_extract(payload, '$.weakness') AS weakness
FROM monsters;

SELECT id, name_ko FROM skills;

SELECT payload FROM sections
WHERE dataset = 'data' AND section = 'weaponCost';
```

원본 ID와 배열 순서를 유지했습니다. 일부 스킬 ID는 중국어이며 한국어 표기는
번역 테이블을 통해 연결합니다. 번역이 없는 항목은 NULL입니다.
강화 비용과 스탯은 계열·등급별 공통 표를 참조하므로, 각 장비의 최종 스탯과
필요 재료를 모두 계산해 펼친 관계형 DB는 아닙니다.
이미지, 서버 전용 데이터, 사이트의 계산 로직은 수집 범위에 포함되지 않습니다.
이 데이터가 게임 공식 데이터와 일치하는지는 별도로 검증하지 않았습니다.

파일명에는 배포 해시가 들어 있어 사이트 업데이트 시 바뀔 수 있습니다.
`build.py`는 오프라인 재변환 도구이며 최신 데이터를 자동 다운로드하지 않습니다.
재수집 시 사이트 HTML과 메인 JS의 import 경로를 확인해야 합니다.
공개 접근 가능 여부와 별개로 재배포 라이선스는 확인되지 않았습니다.
