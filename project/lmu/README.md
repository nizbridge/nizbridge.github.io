# LMU Setup

Le Mans Ultimate(LMU)를 위한 안정형 레이스 셋업 데이터베이스, `.svm` 생성기, 웹 브라우저를 개발하는 프로젝트입니다.

## 구성

- `docs/` — 프로젝트 방향, 데이터 규칙, 조사 및 운영 문서
- `data/` — 원본 스프레드시트와 가져온 참조 셋업 데이터
- `templates/` — 생성기가 기준으로 삼는 검증된 `.svm` 템플릿
- `scripts/` — 데이터 정규화, 검증, `.svm` 생성, ZIP 내보내기 도구
- `web/` — 셋업 검색·비교·다운로드 웹 애플리케이션

## 현재 포함 자료

- 2026-07 안정형 전체 셋업 데이터베이스 스프레드시트
- LMGT3와 Hypercar의 트랙별 안정형 `.svm` 참조 셋업(368개)
- 참조 셋업 매니페스트

## 다음 개발 단계

1. 스프레드시트 구조와 `.svm` 필드를 분석해 표준 데이터 모델을 정의합니다.
2. 정규화된 JSON/DB 데이터에서 `.svm` 파일을 재현하는 생성기를 구현합니다.
3. 차량·트랙·성향별 셋업을 검색하고 ZIP으로 내려받는 웹 서비스를 만듭니다.
4. LMU 패치·BoP 변경마다 데이터 버전과 검증 기록을 갱신합니다.

## 웹사이트 실행

카탈로그를 새로 만들고 프로젝트 루트에서 정적 웹 서버를 실행합니다.

```bash
python3 scripts/build_catalog.py
python3 scripts/build_raw_data.py
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173/web/`를 열면 됩니다. 웹사이트는 `data/derived/catalog.json`과 참조 `.svm` 파일을 직접 사용합니다.

자세한 범위와 원칙은 [프로젝트 컨텍스트](docs/project-context.md)를 참고하세요.
