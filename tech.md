# My Awesome RA – Tech Notes

## Solar API Usage
- Wrapper: `apps/api/src/services/solar.py` (async `httpx` client with retry/backoff). Requires `UPSTAGE_API_KEY`, optional `UPSTAGE_API_BASE_URL` (default `https://api.upstage.ai/v1/solar`).
- Endpoints in use:
  - Document parse: `https://api.upstage.ai/v1/document-ai/document-parse` (PDF → text/html + grounding).
  - Information extraction: `https://api.upstage.ai/v1/document-ai/information-extraction` (schema-driven; used for citations).
  - Chat completion: `/solar/chat/completions` (RAG final generation).
- Embeddings: `apps/api/src/services/embedding.py` hits `/solar/embeddings` with query/passages, batch size 5, 4096-dim vectors (default model `solar-embedding-1-large-query`).

## Backend (FastAPI) Flow
- Entry: `apps/api/src/main.py` wires shared services into app state and mounts routers:
  - `/documents` (`apps/api/src/routers/documents.py`): upload → background parse (Solar) → chunk/embed/index (Chroma) → status polling, PDF retrieval, reindex/delete.
  - `/evidence/search` (`apps/api/src/routers/evidence.py`): query embed → Chroma similarity → scores + page/bbox metadata.
  - `/citations/extract` (`apps/api/src/routers/citations.py`): text → Solar information extraction.
  - `/chat/ask` (`apps/api/src/routers/chat.py`): RAG pipeline (embed, search, prompt assembly, Solar chat).
- Indexing: `apps/api/src/services/index.py`
  - Chroma persistent store at `VECTOR_STORE_PATH` (default `data/chroma`); PDF copies under `PDF_STORAGE_PATH` (default `data/pdfs`).
  - Chunking with overlap; grounding-aware page estimation; cosine-normalized vectors; metadata stores cite_key/title/pages, etc.
- Seed/regeneration: `scripts/regenerate_seed.py` rebuilds `fixtures/seed` via Solar parse+embed for demo quality.

## Overleaf Fork Integration
- Module: `overleaf/services/web/modules/evidence-panel`
  - CodeMirror extension (`frontend/js/extensions/evidence-tracker-extension.ts`) emits `evidence:paragraph-change` with cleaned paragraph text.
  - React contexts: `EvidenceProvider` auto-calls `/evidence/search`; `ReferencesPanelProvider` syncs .bib refs with `/documents` CRUD; `ChatProvider` sends `/chat/ask` with current LaTeX buffer as `document_context`.
  - UI panels (lazy-loaded) injected into PDF preview via `pdf-preview-pane.tsx`; rail entry added in `config/settings.defaults.js` (`moduleImportSequence` includes `evidence-panel`).
  - API base URL read from `window.__EVIDENCE_API_URL__` else `http://localhost:8000`; compose files set `EVIDENCE_PANEL_API_URL` to publish that to the client.

## Deployment Profiles
- `deployment/docker-compose.yml` (demo): builds Overleaf CE (+ module) and `ra-api`; connects via `EVIDENCE_PANEL_API_URL=http://ra-api:8000`; mounts seed index to bootstrap search.
- `deployment/docker-compose.dev.yml` (dev, faster): uses prebuilt sharelatex image, binds local module and API source, runs webpack dev server.
- Overleaf develop override: `overleaf/develop/docker-compose.override.yml` adds `ra-api` to `bin/dev` workflow and injects the API URL.

## Key Environment Vars
- `UPSTAGE_API_KEY` (required), `UPSTAGE_API_BASE_URL` (optional).
- `VECTOR_STORE_PATH`, `PDF_STORAGE_PATH`, `SEED_INDEX_PATH`, `RESET_TO_SEED`, `CHUNK_SIZE`, `CHUNK_OVERLAP`, `INDEX_BATCH_SIZE`.
- Frontend: `EVIDENCE_PANEL_API_URL` → exposed as `window.__EVIDENCE_API_URL__`.

## Data/IO Paths
- Chroma DB: `data/chroma` (or container `/data/chroma`).
- PDFs: `data/pdfs` (or container `/data/pdfs`), served at `/documents/{id}/file#page=N`.
- Seed assets: `fixtures/seed` (Chroma + PDFs) copied on first run or when `RESET_TO_SEED=true`.

## Request Lifecycles (at a glance)
- **Upload**: PDF → `/documents/upload` → Solar parse → chunk/embed → Chroma → status ready; PDF stored for viewer deep-link.
- **Evidence Auto-search**: cursor paragraph event → `/evidence/search` → ranked snippets with page links; opens PDF at page via viewer button.
- **Chat**: user question (+ current LaTeX) → embed+search → Solar chat → answer with source list.

