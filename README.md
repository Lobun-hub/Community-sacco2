# Community SACCO Demo

This workspace contains a full-stack preview of the Community SACCO site.

- `backend/` — FastAPI backend with SQLite database and seed endpoint
- `frontend/` — Next.js + Tailwind frontend with member and admin pages

## Run the backend

1. Open a terminal and go to the backend folder:
   ```powershell
   cd c:\HP Lobun\LOBUN\2026\community-sacco2\backend
   ```
2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```

## Seed the database

Open a browser or run curl:

```powershell
http://127.0.0.1:8000/seed
```

or

```powershell
curl http://127.0.0.1:8000/seed
```

Expected response:

```json
{"message":"Database seeded successfully"}
```

## Run the frontend

1. Open a second terminal and go to the frontend folder:
   ```powershell
   cd c:\HP Lobun\LOBUN\2026\community-sacco2\frontend
   ```
2. Install frontend dependencies:
   ```powershell
   npm install
   ```
3. Start the Next.js development server:
   ```powershell
   npm run dev
   ```

If port `3000` is already in use, Next.js will automatically try the next available port (for example, `3001`, `3002`, etc.).

## Preview the app

- Landing page: `http://localhost:3000` (or the port shown by Next.js)
- Login page: `http://localhost:3000/login`
- Admin dashboard: `http://localhost:3000/admin`

## Notes

- The frontend uses the seeded demo account `+254700000001` for the member flow.
- The backend supports both `GET /seed` and `POST /seed` to populate demo data.
- If backend port `8000` is taken, start the backend on another port and update the frontend API URLs in the frontend code.
- `backend/sacco.db` is excluded from version control to keep local data files out of the repository.

## GitHub

This project is linked to a remote repository at `https://github.com/Lobun-hub/Community-sacco2.git`.

To push local changes:

```powershell
cd c:\HP Lobun\LOBUN\2026\community-sacco2
git add .
git commit -m "Update README and ignore local database files"
git push origin main
```
