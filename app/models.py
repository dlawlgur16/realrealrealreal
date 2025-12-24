"""Pydantic 데이터 모델 및 SQLAlchemy DB 모델"""
from typing import Optional
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# SQLAlchemy Base
Base = declarative_base()

# 데이터베이스 설정
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./karrot_booster.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# SQLAlchemy 모델
class User(Base):
    """사용자 DB 모델"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)  # 프로필 이미지 URL
    provider = Column(String, nullable=False)  # "google", "kakao"
    provider_id = Column(String, unique=True, nullable=False)  # OAuth provider의 user ID
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Pydantic 모델 (API 요청/응답)
class ImageProcessRequest(BaseModel):
    """이미지 처리 요청"""
    process_type: str  # "poster", "serial", "defect"
    additional_instructions: Optional[str] = None
    mask_coordinates: Optional[dict] = None  # {"x": 0, "y": 0, "width": 100, "height": 100}


class ProcessResult(BaseModel):
    """처리 결과"""
    success: bool
    image_base64: Optional[str] = None
    message: str
    process_type: str
    processing_time_ms: int


class UserResponse(BaseModel):
    """사용자 정보 응답"""
    id: int
    email: str
    name: Optional[str]
    picture: Optional[str]
    provider: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT 토큰 응답"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

