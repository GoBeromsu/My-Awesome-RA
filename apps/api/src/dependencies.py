"""Dependency injection providers for services."""

from fastapi import Request

from src.services.embedding import EmbeddingService
from src.services.index import IndexService
from src.services.solar import SolarService


async def get_embedding_service(request: Request) -> EmbeddingService:
    """Get the shared EmbeddingService instance."""
    return request.app.state.embedding_service


async def get_index_service(request: Request) -> IndexService:
    """Get the shared IndexService instance."""
    return request.app.state.index_service


async def get_solar_service(request: Request) -> SolarService:
    """Get the shared SolarService instance."""
    return request.app.state.solar_service
