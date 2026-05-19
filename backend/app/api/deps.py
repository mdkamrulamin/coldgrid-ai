from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import User

# HTTPBearer tells FastAPI that protected endpoints expect:
# Authorization: Bearer <token>
#
# This also makes the Authorize button appear in Swagger docs.
bearer_scheme = HTTPBearer()

def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Session = Depends(get_db),
) -> User:
    """
    Get the currently logged-in user from the JWT access token.

    This dependency will be used by protected routes like:
    - GET /auth/me
    - POST /devices
    - GET /devices
    """
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )   # Standard error for invalid authentication.
    
    try:
        token = credentials.credentials     # Extract the raw token from: Authorization: Bearer <token>
        payload = decode_access_token(token)        # Decode the JWT token.
        user_id = payload.get("sub")        # Get the user ID from the JWT payload.
        
        if user_id is None:
            raise credentials_exception     # Raised if token is expired, malformed, or signed with wrong secret.
    except JWTError:
        raise credentials_exception
    
    try:
        user_id_int = int(user_id)      # Convert user ID from string to integer.
    except ValueError:
        raise credentials_exception
    
    user = db.get(User, user_id_int)         # Find the user in the database.
    
    if user is None:
        raise credentials_exception
    
    return user