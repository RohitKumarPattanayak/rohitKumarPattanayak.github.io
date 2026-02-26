from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_db
from app.services.resume_parser_service import ResumeParserService

router = APIRouter(prefix="/test", tags=["test"])


@router.get("/")
async def test(db: AsyncSession = Depends(get_db)):
    testService = ResumeParserService(db)
    return await testService.parse_resume("rohit")
