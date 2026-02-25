from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class AIUsageModel(Base):
    __tablename__ = "ai_usage"

    id = Column(Integer, primary_key=True, index=True)

    # chat, intent, resume_parse, embedding
    feature = Column(String, nullable=False)
    prompt_tokens = Column(Integer, nullable=False)
    completion_tokens = Column(Integer, nullable=False)
    total_tokens = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
