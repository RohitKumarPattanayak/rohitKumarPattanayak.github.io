from warnings import deprecated
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
from app.core.logger import logger


class ChatService:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.embedding_service = EmbeddingService(session)
        self.vector_service = VectorSearchService(session)
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.model = os.getenv("AI_MODEL", "gpt-4o-mini")
        self.intent_service = IntentService(session)
        self.usage_repo = UsageRepository(session)
        self.chat_repo = ChatRepository(session)

    async def _list_projects(self):
        try:
            repo = ResumeRepository(self.session)
            active_resume = await repo.get_active_resume()

            if not active_resume:
                logger.info(
                    "_list_projects - No active resume found, returning message - success")
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
                logger.info(
                    "_list_projects - No projects found, returning message - success")
                return "No projects found."

            projects_data = [
                {
                    "id": p.id,
                    "title": p.meta_data.get("title"),
                    "company": p.meta_data.get("company"),
                    "tech_stack": p.meta_data.get("tech_stack"),
                }
                for p in projects
            ]

            logger.info("_list_projects - Projects listed successfully")

            return projects_data
        except Exception as e:
            logger.error("_list_projects - Error occurred", exc_info=True)
            raise

    async def _list_experience(self):
        try:
            repo = ResumeRepository(self.session)
            active_resume = await repo.get_active_resume()

            if not active_resume:
                logger.info(
                    "_list_experience - No active resume found, returning message - success")
                return "No active resume found."

            result = await self.session.execute(
                select(ResumeChunkModel)
                .where(
                    ResumeChunkModel.resume_id == active_resume.id,
                    ResumeChunkModel.section == "experience"
                )
            )

            experiences = result.scalars().all()

            if not experiences:
                logger.info(
                    "_list_experience - No experience found, returning message - success")
                return "No experience found."

            experience_data = [
                {
                    "id": e.id,
                    "company": e.meta_data.get("company"),
                    "role": e.meta_data.get("role"),
                    "start_date": e.meta_data.get("start_date"),
                    "end_date": e.meta_data.get("end_date"),
                    "description": e.meta_data.get("description"),
                }
                for e in experiences
            ]

            logger.info("_list_experience - Experience listed successfully")

            return experience_data
        except Exception as e:
            logger.error("_list_experience - Error occurred", exc_info=True)
            raise

    async def _list_education(self):
        try:
            repo = ResumeRepository(self.session)
            active_resume = await repo.get_active_resume()

            if not active_resume:
                logger.info(
                    "_list_education - No active resume found, returning message - success")
                return "No active resume found."

            result = await self.session.execute(
                select(ResumeChunkModel)
                .where(
                    ResumeChunkModel.resume_id == active_resume.id,
                    ResumeChunkModel.section == "education"
                )
            )

            education_items = result.scalars().all()

            if not education_items:
                logger.info(
                    "_list_education - No education found, returning message - success")
                return "No education found."

            education_data = [
                {
                    "id": e.id,
                    "institution": e.meta_data.get("institution"),
                    "degree": e.meta_data.get("degree"),
                    "start_year": e.meta_data.get("start_year"),
                    "end_year": e.meta_data.get("end_year"),
                }
                for e in education_items
            ]

            logger.info("_list_education - Education listed successfully")

            return education_data
        except Exception as e:
            logger.error("_list_education - Error occurred", exc_info=True)
            raise

    async def _list_skills(self):
        try:
            repo = ResumeRepository(self.session)
            active_resume = await repo.get_active_resume()

            if not active_resume:
                return "No active resume found."

            result = await self.session.execute(
                select(ResumeChunkModel)
                .where(
                    ResumeChunkModel.resume_id == active_resume.id,
                    ResumeChunkModel.section == "skills"
                )
            )

            # Get the first chunk since skills are stored as one comma-separated block
            chunk = result.scalars().first()

            if not chunk:
                logger.info("_list_skills - No skills found")
                return "No skills found."

            meta = chunk.meta_data
            raw_skills = ""

            # Extract the raw string from various possible formats
            if isinstance(meta, dict):
                raw_skills = meta.get("skills") or meta.get("skill") or meta.get("name") or ""
            elif isinstance(meta, str):
                raw_skills = meta

            if not raw_skills:
                return "No skills found."

            # Split comma-separated string into a list of objects
            # e.g., "Python, Java" -> [{"id": ..., "content": "Python"}, {"id": ..., "content": "Java"}]
            skills_data = [
                {"id": f"{chunk.id}_{i}", "content": s.strip()}
                for i, s in enumerate(raw_skills.split(","))
                if s.strip()
            ]

            logger.info("_list_skills - Skills split and listed successfully")
            return skills_data

        except Exception as e:
            logger.error("_list_skills - Error occurred", exc_info=True)
            raise
        
    async def _get_introduction(self):
        try:
            repo = ResumeRepository(self.session)
            active_resume = await repo.get_active_resume()

            if not active_resume:
                return "No active resume found."

            result = await self.session.execute(
                select(ResumeChunkModel)
                .where(
                    ResumeChunkModel.resume_id == active_resume.id,
                    ResumeChunkModel.section == "introduction"
                )
            )

            chunk = result.scalars().first()
            if not chunk:
                return "No introduction found."

            meta = chunk.meta_data
            # Extract from dict {"introduction": "..."}
            if isinstance(meta, dict) and meta.get("introduction"):
                return meta["introduction"]
            
            return chunk.content # Fallback to raw content
        except Exception as e:
            logger.error("_get_introduction - Error occurred", exc_info=True)
            raise

    async def _get_total_experience(self):
        try:
            repo = ResumeRepository(self.session)
            active_resume = await repo.get_active_resume()

            if not active_resume:
                return "No active resume found."

            result = await self.session.execute(
                select(ResumeChunkModel)
                .where(
                    ResumeChunkModel.resume_id == active_resume.id,
                    ResumeChunkModel.section == "total_experience"
                )
            )

            chunk = result.scalars().first()
            if not chunk:
                return "Total experience information not available."

            meta = chunk.meta_data
            # Extract from dict {"total_experience": "..."}
            if isinstance(meta, dict) and meta.get("total_experience"):
                return meta["total_experience"]
                
            return chunk.content # Fallback
        except Exception as e:
            logger.error("_get_total_experience - Error occurred", exc_info=True)
            raise

    async def stream_response(self, user_id: int, user_message: str, mode: str = "candidate"):
        try:
            # intent = await self.intent_service.classify(user_message)
            intent = user_message
            await self.chat_repo.create_message(user_id, "user", user_message, mode)            
            if intent == "introduction":
                logger.info("Intent matched with introduction - Streaming response")
                intro = await self._get_introduction()
                await self.chat_repo.create_message(user_id, "assistant", intro, mode)
                logger.info("stream_response - Introduction stream generated successfully")
                return {
                    "type": "introduction",
                    "data": intro
                }

            elif intent == "total_experience":
                logger.info("Intent matched with total_experience - Streaming response")
                total_exp = await self._get_total_experience()
                await self.chat_repo.create_message(user_id, "assistant", total_exp, mode)
                logger.info("stream_response - Total experience stream generated successfully")
                return {
                    "type": "total_experience",
                    "data": total_exp
                }

            elif intent == "list_projects":
                logger.info("Intent matched with list_projects - Streaming response")
                projects = await self._list_projects()
                await self.chat_repo.create_message(user_id, "assistant", str(projects), mode, 'other')
                logger.info("stream_response - Projects list stream generated successfully")
                return {
                    "type": "projects_list",
                    "data": projects
                }

            elif intent == "list_experience":
                logger.info("Intent matched with list_experience - Streaming response")
                experience = await self._list_experience()
                await self.chat_repo.create_message(user_id, "assistant", str(experience), mode, 'other')
                logger.info("stream_response - Experience list stream generated successfully")
                return {
                    "type": "experience_list",
                    "data": experience
                }

            elif intent == "list_education":
                logger.info("Intent matched with list_education - Streaming response")
                education = await self._list_education()
                await self.chat_repo.create_message(user_id, "assistant", str(education), mode, 'other')
                logger.info("stream_response - Education list stream generated successfully")
                return {
                    "type": "education_list",
                    "data": education
                }

            elif intent == "list_skills":
                logger.info("Intent matched with list_skills - Streaming response")
                skills = await self._list_skills()
                await self.chat_repo.create_message(user_id, "assistant", str(skills), mode, 'other')
                logger.info("stream_response - Skills list stream generated successfully")
                return {
                    "type": "skills_list",
                    "data": skills
                }
            
            history = await self.chat_repo.get_recent_messages(user_id,5,True)
            
            formatted_history = [
                {"role": msg.role, "content": msg.message}
                for msg in reversed(history)
            ]

            # can check for future use
            # summary = await self.summarize_history(formatted_history)
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
            messages.extend(formatted_history)
            messages.append({
                "role": "user",
                "content": user_message
            })
            openAiResponse = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0,
            )
            api_response = openAiResponse.choices[0].message.content

            await self.usage_repo.usage_track(openAiResponse, "stream-response")
            
            logger.info(
                "stream_response - Streaming response created successfully")

            await self.chat_repo.create_message(user_id, "assistant", api_response, mode)
            return {
                "type" : "llm",
                "data" : api_response
            }
        except Exception as e:
            logger.error("stream_response - Error occurred", exc_info=True)
            raise

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

    async def summarize_history(self, history: list):
        try:
            if not history:
                logger.info("summarize_history - No history provided")
                return ""

            summary_prompt = [
                {
                    "role": "system",
                    "content": (
                        "Summarize the following conversation briefly. "
                        "Keep important technical details, decisions, "
                        "user goals, and context. Be concise."
                    )
                }
            ]

            summary_prompt.extend(history)

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=summary_prompt,
                temperature=0.2,
            )

            await self.usage_repo.usage_track(response, "summarize-history")
            summary = response.choices[0].message.content.strip()

            logger.info("summarize_history - Summary generated successfully")
            return summary
        except Exception:
            logger.error("summarize_history - Error occurred", exc_info=True)
            return ""

    async def get_conversation(self, user_id: int):
        try:
            result = await self.chat_repo.get_recent_messages(user_id)
            return result
        except Exception as e:
            logger.error("get_conversation - Error occurred", exc_info=True)
            raise
