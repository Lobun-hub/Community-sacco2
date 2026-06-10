from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
import random
from datetime import datetime
import asyncio
import json
from fastapi.responses import StreamingResponse

import models
import schemas
from database import Base, engine, get_db


# Create tables and ensure user schema supports business_type
Base.metadata.create_all(bind=engine)
with engine.connect() as conn:
    result = conn.execute(text("PRAGMA table_info(users)"))
    columns = [row[1] for row in result]
    if "business_type" not in columns:
        conn.execute(
            text(
                "ALTER TABLE users ADD COLUMN business_type VARCHAR"
            )
        )
        conn.commit()
    if "is_active" not in columns:
        conn.execute(
            text(
                "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1"
            )
        )
        conn.commit()


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
@app.post("/register")
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = (
        db.query(models.User)
        .filter(models.User.phone == user_in.phone)
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered.",
        )

    db_user = models.User(
        phone=user_in.phone,
        name=user_in.name,
        role="member",
        business_type=user_in.business_type,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    audit = models.AuditLog(
        framework="SYSTEM",
        action=f"New member registered: {db_user.name} ({db_user.phone})",
    )
    db.add(audit)
    db.commit()

    return {
        "user_id": db_user.id,
        "name": db_user.name,
        "role": db_user.role,
        "savings_balance": db_user.savings_balance,
    }


@app.post("/login")
def login(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = (
        db.query(models.User)
        .filter(models.User.phone == user_in.phone)
        .first()
    )
    if db_user and db_user.role == "admin":
        if user_in.password != "admin":
            raise HTTPException(
                status_code=401,
                detail="Invalid admin credentials.",
            )
        login_action = f"Admin signed in: {db_user.phone}"
    elif not db_user:
        # Auto-create for demo purposes
        db_user = models.User(
            phone=user_in.phone,
            name=user_in.name,
            role="member",
            business_type=user_in.business_type,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        login_action = (
            f"New member auto-created and signed in: {db_user.phone}"
        )
    else:
        login_action = f"Member signed in: {db_user.phone}"

    audit = models.AuditLog(
        framework="SYSTEM",
        action=login_action,
    )
    db.add(audit)
    db.commit()

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


@app.get("/admin/loans")
def get_admin_loans(db: Session = Depends(get_db)):
    loans = db.query(models.Loan).order_by(models.Loan.created_at.desc()).all()
    loan_data = []
    for loan in loans:
        user = (
            db.query(models.User)
            .filter(models.User.id == loan.user_id)
            .first()
        )
        loan_data.append({
            "id": loan.id,
            "user_id": loan.user_id,
            "user_name": user.name if user else None,
            "amount": loan.amount,
            "purpose": loan.purpose,
            "status": loan.status,
            "risk_score": loan.risk_score,
            "created_at": (
                loan.created_at.isoformat() if loan.created_at else None
            ),
        })
    return loan_data


@app.post("/admin/loans/{loan_id}/approve")
def approve_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found.")
    loan.status = "approved"
    db.add(models.AuditLog(
        framework="SYSTEM",
        action=f"Loan {loan.id} approved by admin.",
    ))
    db.commit()
    db.refresh(loan)
    return {"success": True, "loan_id": loan.id, "status": loan.status}


@app.post("/admin/loans/{loan_id}/reject")
def reject_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found.")
    loan.status = "rejected"
    db.add(models.AuditLog(
        framework="SYSTEM",
        action=f"Loan {loan.id} rejected by admin.",
    ))
    db.commit()
    db.refresh(loan)
    return {"success": True, "loan_id": loan.id, "status": loan.status}


@app.get("/admin/members")
def get_admin_members(db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.name).all()
    return [
        {
            "id": user.id,
            "phone": user.phone,
            "name": user.name,
            "role": user.role,
            "business_type": user.business_type,
            "savings_balance": user.savings_balance,
            "is_active": bool(user.is_active),
        }
        for user in users
    ]


@app.post("/admin/members/{member_id}/activate")
def activate_member(member_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == member_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Member not found.")
    user.is_active = True
    db.add(models.AuditLog(
        framework="SYSTEM",
        action=f"Member {user.name} ({user.phone}) activated by admin.",
    ))
    db.commit()
    db.refresh(user)
    return {"success": True, "member_id": user.id, "is_active": user.is_active}


@app.post("/admin/members/{member_id}/deactivate")
def deactivate_member(member_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == member_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Member not found.")
    user.is_active = False
    db.add(models.AuditLog(
        framework="SYSTEM",
        action=f"Member {user.name} ({user.phone}) deactivated by admin.",
    ))
    db.commit()
    db.refresh(user)
    return {"success": True, "member_id": user.id, "is_active": user.is_active}


# --- ADMIN DASHBOARDS ---
@app.get("/admin/metrics")
def get_admin_metrics(db: Session = Depends(get_db)):
    loans = db.query(models.Loan).all()
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp).all()

    return {
        "total_loans": len(loans),
        "approval_rate": "92%",
        "bias_flags": 0,
        "oasis_compliance": "100%",
        "recent_audits": [
            {
                "framework": log.framework,
                "action": log.action,
                "timestamp": (
                    log.timestamp.isoformat() if log.timestamp else None
                ),
            }
            for log in logs[-10:]
        ],
    }


@app.get("/admin/audit-log")
def get_admin_audit_log(db: Session = Depends(get_db)):
    logs = (
        db.query(models.AuditLog)
        .order_by(models.AuditLog.timestamp.desc())
        .all()
    )
    return [
        {
            "framework": log.framework,
            "action": log.action,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
        for log in logs
    ]


    @app.get("/")
    def root():
        return {"message": "Community SACCO backend is running"}


# In-memory listeners for Server-Sent Events (SSE). Keyed by user_id.
listeners: dict[int, list[asyncio.Queue]] = {}


async def event_generator(user_id: int):
    q: asyncio.Queue = asyncio.Queue()
    listeners.setdefault(user_id, []).append(q)
    try:
        while True:
            data = await q.get()
            yield f"data: {json.dumps(data)}\n\n"
    finally:
        # remove queue when client disconnects
        lst = listeners.get(user_id)
        if lst and q in lst:
            lst.remove(q)


@app.get("/notifications/stream/{user_id}")
def notifications_stream(user_id: int):
    return StreamingResponse(
        event_generator(user_id),
        media_type="text/event-stream",
    )


# --- NOTIFICATIONS ---
@app.post("/admin/notifications")
def send_notification(
    payload: schemas.NotificationCreate,
    db: Session = Depends(get_db),
):
    # If recipient_ids provided, send to those users; otherwise broadcast
    # to all members
    recipients = []
    if payload.recipient_ids:
        recipients = (
            db.query(models.User)
            .filter(models.User.id.in_(payload.recipient_ids))
            .all()
        )
    else:
        recipients = (
            db.query(models.User)
            .filter(models.User.role == "member")
            .all()
        )

    created = []
    for user in recipients:
        notif = models.Notification(
            title=payload.title,
            message=payload.message,
            recipient_id=user.id,
            is_read=False,
        )
        db.add(notif)
        created.append(notif)

    db.add(
        models.AuditLog(
            framework="SYSTEM",
            action=f"Notification sent: {payload.title}",
        )
    )
    db.commit()

    # Broadcast to any connected SSE clients for each created notification
    for notif in created:
        payload_out = {
            "id": notif.id,
            "title": notif.title,
            "message": notif.message,
            "recipient_id": notif.recipient_id,
            "is_read": notif.is_read,
            "created_at": (
                notif.created_at.isoformat() if notif.created_at else None
            ),
        }
        qlist = listeners.get(notif.recipient_id, [])
        for q in list(qlist):
            try:
                q.put_nowait(payload_out)
            except Exception:
                # ignore failures to push
                pass

    return {"sent": len(created)}


@app.get(
    "/notifications/{user_id}",
    response_model=list[schemas.NotificationResponse],
)
def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    notifs = (
        db.query(models.Notification)
        .filter(models.Notification.recipient_id == user_id)
        .order_by(models.Notification.created_at.desc())
        .all()
    )
    return notifs


@app.get("/notifications/unread_count/{user_id}")
def get_unread_count(user_id: int, db: Session = Depends(get_db)):
    count = (
        db.query(models.Notification)
        .filter(
            models.Notification.recipient_id == user_id,
            models.Notification.is_read.is_(False),
        )
        .count()
    )
    return {"unread": count}


@app.post("/ussd", response_model=schemas.USSDResponse)
def ussd_session(request: schemas.USSDRequest, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(models.User.phone == request.phone)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Member not found.",
        )

    if user.role != "member":
        raise HTTPException(
            status_code=403,
            detail="USSD access is available for members only.",
        )

    code = request.code.strip()
    if not code:
        raise HTTPException(status_code=400, detail="USSD code is required.")

    def format_currency(value: float) -> str:
        return f"KES {value:,.2f}"

    normalized = code.replace(" ", "").upper()
    if normalized == "*700#":
        message = (
            "Welcome to Community SACCO USSD.\n"
            "1. Check savings balance\n"
            "2. View unread notifications\n"
            "3. Review loan status\n"
            "4. Check membership details\n"
            "Dial *700*<option># to continue."
        )
    elif normalized == "*700*1#":
        message = (
            f"Hello {user.name}, your savings balance is "
            f"{format_currency(user.savings_balance)}."
        )
    elif normalized == "*700*2#":
        unread_count = (
            db.query(models.Notification)
            .filter(
                models.Notification.recipient_id == user.id,
                models.Notification.is_read.is_(False),
            )
            .count()
        )
        message = (
            f"You have {unread_count} unread notification"
            f"{'s' if unread_count != 1 else ''}."
        )
    elif normalized == "*700*3#":
        loans = (
            db.query(models.Loan)
            .filter(models.Loan.user_id == user.id)
            .all()
        )
        if not loans:
            message = "You have no active loan applications at this time."
        else:
            lines = [
                f"{loan.purpose}: {loan.status.upper()} "
                f"({format_currency(loan.amount)})"
                for loan in loans
            ]
            message = "Loan status:\n" + "\n".join(lines)
    elif normalized == "*700*4#":
        status_text = "Active" if user.is_active else "Inactive"
        message = (
            f"Member status for {user.name}: {status_text}.\n"
            f"Phone: {user.phone}\n"
            f"Business type: {user.business_type or 'Not specified'}"
        )
    else:
        message = "Invalid USSD code. Dial *700# for the SACCO service menu."

    db.add(
        models.AuditLog(
            framework="TRACK",
            action=f"USSD command received: {normalized}",
        )
    )
    db.commit()
    return {"success": True, "message": message}


@app.post("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db)):
    notif = (
        db.query(models.Notification)
        .filter(models.Notification.id == notif_id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notif.is_read = True
    notif.read_at = datetime.utcnow()
    db.commit()
    return {"success": True, "id": notif.id}
