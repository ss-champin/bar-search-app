"""SQLAlchemy Base クラス"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """全てのモデルの基底クラス"""

    pass
