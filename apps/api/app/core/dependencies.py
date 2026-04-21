from app.core.database import PrimaryAsyncSessionLocal
# , ReplicaAsyncSessionLocal

async def get_db_write():
    async with PrimaryAsyncSessionLocal() as session:
        yield session

# async def get_db_write():
#     async with ReplicaAsyncSessionLocal() as session:
#         yield session

# Backward-compatible alias.
get_db = get_db_write

# Why use 'yield' instead of 'return'?
# Because return exits the function instantly.

# But yield:
# Pauses the function
# Lets someone else use the session
# Then resumes for cleanup