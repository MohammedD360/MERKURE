from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    PORT: int = 8000

    # Security
    AI_SERVICE_SECRET: str  # Shared secret avec le backend Node.js

    # Anthropic
    ANTHROPIC_API_KEY: str = ""

    # Database (lecture seule si necessaire)
    DATABASE_URL: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Claude model
    CLAUDE_MODEL: str = "claude-sonnet-4-6"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
