from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Any, Union

from app.core.dependencies import get_db_read, get_db_write
from app.services.resume_injestion_service import ResumeIngestionService
from app.repositories.resume_repository import ResumeRepository
from app.models.resume_model import ResumeModel
from app.services.file_parser import FileParserService
from app.core.logger import logger

router = APIRouter(prefix="/resume", tags=["Resume"])


class InjectManualDataRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resume_id: int = Field(..., gt=0)
    section: str = Field(..., min_length=1, max_length=20)
    data: Union[dict[str, Any], str]

    @field_validator("section")
    @classmethod
    def validate_and_normalize_section(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("section must be a non-empty string")
        if len(v) > 20:
            raise ValueError("section must be at most 20 characters")
        return v.lower()

    @field_validator("data")
    @classmethod
    def validate_data(cls, v):
        if isinstance(v, str):
            s = v.strip()
            if not s:
                raise ValueError("data must be a non-empty string")
            return s
        if isinstance(v, dict):
            if not v:
                raise ValueError("data must be a non-empty object")
            return v
        raise ValueError("data must be either a string or an object")


@router.post("/upload")
async def upload_resume(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db_write)
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
async def list_resumes(
    db: AsyncSession = Depends(get_db_read),
    isActive: bool = Query(default=None, ge=False)
):
    try:
        if(isActive):
            result = await db.execute(select(ResumeModel).where(ResumeModel.is_active == True))
        else:
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
async def activate_resume(resume_id: int, db: AsyncSession = Depends(get_db_write)):
    try:
        repo = ResumeRepository(db)
        await repo.switch_active_resume(resume_id)

        logger.info("activate_resume - Resume activated successfully")

        return {"message": "Resume activated"}
    except Exception as e:
        logger.error("activate_resume - Error occurred", exc_info=True)
        raise


@router.post("/inject_manual_data")
async def inject_manual_data(
    body: InjectManualDataRequest,
    db: AsyncSession = Depends(get_db_write)
):
    try:
        resume_result = await db.execute(
            select(ResumeModel).where(ResumeModel.id == body.resume_id)
        )
        resume = resume_result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="resume_id not found")

        service = ResumeIngestionService(db)
        chunk = await service.inject_manual_data(
            resume_id=body.resume_id,
            section=body.section,
            data=body.data
        )
        if chunk is None:
            raise HTTPException(
                status_code=400,
                detail="Data produced no embeddable content for the given section."
            )
        logger.info("inject_manual_data - Chunk injected successfully")
        return {
            "message": "Chunk added with embedding",
            "chunk_id": chunk.id,
            "resume_id": chunk.resume_id,
            "section": chunk.section
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("inject_manual_data - Error occurred", exc_info=True)
        raise


@router.delete("/{resume_id}")
async def delete_resume(resume_id: int, db: AsyncSession = Depends(get_db_write)):
    try:
        repo = ResumeRepository(db)
        await repo.delete_resume(resume_id)

        logger.info("delete_resume - Resume deleted successfully")

        return {"message": "Resume deleted"}
    except Exception as e:
        logger.error("delete_resume - Error occurred", exc_info=True)
        raise

@router.get("/{resume_id}")
async def get_resume_by_id(
    resume_id: int,
    sections: str = Query(None, description="Comma separated list of sections to filter, e.g. projects,skills"),
    db: AsyncSession = Depends(get_db_read)
):
    try:
        resume_result = await db.execute(
            select(ResumeModel).where(ResumeModel.id == resume_id)
        )
        resume = resume_result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        repo = ResumeRepository(db)
        section_list = [s.strip() for s in sections.split(",")] if sections else None
        chunks = await repo.get_chunks_by_resume_id(resume_id, section_list)

        result_data = {
            "id": resume.id,
            "name": resume.name,
            "is_active": resume.is_active,
            "sections": {}
        }
        
        for chunk in chunks:
            if chunk.section not in result_data["sections"]:
                result_data["sections"][chunk.section] = []
            
            result_data["sections"][chunk.section].append(chunk.meta_data)
            
        return result_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_resume_by_id - Error occurred: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
