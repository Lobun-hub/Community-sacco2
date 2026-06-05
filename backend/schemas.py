from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    phone: str
    name: str

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