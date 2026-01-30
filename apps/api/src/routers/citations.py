"""Citation extraction router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from src.dependencies import get_solar_service
from src.models.citation import CitationExtractRequest, CitationExtractResponse, Citation
from src.services.solar import SolarService

router = APIRouter()


@router.post("/extract", response_model=CitationExtractResponse)
async def extract_citations(
    request: CitationExtractRequest,
    solar_service: Annotated[SolarService, Depends(get_solar_service)],
) -> CitationExtractResponse:
    """
    Extract citation information from text using SOLAR Information Extraction API.

    Args:
        request: Text content to extract citations from.
        solar_service: Shared SolarService instance.

    Returns:
        Extracted citations with structured metadata.
    """
    try:
        result = await solar_service.extract_information(
            text=request.text,
            schema=request.extraction_schema or "citation",
        )

        return CitationExtractResponse(
            citations=[
                Citation(
                    title=c.get("title", ""),
                    authors=c.get("authors", []),
                    year=c.get("year"),
                    venue=c.get("venue"),
                    doi=c.get("doi"),
                    raw_text=c.get("raw_text", ""),
                )
                for c in result.get("citations", [])
            ],
            total=len(result.get("citations", [])),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
