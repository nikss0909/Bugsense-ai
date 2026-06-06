<<<<<<< HEAD
# BugSense

Offline static code analysis and bug detection platform.

BugSense is a full-stack Spring Boot + React application for uploading source code files, running rule-based analysis locally, storing reports in MongoDB, and viewing SonarQube-inspired quality dashboards and PDF reports.
=======
# 🚀 BugSense AI

### AI-Powered Automated QA & Bug Analysis Platform

BugSense AI is a full-stack web application that helps developers analyze source code, identify potential bugs, improve code quality, and generate actionable recommendations through AI-powered analysis.
>>>>>>> 9bcc22c0c33ae889eebcb11d60995ff76e89f230

The platform provides automated code inspection, issue severity classification, quality scoring, test case suggestions, and detailed bug reports through an intuitive dashboard.

<<<<<<< HEAD
- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: Spring Boot, Spring Security, JWT
- Database: MongoDB
- Analysis: Offline Java rule strategies, no external AI APIs
- Reporting: Apache PDFBox
=======
---
>>>>>>> 9bcc22c0c33ae889eebcb11d60995ff76e89f230

## 📌 Key Features

<<<<<<< HEAD
- Signup and login with BCrypt password hashing and JWT authentication
- Protected React routes with persisted sessions
- Source file upload and immediate offline static analysis
- Java, JavaScript, SQL, and HTML rule coverage
- Severity analytics, most common issue types, recent scans, language usage, and quality scoring
- Report detail pages with issue cards, technical debt, recommendations, source preview, and PDF export
- Multi-file analysis entry point in the backend service for future ZIP and GitHub repository scanning
=======
### 🔐 Secure Authentication
>>>>>>> 9bcc22c0c33ae889eebcb11d60995ff76e89f230

* User Registration and Login
* JWT-based Authentication
* BCrypt Password Hashing
* Protected Routes
* Persistent User Sessions
* Profile Management

### 📂 Code Analysis

* Upload source code files for analysis
* AI-powered bug detection
* Issue categorization and severity classification
* Code quality scoring
* Language identification

### 🤖 AI-Powered Insights

* Bug explanations
* Fix recommendations
* Test case suggestions
* Code quality improvement recommendations
* Automated analysis reports using Gemini API

### 📊 Interactive Dashboard

* Quality Score Overview
* Severity Distribution Charts
* Recent Analysis Reports
* Language Usage Analytics
* Project Statistics

### 📑 Detailed Reports

* Bug Findings
* Severity Levels
* Suggested Fixes
* Test Case Recommendations
* Source Code Preview
* Analysis History

### 👤 User Management

* View Profile
* Edit Profile Information
* Account Management

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Recharts
* React Router

### Backend

* Spring Boot
* Spring Security
* JWT Authentication
* REST APIs

### Database

* MongoDB

### AI Integration

* Google Gemini API
* REST-based AI Analysis Service

---

## 🏗️ System Architecture

```text
<<<<<<< HEAD
backend/   Spring Boot REST API and rule-based analyzer
frontend/  React + Vite application
=======
Frontend (React + Tailwind)
        │
        ▼
Spring Boot REST API
        │
        ├── JWT Authentication
        ├── User Management
        ├── Report Management
        └── AI Analysis Service
                │
                ▼
          Gemini API

        │
        ▼
     MongoDB
>>>>>>> 9bcc22c0c33ae889eebcb11d60995ff76e89f230
```

---

## 📁 Project Structure

<<<<<<< HEAD
```powershell
$env:MONGODB_URI="mongodb://localhost:27017/bugsense_ai"
$env:JWT_SECRET="replace-with-a-long-unique-secret-at-least-32-bytes"
$env:FRONTEND_ORIGIN="http://localhost:5173"
=======
```text
BugSense-AI/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── security/
│   └── config/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── layouts/
│
└── README.md
>>>>>>> 9bcc22c0c33ae889eebcb11d60995ff76e89f230
```

---

## ⚙️ Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb://localhost:27017/bugsense_ai
JWT_SECRET=your-secure-secret-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIMEOUT_SECONDS=45
FRONTEND_ORIGIN=http://localhost:5173
```

<<<<<<< HEAD
`JWT_SECRET` should be set for stable sessions across backend restarts. Analysis runs fully offline and does not need any API key or internet access.
=======
### Frontend (.env)
>>>>>>> 9bcc22c0c33ae889eebcb11d60995ff76e89f230

```env
VITE_API_URL=http://localhost:8080/api
```

---

## 🚀 Running Locally

### Clone Repository

```bash
git clone https://github.com/nikss0909/Bugsense-ai.git
cd bugsense-ai
```

### Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### Access Application

```text
http://localhost:5173
```

<<<<<<< HEAD
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
=======
---

## 🔗 REST API Endpoints

### Authentication

```http
POST /api/auth/signup
POST /api/auth/login
```

### User Management

```http
GET  /api/users/me
PUT  /api/users/me
```

### Report Management

```http
POST /api/reports/analyze
GET  /api/reports
GET  /api/reports/recent
GET  /api/reports/{id}
```

### Dashboard

```http
GET /api/dashboard/stats
```

---

## 📈 Future Enhancements

- Team Collaboration & Issue Assignment
- CI/CD Integration
- GitHub Pull Request Analysis
- Real-time Notifications
- Multi-Organization Support
- API Access & Webhooks

---

## 🎯 Project Objectives

* Improve software quality through automated analysis
* Help developers identify bugs faster
* Generate meaningful AI-assisted recommendations
* Simplify QA and debugging workflows
* Provide actionable software quality metrics

---

## 👨‍💻 Author

**Nikhil Prakash Patil**

Final Year Computer Engineering Student

Passionate about Full Stack Development, Software Quality Engineering, AI-Powered Applications, and Backend Development.
>>>>>>> 9bcc22c0c33ae889eebcb11d60995ff76e89f230
