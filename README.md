# 🚀 BugSense AI

### AI-Powered Automated QA & Bug Analysis Platform

BugSense AI is a full-stack web application that helps developers analyze source code, identify potential bugs, improve code quality, and generate actionable recommendations through AI-powered analysis.

The platform provides automated code inspection, issue severity classification, quality scoring, test case suggestions, and detailed bug reports through an intuitive dashboard.

---

## 📌 Key Features

### 🔐 Secure Authentication

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
```

---

## 📁 Project Structure

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

### Frontend (.env)

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

* GitHub Repository Scanning
* AI Chat Assistant
* Security Vulnerability Detection
* Scan History Tracking
* Team Collaboration Features
* Advanced Analytics Dashboard
* PDF & Excel Export
* Project Health Scoring
* Dark/Light Theme Support
* Multi-language Code Analysis

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
