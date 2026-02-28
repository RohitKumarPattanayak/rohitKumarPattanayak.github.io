import re
from openai import AsyncOpenAI
import re
import os
from app.services.embedding_service import EmbeddingService
from app.utils import constants
from app.repositories.usage_repository import UsageRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import cache
from app.core.logger import logger
import json
from app.utils.prompt_templates import TEMPLATE_FACTORY
from app.utils import response_format_constants
import numpy as np


class IntentService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.model = os.getenv("AI_MODEL", "gpt-4o-mini")
        self.usage_repo = UsageRepository(self.session)
        self.intent_vectors = {}
        self.embedding_service = EmbeddingService(session)

    async def initialize(self):
        for key, description in constants.INTENTS.items():
            embedding = await self.embedding_service.generate_embedding(description)
            self.intent_vectors[key] = embedding

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

    def rule_based_intent(self, query: str):
        """
        Fast rule-based intent classifier.
        Returns intent string or None.
        """
        if not query:
            return None

        query = query.lower().strip()

        # Generic introductions / meta-questions about the assistant => semantic_search
        if re.search(
            r"(introduce\s+yourself|who\s+are\s+you|about\s+you|tell\s+me\s+about\s+yourself)",
            query,
        ):
            return "semantic_search"

        # Questions about how good someone is at a skill => semantic_search
        if "good at" in query and "skill" in query:
            return "semantic_search"

        for intent, pattern in constants._INTENT_PATTERNS.items():
            if pattern.search(query):
                return intent

        return None

    def cosine_similarity(self, vec1, vec2):
        return np.dot(vec1, vec2) / (
            np.linalg.norm(vec1) * np.linalg.norm(vec2)
        )

    async def classify_v2(self, query: str):
        # Step 1: rule-based
        rule_intent = self.rule_based_intent(query)
        print("rule_intent", rule_intent)
        if rule_intent:
            logger.info(
                "classify - Intent rule-based classified successfully - ", rule_intent)
            return rule_intent

        await self.initialize()
        # Step 2: embedding-based
        query_embedding = await self.embedding_service.generate_embedding(query)

        scores = []

        for intent, intent_vector in self.intent_vectors.items():
            score = self.cosine_similarity(query_embedding, intent_vector)
            scores.append((intent, score))

        [
            print(score)
            for score in scores
        ]
        best_intent, best_score = max(scores, key=lambda x: x[1])

        if best_score > 0.73:
            logger.info("Intent score: %s", best_score)
            return best_intent
        logger.info(
            "classify-v2 - Intent classification failed, defaulting to semantic_search - success")
        return "semantic_search"

    async def classify_v3(self, query: str) -> str:
        """
        Ensemble intent classifier with better robustness:
        1. Rule-based patterns (fast, high precision)
        2. Embedding similarity vs prototype intents
        3. LLM JSON classifier as tie-breaker / fallback
        """
        if not query or not query.strip():
            return "semantic_search"

        query = query.strip()
        cache_key = f"intent_v3b:{query}"
        cached = cache.get(cache_key)
        if cached:
            logger.info("classify_v3 - Intent fetched from cache successfully")
            return cached

        allowed_intents = set(constants.INTENTS.keys()) | set(
            constants.SEGREGATION_ARR
        ) | {"semantic_search"}

        # 1) Rule-based
        rule_intent = self.rule_based_intent(query)
        if rule_intent == "mention_projects":
            rule_intent = "list_projects"
        if rule_intent and rule_intent not in allowed_intents:
            rule_intent = None

        # If rule explicitly says semantic_search, trust it for generic queries
        if rule_intent == "semantic_search":
            cache.set(cache_key, rule_intent)
            logger.info(
                "classify_v3 - Using rule intent semantic_search for generic query"
            )
            return rule_intent

        # High-confidence intents: trust rule-based and short-circuit
        if rule_intent in {
            "list_experience",
            "list_skills",
            "list_education",
            "list_projects",
            "total_experience",
        }:
            cache.set(cache_key, rule_intent)
            logger.info(
                "classify_v3 - Using high-confidence rule intent: %s",
                rule_intent,
            )
            return rule_intent

        # 2) Embedding-based
        await self.initialize()
        embed_intent = None
        embed_score = -1.0

        if self.intent_vectors:
            query_embedding = await self.embedding_service.generate_embedding(query)
            for intent_key, intent_vec in self.intent_vectors.items():
                score = self.cosine_similarity(query_embedding, intent_vec)
                if score > embed_score:
                    embed_intent, embed_score = intent_key, score

            if embed_intent not in allowed_intents:
                embed_intent = None

        # 3) LLM-based
        llm_intent = await self.classify(query)
        if llm_intent not in allowed_intents:
            llm_intent = "semantic_search"

        # Selection strategy
        # High confidence rule-based wins if supported by either LLM or strong embedding
        if rule_intent:
            if rule_intent == llm_intent:
                final_intent = rule_intent
            elif rule_intent == embed_intent and embed_score >= 0.6:
                final_intent = rule_intent
            elif embed_score >= 0.8:
                final_intent = rule_intent
            else:
                # If rule disagrees with both and embedding is weak, trust LLM
                final_intent = llm_intent
        else:
            # No rule hit: prefer agreement between embedding and LLM
            if embed_intent and embed_intent == llm_intent and embed_score >= 0.6:
                final_intent = embed_intent
            elif embed_intent and embed_score >= 0.8:
                final_intent = embed_intent
            else:
                final_intent = llm_intent

        if final_intent not in allowed_intents:
            final_intent = "semantic_search"

        cache.set(cache_key, final_intent)
        logger.info("classify_v3 - Final intent: %s", final_intent)
        return final_intent
