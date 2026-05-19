from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import Token, UserLogin, UserRegister, UserResponse

# Create an API router for authentication endpoints. All routes in this file will start with /auth.
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    """
    Register a new user.
    1. Check if email already exists.
    2. Hash the user's password.
    3. Save the new user in the database.
    4. Return safe user data without password.
    """
    email = user_data.email.lower()
    existing_user = db.query(User).filter(User.email == email).first()      # Check whether a user with this email already exists.
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )
    
    new_user = User(
        name=user_data.name,
        email=email,
        hashed_password=hash_password(user_data.password),
    )         # Create a new User database object.
    
    db.add(new_user)    # Add the user to the database session.
    db.commit()         # Save changes to the database.
    db.refresh(new_user)         # Refresh the object so it includes database-generated values like id.
    return new_user

@router.post(
    "/login",
    response_model=Token,
)
def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Log in an existing user.
    1. Find user by email.
    2. Verify password.
    3. Create JWT access token.
    4. Return token to frontend/client.
    """
    email = login_data.email.lower()
    user = db.query(User).filter(User.email == email).first()       # Find the user by email.
    
    # If user does not exist or password is wrong, return the same error. This avoids revealing whether an email is registered.
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(subject=user.id)     # Create JWT token using the user's database ID.
    return Token(access_token=access_token)

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Return the currently logged-in user. This is a protected endpoint. The request must include:
    Authorization: Bearer <access_token>
    """
    
    return current_user