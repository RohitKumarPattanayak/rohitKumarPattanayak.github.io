from fastapi import HTTPException, APIRouter, Depends, Request
from app.core.logger import logger
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.core.logger import logger
from app.models.schema.user_schema import UserMode, UserResponse, CreateUserRequest
from app.services.user_service import UserService

router = APIRouter(prefix="/user-create", tags=["user creation"])


@router.post("", response_model=UserResponse)
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


@router.patch("/mode", response_model=UserResponse)
async def update_mode(
    request: Request,
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
