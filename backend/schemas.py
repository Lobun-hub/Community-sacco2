from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class UserCreate(BaseModel):
    phone: str
    name: str
    password: Optional[str] = None
    business_type: Optional[str] = None


class LoanApply(BaseModel):
    user_id: int
    amount: float
    purpose: str


class LoanResponse(BaseModel):
    id: int
    amount: float
    purpose: str
    status: str
    risk_score: float

    class Config:
        from_attributes = True


class LoanAdminResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str]
    amount: float
    purpose: str
    status: str
    risk_score: float
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class MemberAdminResponse(BaseModel):
    id: int
    phone: str
    name: str
    role: str
    business_type: Optional[str]
    savings_balance: float
    is_active: bool

    class Config:
        from_attributes = True


class AdminAction(BaseModel):
    action: str


class NotificationCreate(BaseModel):
    title: str
    message: str
    recipient_ids: Optional[List[int]] = None


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    recipient_id: Optional[int]
    is_read: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class USSDRequest(BaseModel):
    phone: str
    code: str


class USSDResponse(BaseModel):
    success: bool
    message: str
    items: Optional[list[dict]] = None
