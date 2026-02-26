from fastapi import Query
from fastapi import APIRouter
from pydantic import BaseModel
from app.repositories.chat_repository import ChatRepository
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from fastapi.responses import StreamingResponse
from app.core.dependencies import get_db
from app.services.chat_service import ChatService
from app.core.logger import logger

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str


@router.post("/")
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    try:
        repo = ChatRepository(db)
        await repo.create_message("user", request.message)

        logger.info("chat - Chat message stored successfully")

        return {"response": "Message stored successfully"}
    except Exception as e:
        logger.error("chat - Error occurred while storing message", exc_info=True)
        raise


@router.get("/")
async def get_chat(db: AsyncSession = Depends(get_db)):
    try:
        repo = ChatRepository(db)
        messages = await repo.get_recent_messages()

        logger.info("get_chat - Chat messages fetched successfully")

        return {"messages": messages}
    except Exception as e:
        logger.error("get_chat - Error occurred", exc_info=True)
        raise


@router.post("/user")
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    try:
        chat_service = ChatService(db)
        reply = await chat_service.generate_response(request.message)

        logger.info("chat - Chat reply generated successfully")

        return {
            "response": reply
        }
    except Exception as e:
        logger.error("chat - Error occurred while generating reply", exc_info=True)
        raise


@router.post("/stream")
async def stream_chat(request: ChatRequest,
                      mode: str = Query("candidate"),
                      db: AsyncSession = Depends(get_db)
                      ):
    try:
        chat_service = ChatService(db)
        response = StreamingResponse(
            chat_service.stream_response(request.message, mode),
            media_type="text/plain"
        )

        logger.info("stream_chat - Streaming chat response started successfully")

        return response
    except Exception as e:
        logger.error("stream_chat - Error occurred", exc_info=True)
        raise
