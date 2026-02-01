# My Awesome RA

> **AI Agent for Reference-Grounded LaTeX Paper Writing**
> Powered by [Upstage SOLAR API](https://console.upstage.ai/)

**My Awesome RA**는 논문 작성 중 *현재 작성 중인 문단*에 맞는 참고문헌 근거를 자동으로 찾아주는 **Evidence Panel 기반 AI Agent**입니다.
Overleaf Community Edition(CE)을 포크하여, 에디터 내부에서 **근거 탐색 → 확인 → 인용**까지 한 흐름으로 수행할 수 있도록 설계되었습니다.

---

## Why My Awesome RA?

논문 작성 과정에서 가장 자주 흐름이 끊기는 지점은 **근거를 찾고 검증하는 순간**입니다.
My Awesome RA는 다음 질문에 즉시 답하는 것을 목표로 합니다.

* *“이 문장을 뒷받침하는 근거가 뭐였지?”*
* *“어디 페이지를 인용한 거지?”*
* *“에디터를 벗어나지 않고 확인할 수 없을까?”*

---

## Demo

![Evidence Panel Demo](docs/images/demo.png)

---

## Features

| Feature                   | Description                       | Status |
| ------------------------- | --------------------------------- | ------ |
| **Evidence Search**       | 현재 문단 의미 기반 근거 자동 검색 (500ms 디바운스) | ✅      |
| **Chat Panel**            | 참고문헌 기반 RAG 질의응답                  | ✅      |
| **PDF Upload & Indexing** | PDF → SOLAR 파싱 → ChromaDB 인덱싱     | ✅      |
| **Reference Library**     | `.bib` 기반 참고문헌 목록 관리              | ✅      |

---

## How It Works (High-Level)

1. 사용자가 LaTeX 문단을 작성합니다.
2. 에디터가 현재 커서 위치의 문단을 감지합니다.
3. 문단 의미를 기반으로 관련 참고문헌 구간을 검색합니다.
4. Evidence Panel에서 근거를 즉시 확인하고 인용합니다.

> 핵심은 **“검색하지 않아도, 쓰는 순간 근거가 보인다”**는 점입니다.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Overleaf CE                          │
│  ┌──────────────────┐    ┌────────────────────────────┐    │
│  │   LaTeX Editor   │    │    Evidence Panel Module   │    │
│  │  (CodeMirror 6)  │───▶│  - Evidence 자동 검색      │    │
│  │                  │    │  - Chat (RAG Q&A)          │    │
│  └──────────────────┘    │  - PDF 업로드/인덱싱       │    │
│                          └────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /evidence    │  │ /documents   │  │ /chat        │      │
│  │ /search      │  │ /upload      │  │ /ask         │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         ▼                 ▼                 ▼               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Upstage SOLAR API                   │   │
│  │  • Embeddings (4096-dim)                             │   │
│  │  • Document Parse                                   │   │
│  │  • Chat Completions (solar-pro)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │  ChromaDB    │  (persistent vector store)               │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

* Docker & Docker Compose
* [Upstage API Key](https://console.upstage.ai/)

---

### Demo Mode (Recommended)

```bash
git clone --recursive https://github.com/GoBeromsu/my-awesome-ra.git
cd my-awesome-ra

cp .env.example .env
# set UPSTAGE_API_KEY

cd deployment
docker compose up --build

./scripts/setup-demo.sh
```

* Access: [http://localhost](http://localhost)
* Login: `demo@example.com` / `Demo@2024!Secure`

---

### Development Mode

```bash
# Build CLSI (first time)
cd overleaf
docker build -f develop/Dockerfile.clsi-dev -t develop-clsi .

# Start dev services
cd develop
docker compose up -d mongo redis web webpack clsi filestore docstore document-updater history-v1 real-time

# Init MongoDB replica set
docker exec develop-mongo-1 mongosh --quiet --eval "rs.initiate()"

# Setup demo
CONTAINER_NAME=develop-web-1 ./scripts/setup-demo.sh
```
---

## API Endpoints

| Method   | Endpoint                 | Description              |
| -------- | ------------------------ | ------------------------ |
| `GET`    | `/health`                | Health check             |
| `POST`   | `/evidence/search`       | Search evidence by query |
| `POST`   | `/chat/ask`              | RAG Q&A                  |
| `POST`   | `/documents/upload`      | Upload & index PDF       |
| `GET`    | `/documents/{id}/status` | Indexing status          |
| `DELETE` | `/documents/{id}`        | Remove document          |

---

## Project Structure

```text
my-awesome-ra/
├── apps/api/              # FastAPI backend
├── overleaf/              # Forked Overleaf CE
│   └── evidence-panel/    # Evidence Panel module
├── deployment/            # Docker Compose
├── fixtures/              # Demo data
└── scripts/               # Setup & utilities
```

---

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| AI       | Upstage SOLAR (Embeddings, Parse, Chat) |
| Backend  | FastAPI, ChromaDB                       |
| Frontend | React, TypeScript, CodeMirror 6         |
| Editor   | Overleaf CE                             |
| Infra    | Docker Compose                          |

---

## Configuration

| Variable          | Required | Description    |
| ----------------- | :------: | -------------- |
| `UPSTAGE_API_KEY` |     ✅    | SOLAR API key  |
| `CHUNK_SIZE`      |          | Default: `500` |
| `CHUNK_OVERLAP`   |          | Default: `100` |

---

## License

AGPL-3.0 (compatible with Overleaf CE)