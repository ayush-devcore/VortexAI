# Vortex Workspace ⚡ v3.0 (Enterprise Edition)

![Database: Neon PostgreSQL](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=flat-square&logo=postgresql&logoColor=black)
![Cache: Upstash Redis](https://img.shields.io/badge/Cache-Upstash_Redis-FF4D4D?style=flat-square&logo=redis&logoColor=white)
![AI: Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)

Vortex Workspace is a modern, high-performance, real-time SaaS dashboard built for the GSSoC Hackathon. It features an "Arctic-Vivid" Glassmorphism UI, real-time optimistic updates, and intelligent AI insights powered by Google Gemini.

---

### 🎥 Demo
<!-- Add your 10-second GIF here showing Optimistic UI and AI slide-over -->
*(Demo GIF goes here)*

> **💡 Pro-Tip:** Notice the Zero-Latency task creation. Vortex uses Optimistic UI updates to ensure the interface never waits for the database.

---

### 🏛️ The Architecture
Vortex has graduated from prototype to a fully production-ready system:
- **Scalable Backend:** Node.js, Express, Prisma ORM, PostgreSQL (via Neon) and Redis caching (via Upstash).
- **Secure Infrastructure:** JWT Authentication, HTTP-only cookies, Row Level Security (RLS), Helmet, and rate limiting.
- **Premium Frontend:** HTML5/CSS3 with Tailwind CSS, strictly implementing the Arctic-Vivid design philosophy.
- **Real-Time Sync:** Socket.io connected for instantaneous multi-client updates.
- **Smart Layer:** Markdown-rendered AI slide-over panels utilizing the Gemini 2.0 API.

### 🎨 Design Tokens (Arctic-Vivid)
Strict adherence to this color palette is required for all new components to prevent the "Tailwind Reset" issue:
- **Primary Blue:** `#2563EB` (Electric Blue)
- **Primary Green:** `#10B981` (Success Emerald)
- **Background:** `#F9FAFB` (Arctic White)

---

### 📊 Project Status

| Feature | Status | Tech |
|---------|--------|------|
| **Core Dashboard** | ✅ Complete | Tailwind / HTML5 |
| **Postgres Persistence** | ✅ Complete | Prisma / Neon |
| **Real-time Sync** | ✅ Complete | Socket.io |
| **Fuzzy Search** | 🛠️ Help Wanted | Fuse.js |
| **AI Sub-tasks** | 🛠️ Help Wanted | Gemini API |

---

### 🚩 Call To Contributors (The "Issue #6" Call-to-Action)
The Core Engine is built, but we need your help to polish the smart features!
- **Search Logic:** Implement `Fuse.js` for fuzzy search across tasks and workspaces in `dashboard.js`.
- **Detailed AI Suggestions:** Enhance the AI context window to generate actionable sub-tasks based on the sentiment analysis.
- **Mobile Responsiveness:** Ensure the Glassmorphism sidebar collapses perfectly on smaller screens.

### 🛠️ Local Development Setup

1. **Clone and Install:**
   ```bash
   git clone https://github.com/your-username/VortexAI.git
   cd VortexAI
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file and populate it using `.env.example`:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `REDIS_URL` (Upstash Redis)
   - `GEMINI_API_KEY`
   - `JWT_SECRET`

3. **Database Migration:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   node prisma/seed.js
   ```

4. **Launch Server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to enter the Vortex.

---

**Built with ❤️ for GSSoC.**
