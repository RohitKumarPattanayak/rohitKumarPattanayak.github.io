from app.core.database import AsyncSessionLocal

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Why use 'yield' instead of 'return'?
# Because return exits the function instantly.

# But yield:
# Pauses the function
# Lets someone else use the session
# Then resumes for cleanup