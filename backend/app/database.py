from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import SQLALCHEMY_DATABASE_URL, TURSO_AUTH_TOKEN

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"auth_token": TURSO_AUTH_TOKEN},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
