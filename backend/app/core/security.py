from datetime import datetime, timedelta, timezone
from typing import Any
import secrets

from jose import jwt
from pwdlib import PasswordHash

from app.core.config import settings

# Password hashing manager. Argon2 is a modern password hashing algorithm recommended for new systems.
password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str:
    """
    Hash a plain-text password before saving it to the database.
    """
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compare a plain-text password with a stored hashed password. Used during login.
    """
    return password_hash.verify(plain_password, hashed_password)

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
    
def generate_device_uid() -> str:
    """
    Generate a public device ID. This ID can be used later by the simulator when sending telemetry.
    """
    return f"dev_{secrets.token_hex(8)}"

def generate_device_api_key() -> str:
    """
    Generate a secure raw API key for a device.
    - This raw key is shown only once when the device is created.
    - Only the hashed version is stored in the database.
    """
    return f"cg_live_{secrets.token_urlsafe(32)}"

def hash_api_key(api_key: str) -> str:
    """
    Hash a raw device API key before storing it. The same secure password hashing system is reused.
    """
    return password_hash.hash(api_key)

def verify_api_key(raw_api_key: str, hashed_api_key: str) -> bool:
    """
    Verify a raw API key against the stored hashed API key. This will be used later when the simulator sends telemetry.
    """
    return password_hash.verify(raw_api_key, hashed_api_key)

