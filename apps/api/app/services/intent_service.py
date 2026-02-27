from tkinter import constants
from openai import AsyncOpenAI
import os
from app.utils import constants
from app.repositories.usage_repository import UsageRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import cache
from app.core.logger import logger


class IntentService:
    def __init__(self, session: AsyncSession):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.usage_repo = UsageRepository(self.session)

    async def classify(self, message: str) -> str:
        try:
            cache_key = f"intent:{message}"
            prompt = f"""
            Classify the user's intent.

            Return ONLY valid JSON in this format:

            {{
            "intent": "list_projects | semantic_search | list_skills | list_experience"
            }}

            User message:
            {message}
            """

            cached = cache.get(cache_key)
            if cached:
                logger.info(
                    "classify - Intent fetched from cache successfully")
                return cached

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You classify user intents."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "intent_classification",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "intent": {
                                    "type": "string",
                                    "enum": constants.SEGREGATION_ARR
                                }
                            },
                            "required": ["intent"]
                        }
                    }
                }
            )

            await self.usage_repo.usage_track(response, "intent-classification")
            try:
                intent = response.choices[0].message.parsed["intent"]
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
