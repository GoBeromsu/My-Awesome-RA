"""Evidence search router."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from src.dependencies import get_embedding_service, get_index_service
from src.models.evidence import EvidenceSearchRequest, EvidenceSearchResponse, EvidenceResult
from src.services.embedding import EmbeddingService
from src.services.index import IndexService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/search", response_model=EvidenceSearchResponse)
async def search_evidence(
    request: EvidenceSearchRequest,
    embedding_service: Annotated[EmbeddingService, Depends(get_embedding_service)],
    index_service: Annotated[IndexService, Depends(get_index_service)],
) -> EvidenceSearchResponse:
    """
    Search for relevant evidence spans from reference documents.

    Args:
        request: Search request containing query text and optional filters.
        embedding_service: Shared EmbeddingService instance.
        index_service: Shared IndexService instance.

    Returns:
        List of evidence results with relevance scores.
    """
    try:
        query_embedding = await embedding_service.embed_query(request.query)
        results = await index_service.search(
            embedding=query_embedding,
            top_k=request.top_k,
            threshold=request.threshold,
        )

        return EvidenceSearchResponse(
            results=[
                EvidenceResult(
                    document_id=r["document_id"],
                    chunk_id=r["chunk_id"],
                    text=r["text"],
                    page=r.get("page"),
                    score=r["score"],
                    title=r.get("metadata", {}).get("title"),
                    authors=r.get("metadata", {}).get("authors"),
                    year=r.get("metadata", {}).get("year"),
                    source_pdf=r.get("metadata", {}).get("source_pdf"),
                    metadata=r.get("metadata", {}),
                )
                for r in results
            ],
            query=request.query,
            total=len(results),
        )
    except Exception as e:
        logger.error("Evidence search failed", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while searching for evidence. Please try again."
        ) from e
