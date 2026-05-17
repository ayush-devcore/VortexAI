# ⚡ Vortex Workspace

A high-energy, AI-powered workspace dashboard built with a professional full-stack architecture.

## 🏗️ Architecture

```
vortex/
├── server.js                    # Express entry point
├── public/                      # Frontend (HTML + Tailwind CSS)
│   ├── index.html
│   └── js/
│       ├── dashboard.js         # Dashboard UI logic
│       └── aiAssistant.js       # Gemini AI utility
└── src/                         # Backend (Controller-Service-Repository)
    ├── controllers/
    ├── services/
    ├── repositories/
    └── routes/
```

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | List all tasks (supports `?status=`, `?priority=` filters) |
| GET | `/api/v1/tasks/stats` | Dashboard statistics |
| POST | `/api/v1/tasks` | Create a new task |
| GET | `/api/v1/workspace` | List all workspaces |
| POST | `/api/v1/workspace` | Create a workspace |
| GET | `/api/health` | Health check |

## 🤝 Contributing — Intentional Gaps

These features are intentionally left incomplete for contributors:

1. **Live Search** — The search bar UI exists but has no JS filtering logic
2. **Database Layer** — API returns static JSON; connect MongoDB/PostgreSQL
3. **API Key Security** — `aiAssistant.js` has a plain API key; implement `dotenv`

## 📄 License

MIT
