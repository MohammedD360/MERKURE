from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from .config import settings

api_key_header = APIKeyHeader(name="X-AI-Service-Secret", auto_error=False)


def verify_service_secret(api_key: str = Security(api_key_header)) -> str:
    """Verifie que la requete vient du backend Node.js."""
    if api_key != settings.AI_SERVICE_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid service secret",
        )
    return api_key
