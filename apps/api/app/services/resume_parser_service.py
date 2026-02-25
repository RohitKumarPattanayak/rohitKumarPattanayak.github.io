from tkinter import constants
from openai import AsyncOpenAI
import os
import json
from app.utils import constants
from app.repositories.usage_repository import UsageRepository
from sqlalchemy.ext.asyncio import AsyncSession


class ResumeParserService:

    def __init__(self, session: AsyncSession):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.usage_repo = UsageRepository(session)

    async def parse_resume(self, raw_text: str) -> dict:
        prompt = f"""
            You are a resume parser.

            Extract structured JSON from the resume text.

            Return ONLY valid JSON with this structure:

            {{
            "projects": [
                {{
                "title": "",
                "company": "",
                "tech_stack": [],
                "description": "",
                "impact": ""
                }}
            ],
            "experience": [],
            "skills": [],
            "education": []
            }}

            Resume Text:
            {raw_text}
            """

        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You extract structured resume data."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "resume_structure",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "projects": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "company": {"type": "string"},
                                        "tech_stack": {
                                            "type": "array",
                                            "items": {"type": "string"}
                                        },
                                        "description": {"type": "string"},
                                        "impact": {"type": "string"}
                                    },
                                    "required": constants.RESUME_PARSE_SECTION
                                }
                            },

                            "experience": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "company": {"type": "string"},
                                        "role": {"type": "string"},
                                        "start_date": {"type": "string"},
                                        "end_date": {"type": "string"},
                                        "description": {"type": "string"}
                                    }
                                }
                            },

                            "skills": {
                                "type": "array",
                                "items": {"type": "string"}
                            },

                            "education": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "institution": {"type": "string"},
                                        "degree": {"type": "string"},
                                        "start_year": {"type": "string"},
                                        "end_year": {"type": "string"}
                                    }
                                }
                            }
                        },
                        "required": ["projects"]
                    }
                }
            })

        await self.usage_repo.usage_track(response, "parse-resume")

        content = response.choices[0].message.content
        parsed_json = json.loads(content)

        return parsed_json
