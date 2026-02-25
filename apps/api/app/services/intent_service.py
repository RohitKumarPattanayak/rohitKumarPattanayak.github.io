from openai import AsyncOpenAI
import os
import json


class IntentService:

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )

    async def classify(self, message: str) -> str:

        prompt = f"""
Classify the user's intent.

Return ONLY valid JSON in this format:

{{
  "intent": "list_projects | semantic_search | list_skills | list_experience"
}}

User message:
{message}
"""

        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You classify user intents."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        content = response.choices[0].message.content

        try:
            data = json.loads(content)
            return data.get("intent", "semantic_search")
        except Exception:
            return "semantic_search"
