from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.chat_model import ChatMessageModel
from app.core.logger import logger
from app.repositories.resume_repository import ResumeRepository
import asyncio

class ChatRepository:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.resume_repo = ResumeRepository(session)

    async def create_message(self, user_id: int, role: str, message: str, mode, content_type: str = 'text'):
        try:
            resume = await self.resume_repo.get_active_resume()
            chat_message = ChatMessageModel(
                user_id=user_id,
                role=role,
                message=message,
                content_type=content_type,
                mode=mode,
                resume_id=resume.id
            )
            self.session.add(chat_message)
            await self.session.commit()
            await self.session.refresh(chat_message)
            logger.info(
                f"create_message - user_id={user_id} role={role} - success")
            return chat_message
        except Exception:
            await self.session.rollback()
            logger.error(
                f"create_message - user_id={user_id} - error",
                exc_info=True
            )
            raise

    async def get_recent_messages(self, user_id: int, limit: int = 5, clean_up: bool = False):
        try:
            activeResume = await self.resume_repo.get_active_resume()
            result = await self.session.execute(
                select(ChatMessageModel)
                .where(
                    ChatMessageModel.user_id == user_id,
                    ChatMessageModel.resume_id == activeResume.id
                )
                .order_by(ChatMessageModel.created_at.desc())
                .limit(limit)
            )
            messages = result.scalars().all()
            if clean_up and messages:
                oldest_kept = messages[-1].created_at

                await self.session.execute(
                    delete(ChatMessageModel).where(
                        ChatMessageModel.user_id == user_id,
                        ChatMessageModel.created_at < oldest_kept,
                        ChatMessageModel.resume_id == activeResume.id
                    )
                )
                await self.session.commit()
                logger.info(
                f"get_recent_messages - user_id={user_id} - cleanup older chat completed - len={len(messages)}")
            logger.info(
                f"get_recent_messages - user_id={user_id} - fetched successfully - len={len(messages)}")
            return messages
        except Exception:
            logger.error(
                f"get_recent_messages - user_id={user_id} - error", exc_info=True)
            raise
