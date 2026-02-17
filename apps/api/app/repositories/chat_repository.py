from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.chat_model import ChatMessageModel

class ChatRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_message(self, role: str, content: str):
        message = ChatMessageModel(role=role, content=content)
        self.session.add(message)
        await self.session.commit()
        await self.session.refresh(message)
        return message

    async def get_recent_messages(self, limit: int = 10):
        result = await self.session.execute(
            select(ChatMessageModel).order_by(ChatMessageModel.created_at.desc()).limit(limit)
        )
        return result.scalars().all()
