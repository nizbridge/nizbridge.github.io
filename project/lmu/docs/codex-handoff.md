# Codex 세션 인수인계 - LMU Setup

최종 갱신: 2026-09-23

## 프로젝트 위치와 Git

- 프로젝트: `/Users/kimss/git/nizbridge/project/lmu`
- Git 저장소 루트: `/Users/kimss/git/nizbridge`
- `lmu`는 독립 저장소가 아니다. `lmu/.git`은 제거했으므로 상위 `nizbridge` 저장소에서 `project/lmu/` 전체를 커밋한다.
- 상위 저장소에 이미 존재하던 변경(`project/index.html`)은 LMU 작업과 무관하므로 함께 수정하거나 커밋하지 않는다.

## 현재 완성된 기능

개인용 정적 웹사이트가 `web/`에 있다. 첫 화면은 랜딩이 아닌 셋업 라이브러리다.

- 클래스, 서킷, 차량 선택 후 `셋업 검색` 버튼으로 368개 셋업을 필터링
- 클래스 선택 후 해당 클래스의 차량만 차량 목록에 표시
- 셋업 카드에서 `.svm`을 직접 다운로드
- `RAW 데이터` 메뉴에서 원본 엑셀의 서킷 특성 16개와 차량 특성 23개를 테이블로 표시
- 상단 릴리스 표시 형식: `RELEASE V1.4.2 (260922)`

## 데이터 구조

- `data/normalized/lmu-setup-db-2026-07.json`: 2026-07 데이터베이스의 전체 7개 시트를 셀·수식 단위로 보존한 기준 데이터다.
- `data/reference-setups/2026-07/`: LMGT3·Hypercar 안정형 `.svm` 368개와 `manifest.csv`.
- `data/reference-setups/2026-09-v1.4.2/`: 웹에서 다운로드하는 V1.4.2 재검증 후보 `.svm` 368개와 `manifest.csv`.
- `data/reference/bop/LMU_BOP_1.4.2_Marked-up.pdf`: 공식 V1.4.2 BoP PDF.
- `data/derived/catalog.json`: 웹 라이브러리용 생성 카탈로그.
- `data/derived/raw-data.json`: 웹 RAW 데이터 메뉴용 생성 파일.

## 생성 명령

프로젝트 루트에서 실행한다.

```bash
python3 scripts/build_catalog.py
python3 scripts/build_raw_data.py
python3 -m http.server 4173
```

웹 주소: `http://localhost:4173/web/`

`catalog.json` 또는 `raw-data.json`을 직접 수정하지 않는다. 기준 JSON 또는 변환 스크립트를 수정한 뒤 다시 생성한다.

## 최신화 기준

현재 게임·BoP 기준은 LMU V1.4.2(2026-09-22)다. 전 트랙 BoP, GT3 브레이크 패드, Daytona·Laguna Seca Hypercar 타이어 변경의 영향은 `docs/releases/2026-09-v1.4.2.md`에 기록했다.

- V1.4.2는 전 트랙 BoP와 GT3 브레이크 패드 최적 온도 범위를 바꿨다.
- 368개 후보 `.svm` 모두 `REVIEW_V142` 상태로 웹 카탈로그에 기록되어 있다.
- 이 상태는 파일이 무효라는 뜻이 아니다. V1.4 장거리 주행으로 확인되기 전, 최신 검증본이라고 단정하지 않는다는 뜻이다.
- BoP가 바뀌었다고 `.svm` 내부 값을 추정해 자동 변경하지 않는다. 트랙 주행 검증 후 새 릴리스 파일을 별도 보존한다.
- V1.4의 Cadillac V-Series.R Evo는 검증된 템플릿이 없어 라이브러리에 넣지 않았다.

자세한 V1.4.2 검토 내용은 `docs/releases/2026-09-v1.4.2.md`를 참고한다.

## 다음 권장 작업

1. COTA Hypercar, Daytona·Laguna Seca Hypercar, 전 트랙 LMGT3의 브레이크 온도·타이어 스틴트를 실제 주행으로 확인한다.
2. 결과를 릴리스별 데이터로 기록할 스키마(차량, 트랙, 패치, 검증일, 출처, 파라미터)를 정의한다.
3. `.svm` 구조를 분석해 보존적 생성기와 결과 검증을 구현한다.
4. 라이브러리에 릴리스/검증 상태 필터와 변경 이력을 추가한다.

## 작업 원칙

- `data/normalized/`와 `data/reference-setups/`는 기준 데이터 보존을 우선한다.
- 외부 자료를 반영할 때는 공식 패치 노트/BoP 문서를 우선하고, 출처 URL과 검토일을 릴리스 문서에 남긴다.
- 사용자 요청이 "최신화해줘"인 경우: 공식 최신 패치·BoP 확인 → 영향 분석 → 근거 자료 보관 → 문서·카탈로그 갱신 → 재검증이 필요한 셋업을 명시한다.
