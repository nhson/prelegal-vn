import os
import warnings
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
import jwt

_SECRET_KEY_DEFAULT = "dev-secret-key-change-in-production"
SECRET_KEY = os.getenv("SECRET_KEY", _SECRET_KEY_DEFAULT)

if SECRET_KEY == _SECRET_KEY_DEFAULT:
    warnings.warn(
        "SECRET_KEY is using the insecure dev default. Set SECRET_KEY in your environment.",
        stacklevel=2,
    )

ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
