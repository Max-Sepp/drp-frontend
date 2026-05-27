import os
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

_database_url = os.environ.get("DATABASE_URL")

if _database_url:
    # Normalize "postgres://" → "postgresql://" for SQLAlchemy 2.x compatibility
    # (providers like Heroku and Railway still emit the legacy scheme)
    if _database_url.startswith("postgres://"):
        _database_url = _database_url.replace("postgres://", "postgresql://", 1)
    engine = create_engine(_database_url)
else:
    _database_url = "sqlite:///./dev.db"
    engine = create_engine(
        _database_url,
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
