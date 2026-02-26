from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_db
from app.services.resume_parser_service import ResumeParserService
from app.core.logger import logger

router = APIRouter(prefix="/test", tags=["test"])


@router.get("/")
async def test(db: AsyncSession = Depends(get_db)):
    try:
        testService = ResumeParserService(db)
        result = await testService.parse_resume("rohit")

        logger.info("test - Test endpoint executed successfully")

        return result
    except Exception as e:
        logger.error("test - Error occurred", exc_info=True)
        raise
