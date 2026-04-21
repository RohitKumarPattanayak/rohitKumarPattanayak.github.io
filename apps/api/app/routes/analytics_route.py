from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.dependencies import get_db_write
from app.models.ai_usage_model import AIUsageModel
from app.core.logger import logger

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/usage")
async def usage_summary(db: AsyncSession = Depends(get_db_write)):
    try:
        result = await db.execute(
            select(
                AIUsageModel.feature,
                func.sum(AIUsageModel.total_tokens)
            ).group_by(AIUsageModel.AIUsageModel)
        )

        data = result.all()

        logger.info("usage_summary - Usage summary fetched successfully")

        return data
    except Exception as e:
        logger.error("usage_summary - Error occurred", exc_info=True)
        raise
