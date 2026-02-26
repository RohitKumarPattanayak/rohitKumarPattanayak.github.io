from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.dependencies import get_db
from app.services.resume_injestion_service import ResumeIngestionService
from app.repositories.resume_repository import ResumeRepository
from app.models.resume_model import ResumeModel
from app.services.file_parser import FileParserService
from app.core.logger import logger

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        RIservice = ResumeIngestionService(db)
        Fservice = FileParserService()

        content = await file.read()
        text = Fservice.parse(file.filename, content)
        resume = await RIservice.upload_resume(name=name, raw_text=text)

        logger.info("upload_resume - Resume uploaded successfully")

        return {"message": "Resume uploaded", "resume_id": resume.id}
    except Exception as e:
        logger.error("upload_resume - Error occurred", exc_info=True)
        raise


@router.get("/")
async def list_resumes(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(ResumeModel))
        resumes = result.scalars().all()

        logger.info("list_resumes - Resumes listed successfully")

        return [
            {
                "id": r.id,
                "name": r.name,
                "is_active": r.is_active
            }
            for r in resumes
        ]
    except Exception as e:
        logger.error("list_resumes - Error occurred", exc_info=True)
        raise


@router.post("/activate/{resume_id}")
async def activate_resume(resume_id: int, db: AsyncSession = Depends(get_db)):
    try:
        repo = ResumeRepository(db)
        await repo.switch_active_resume(resume_id)

        logger.info("activate_resume - Resume activated successfully")

        return {"message": "Resume activated"}
    except Exception as e:
        logger.error("activate_resume - Error occurred", exc_info=True)
        raise


@router.delete("/{resume_id}")
async def delete_resume(resume_id: int, db: AsyncSession = Depends(get_db)):
    try:
        repo = ResumeRepository(db)
        await repo.delete_resume(resume_id)

        logger.info("delete_resume - Resume deleted successfully")

        return {"message": "Resume deleted"}
    except Exception as e:
        logger.error("delete_resume - Error occurred", exc_info=True)
        raise
