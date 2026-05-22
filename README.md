# BugSense AI

AI-powered Automated QA & Bug Analysis System

BugSense AI is a full-stack QA platform for uploading source code files and generating bug findings, severity summaries, code quality scoring, test case suggestions, and fix recommendations.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: Spring Boot, Spring Security, JWT
- Database: MongoDB
- AI: Gemini API via REST `generateContent`

## Features

- Signup and login with BCrypt password hashing and JWT authentication
- Protected React routes with persisted sessions
- Source file upload and analysis
- Gemini-powered bug detection through the backend-only Gemini API integration
- Severity analytics, recent reports, language usage, and quality score dashboard
- Report detail pages with findings, tests, fixes, and source previews
- User profile view and edit flow

## Project Structure

```text
backend/   Spring Boot REST API
frontend/  React + Vite application
```

## Environment

Backend variables:

The backend automatically imports `.env` from either the repository root or `backend/.env`, so you can copy
`backend/.env.example` to `backend/.env` for local runs. You can also export variables in PowerShell:

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/bugsense_ai"
$env:JWT_SECRET="replace-with-a-long-unique-secret-at-least-32-bytes"
$env:GEMINI_API_KEY="your-google-ai-studio-key"
$env:GEMINI_MODEL="gemini-1.5-flash"
$env:GEMINI_TIMEOUT_SECONDS="45"
$env:FRONTEND_ORIGIN="http://localhost:5173"
```

Frontend variables:

```powershell
$env:VITE_API_URL="http://localhost:8080/api"
```

`JWT_SECRET` should be set for stable sessions across backend restarts. `GEMINI_API_KEY` is only required for
source-code analysis uploads; signup and login continue to work without it. The React app never receives or stores the
Gemini key.

## Run Locally

Start MongoDB, then run the API:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Run the web app:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## REST API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/reports/analyze`
- `GET /api/reports`
- `GET /api/reports/recent`
- `GET /api/reports/{id}`
- `GET /api/dashboard/stats`
