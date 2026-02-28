# app/services/embedding_service.py

from openai import AsyncOpenAI
import os
from app.repositories.usage_repository import UsageRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import cache
from app.core.logger import logger


class EmbeddingService:
    """
    Responsible only for generating embeddings.
    Encapsulates OpenAI embedding logic.
    """

    def __init__(self, session: AsyncSession):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.usage_repo = UsageRepository(session)

    async def generate_embedding(self, text: str) -> list[float]:
        try:
            cache_key = f"embedding:{text}"

            cached = cache.get(cache_key)
            if cached:
                logger.info(
                    "generate_embedding - Embedding fetched from cache successfully")
                return cached

            response = await self.client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )

            await self.usage_repo.usage_track(response, "embedding-service")

            embedding = response.data[0].embedding
            cache.set(cache_key, embedding)

            # logger.info("generate_embedding - Embedding generated and cached successfully")

            return embedding
        except Exception as e:
            logger.error("generate_embedding - Error occurred", exc_info=True)
            raise
