import os
from app.services.jwt_service import JwtService
from fastapi import HTTPException, APIRouter, Depends, Query, Response, Request
from app.core.logger import logger
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db_write
from app.models.schema.user_schema import UserMode, UserResponse, CreateUserRequest, PaginatedUserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/user", tags=["user module"])


is_prod = os.getenv("ENVIRONMENT", "development").lower() in ["production", "prod"]
COOKIE_SAMESITE = "none" if is_prod else "lax"
COOKIE_SECURE = True if is_prod else False

def authenticate_set_cookie(user, res: Response):
    jwt_service = JwtService()

    jwt_payload = {
        "id": user.id,
        "username": user.username,
        "mode": user.mode.value
    }

    access_token = jwt_service.create_access_token(jwt_payload)
    refresh_token = jwt_service.create_refresh_token(jwt_payload)

    res.set_cookie("_P_jwt_access", access_token, httponly=True, samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)
    res.set_cookie("_P_jwt_refresh", refresh_token, httponly=True, samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)

@router.post("/create", response_model=UserResponse)
async def create_user(
    request: CreateUserRequest,
    res: Response,
    session: AsyncSession = Depends(get_db_write)
):
    try:
        service = UserService(session)

        user = await service.create_user(
            username=request.username.lower(),
            mode=request.mode
        )

        authenticate_set_cookie(user, res)

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
    session: AsyncSession = Depends(get_db_write)
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


@router.patch("/login", response_model=UserResponse)
async def login_user(
    user_id: int,
    mode: UserMode,
    res: Response,
    session: AsyncSession = Depends(get_db_write),
):
    try:
        # 
        if user_id == 0:
            service = UserService(session)
            user = await service.get_user_by_name("guest")
            if not user:
                user = await service.create_user(
                    username="guest",
                    mode=UserMode.recruiter
                )
            authenticate_set_cookie(user, res)
            return user
            
        service = UserService(session)
        user = await service.update_mode(user_id, mode)
        
        authenticate_set_cookie(user, res)

        logger.info("login route - success")
        return user
    except ValueError as ve:
        logger.error("update_mode route - error", exc_info=True)
        raise HTTPException(status_code=404, detail=str(ve))

    except Exception:
        logger.error("update_mode route - error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/refresh")
async def refresh_access_token(req: Request, res: Response):
    try:
        refresh_token = req.cookies.get("_P_jwt_refresh")

        if not refresh_token:
            raise HTTPException(
                status_code=401, detail="Missing refresh token")

        jwt_service = JwtService()
        user_payload = jwt_service.decode_refresh_token(refresh_token)

        access_payload = {
            "id": user_payload.get("id"),
            "username": user_payload.get("username"),
            "mode": user_payload.get("mode"),
        }

        new_access_token = jwt_service.create_access_token(access_payload)
        new_refresh_token = jwt_service.create_refresh_token(access_payload)
        res.set_cookie("_P_jwt_access", new_access_token, httponly=True, samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)
        res.set_cookie("_P_jwt_refresh", new_refresh_token, httponly=True, samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)

        logger.info("refresh_access_token route - success")
        return {"message": "Access token refreshed"}

    except HTTPException:
        raise
    except Exception:
        logger.error("refresh_access_token route - error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/get_logged_user")
async def get_logged_user(req: Request):
    try:
        access_token = req.cookies.get("_P_jwt_access")
        if access_token:
            jwt_service = JwtService()
            user = jwt_service.decode_access_token(access_token)
            if user:
                logger.info("user data fetched successfully")
                return user
        return {}
    except HTTPException:
        # If access token is expired/invalid, keep the endpoint non-throwing.
        # Frontend will interpret `{}` and call `/user/refresh`.
        return {}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

    except Exception:
        logger.error("get_user_by_id route - error", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/get_user_by_id", response_model=UserResponse)
async def get_user_by_id(user_id: int, session: AsyncSession = Depends(get_db_write)):
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

@router.post("/logout")
async def logout_user(res: Response):
    res.delete_cookie("_P_jwt_access", samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)
    res.delete_cookie("_P_jwt_refresh", samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)
    return {"message": "Logged out successfully"}