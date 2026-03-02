from app.models.user_model import UserModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, func
from app.models.user_model import UserModel
from app.core.logger import logger


class UserRepository:

    def __init__(self, session):
        self.session = session

    async def get_by_username(self, username: str):
        try:
            result = await self.session.execute(select(UserModel).where(UserModel.username == username))
            user = result.scalars().first()
            if not user:
                logger.info(
                    "get_by_username - No user found - success"
                )
                return None
            logger.info(
                "get_by_username - User fetched successfully"
            )
            return user
        except Exception:
            logger.error(
                "get_by_username - Error occurred",
                exc_info=True
            )
            raise

    async def create_user(self, username: str, mode):
        try:
            user = UserModel(username=username, mode=mode)
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
            logger.info(
                f"create_user - username={username} - success"
            )
            return user
        except IntegrityError:
            await self.session.rollback()
            logger.info(
                f"create_user - username={username} already exists")
            raise ValueError("Username already exists")
        except Exception:
            await self.session.rollback()
            logger.error(
                f"create_user - username={username} - error", exc_info=True)
            raise

    async def update_mode(self, user: UserModel, mode):
        try:
            user.mode = mode
            await self.session.commit()
            await self.session.refresh(user)

            logger.info(
                "update_mode - User mode updated successfully"
            )
            return user

        except Exception:
            await self.session.rollback()
            logger.error(
                "update_mode - Error occurred",
                exc_info=True
            )
            raise

    async def get_by_id(self, user_id: int):
        try:
            result = await self.session.execute(
                select(UserModel).where(UserModel.id == user_id)
            )
            return result.scalars().first()

        except Exception:
            logger.error("get_by_id - Error occurred", exc_info=True)
            raise

    async def get_all_users(self, params):
        try:
            offset = params.get("offset")
            limit = params.get("limit", 1000)
            search = params.get("search")

            stmt = (
                select(
                    UserModel,
                    func.count().over().label("total_count")
                )
                .order_by(UserModel.username.asc())
            )

            if search:
                stmt = stmt.where(UserModel.username.op("~*")(search))

            stmt = stmt.limit(limit)

            # Add offset only if provided
            if offset is not None:
                stmt = stmt.offset(offset)

            result = await self.session.execute(stmt)
            rows = result.all()

            if not rows:
                return [], 0

            users = [row[0] for row in rows]
            total = rows[0][1]

            return users, total

        except Exception:
            logger.error(
                "get_all_users - Error occurred", exc_info=True
            )
            raise
