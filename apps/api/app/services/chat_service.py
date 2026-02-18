from app.services.embedding_service import EmbeddingService
from app.services.vector_search_service import VectorSearchService
from app.repositories.resume_repository import ResumeRepository
from app.models.resume_chunk_model import ResumeChunkModel
from sqlalchemy import select
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

        intent = self._detect_intent(user_message)

        # Structured path
        if intent == "list_projects":
            return {
                "type": "projects_list",
                "data": await self._list_projects()
            }

        # Semantic path
        relevant_chunks = await self.vector_service.search(user_message)

        context_text = "\n\n".join(relevant_chunks)

        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional AI assistant representing a software engineer."
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

        return {
            "type": "text",
            "data": response.choices[0].message.content
        }


    def _detect_intent(self, message: str) -> str:
        message = message.lower()

        if "list my projects" in message or "show my projects" in message:
            return "list_projects"

        if "skills" in message:
            return "list_skills"

        return "semantic_search"


    async def _list_projects(self):
        repo = ResumeRepository(self.session)
        active_resume = await repo.get_active_resume()

        if not active_resume:
            return "No active resume found."

        result = await self.session.execute(
            select(ResumeChunkModel)
            .where(
                ResumeChunkModel.resume_id == active_resume.id,
                ResumeChunkModel.section == "projects"
            )
        )

        projects = result.scalars().all()

        if not projects:
            return "No projects found."

        return [
            {
                "id": p.id,
                "title": p.meta_data.get("title"),
                "company": p.meta_data.get("company"),
                "tech_stack": p.meta_data.get("tech_stack"),
            }
            for p in projects
        ]
