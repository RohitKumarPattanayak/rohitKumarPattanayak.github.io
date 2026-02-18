from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.resume_model import ResumeModel
from sqlalchemy.exc import IntegrityError
from app.models.resume_chunk_model import ResumeChunkModel
from sqlalchemy import update

class ResumeRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_active_resume(self):
        result = await self.session.execute(
            select(ResumeModel).where(ResumeModel.is_active == True)
        )
        return result.scalar_one_or_none()

    async def set_active_resume(self, resume_id: int):
        try:
            await self.session.execute(
                update(ResumeModel)
                .where(ResumeModel.id == resume_id)
                .values(is_active=True)
            )
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            raise Exception("Another resume is already active.")

    async def create_resume(self, name: str):
        resume = ResumeModel(name=name, is_active=False)
        self.session.add(resume)
        await self.session.commit()
        await self.session.refresh(resume)
        return resume

    async def save_chunk(self, content, embedding, resume_id):
        chunk = ResumeChunkModel(
            content=content,
            embedding=embedding,
            resume_id=resume_id
        )
        self.session.add(chunk)
        await self.session.commit()
        await self.session.refresh(chunk)
        return chunk

    async def switch_active_resume(self, resume_id: int):
        try:
            await self.session.execute(
                update(ResumeModel).values(is_active=False)
            )

            await self.session.execute(
                update(ResumeModel)
                .where(ResumeModel.id == resume_id)
                .values(is_active=True)
            )

            await self.session.commit()

        except IntegrityError:
            await self.session.rollback()
            raise Exception("Activation conflict occurred.")

    async def save_structured_chunk(
        self,
        resume_id,
        section,
        meta_data,
        content,
        embedding
    ):
        chunk = ResumeChunkModel(
            resume_id=resume_id,
            section=section,
            meta_data=meta_data,
            content=content,
            embedding=embedding
        )

        self.session.add(chunk)
        await self.session.commit()
        await self.session.refresh(chunk)
        return chunk
