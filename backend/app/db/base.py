from sqlalchemy.orm import DeclarativeBase

"""
Base class for all SQLAlchemy models in the project.
Every database model will inherit from this class.
This allows SQLAlchemy and Alembic to understand which Python classes
should be mapped to database tables.
"""
class Base(DeclarativeBase):
    pass