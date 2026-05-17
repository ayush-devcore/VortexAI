# Vortex Workspace ⚡ v4 (Enterprise React Edition)

![Frontend: React 19](https://img.shields.io/badge/Frontend-React_19_%2B_Vite-61DAFB?style=flat-square&logo=react&logoColor=black)
![Language: TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Database: PostgreSQL](https://img.shields.io/badge/Database-Prisma_%2B_PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![AI: Google Gemini](https://img.shields.io/badge/AI-Gemini_2.0_Flash-4285F4?style=flat-square&logo=google&logoColor=white)

Vortex Workspace is a modern, high-performance SaaS dashboard designed for elite team collaboration. Version 4 introduces a complete architecture overhaul: a decoupled **React 19 + TypeScript** SPA, real-time Socket.io synchronization, enterprise-grade security, and an intelligent AI Studio powered by Google Gemini.

---

### 🎥 Live Demo
*(Demo GIF goes here)*

> **💡 Pro-Tip:** Press `Ctrl + K` anywhere in the app to trigger the lightning-fast Fuse.js fuzzy search engine.

---

### 🚀 Core Features

* **Intelligent Dashboard:** Real-time stats, team velocity analytics, and an integrated AI Studio for sentiment and risk analysis.
* **Zero-Latency Interactions:** Built with Optimistic UI principles. Don't wait for the database; the UI updates instantly.
* **Deep Workspace Management:** Seamlessly switch between workspaces, manage roles, and invite team members.
* **Advanced Task Engine:** Full CRUD capabilities with rich edit modals (descriptions, dynamic priority, due dates, and status tracking).
* **The "Arctic-Vivid" Dark Theme:** A premium, custom Teal & Amber design system built on Tailwind CSS 4 with fluid Framer Motion animations (Strictly 0% purple).

---

### 🏛️ The V4 Architecture Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite | High-performance SPA with instant Hot Module Replacement. |
| **Styling** | Tailwind CSS 4, Framer Motion | Fluid layouts, glassmorphism, and complex layout animations. |
| **Backend** | Node.js, Express 5 | Asynchronous, event-driven API engine. |
| **Database** | PostgreSQL (via Prisma ORM) | Strictly typed, relational data persistence. |
| **Real-Time** | Socket.io | Bi-directional event broadcasting for multi-user sync. |
| **Intelligence** | Google Gemini 2.0 Flash | Server-side automated prompt pipelines and Markdown generation. |

---

### 🛡️ Enterprise-Grade Security
Vortex doesn't compromise on data integrity.
* **Auth Architecture:** JWT Access Tokens paired with secure Refresh Token rotation stored in the database.
* **Transport Security:** Strict `HTTP-Only`, `SameSite=strict` signed cookies to prevent XSS and CSRF attacks.
* **Data Hardening:** Bcrypt (12 rounds) password hashing, rate limiting on Auth/AI routes, and strict Row-Level Security (RLS) ensuring users only mutate data within their authorized workspaces.

---

### 🛠️ Quick Start & Local Development

Vortex uses a decoupled monorepo structure. You will run the API and the UI simultaneously.

#### 1. Clone & Install
```bash
git clone [https://github.com/your-username/VortexAI.git](https://github.com/your-username/VortexAI.git)
cd VortexAI

# Install Backend dependencies
npm install

# Install Frontend dependencies
cd client
npm install
cd ..
