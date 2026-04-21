import os
from dotenv import load_dotenv

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

load_dotenv()

def _build_database_url(prefix: str) -> str:
    user = os.getenv(f"{prefix}_USER", os.getenv("POSTGRES_USER"))
    password = os.getenv(f"{prefix}_PASSWORD", os.getenv("POSTGRES_PASSWORD"))
    host = os.getenv(f"{prefix}_HOST", os.getenv("POSTGRES_HOST"))
    port = os.getenv(f"{prefix}_PORT", os.getenv("POSTGRES_PORT"))
    db_name = os.getenv(f"{prefix}_DB", os.getenv("POSTGRES_DB"))
    
    return (
        f"postgresql+asyncpg://"
        f"{user}:{password}@{host}:{port}/{db_name}"
    )


PRIMARY_DATABASE_URL = _build_database_url("POSTGRES_PRIMARY")
REPLICA_DATABASE_URL = _build_database_url("POSTGRES_REPLICA")

primary_engine = create_async_engine(
    PRIMARY_DATABASE_URL,
    echo=False,  # Switched off sqlalchemy logs
)

replica_engine = create_async_engine(
    REPLICA_DATABASE_URL,
    echo=False,  # Switched off sqlalchemy logs
)

PrimaryAsyncSessionLocal = async_sessionmaker(
    primary_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# ReplicaAsyncSessionLocal = async_sessionmaker(
#     replica_engine,
#     class_=AsyncSession,
#     expire_on_commit=False
# )

# Backward-compatible aliases for older imports.
engine = primary_engine
AsyncSessionLocal = PrimaryAsyncSessionLocal

Base = declarative_base()
