# Community SACCO Demo

A professional full-stack proof-of-concept for a Community SACCO platform that supports member onboarding, loan oversight, admin controls, real-time notifications, and governance transparency.

## Project Overview

This repository demonstrates a modern Kenyan SACCO-style application built with a React-based Next.js frontend and a Python FastAPI backend. It is designed as a developer-friendly sample app with a clean separation between presentation, business logic, and persistence.

Key capabilities:
- Member registration and login flows
- Admin dashboard for loan review, member management, and broadcast notifications
- Real-time member notifications using Server-Sent Events (SSE)
- Audit and governance tracking integrated with specialized frameworks

## Governance Frameworks

The application is designed around three governance and accountability frameworks to emphasize ethical AI, data sovereignty, and transparency.

- **TRACK**: Used for monitoring loan decision quality and logging bias-related actions. The backend simulates AI risk checks and stores audit events to support explainability and accountability.
- **OASIS**: Used for data sovereignty and compliance metadata. The seed data and audit logs document key trust signals such as Kenya hosting and encryption status.
- **OCEAN**: Used as a high-level ethical posture for the system, reflecting principles of openness, accessibility, fairness, and responsible community stewardship.

## Technology Stack

**Backend**
- Python 3
- FastAPI for API construction and request handling
- Uvicorn for ASGI server execution
- SQLAlchemy for ORM database interactions
- SQLite for lightweight local persistence
- Pydantic for schema validation

**Frontend**
- Next.js 15 for React-based application structure
- React 18 for component rendering
- Tailwind CSS for responsive styling
- TypeScript for typed component interfaces and safety

## Repository Structure

```text
community-sacco2/
├── backend/
│   ├── database.py          # SQLAlchemy engine, Base, and DB session helper
│   ├── main.py              # FastAPI app, routes, notifications, and audit logic
│   ├── models.py            # SQLAlchemy ORM models for users, loans, audits, notifications
│   ├── requirements.txt     # Python dependencies
│   └── schemas.py           # Pydantic request/response models
├── frontend/
│   ├── app/
│   │   ├── admin/page.tsx   # Admin dashboard UI and notification composer
│   │   ├── dashboard/page.tsx # Member dashboard with notification feed
│   │   ├── login/page.tsx   # Member login page
│   │   └── register/page.tsx # Member registration page
│   ├── lib/api.ts           # API base URL helper
│   ├── package.json         # Frontend scripts and dependencies
│   └── tailwind.config.ts   # Tailwind configuration
└── README.md
```

## Running the Application

### Backend

From the repository root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Seed the database

After the backend is running, seed demo data:

```powershell
curl http://127.0.0.1:8000/seed
```

Expected response:

```json
{"message":"Database seeded successfully"}
```

### Frontend

Open a second terminal and run:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000` by default.

## Application URLs

- Landing page: `http://localhost:3000`
- Member login: `http://localhost:3000/login`
- Admin dashboard: `http://localhost:3000/admin`
- Backend API root: `http://127.0.0.1:8000`
- FastAPI docs: `http://127.0.0.1:8000/docs`

## Demo Credentials

- Admin account: `+254711111111` with password `admin`
- Example member account: `+254700000001`

## Notifications and Real-Time Updates

The application supports member notifications with:
- Admin broadcast and direct recipient notifications
- Real-time push with Server-Sent Events (`/notifications/stream/{user_id}`)
- Mark-as-read handling and unread badge display

## USSD Member Simulation

Members can use the built-in USSD demo flow from the dashboard to simulate mobile service access. Supported commands include:
- `*700#` — SACCO service menu
- `*700*1#` — View savings balance
- `*700*2#` — View unread notification count
- `*700*3#` — Review loan application status
- `*700*4#` — Check membership details

USSD commands are submitted through the dashboard UI and processed by the backend at `/ussd`.

## Notes for Developers

- The backend stores data in SQLite and is intended for local development.
- If port `8000` is unavailable, change the backend port and update the frontend API base URL in `frontend/src/lib/api.ts`.
- Local notification state is persisted in browser storage to maintain read/unread status across refreshes.

## Contribution

This project is built to be a polished demo. To contribute, modify source files in `backend/` and `frontend/`, then commit and push to your repository.

```powershell
git add .
git commit -m "Improve README and document architecture"
git push origin main
```
