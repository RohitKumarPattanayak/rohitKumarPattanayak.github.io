from openai import AsyncOpenAI
import os
from app.utils import constants
from app.repositories.usage_repository import UsageRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import cache
from app.core.logger import logger
import json
from app.utils.prompt_templates import TEMPLATE_FACTORY
from app.utils import response_format_constants


class IntentService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.model = os.getenv("AI_MODEL", "gpt-4o-mini")
        self.usage_repo = UsageRepository(self.session)

    async def classify(self, message: str) -> str:
        try:
            cache_key = f"intent:{message}"
            prompt = TEMPLATE_FACTORY['intent_clsify'].safe_substitute(
                message=message
            )

            cached = cache.get(cache_key)
            if cached:
                logger.info(
                    "classify - Intent fetched from cache successfully")
                return cached

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You classify user intents."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0,
                response_format=response_format_constants.INTENT_CLASIFY_RESPONSE_FORMAT
            )

            await self.usage_repo.usage_track(response, "intent-classification")
            try:
                intent_content = response.choices[0].message.content
                parsed = json.loads(intent_content)
                intent = parsed.get("intent", "")

                cache.set(cache_key, intent)

                logger.info("classify - Intent classified successfully")

                return intent
            except Exception:
                logger.info(
                    "classify - Intent classification failed, defaulting to semantic_search - success")
                return "semantic_search"
        except Exception as e:
            logger.error("classify - Error occurred", exc_info=True)
            raise
