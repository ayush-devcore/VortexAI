# Vortex Workspace v4

AI-powered workspace dashboard with React, secure auth, real-time collaboration, and Gemini insights.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion |
| Backend | Node.js, Express 5, Prisma, PostgreSQL |
| Auth | JWT access tokens + refresh token rotation (HTTP-only cookies) |
| Real-time | Socket.io |
| AI | Google Gemini 2.0 Flash (server-side only) |

## Features

- Dashboard with stats, tasks, analytics, and AI Studio
- Workspace switcher, team invites, and member management
- Task CRUD with full edit modal (description, priority, due date, status)
- In-app notifications (persisted + real-time)
- Email verification flow
- Profile & password settings
- Calendar, Projects, Roadmap, and Help views
- Fuse.js fuzzy search with **Ctrl+K**
- Teal/amber dark theme (no purple)

## Quick start

```bash
npm install
cd client && npm install && cd ..
cp .env.example .env   # fill DATABASE_URL, JWT_SECRET, COOKIE_SECRET, GEMINI_API_KEY
npm run setup          # prisma generate, db push, seed
```

**Terminal 1 — API:**
```bash
npm run dev
```

**Terminal 2 — UI:**
```bash
npm run client:dev
```

Open **http://localhost:5173**

**Demo login:** `admin@vortex.io` / `Password123`

## Production build

```bash
npm run build
NODE_ENV=production npm start
```

Serves the React app from `client/dist` on port 3000.

## API

Base: `/v1/api`

- `POST /auth/register|login|logout|refresh|verify-email`
- `GET|PATCH /auth/me`, `PUT /auth/password`
- `GET|POST|PUT|DELETE /workspace`, `.../members`
- `GET|POST|PUT|DELETE /tasks`
- `GET /analytics`, `POST /summarize`
- `GET|PATCH /notifications`

## Security

- Bcrypt (12 rounds), strong password policy
- Short-lived access tokens + refresh rotation in DB
- `SameSite=strict` signed cookies
- Rate limiting on auth and AI routes
- Workspace membership checks on all mutations

## License

ISC
