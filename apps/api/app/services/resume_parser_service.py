from openai import AsyncOpenAI
import os
import json

class ResumeParserService:

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )

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
            temperature=0 # Randomness
        )

        content = response.choices[0].message.content

        return json.loads(content)
