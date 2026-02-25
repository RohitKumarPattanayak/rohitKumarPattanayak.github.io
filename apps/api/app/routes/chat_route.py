from fastapi import Query
from fastapi import APIRouter
from pydantic import BaseModel
from app.repositories.chat_repository import ChatRepository
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from fastapi.responses import StreamingResponse
from app.core.dependencies import get_db
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str


@router.post("/")
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    repo = ChatRepository(db)
    await repo.create_message("user", request.message)
    return {"response": "Message stored successfully"}


@router.get("/")
async def get_chat(db: AsyncSession = Depends(get_db)):
    repo = ChatRepository(db)
    messages = await repo.get_recent_messages()
    return {"messages": messages}


@router.post("/user")
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    chat_service = ChatService(db)
    reply = await chat_service.generate_response(request.message)
    return {
        "response": reply
    }


@router.post("/stream")
async def stream_chat(request: ChatRequest,
                      mode: str = Query("candidate"),
                      db: AsyncSession = Depends(get_db)
                      ):
    chat_service = ChatService(db)
    return StreamingResponse(
        chat_service.stream_response(request.message, mode),
        media_type="text/plain"
    )
