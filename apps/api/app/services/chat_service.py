from app.services.embedding_service import EmbeddingService
from app.services.vector_search_service import VectorSearchService
from app.repositories.resume_repository import ResumeRepository
from app.models.resume_chunk_model import ResumeChunkModel
from sqlalchemy import select
from openai import AsyncOpenAI
import os
from app.repositories.chat_repository import ChatRepository
from app.services.intent_service import IntentService
from app.repositories.usage_repository import UsageRepository
from sqlalchemy.ext.asyncio import AsyncSession


class ChatService:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.embedding_service = EmbeddingService(session)
        self.vector_service = VectorSearchService(session)
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.intent_service = IntentService(session)
        self.usage_repo = UsageRepository(session)

    async def generate_response(self, user_message: str):

        intent = await self.intent_service.classify(user_message)

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

        await self.usage_repo.log_usage(
            feature="generate-response",
            prompt_tokens=response.usage.prompt_tokens,
            completion_tokens=response.usage.completion_tokens,
            total_tokens=response.usage.total_tokens
        )

        return {
            "type": "text",
            "data": response.choices[0].message.content
        }

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

    async def stream_response(self, user_message: str, mode: str = "candidate"):

        intent = await self.intent_service.classify(user_message)

        if intent == "list_projects":
            projects = await self._list_projects()
            yield str({
                "type": "projects_list",
                "data": projects
            })
            return

        history = await self._get_recent_history()
        relevant_chunks = await self.vector_service.search(user_message)

        context_text = "\n\n".join(relevant_chunks)

        messages = [
            {
                "role": "system",
                "content": self._get_system_prompt(mode)
            },
            {
                "role": "system",
                "content": f"Relevant Resume Context:\n{context_text}"
            }
        ]

        messages.extend(history)

        messages.append({
            "role": "user",
            "content": user_message
        })

        stream = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            stream=True
        )

        await self.usage_repo.log_usage(
            feature="stream-response",
            prompt_tokens=stream.usage.prompt_tokens,
            completion_tokens=stream.usage.completion_tokens,
            total_tokens=stream.usage.total_tokens
        )

        full_response = ""

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                token = chunk.choices[0].delta.content
                full_response += token
                yield token

        # store conversation after completion
        chat_repo = ChatRepository(self.session)

        await chat_repo.create_message("user", user_message)
        await chat_repo.create_message("assistant", full_response)

    def _get_system_prompt(self, mode: str) -> str:

        if mode == "recruiter":
            return """
    You are representing a senior software engineer to recruiters.
    Respond confidently.
    Focus on impact, scale, leadership, and measurable results.
    Keep responses concise and business-oriented.
    """

        return """
    You are representing a senior software engineer.
    Respond with technical clarity.
    Explain architecture decisions and implementation details when needed.
    """
