from app.services.resume_parser_service import ResumeParserService
from app.services.embedding_service import EmbeddingService
from app.repositories.resume_repository import ResumeRepository
from app.core.logger import logger


class ResumeIngestionService:

    def __init__(self, session):
        self.session = session
        self.resumeRepo = ResumeRepository(session)
        self.embedding_service = EmbeddingService(session)
        self.parser_service = ResumeParserService(session)

    async def upload_resume(self, name: str, raw_text: str):

        try:
            resume = await self.resumeRepo.create_resume(name)
            structured_data = await self.parser_service.parse_resume(raw_text)

            sections = ["projects", "experience", "education", "skills"]

            for section in sections:
                items = structured_data.get(section, [])

                if not isinstance(items, list):
                    continue

                for item in items:
                    await self._store_structured_chunk(
                        resume.id,
                        section=section,
                        meta_data=item
                    )

            logger.info(
                "upload_resume - embedings generated succesfully")
            await self.resumeRepo.switch_active_resume(resume.id)

            logger.info(
                "upload_resume - Resume ingested and activated successfully")

            return resume
        except Exception as e:
            logger.error(
                "upload_resume - Error occurred in ResumeIngestionService", exc_info=True)
            raise

    async def _store_structured_chunk(self, resume_id, section, meta_data):

        try:
            content_for_embedding = f"Section: {section}\n"

            if isinstance(meta_data, dict):

                if meta_data.get("title"):
                    content_for_embedding += f"Title: {meta_data['title'].strip()}\n"

                if meta_data.get("company"):
                    content_for_embedding += f"Company: {meta_data['company'].strip()}\n"

                if meta_data.get("role"):
                    content_for_embedding += f"Role: {meta_data['role'].strip()}\n"

                if meta_data.get("tech_stack") and isinstance(meta_data.get("tech_stack"), list):
                    tech_stack = ", ".join([t.strip()
                                           for t in meta_data["tech_stack"]])
                    content_for_embedding += f"Tech Stack: {tech_stack}\n"

                if meta_data.get("description"):
                    content_for_embedding += f"Description: {meta_data['description'].strip()}\n"

                if meta_data.get("impact"):
                    content_for_embedding += f"Impact: {meta_data['impact'].strip()}\n"

                if meta_data.get("start_date"):
                    content_for_embedding += f"Start Date: {meta_data['start_date'].strip()}\n"

                if meta_data.get("end_date"):
                    content_for_embedding += f"End Date: {meta_data['end_date'].strip()}\n"

                if meta_data.get("institution"):
                    content_for_embedding += f"Institution: {meta_data['institution'].strip()}\n"

                if meta_data.get("degree"):
                    content_for_embedding += f"Degree: {meta_data['degree'].strip()}\n"

                if meta_data.get("start_year"):
                    content_for_embedding += f"Start Year: {meta_data['start_year'].strip()}\n"

                if meta_data.get("end_year"):
                    content_for_embedding += f"End Year: {meta_data['end_year'].strip()}\n"

            elif isinstance(meta_data, str):
                if meta_data.strip():
                    content_for_embedding += f"Skill: {meta_data.strip()}\n"

            # Avoid embedding empty content
            if content_for_embedding.strip() == f"Section: {section}":
                logger.info(
                    "_store_structured_chunk - No content to embed for section, skipping - success")
                return

            embedding = await self.embedding_service.generate_embedding(
                content_for_embedding
            )

            await self.resumeRepo.save_structured_chunk(
                resume_id=resume_id,
                section=section,
                meta_data=meta_data,
                content=content_for_embedding,
                embedding=embedding
            )

            # logger.info("_store_structured_chunk - Structured chunk stored successfully")
        except Exception as e:
            logger.error(
                "_store_structured_chunk - Error occurred", exc_info=True)
            raise
