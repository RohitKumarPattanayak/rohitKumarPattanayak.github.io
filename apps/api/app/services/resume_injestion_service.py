from app.services.resume_parser_service import ResumeParserService
from app.services.embedding_service import EmbeddingService
from app.repositories.resume_repository import ResumeRepository
from app.core.logger import logger
from app.utils import constants

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

            sections = constants.RESUME_INJESTION_SECTIONS

            # Define which sections are single strings vs which are lists of objects
            for section in sections:
                data = structured_data.get(section)

                if not data:
                    continue

                # Case 1: The section is a list of objects (Experience, Projects, Education)
                if isinstance(data, list):
                    for item in data:
                        await self._store_structured_chunk(
                            resume.id,
                            section=section,
                            meta_data=item
                        )
                
                # Case 2: The section is a single string (Introduction, Skills, Total Experience)
                elif isinstance(data, str):
                    # Wrap the string in a dict so _store_structured_chunk can label it
                    await self._store_structured_chunk(
                        resume.id,
                        section=section,
                        meta_data={section: data} 
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
                # --- New Fields ---
                if meta_data.get("introduction"):
                    content_for_embedding += f"Introduction: {meta_data['introduction'].strip()}\n"
                
                if meta_data.get("total_experience"):
                    content_for_embedding += f"Total Experience: {meta_data['total_experience'].strip()}\n"

                # --- Existing Fields ---
                if meta_data.get("title"):
                    content_for_embedding += f"Title: {meta_data['title'].strip()}\n"

                if meta_data.get("company"):
                    content_for_embedding += f"Company: {meta_data['company'].strip()}\n"

                if meta_data.get("role"):
                    content_for_embedding += f"Role: {meta_data['role'].strip()}\n"

                # Handle tech_stack (still a list inside projects)
                if meta_data.get("tech_stack") and isinstance(meta_data.get("tech_stack"), list):
                    tech_stack = ", ".join([t.strip() for t in meta_data["tech_stack"]])
                    content_for_embedding += f"Tech Stack: {tech_stack}\n"

                # Handle skills if passed as a string within a dict (for the 'skills' section)
                if meta_data.get("skills") and isinstance(meta_data.get("skills"), str):
                    content_for_embedding += f"Skills: {meta_data['skills'].strip()}\n"

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
                # This handles cases where the parser might send the skills string directly
                if meta_data.strip():
                    content_for_embedding += f"Content: {meta_data.strip()}\n"

            # Avoid embedding empty content
            if content_for_embedding.strip() == f"Section: {section}":
                logger.info(
                    "_store_structured_chunk - No content to embed for section, skipping - success")
                return None

            embedding = await self.embedding_service.generate_embedding(
                content_for_embedding
            )

            chunk = await self.resumeRepo.save_structured_chunk(
                resume_id=resume_id,
                section=section,
                meta_data=meta_data,
                content=content_for_embedding,
                embedding=embedding
            )

            return chunk
        except Exception as e:
            logger.error(
                "_store_structured_chunk - Error occurred", exc_info=True)
            raise

    async def inject_manual_data(self, resume_id: int, section: str, data: dict | str):
        chunk = await self._store_structured_chunk(resume_id, section=section, meta_data=data)
        return chunk
