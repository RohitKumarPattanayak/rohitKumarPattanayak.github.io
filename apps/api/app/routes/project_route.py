from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_db
from app.models.resume_chunk_model import ResumeChunkModel
from app.repositories.resume_repository import ResumeRepository
from app.core.logger import logger

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/")
async def list_projects(db: AsyncSession = Depends(get_db)):
    try:
        repo = ResumeRepository(db)
        active_resume = await repo.get_active_resume()

        if not active_resume:
            logger.info("list_projects - No active resume found, returning empty list - success")
            return []

        result = await db.execute(
            select(ResumeChunkModel.id,
                   ResumeChunkModel.meta_data)
            .where(
                ResumeChunkModel.resume_id == active_resume.id,
                ResumeChunkModel.section == "projects"
            )
        )

        rows = result.all()

        if len(rows):
            projects = [
                {
                    "id": row.id,
                    "title": row.meta_data.get("title"),
                    "company": row.meta_data.get("company"),
                    "tech_stack": row.meta_data.get("tech_stack"),
                }
                for row in rows
            ]
            logger.info("list_projects - Projects listed successfully")
            return projects

        logger.info("list_projects - No projects found, returning empty list - success")
        return []
    except Exception as e:
        logger.error("list_projects - Error occurred", exc_info=True)
        raise


@router.get("/{project_id}")
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):

    try:
        repo = ResumeRepository(db)
        active_resume = await repo.get_active_resume()

        if not active_resume:
            raise HTTPException(status_code=404, detail="No active resume found")

        result = await db.execute(
            select(ResumeChunkModel.id,
                   ResumeChunkModel.meta_data)
            .where(
                ResumeChunkModel.id == project_id,
                ResumeChunkModel.resume_id == active_resume.id,
                ResumeChunkModel.section == "projects"
            )
        )
        project = result.mappings().one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        response = {
            "id": project.id,
            "title": project.meta_data.get("title"),
            "company": project.meta_data.get("company"),
            "tech_stack": project.meta_data.get("tech_stack"),
            "description": project.meta_data.get("description"),
            "impact": project.meta_data.get("impact"),
        }

        logger.info("get_project - Project fetched successfully")

        return response
    except Exception as e:
        logger.error("get_project - Error occurred", exc_info=True)
        raise
