from pydantic import BaseModel, Field
from app.models.z_enums import UserMode
from datetime import datetime

class CreateUserRequest(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=20,
        pattern="^[a-zA-Z0-9]+$"
    )
    mode: UserMode


class UserResponse(BaseModel):
    id: int
    username: str
    mode: UserMode
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class PaginatedUserResponse(BaseModel):
    items: list[UserResponse]
    total: int
    offset: int | None
    limit: int | None
