# app/services/embedding_service.py

from openai import AsyncOpenAI
import os
from app.repositories.usage_repository import UsageRepository
from sqlalchemy.ext.asyncio import AsyncSession


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
        """
        Generates vector embedding for given text.
        """

        response = await self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        await self.usage_repo.log_usage(
            feature="embedding-service",
            prompt_tokens=response.usage.prompt_tokens,
            completion_tokens=response.usage.completion_tokens,
            total_tokens=response.usage.total_tokens
        )
        return response.data[0].embedding
