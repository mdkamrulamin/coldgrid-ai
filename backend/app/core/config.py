#https://pydantic.dev/docs/validation/latest/concepts/pydantic_settings/

from pydantic_settings import BaseSettings, SettingsConfigDict

"""
Central application settings.

This class reads values from the .env file and makes them available
throughout the backend using the `settings` object below.
"""

class Settings(BaseSettings):
    database_url: str       # Database connection string.
    
    jwt_secret_key: str     # Secret key used to sign and verify JWT access tokens.
    jwt_algorithm: str = "HS256"    # Algorithm used for JWT token signing.
    access_token_expire_minutes: int = 60       # Number of minutes before an access token expires.
    
    # Host address where the backend will run. 0.0.0.0 means the server can accept connections from any network interface.
    backend_host: str = "0.0.0.0"       
    backend_port: int = 8000        # Port where the backend will run locally.
    
    frontend_url: str = "http://localhost:5173"      # Frontend URL allowed to communicate with the backend through CORS.
    openai_api_key: str | None = None
    
    
    # Pydantic settings configuration. env_file tells Pydantic where to read environment variables from.
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",     # extra="ignore" means unknown values in .env will not break the app.
    )
    
settings = Settings()