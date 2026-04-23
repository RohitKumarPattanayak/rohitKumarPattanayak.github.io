from app.middleware.basic_auth_middleware import AuthMiddleware
from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn
from mangum import Mangum
import os
from app.core.database import Base, primary_engine 
# replica_engine
from app.routes import dashboard_route, chat_route, resume_route, health_route, analytics_route, test_route, user_route
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.core.logger import logger
from contextlib import asynccontextmanager


from sqlalchemy import text

# startup code
#    ↓
# yield
#    ↓
# app runs
#    ↓
# shutdown code (after yield)
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with primary_engine.begin() as conn:
            # the below is for activating pgvector extension in postgres
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.run_sync(Base.metadata.create_all)
        logger.info("startup - Database tables created successfully")
        yield  # this is required for lifespan function so it could let it proceed like for the async context manager
        # shutdown
        await primary_engine.dispose()
        # await replica_engine.dispose()
        logger.info("shutdown - DB connection closed")
    except Exception as e:
        logger.error("startup - Error occurred", exc_info=True)
        raise

load_dotenv()
app = FastAPI(title="Rohit AI Portfolio API", lifespan=lifespan)

app.include_router(health_route.router)
app.include_router(resume_route.router)
app.include_router(chat_route.router)
app.include_router(dashboard_route.router)
app.include_router(analytics_route.router)
app.include_router(test_route.router)
app.include_router(user_route.router)


app.add_middleware(AuthMiddleware)

# First add logging middleware
app.add_middleware(LoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "https://rohitkp.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def root():
    try:
        logger.info("root - Root endpoint hit successfully")
        return {"message": "AI Portfolio API Running"}
    except Exception as e:
        logger.error("root - Error occurred", exc_info=True)
        raise

# @app.on_event("startup")
# async def startup():
#     try:
#         async with engine.begin() as conn:
#             await conn.run_sync(Base.metadata.create_all)

#         logger.info("startup - Database tables created successfully")
#     except Exception as e:
#         logger.error("startup - Error occurred", exc_info=True)
#         raise

handler = Mangum(app, lifespan="auto")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 3000)),
        reload=True
    )
