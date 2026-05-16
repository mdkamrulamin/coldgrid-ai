from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Create the SQLAlchemy database engine. The engine is responsible for managing the connection to PostgreSQL.
engine = create_engine(settings.database_url)       


# Create a database session factory. A session is used to communicate with the database
SessionLocal = sessionmaker(
    autocommit=False,   #autocommit=False means changes are not saved automatically. Must use db.commit()
    autoflush=False,    #autoflush=False means SQLAlchemy will not automatically push pending changes to the database before every query.
    bind=engine,        # bind=engine connects this session factory to our PostgreSQL engine.
)

def get_db():
    """
    The function opens a session, gives it to the route using yield,
    and then closes it after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
            