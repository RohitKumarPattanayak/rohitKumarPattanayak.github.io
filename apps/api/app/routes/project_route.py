from fastapi import Depends,APIRouter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.repositories.resume_repository import ResumeRepository
from app.models.resume_chunk_model import ResumeChunkModel
APIRouter

router = APIRouter(prefix="/project", tags=["Project"])

@router.get("/")
async def list_projects(db: AsyncSession = Depends(get_db)):

    repo = ResumeRepository(db)
    active_resume = await repo.get_active_resume()

    if not active_resume:
        return []

    result = await db.execute(
        select(ResumeChunkModel)
        .where(
            ResumeChunkModel.resume_id == active_resume.id,
            ResumeChunkModel.section == "projects"
        )
    )

    projects = result.scalars().all()

    return [
        {
            "id": p.id,
            "title": p.meta_data.get("title"),
            "company": p.meta_data.get("company"),
            "tech_stack": p.meta_data.get("tech_stack"),
        }
        for p in projects
    ]
