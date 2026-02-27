from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user_model import UserModel
from app.core.database import AsyncSessionLocal
from app.core.logger import logger
import json
import os
from fastapi.responses import JSONResponse

API_KEY = os.getenv("AUTH_API_KEY")


class AuthMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        try:
            # 1️⃣ Validate API Key
            auth_header = request.headers.get("Authorization")

            if not auth_header or not auth_header.startswith("Bearer "):
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Unauthorized"}
                )

            token = auth_header.split(" ")[1]

            if token != API_KEY:
                logger.info("AuthMiddleware - Invalid API key")
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Unauthorized"}
                )

            # 2️⃣ Read request body safely
            body = await request.body()

            if body:
                body_data = json.loads(body)
                user_id = body_data.get(
                    "user_id")
            else:
                user_id = request.query_params.get("user_id")

                if user_id:
                    async with AsyncSessionLocal() as session:
                        result = await session.execute(
                            select(UserModel).where(
                                UserModel.id == int(user_id))
                        )
                        user = result.scalars().first()

                        if not user:
                            logger.info(
                                f"AuthMiddleware - user_id={user_id} not found"
                            )
                            return JSONResponse(
                                status_code=404,
                                content={"detail": "Not a valid user."}
                            )

                        # Attach user to request
                        request.state.user = user
                        logger.info(
                            f"AuthMiddleware - user_id={user_id} attached"
                        )

            # 3️⃣ Restore body for downstream usage
            async def receive():
                return {"type": "http.request", "body": body}

            request._receive = receive

            response = await call_next(request)

            return response

        except HTTPException as e:
            raise HTTPException(
                status_code=500,
                detail='internal server error'
            )

        except Exception as e:
            logger.error("AuthMiddleware - Error occurred", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail='internal server error'
            )
