from fastapi import HTTPException, APIRouter, Depends, Query
from app.core.logger import logger
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.core.logger import logger
from app.models.schema.user_schema import UserMode, UserResponse, CreateUserRequest, PaginatedUserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/user", tags=["user module"])


@router.post("/create", response_model=UserResponse)
async def create_user(request: CreateUserRequest, session: AsyncSession = Depends(get_db)):
    try:
        service = UserService(session)

        user = await service.create_user(
            username=request.username.lower(),
            mode=request.mode
        )

        logger.info("create_user route - success")

        return user

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    except Exception:
        logger.error("create_user route - error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/fetch_all_users")
async def fetch_all_users(
    offset: int | None = Query(default=None, ge=0),
    limit: int | None = Query(default=None, ge=1),
    search: str | None = Query(default=None),
    session: AsyncSession = Depends(get_db)
):
    try:
        service = UserService(session)
        params = {
            "offset": offset,
            "limit": limit,
            "search": search
        }
        users, total = await service.get_all_users(params)
        return PaginatedUserResponse(
            items=users,
            total=total,
            offset=offset,
            limit=limit
        )
    except HTTPException:
        raise
    except Exception:
        logger.error("fetch_all_users route - error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/mode", response_model=UserResponse)
async def update_mode(
    user_id: int,
    mode: UserMode,
    session: AsyncSession = Depends(get_db)
):
    try:
        service = UserService(session)
        user = await service.update_mode(user_id, mode)
        logger.info("update_mode route - success")
        return user
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

    except Exception:
        logger.error("update_mode route - error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/get_user_by_id", response_model=UserResponse)
async def get_user_by_id(user_id: int, session: AsyncSession = Depends(get_db)):
    try:
        service = UserService(session)
        user = await service.get_user_by_id(user_id)
        if user:
            logger.info("user data fetched successfully")
            return user
        return {}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

    except Exception:
        logger.error("get_user_by_id route - error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
