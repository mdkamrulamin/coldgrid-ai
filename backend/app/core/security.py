from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Password hashing context. bcrypt is used to securely hash user passwords.
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

def hash_password(password: str) -> str:
    """
    Hash a plain-text password before saving it to the database.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compare a plain-text password with a stored hashed password. Used during login.
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: str | int) -> str:
    """
    Create a JWT access token.
    subject is usually the user ID.
    The token will include:
    - sub: the user ID
    - exp: expiry time
    """
    # Calculate when the token should expire.
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    
    # JWT payload. "sub" means subject. Store the user ID here.
    to_encode: dict[str, Any] = {
        "sub": str(subject), 
        "exp": expire,
    }
    
    # Create and return the signed JWT token.
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )
    
    return encoded_jwt

def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.
    If the token is invalid or expired, python-jose will raise an error.
    Error is handled in auth dependency
    """
    return jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )

