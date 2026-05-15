from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


# To run `app` object use: uvicorn app.main:app --reload
app = FastAPI(
    title="ColdGrid AI API",        # Name shown in API docs.
    description="Backend API for ColdGrid AI cold storage monitoring platform",
    version="0.1.0",        # Current backend API version.
) # Create the main FastAPI application instance.



# CORS allows the frontend running on a different origin/port to communicate with this backend.
# Without CORS, the browser may block frontend API requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],      # Only allow requests from the frontend URL defined in .env.
    allow_credentials=True,       # Allow cookies/auth headers to be sent in requests if needed later.
    allow_methods=["*"],          # Allow all HTTP methods such as GET, POST, PUT, DELETE.
    allow_headers=["*"],          # Allow all request headers, including Authorization headers for JWT later.
)       # CORS middleware.

#Simple health checkpoint used to confrim that the backend server is running properly
@app.get("/health")
def health_check():
    return {"status": "ok"}