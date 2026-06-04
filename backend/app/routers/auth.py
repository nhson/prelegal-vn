from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from app.database import get_db
from app.models import User
from app import auth_utils

router = APIRouter()

COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days
COOKIE_KWARGS = {"httponly": True, "samesite": "lax", "path": "/"}


class AuthRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=COOKIE_MAX_AGE,
        secure=auth_utils.COOKIE_SECURE,
        **COOKIE_KWARGS,
    )


@router.post("/signup")
def signup(req: AuthRequest, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=req.email,
        hashed_password=auth_utils.hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _set_auth_cookie(response, auth_utils.create_access_token(user.id))
    return {"message": "Account created", "email": user.email}


@router.post("/signin")
def signin(req: AuthRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not auth_utils.verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    _set_auth_cookie(response, auth_utils.create_access_token(user.id))
    return {"message": "Signed in", "email": user.email}


@router.post("/signout")
def signout(response: Response):
    response.delete_cookie(COOKIE_NAME, **COOKIE_KWARGS)
    return {"message": "Signed out"}


@router.get("/me")
def me(
    access_token: Optional[str] = Cookie(None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = auth_utils.decode_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {"id": user.id, "email": user.email}
