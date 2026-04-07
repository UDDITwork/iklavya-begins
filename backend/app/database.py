from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import SQLALCHEMY_DATABASE_URL, TURSO_AUTH_TOKEN

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"auth_token": TURSO_AUTH_TOKEN},
    echo=False,
    pool_pre_ping=True,      # Test connection before using — prevents stale conn panics
    pool_recycle=300,         # Recycle connections every 5 min
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            # Turso libsql driver can panic on close — swallow it
            pass
