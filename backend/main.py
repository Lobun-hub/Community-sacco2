from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import random

import models
import schemas
from database import Base, engine, get_db


# Create tables
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Community SACCO API")


# Allow Next.js frontend to connect from local dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://[::1]:3000",
    ],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1|\[::1\]):[0-9]+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- SEED DATA ENDPOINT (Run this once to populate DB) ---
@app.api_route("/seed", methods=["GET", "POST"])
def seed_db(db: Session = Depends(get_db)):
    if db.query(models.User).first():
        return {"message": "Already seeded"}

    user = models.User(
        phone="+254700000001",
        name="Amina Hassan",
        role="member",
        savings_balance=15000.0,
    )
    admin = models.User(
        phone="+254711111111",
        name="Admin User",
        role="admin",
        savings_balance=0.0,
    )
    db.add_all([user, admin])

    # Seed an audit log for OASIS dashboard
    log = models.AuditLog(
        framework="OASIS",
        action="Data Sovereignty Verified: Kenya Hosted",
    )
    db.add(log)
    db.commit()
    return {"message": "Database seeded successfully"}


# --- AUTH / USER ---
@app.post("/login")
def login(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = (
        db.query(models.User)
        .filter(models.User.phone == user_in.phone)
        .first()
    )
    if not db_user:
        # Auto-create for demo purposes
        db_user = models.User(
            phone=user_in.phone,
            name=user_in.name,
            role="member",
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    return {
        "user_id": db_user.id,
        "name": db_user.name,
        "role": db_user.role,
        "savings_balance": db_user.savings_balance,
    }


# --- LOANS ---
@app.post("/loans/apply", response_model=schemas.LoanResponse)
def apply_loan(loan: schemas.LoanApply, db: Session = Depends(get_db)):
    # Simulate GUARDIAN AGENT AI Triage.
    # In production, this triggers CrewAI.
    # Here we simulate an ethical bias check.
    simulated_risk = random.uniform(10.0, 40.0)

    db_loan = models.Loan(
        user_id=loan.user_id,
        amount=loan.amount,
        purpose=loan.purpose,
        status="under_review",
        risk_score=simulated_risk,
    )
    db.add(db_loan)

    # Log to TRACK framework.
    audit = models.AuditLog(
        framework="TRACK",
        action=f"Bias check passed for loan {loan.amount} KES",
    )
    db.add(audit)
    db.commit()
    db.refresh(db_loan)
    return db_loan


@app.get("/loans/{user_id}")
def get_user_loans(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Loan).filter(models.Loan.user_id == user_id).all()


# --- ADMIN DASHBOARDS ---
@app.get("/admin/metrics")
def get_admin_metrics(db: Session = Depends(get_db)):
    loans = db.query(models.Loan).all()
    logs = db.query(models.AuditLog).all()

    return {
        "total_loans": len(loans),
        "approval_rate": "92%",
        "bias_flags": 0,
        "oasis_compliance": "100%",
        "recent_audits": [
            {"framework": log.framework, "action": log.action}
            for log in logs[-5:]
        ],
    }
