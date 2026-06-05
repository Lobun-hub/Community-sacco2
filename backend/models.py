from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String, default="member")
    savings_balance = Column(Float, default=0.0)


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    amount = Column(Float)
    purpose = Column(String)
    status = Column(String, default="pending")
    risk_score = Column(Float, default=0.0)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    framework = Column(String)
    action = Column(String)
    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
