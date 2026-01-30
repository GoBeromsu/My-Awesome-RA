# 문제 상황 기록 (대화 기반 요약)

## 1) 프로젝트 초기화/구조 재구성
- 사용자가 `.claude`, `claude.md`, `.env`만 남기고 전체 삭제 요청.
- 해당 삭제 수행 후 새 폴더 구조를 생성함.
- `spec.md` 재작성 완료.

## 2) Overleaf 서브모듈 추가
- `overleaf`를 git submodule로 추가하려고 했고, 네트워크 권한 문제로 일부 작업에 escalated permission이 필요했음.
- 클론 시간이 오래 걸려 초기 `git submodule add`가 timeout 되었고, 이후 `fetch`와 `checkout`을 별도 수행.
- 최종적으로 `.gitmodules`에 submodule 등록 완료.

## 3) Overleaf Toolkit 클론/구동 이슈
- `deployment/overleaf-toolkit`에 toolkit을 클론하려고 했으나, 해당 경로에 비어있지 않은 디렉터리가 계속 생성되어 클론이 반복 실패.
- 원인은 Docker가 만든 `deployment/overleaf-toolkit/data/...`가 자동으로 재생성되는 것으로 보임.
- 이를 제거하기 위해 `rm -rf`를 반복했으나, 데이터 폴더가 다시 생김.
- 해결 방안: 
  - (A) toolkit 경로를 완전히 비운 뒤 재클론
  - (B) 다른 경로로 새로 클론

## 4) Overleaf Toolkit 실행 오류
- `bin/up` 실행 시 다음 오류 발생:
  - `Invalid MONGO_VERSION: MONGO_VERSION=8.0`
  - 메시지: `MONGO_VERSION must start with the actual major version of mongo, followed by a dot.`
- 원인은 toolkit 내부 스크립트가 `sed -r`(GNU sed) 구문을 사용했는데, macOS 기본 sed에서는 동작이 달라 값 파싱이 실패하는 것으로 보임.
- 임시로 `lib/shared-functions.sh`에서 `sed -r`을 `sed -E`로 변경했으나, 이후 reset으로 파일이 제거됨.
- 재구동 시에는 macOS sed 호환성 패치가 다시 필요할 수 있음.

## 5) Docker 관련 상태
- Docker Desktop은 실행 중이며, 로컬에 다른 컨테이너가 떠 있음.
- Overleaf 구동을 위해 Docker daemon 접근 권한이 필요했고, escalated permission을 사용해야 정상 동작했음.

## 6) 미완료 작업
- Overleaf Toolkit 재클론 및 `bin/init`/`bin/up`까지 구동 완료 상태가 아님.
- Overleaf UI 수정은 아직 시작하지 않았음(우측 패널 Evidence 탭 추가 예정).


## 7) 프로젝트 시작 목적과 방향 (요약)
- 과제 1 요구사항(Upstage Solar/Document Parse/Information Extract API 활용) 충족을 위해 시작.
- 기존 Streamlit 대신 **Overleaf CE 기반**으로 UI/컴파일/프로젝트 관리 기능을 재사용하고,
  Upstage API를 붙여 연구 프로세스(인용 근거 추적/논문 관리/전개 점검)를 고도화하는 것이 목표.
- 개인용/로컬 self-hosting 중심으로 배포하며, 외부 공개는 가능하되 상용/호스팅 제공 목적은 아님.
- AGPL-3.0 준수(소스 공개/라이선스 고지)를 명확히 포함할 예정.

## 8) 합의된 폴더 구조 (최종안)
```
.
├── overleaf/             # Overleaf CE git submodule (upstream fork)
├── services/
│   ├── ra-api/            # Upstage 연동, 인용/임베딩 API
│   └── ra-worker/         # 백그라운드 임베딩 파이프라인(옵션)
├── packages/
│   └── ra-core/           # 공통 도메인/유틸 (파싱, 상태 모델)
├── deployment/
│   └── overleaf-toolkit/  # 로컬 self-hosting용 Toolkit
├── patches/               # Overleaf 변경 패치(선택)
├── data/                  # 로컬 DB/인덱스/임베딩 캐시
├── docs/                  # 설계 문서
├── scripts/               # 개발/배포 유틸
├── spec.md                # PRD
└── context.md             # 진행/이슈 기록
```

## 9) UI 통합 방향 (합의 내용)
- Overleaf 기본 UI에 **우측 사이드바 Evidence 탭**을 추가하는 방식이 MVP에 적합.
- 섹션 단위로 인용과의 연결을 보여주며, `\cite{key}` 클릭 시 Evidence 탭을 활성화.
- PDF 왼쪽에 새 패널을 추가하는 것은 MVP에서는 리스크가 커서 후순위로 두기로 함.

