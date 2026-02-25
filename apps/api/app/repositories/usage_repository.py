from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ai_usage_model import AIUsageModel


class UsageRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def log_usage(
        self,
        feature: str,
        prompt_tokens: int,
        completion_tokens: int,
        total_tokens: int
    ):
        usage = AIUsageModel(
            feature=feature,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens
        )

        self.session.add(usage)
        await self.session.commit()
