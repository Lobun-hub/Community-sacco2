# Community SACCO Demo

This workspace contains a full-stack preview of the Community SACCO site:

- `backend/` — FastAPI backend with SQLite database and seed endpoint
- `frontend/` — Next.js + Tailwind frontend with member and admin pages

## Run the backend

1. Open a terminal and go to `backend`:
   ```powershell
   cd c:\HP Lobun\LOBUN\2026\community-sacco2\backend
   ```
2. Create a virtual environment and activate it:
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```

## Seed the database

Open a browser and visit:

```
http://localhost:8000/seed
```

You should see:

```json
{"message":"Database seeded successfully"}
```

## Run the frontend

1. Open a second terminal and go to `frontend`:
   ```powershell
   cd c:\HP Lobun\LOBUN\2026\community-sacco2\frontend
   ```
2. Install frontend dependencies:
   ```powershell
   npm install
   ```
3. Start the Next.js app:
   ```powershell
   npm run dev
   ```

## Preview the app

- Landing page: `http://localhost:3000`
- Login page: `http://localhost:3000/login`
- Admin dashboard: `http://localhost:3000/admin`

## Notes

- The frontend uses the seeded demo account `+254700000001` for the member flow.
- The backend is configured for CORS from `http://localhost:3000`.
- If port `8000` is taken, start the backend on another port and update the frontend API URLs accordingly.
# Community-sacco2
