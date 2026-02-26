from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn
import os
from app.core.database import engine, Base
from app.routes import project_route, chat_route, resume_route, health_route, analytics_route, test_route
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI(title="Rohit AI Portfolio API")

app.include_router(health_route.router)
app.include_router(resume_route.router)
app.include_router(chat_route.router)
app.include_router(project_route.router)
app.include_router(analytics_route.router)
app.include_router(test_route.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specific URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "AI Portfolio API Running"}


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 3000)),
        reload=True
    )
