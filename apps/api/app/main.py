from fastapi import FastAPI
from app.routes import chat_route
import uvicorn
import os

app = FastAPI(title="Rohit AI Portfolio API")

app.include_router(chat_route.router)

@app.get("/")
def root():
    return {"message": "AI Portfolio API Running"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 3000)),
        reload=True
    )