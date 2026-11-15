# 🛡️ BugTracer – AI-Powered Enterprise Issue & Sprint Intelligence Platform

**BugTracer** is an enterprise-grade Bug Tracking and Agile Sprint Intelligence platform built on the **MERN** stack (MongoDB, Express.js, React, Node.js). Designed for final-year / capstone project evaluations, it elevates a standard issue tracker with **predictive AI root cause analysis, automated resolution suggestions, SLA deadline monitoring, story points velocity tracking, and complete audit logging**.

---

## 🚀 Innovative Capstone & Industry-Grade Features

### 1. 🤖 AI-Powered Root Cause & Resolution Diagnostics
- Automatically parses error messages, stack traces, and descriptions upon issue creation or on-demand.
- Pinpoints likely system bottlenecks (e.g. *Memory leaks in Redis tier*, *CORS header misconfigurations*, *Database full collection scans*, *Deep link entitlements*).
- Suggests concrete architectural code fixes and calculates an AI Confidence Score (85%–96%) with Complexity Grading (Easy / Moderate / Complex).

### 2. ⏱️ Automated SLA Health Monitoring & Deadline Tracking
- Configurable target resolution SLAs based on issue severity (1-day for Critical, 2-days for High, 3-5 days for others).
- System computes real-time **SLA Health Scores (0–100%)** on the Dashboard.
- Highlights overdue cards on the Kanban board with pulsing red alert borders and provides dedicated filters for breached SLAs.

### 3. 🎯 Agile Sprint Story Points & Velocity Analytics
- Developers and PMs estimate complexity with Fibonacci story points per card.
- Live Sprint Velocity widget measures completed points vs. total sprint commitments.

### 4. 📜 Comprehensive Audit Trail & Activity Logging
- Every ticket maintains an immutable timeline history of status transitions, assignee shifts, priority escalations, AI diagnoses, and attachments.
- Visible via the **Audit Trail** tab in the issue inspection modal.

### 5. 📊 One-Click CSV Issue Export
- Export filtered issue tables directly to CSV format for stakeholder presentations, Jira migration, or QA compliance audits.

### 6. 🗂️ Multi-Tenant Workspace & Team Role Management
- Create isolated projects with custom key prefixes (e.g., `DCM-101`, `FME-204`).
- Invite team members with 4-tier Role-Based Access: **Admin**, **Manager**, **Developer**, **Viewer**.

---

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide Icons, `@hello-pangea/dnd`, React Router v6 |
| **Backend** | Node.js, Express.js (REST API), Mongoose |
| **Database** | MongoDB (Local / Atlas) |
| **Intelligent Modules** | Custom AI Assistant engine (`aiAssistant.js`), SLA calculators, Story points velocity |
| **Security & Uploads** | JWT, bcryptjs, Multer (screenshots & crash logs), CORS, dotenv |

---

## 🏃 Quick Start Guide

### 1. Backend Server
```bash
cd server
npm install
npm run seed      # Seeds demo projects, AI diagnostics, and realistic tickets
npm run start     # Starts API server on http://localhost:5000
```

### 2. Frontend Web Client
```bash
cd client
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

Visit **http://localhost:5173** in your web browser.

---

## 🔑 1-Click Evaluation Credentials

Use the **1-Click Demo Buttons** on the sign-in screen or log in with:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@bugtracer.io` | `password123` |
| **Developer** | `alex@bugtracer.io` | `password123` |
| **Developer** | `maya@bugtracer.io` | `password123` |
| **Project Manager** | `david@bugtracer.io` | `password123` |

---

## 📂 Project Architecture

```text
full_stack_final_project/
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT & Role authorization
│   │   │   └── upload.js        # Multer attachment handler
│   │   ├── models/
│   │   │   ├── User.js          # User schema & bcrypt methods
│   │   │   ├── Project.js       # Workspace schema & members
│   │   │   ├── Ticket.js        # Ticket with AI Diagnostics, SLA, & Audit logs
│   │   │   └── Comment.js       # Threaded comments
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # User authentication
│   │   │   ├── projectRoutes.js  # Project workspace operations
│   │   │   ├── ticketRoutes.js   # Ticket CRUD, AI trigger, and status
│   │   │   └── dashboardRoutes.js# SLA health & velocity metrics
│   │   ├── utils/
│   │   │   └── aiAssistant.js   # AI root cause analysis engine
│   │   ├── seed.js              # Mock database seeder
│   │   └── server.js            # Express server entry point
│   ├── uploads/                 # File storage
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top bar & workspace switcher
│   │   │   ├── CreateTicketModal.jsx # Create issue with SLA & story points
│   │   │   ├── CreateProjectModal.jsx# Create workspace
│   │   │   └── TicketDetailModal.jsx # AI Diagnostics card & Audit Trail
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth provider
│   │   │   └── ProjectContext.jsx    # Project workspace provider
│   │   ├── pages/
│   │   │   ├── Auth.jsx              # Sign In / Sign Up
│   │   │   ├── Dashboard.jsx         # Executive SLA & Velocity console
│   │   │   ├── KanbanBoard.jsx       # Drag & drop sprint board
│   │   │   ├── IssuesList.jsx        # Issue registry with CSV export
│   │   │   └── ProjectsView.jsx      # Workspace & team manager
│   │   ├── services/
│   │   │   └── api.js                # API fetch helper
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```
