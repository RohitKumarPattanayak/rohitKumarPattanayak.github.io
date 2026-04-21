from app.services.user_service import UserService
from fastapi import APIRouter
from app.repositories.chat_repository import ChatRepository
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from fastapi.responses import StreamingResponse
from app.core.dependencies import get_db_write
from app.services.chat_service import ChatService
from app.core.logger import logger
from pydantic import BaseModel, Field

router = APIRouter(prefix="/chat", tags=["Chat"])


class StreamChatRequest(BaseModel):
    user_id: int
    message: str = Field(..., min_length=1)


@router.post("/conversation")
async def stream_chat(
    payload: StreamChatRequest,
    db: AsyncSession = Depends(get_db_write)
):
    try:
        chat_service = ChatService(db)
        user_service = UserService(db)
        user = await user_service.get_user_by_id(payload.user_id)
        response = await chat_service.stream_response(
                payload.user_id,
                payload.message,
                user.mode
            )

        logger.info(
            "stream_chat - Streaming chat response started successfully")

        return response
    except Exception as e:
        logger.error("stream_chat - Error occurred", exc_info=True)
        raise


@router.get("/get-conversation/{user_id}")
async def get_chat_conversation(
    user_id: int,
    db: AsyncSession = Depends(get_db_write)
):
    try:
        chat_service = ChatService(db)
        conversation = await chat_service.get_conversation(user_id)
        return conversation
    except Exception as e:
        logger.error("get_chat_conversation - Error occurred", exc_info=True)
        raise

@router.delete("/cleanup/{user_id}")
async def cleanup_chat_messages(
    user_id: int,
    db: AsyncSession = Depends(get_db_write)
):
    try:
        chat_repo = ChatRepository(db)
        await chat_repo.cleanup_old_messages(user_id)
        return {"status": "success", "message": "Cleanup completed"}
    except Exception as e:
        logger.error("cleanup_chat_messages - Error occurred", exc_info=True)
        raise
