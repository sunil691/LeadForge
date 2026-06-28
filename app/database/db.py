from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker



DATABASE_URL = "sqlite:///./test.db"
engine= create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread":False}

)
Sessionlocal= sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
from sqlalchemy.orm import Session
def get_db():
    db=Sessionlocal()
    try:
        yield db
    finally:
        db.close()

