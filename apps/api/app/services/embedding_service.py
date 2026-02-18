# app/services/embedding_service.py

from openai import AsyncOpenAI
import os


class EmbeddingService:
    """
    Responsible only for generating embeddings.
    Encapsulates OpenAI embedding logic.
    """

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )

    async def generate_embedding(self, text: str) -> list[float]:
        """
        Generates vector embedding for given text.
        """

        response = await self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )

        return response.data[0].embedding
