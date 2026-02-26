from sqlalchemy.ext.asyncio import AsyncSession
from app.services.embedding_service import EmbeddingService
from app.repositories.resume_repository import ResumeRepository
from app.core.logger import logger


class VectorSearchService:
    """
    Handles semantic retrieval using embeddings.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.embedding_service = EmbeddingService(session)
        self.resumeRepo = ResumeRepository(session)

    async def search(self, query: str, limit: int = 5):
        """
        Perform semantic search over active resume chunks.
        """

        try:
            # 1️⃣ Generate query embedding
            query_embedding = await self.embedding_service.generate_embedding(query)

            # 2️⃣ Search similar chunks from DB
            chunks = await self.resumeRepo.search_similar_chunks(
                query_embedding=query_embedding,
                limit=limit
            )

            results = [chunk.content for chunk in chunks]

            logger.info("search - Vector search completed successfully")

            return results
        except Exception as e:
            logger.error("search - Error occurred in VectorSearchService", exc_info=True)
            raise
