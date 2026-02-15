# Future Find Career

A full-stack career platform: resume builder, AI job recommendations, skill gap analysis, mock interviews.

## Project Structure

```
Major-project/
├── client/             # React frontend (Vite, Tailwind, Shadcn)
│   ├── src/
│   │   ├── pages/      # Home, Dashboard, Resume Builder, Skill Gap, etc.
│   │   ├── components/
│   │   ├── config/     # API URLs
│   │   └── services/   # Gemini, API client
│   └── ...
│
├── node/               # Express API (auth, resumes, interviews)
│   ├── routes/         # auth, resume, ai, interviews
│   ├── models/
│   └── ...
│
├── flask/              # Python ML API (job recommendations, skill gap)
│   ├── app.py          # Entry point, CORS, /warm, blueprints
│   ├── config.py       # Environment config
│   ├── services.py     # Lazy singletons
│   ├── skill_gap/      # Skill gap analysis (AI + fallback + YouTube)
│   ├── job_recommender/# Job recommendations (TF-IDF + embeddings)
│   ├── routes/         # health, jobs, skill_gap
│   └── utils/          # resume_parser
│
├── render.yaml         # Render deployment (Node, Flask, Static)
└── README.md
```

## Flow

1. **Client** – React app, calls Node API (auth, resumes, interviews) and Flask API (jobs, skill gap).
2. **Node** – Auth (JWT, Google), MongoDB, Gemini for interview AI.
3. **Flask** – Job matching (TF-IDF + sentence embeddings), skill gap (Gemini + regex fallback), learning resources (YouTube). `/warm` preloads job recommender to avoid cold-start timeouts.

## Tech Stack

| Layer    | Tech                                                  |
| -------- | ----------------------------------------------------- |
| Frontend | React 18, Vite, Tailwind, Shadcn UI                   |
| Node API | Express, MongoDB, JWT, Google Auth, Gemini            |
| Flask API| Python, Flask, Gemini, Sentence Transformers, sklearn |

## Setup

### Prerequisites

- Node.js 18+, Python 3.9+, MongoDB
- API keys: Gemini, Google OAuth, YouTube (for skill gap)

### Install & Run

```bash
# Client
cd client && npm install
# Add client/.env: VITE_API_BASE_URL, VITE_FLASK_BASE_URL, VITE_GOOGLE_CLIENT_ID

# Node
cd node && npm install
# Add node/.env: GEMINI_API_KEY, JWT_SECRET, MONGODB_URI, GOOGLE_CLIENT_ID, PORT=1000

# Flask
cd flask && pip install -r requirements.txt
# Add flask/.env: GEMINI_API_KEY, YOUTUBE_API_KEY, FLASK_PORT=2000
```

Run (3 terminals):

```bash
cd flask && python app.py      # :2000
cd node && npm run dev         # :1000
cd client && npm run dev       # :8080
```

Open [http://localhost:8080](http://localhost:8080).

## Deployment (Render)

Use `render.yaml` for blueprints. Services: Node (auth, API), Flask (jobs, skill gap), Static (client). Set env vars in Render dashboard (MONGODB_URI, GEMINI_API_KEY, YOUTUBE_API_KEY, JWT_SECRET, etc.).

## License

ISC
