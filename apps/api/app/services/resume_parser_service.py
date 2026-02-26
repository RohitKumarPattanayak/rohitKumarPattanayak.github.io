from openai import AsyncOpenAI
import os
import json
from app.utils import response_format_constants
from app.utils.prompt_templates import TEMPLATE_FACTORY
from app.repositories.usage_repository import UsageRepository
from sqlalchemy.ext.asyncio import AsyncSession


class ResumeParserService:

    def __init__(self, session: AsyncSession):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.usage_repo = UsageRepository(session)

    async def parse_resume(self, user_text: str) -> dict:
        prompt = TEMPLATE_FACTORY['resume_parser'].safe_substitute(
            raw_text=user_text
        )
        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict resume parser. Extract structured resume data completely and accurately."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            response_format=response_format_constants.PARSE_RESUME_RESPONSE_FORMAT
        )

        await self.usage_repo.usage_track(response, "parse-resume")

        content = response.choices[0].message.content
        parsed_json = json.loads(content)

        return parsed_json
