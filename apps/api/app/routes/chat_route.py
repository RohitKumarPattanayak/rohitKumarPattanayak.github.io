from fastapi import APIRouter
from pydantic import BaseModel
from app.repositories.chat_repository import ChatRepository
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
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