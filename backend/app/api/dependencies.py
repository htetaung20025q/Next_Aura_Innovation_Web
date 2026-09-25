"""FastAPI dependencies for dependency injection across API routes."""

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import AdminUser
from app.repositories.user_repo import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


def get_current_admin_user(
    db: SessionDep,
    token: TokenDep,
) -> AdminUser:
    """Validate bearer token and return authenticated admin user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    username: str = payload.get("sub")
    if not username:
        raise credentials_exception

    user_repo = UserRepository(db)
    user = user_repo.get_by_username(username)
    if not user or not user.is_active:
        raise credentials_exception

    return user


CurrentUserDep = Annotated[AdminUser, Depends(get_current_admin_user)]

__all__ = ["get_db", "SessionDep", "oauth2_scheme", "get_current_admin_user", "CurrentUserDep"]
