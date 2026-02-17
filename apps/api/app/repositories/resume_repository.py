from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.resume import Resume
from sqlalchemy.exc import IntegrityError

class ResumeRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_resume(self, name: str):
        resume = Resume(name=name, is_active=False)
        self.session.add(resume)
        await self.session.commit()
        await self.session.refresh(resume)
        return resume

    async def get_active_resume(self):
        result = await self.session.execute(
            select(Resume).where(Resume.is_active == True)
        )
        return result.scalar_one_or_none()


    async def set_active_resume(self, resume_id: int):
        try:
            await self.session.execute(
                update(Resume)
                .where(Resume.id == resume_id)
                .values(is_active=True)
            )
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            raise Exception("Another resume is already active.")
