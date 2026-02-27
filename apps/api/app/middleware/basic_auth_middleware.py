from starlette.requests import Request
from starlette.middleware.base import BaseHTTPMiddleware
import os
from fastapi.responses import JSONResponse


API_KEY = os.getenv("AUTH_API_KEY")


class AuthMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):

        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

        token = auth_header.split(" ")[1]

        if token != API_KEY:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

        return await call_next(request)
