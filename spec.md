# My Awesome RA PRD (Draft)

## 1) 개요
- 개인용 LaTeX 논문 작성 도구(간단한 Overleaf 지향)
- 기반: Overleaf Community Edition(AGPL-3.0) fork + self-hosting 로컬 중심
- 목표: LaTeX 컴파일 + PDF 미리보기 + 인용 근거 탐색 + 전개 일관성 점검
- UI: Overleaf 기본 편집기/뷰어 재사용 + 우측 패널 확장(Evidence Panel)
- Backend: Upstage SOLAR API 활용(임베딩/문서파싱/정보추출), 로컬 저장소 중심

## 2) 목표 (Goals)
- LaTeX 컴파일 결과를 즉시 확인할 수 있다(PDF + 에러 로그)
- `\cite{key}` 클릭 시 우측 패널에 해당 인용의 원문 후보 근거를 표시한다
- Bib에서 논문을 검색/다운로드하거나, 없을 경우 사용자가 업로드할 수 있다
- 각 논문의 임베딩 처리 상태를 사용자가 확인할 수 있다
- 섹션별 전개 흐름(일관성/누락/비약)을 점검할 수 있다(참고용)
- Overleaf 기반으로 MVP를 빠르게 구성하고 로컬 self-hosting 배포가 가능하다

## 3) 범위 제외 (Non‑Goals)
- 다중 사용자 협업/권한 관리
- 브라우저 기반 실시간 동시 편집 기능 개선
- 완전 자동 인용 근거 확정(정확 매칭은 불가, 추정 기반 제공)
- 멀티 테넌트/외부 SaaS 운영(호스팅 제공 없음)

## 4) 제품 방향: Overleaf CE 기반 + Self‑Hosting
- Overleaf CE의 편집기/컴파일/프로젝트 관리 기능을 재사용한다
- Upstage SOLAR API 연동을 통해 인용 근거 탐색/전개 점검을 고도화한다
- 배포는 사용자 로컬 환경에서의 self-hosting을 기본으로 한다
- "네이티브 배포"는 로컬 실행 가능한 패키징(예: Docker/Toolkit 기반)으로 정의한다

## 5) 핵심 사용자 플로우
1. 사용자가 `.tex`/`.bib` 파일을 열고 편집
2. 컴파일 실행 → PDF 미리보기 + 에러 로그 확인
3. 섹션/`\cite` 클릭 → 우측 패널에 인용 메타 + 근거 후보
4. 논문 PDF가 없으면 검색/다운로드/업로드 수행
5. 임베딩 진행 상태 확인(대기/처리/완료/실패)

## 6) 인용 근거 표시 규칙
- 입력: 현재 섹션 또는 `\cite` 주변 문장
- 출력: 해당 논문에서 유사 문장 Top‑k + 페이지 정보 + 신뢰도(유사도)
- 주의: "추정 결과"라는 명확한 표기 필요

## 7) 데이터 파이프라인 개요
- PDF 저장 → 텍스트 추출 → 청크 분할 → 임베딩 → 벡터 인덱스
- 상태 추적: NOT_FOUND → DOWNLOADED → TEXT_EXTRACTED → EMBEDDING_DONE → FAILED

## 8) 모노레포 폴더 구조

```
my-awesome-ra/
│
├── overleaf/                          # Forked Overleaf CE (git submodule, public)
│   └── services/web/modules/
│       └── evidence-panel/            # Evidence Panel UI 모듈
│
├── apps/
│   └── api/                           # FastAPI 백엔드 (Upstage SOLAR 연동)
│       ├── src/
│       │   ├── main.py
│       │   ├── routers/               # evidence, documents, citations
│       │   ├── services/              # solar, embedding, index
│       │   └── models/
│       ├── tests/
│       ├── pyproject.toml             # uv 사용
│       └── Dockerfile
│
├── packages/
│   ├── solar-client/                  # SOLAR API Python 래퍼
│   │   ├── solar_client/
│   │   │   ├── embedding.py
│   │   │   ├── document_parse.py
│   │   │   └── information_extract.py
│   │   └── pyproject.toml
│   │
│   └── evidence-types/                # 공유 TypeScript 타입
│       ├── src/
│       │   ├── evidence.ts
│       │   └── citation.ts
│       └── package.json
│
├── deployment/
│   ├── docker-compose.yml             # Production compose
│   ├── docker-compose.dev.yml         # Development compose
│   └── overleaf-toolkit/              # Overleaf Toolkit 구성
│
├── data/                              # .gitignore (로컬 데이터)
│   ├── embeddings/
│   ├── faiss/
│   └── parsed/
│
├── scripts/
│   ├── setup.sh
│   ├── dev.sh
│   └── build-module.sh
│
├── docs/
├── patches/                           # Overleaf 패치 (필요시)
├── .gitmodules
├── .env
├── context.md
├── CLAUDE.md
└── spec.md                            # PRD (이 문서)
```

## 9) Overleaf 서브모듈 운영 원칙
- Overleaf CE는 **Public** git submodule로 관리 (AGPL 준수)
- Evidence Panel 모듈은 `overleaf/services/web/modules/evidence-panel/`에 구현
- RA 백엔드 기능은 `apps/api/`에서 별도 개발
- 서브모듈 커밋은 명시적으로 고정(pin)하여 재현 가능한 빌드 보장

## 10) MVP 범위/기능 상세 (Overleaf CE 기반)
### 포함 (In Scope)
- Overleaf CE 기본 기능 유지: 프로젝트 관리, 에디터, 컴파일, PDF 뷰어
- 우측 패널 탭 추가: 인용 근거/논문 메타/임베딩 상태 표시 (Evidence Panel)
- `.bib` 파싱 및 `\cite{key}` 토큰 클릭 이벤트 처리
- 논문 메타 조회 및 PDF 확보:
  - DOI/Title 기반 검색(가능 시)
  - 다운로드 실패 시 사용자 업로드 지원
- 임베딩 파이프라인:
  - PDF 텍스트 추출 → 청크 분할 → 임베딩 → 인덱스
  - 상태 추적 및 재시도
- 인용 근거 표시:
  - `\cite{key}` 주변 문장 → 해당 논문 근거 후보 Top‑k
  - 페이지/유사도 표시 + "추정 결과" 고지

### 제외 (Out of Scope)
- 협업/실시간 동시 편집 기능 개선
- 인용 근거의 자동 확정(정답 보장)
- 멀티 테넌트/외부 SaaS 운영
- 대규모 크롤링/자동 논문 수집

## 11) "우측 패널 + 인용 근거" 아키텍처 스펙
### UI 확장 지점 (Overleaf)
- Overleaf 편집기 화면 우측에 Evidence Panel 모듈 추가
- `editorSidebarComponents`를 통해 등록
- 탭 구성: 기존 Components + Evidence Panel

### Evidence Panel 모듈 구조
```
evidence-panel/
├── index.mjs                      # 모듈 진입점
├── app/src/
│   └── evidence-router.mjs        # Express 라우터 (옵션)
└── frontend/
    ├── js/
    │   ├── components/
    │   │   ├── evidence-panel.tsx     # 메인 패널
    │   │   ├── evidence-card.tsx      # 결과 카드
    │   │   ├── evidence-search.tsx    # 검색 입력
    │   │   └── settings-toggle.tsx    # 자동검색 on/off
    │   ├── hooks/
    │   │   ├── use-evidence.ts
    │   │   └── use-cursor-context.ts
    │   └── context/
    │       └── evidence-context.tsx
    └── stylesheets/
        └── evidence-panel.scss
```

### 이벤트 흐름
1. 사용자 `\cite{key}` 클릭 또는 수동 검색 트리거
2. 프론트에서 `citeKey`, `projectId`, `contextText` 수집
3. `apps/api` 호출 → 메타/상태/근거 후보 조회
4. Evidence Panel 렌더링

### API 엔드포인트 (apps/api)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/evidence/search` | 텍스트로 관련 근거 검색 |
| POST | `/documents/parse` | PDF 파싱 (SOLAR Document Parse) |
| POST | `/documents/index` | 문서 임베딩 & 인덱싱 |
| GET | `/documents/{id}/chunks` | 문서 청크 조회 |
| POST | `/citations/extract` | 인용 정보 추출 (SOLAR IE) |

### 데이터 모델
- `Paper`: id, title, doi, pdfPath, source, createdAt
- `EmbeddingJob`: id, paperId, status, lastUpdatedAt, error
- `EvidenceChunk`: id, paperId, text, page, embeddingId

### 파이프라인 구성 요소
- Extractor: PDF → 텍스트/페이지 분할 (SOLAR Document Parse)
- Chunker: 문단 기반 청크 생성
- Embedder: SOLAR Embedding API
- Index: FAISS 로컬 벡터 인덱스

## 12) 라이선스 및 준수(AGPL-3.0)
- Overleaf CE(AGPL-3.0) 기반 포크로 개발한다
- **Overleaf fork는 Public repository**로 관리 (AGPL 준수)
- 배포 시 LICENSE/NOTICE를 포함하고, 수정 소스 접근 경로를 명시한다
- 네트워크를 통해 제공되는 경우 사용자에게 소스 접근을 보장한다
- UI/문서에 라이선스 고지 및 출처 표기를 명확히 한다

### README 고지 (초안)
```
This project is based on the Overleaf Community Edition, licensed under the AGPL-3.0.
Our modifications are also released under the AGPL-3.0. Source code for the running
version is available in this repository. If you access this service over a network,
you are entitled to receive the corresponding source code.
```

### 제품 내 공지 (UI footer/설정 페이지)
```
Powered by Overleaf Community Edition (AGPL-3.0). This service includes modifications
released under the same license. Source code is available in the project repository.
```

## 13) 리스크 및 고려사항
- LaTeX 컴파일 보안(쉘 이스케이프 비활성화, 타임아웃 필요)
- PDF → 텍스트 추출 품질 편차
- 인용 근거는 추정 결과이므로 정확도 한계 명시 필요
- AGPL 준수(소스 공개/고지) 누락 리스크

## 14) 구현 단계

### Phase 1: Overleaf Hosting 검증 ✅ (현재)
- [x] 프로젝트 구조 설정 (apps/, packages/)
- [x] apps/api 기본 구조 (uv + FastAPI)
- [x] packages/solar-client 기본 구조
- [x] packages/evidence-types 기본 구조
- [ ] **Overleaf Docker 호스팅 검증** ← 현재 마일스톤
- [ ] 기본 프로젝트 생성 및 컴파일 테스트

### Phase 2: apps/api 구현
- [ ] SOLAR Embedding 연동 완성
- [ ] FAISS 인덱싱 완성
- [ ] `/evidence/search` 엔드포인트 테스트
- [ ] `/documents/parse` 엔드포인트 테스트

### Phase 3: Evidence Panel 모듈
- [ ] `modules/evidence-panel/` 생성
- [ ] `settings.defaults.js` 수정
- [ ] `evidence-panel.tsx` 구현
- [ ] 검색 트리거 (수동 기본 + 자동 옵션)
- [ ] apps/api 연동

### Phase 4: 통합 & 테스트
- [ ] Docker Compose 통합 구성
- [ ] E2E 테스트
- [ ] 문서화

## 15) 검증 방법

### Overleaf 호스팅 검증 (Phase 1)
```bash
# Overleaf 컨테이너 시작
cd overleaf
docker-compose up -d

# 헬스체크
curl http://localhost/status

# 웹 브라우저에서 접속
open http://localhost

# 관리자 계정 생성
docker exec sharelatex /bin/bash -c "cd /overleaf/services/web && \
  node modules/server-ce-scripts/scripts/create-user --admin --email=admin@example.com"
```

### apps/api 테스트
```bash
cd apps/api
uv sync
uv run pytest

uv run uvicorn src.main:app --reload
curl -X POST http://localhost:8000/evidence/search \
  -H "Content-Type: application/json" \
  -d '{"query": "neural network"}'
```

### 모듈 빌드 테스트
```bash
cd overleaf/services/web
npm install
npm run webpack:production
cat public/manifest.json | grep evidence
```

## 16) 성공 기준 (MVP)
- 컴파일 + PDF 뷰어 + 에러 로그
- `\cite` 클릭 → bib 메타 표시 + PDF 업로드
- 임베딩 완료 후 근거 후보 문장 표시
- Evidence Panel이 Overleaf 편집기 우측에 표시됨
