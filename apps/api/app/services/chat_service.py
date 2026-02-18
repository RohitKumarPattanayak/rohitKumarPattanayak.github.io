from app.services.embedding_service import EmbeddingService
from app.services.vector_search_service import VectorSearchService
from openai import AsyncOpenAI
import os


class ChatService:

    def __init__(self, session):
        self.session = session
        self.embedding_service = EmbeddingService()
        self.vector_service = VectorSearchService(session)
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )

    async def generate_response(self, user_message: str):

        # Step 1: Retrieve relevant context
        relevant_chunks = await self.vector_service.search(user_message)

        context_text = "\n\n".join(relevant_chunks)

        # Step 2: Ask GPT using context
        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional AI assistant representing a software engineer. Answer confidently and clearly."
                },
                {
                    "role": "system",
                    "content": f"Relevant Resume Context:\n{context_text}"
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.3
        )

        return response.choices[0].message.content
