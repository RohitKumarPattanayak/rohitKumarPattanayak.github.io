from app.services.resume_parser_service import ResumeParserService
from app.services.embedding_service import EmbeddingService
from app.repositories.resume_repository import ResumeRepository


class ResumeIngestionService:

    def __init__(self, session):
        self.session = session
        self.resumeRepo = ResumeRepository(session)
        self.embedding_service = EmbeddingService()
        self.parser_service = ResumeParserService()

    async def upload_resume(self, name: str, raw_text: str):

        resume = await self.resumeRepo.create_resume(name)

        structured_data = await self.parser_service.parse_resume(raw_text)

        for project in structured_data.get("projects", []):
            await self._store_structured_chunk(
                resume.id,
                section="projects",
                meta_data=project
            )

        # You can later expand for experience, skills, etc.

        await self.resumeRepo.switch_active_resume(resume.id)

        return resume

    async def _store_structured_chunk(self, resume_id, section, meta_data):

        content_for_embedding = f"""
            Section: {section}
            Title: {meta_data.get("title")}
            Company: {meta_data.get("company")}
            Tech Stack: {", ".join(meta_data.get("tech_stack", []))}
            Description: {meta_data.get("description")}
            Impact: {meta_data.get("impact")}
            """

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
