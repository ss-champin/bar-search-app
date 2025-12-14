"""認証関連の依存関数"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.profile import Profile

# HTTPBearerスキーム（Authorization: Bearer <token>）
security = HTTPBearer(auto_error=False)


def decode_jwt_token(token: str) -> dict:
    """
    JWTトークンをデコード

    Args:
        token: JWTトークン

    Returns:
        dict: デコードされたペイロード

    Raises:
        HTTPException: トークンが無効な場合
    """
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> str:
    """
    JWTトークンから現在のユーザーIDを取得

    Args:
        credentials: HTTPベアラー認証情報

    Returns:
        ユーザーID

    Raises:
        HTTPException: 認証に失敗した場合
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_jwt_token(token)

    # subクレームからユーザーIDを取得
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id


async def get_current_user_email(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> str:
    """
    JWTトークンから現在のユーザーのメールアドレスを取得

    Args:
        credentials: HTTPベアラー認証情報

    Returns:
        メールアドレス

    Raises:
        HTTPException: 認証に失敗した場合
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_jwt_token(token)

    # emailクレームからメールアドレスを取得
    email: str | None = payload.get("email")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return email


async def get_current_user(
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> Profile:
    """
    現在認証されているユーザーのプロフィールを取得

    Args:
        user_id: ユーザーID（get_current_user_idから取得）
        db: データベースセッション

    Returns:
        ユーザープロフィール

    Raises:
        HTTPException: ユーザーが見つからない場合
    """
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return profile


async def get_optional_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> str | None:
    """
    オプショナルな認証: JWTトークンがあれば検証し、なければNoneを返す

    認証が必須でないエンドポイント（お気に入り状態の取得など）で使用

    Args:
        credentials: HTTPベアラー認証情報

    Returns:
        ユーザーID、または認証情報がない場合はNone
    """
    if not credentials:
        return None

    try:
        return await get_current_user_id(credentials)
    except HTTPException:
        return None
