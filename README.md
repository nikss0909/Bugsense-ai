# BugSense

Offline static code analysis and bug detection platform.

BugSense is a full-stack Spring Boot + React application for uploading source code files, running rule-based analysis locally, storing reports in MongoDB, and viewing SonarQube-inspired quality dashboards and PDF reports.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: Spring Boot, Spring Security, JWT
- Database: MongoDB
- Analysis: Offline Java rule strategies, no external AI APIs
- Reporting: Apache PDFBox

## Features

- Signup and login with BCrypt password hashing and JWT authentication
- Protected React routes with persisted sessions
- Source file upload and immediate offline static analysis
- Java, JavaScript, SQL, and HTML rule coverage
- Severity analytics, most common issue types, recent scans, language usage, and quality scoring
- Report detail pages with issue cards, technical debt, recommendations, source preview, and PDF export
- Multi-file analysis entry point in the backend service for future ZIP and GitHub repository scanning

## Project Structure

```text
backend/   Spring Boot REST API and rule-based analyzer
frontend/  React + Vite application
```

## Environment

Backend variables:

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/bugsense_ai"
$env:JWT_SECRET="replace-with-a-long-unique-secret-at-least-32-bytes"
$env:FRONTEND_ORIGIN="http://localhost:5173"
```

Frontend variables:

```powershell
$env:VITE_API_URL="http://localhost:8080/api"
```

`JWT_SECRET` should be set for stable sessions across backend restarts. Analysis runs fully offline and does not need any API key or internet access.

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
- `GET /api/reports/{id}/pdf`
- `GET /api/dashboard/stats`
