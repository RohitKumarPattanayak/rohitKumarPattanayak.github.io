from fastapi import APIRouter
from app.core.logger import logger

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health():
    try:
        logger.info("health - Health check successful")
        return {"status": "ok"}
    except Exception as e:
        logger.error("health - Error occurred", exc_info=True)
        raise
