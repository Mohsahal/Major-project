# Future Find Career

A full-stack career platform that helps job seekers build resumes, get AI-powered job recommendations, analyze skill gaps, and practice with mock interviews.

## Features

- **Resume Builder** – Create and manage multiple resumes with professional templates
- **Job Recommendations** – Upload your resume and get personalized job matches using ML similarity scoring
- **Skill Gap Analysis** – Compare your resume against job descriptions; identify missing skills and get learning resources (courses, YouTube videos)
- **Mock Interview** – AI-generated interview questions, practice with recording, and feedback
- **Authentication** – Sign up, login, and Google OAuth
- **Dashboard** – Overview of jobs, resumes, and quick actions

## Tech Stack

| Layer   | Technology                                                                 |
| ------- | -------------------------------------------------------------------------- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, Shadcn UI, Framer Motion       |
| Node API | Express, MongoDB (Mongoose), JWT, Google Auth, Gemini AI                   |
| Flask API | Python, Flask, LangChain, Gemini, Sentence Transformers, FAISS, scikit-learn |

## Project Structure

```
Major-project/
├── client/          # React frontend (Vite + JSX)
├── node/            # Express backend (auth, resumes, interviews, AI)
├── flask/           # Python ML service (job recommendations, skill gap analysis)
└── README.md
```

### Client (`client/`)

- Pages: Home, About, Features, Auth, Dashboard, Resume Builder, My Resumes, View All Jobs, Skill Gap Analysis, Profile, Settings
- Mock Interview: Create/edit interviews, record answers, AI feedback
- UI: Shadcn components, responsive layouts

### Node (`node/`)

- **Auth** – Login, signup, Google OAuth, JWT
- **Resumes** – CRUD for user resumes
- **Interviews** – CRUD for mock interviews
- **AI** – Generate interview questions, summaries, experience, projects (Gemini)
- **Resume Parser** – Parse PDF/DOCX resumes

### Flask (`flask/`)

- **Job Recommender** – TF-IDF + Sentence Transformers; matches resumes to jobs from `data.json` / `naukridatas.json`
- **Skill Gap Analyzer** – LangChain + Gemini for skill extraction; YouTube API for learning resources
- Endpoints: `/upload-resume`, `/skill-gap-analysis`, `/recommend-jobs`, `/all-jobs`, `/jobs-stats`

## Prerequisites

- **Node.js** 18+
- **Python** 3.9+
- **MongoDB** (local or cloud)
- **API keys:**
  - [Google Cloud Console](https://console.cloud.google.com/) – Gemini API, Google OAuth client
  - [YouTube Data API](https://console.cloud.google.com/apis/library/youtube.googleapis.com) – for skill gap learning resources

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Major-project
```

### 2. Client setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:1000/api
VITE_FLASK_BASE_URL=http://localhost:2000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### 3. Node backend setup

```bash
cd node
npm install
```

Create `node/.env`:

```env
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
MONGODB_URI=mongodb://localhost:27017/future_find
PORT=1000
```

### 4. Flask ML service setup

```bash
cd flask
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
```

Create `flask/.env`:

```env
GEMINI_API_KEY=your-gemini-api-key
YOUTUBE_API_KEY=your-youtube-api-key
FLASK_PORT=2000
```

## Running the Application

Start all three services (each in its own terminal):

### Terminal 1 – Flask (port 2000)

```bash
cd flask
python app.py
```

### Terminal 2 – Node (port 1000)

```bash
cd node
npm run dev
```

### Terminal 3 – Client (port 8080)

```bash
cd client
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## Environment Variables Summary

| Variable               | Where   | Description                    |
| ---------------------- | ------- | ------------------------------ |
| `VITE_API_BASE_URL`    | client  | Node API base URL              |
| `VITE_FLASK_BASE_URL`  | client  | Flask API base URL             |
| `VITE_GOOGLE_CLIENT_ID`| client  | Google OAuth client ID         |
| `GEMINI_API_KEY`       | node, flask | Google Gemini API key      |
| `JWT_SECRET`           | node    | Secret for JWT signing         |
| `GOOGLE_CLIENT_ID`     | node    | Google OAuth client ID         |
| `MONGODB_URI`          | node    | MongoDB connection string      |
| `PORT`                 | node    | Node server port (default 1000)|
| `YOUTUBE_API_KEY`      | flask   | YouTube Data API key           |
| `FLASK_PORT`           | flask   | Flask server port (default 2000)|

## Scripts

| Command          | Where   | Description           |
| ---------------- | ------- | --------------------- |
| `npm run dev`    | client  | Start Vite dev server |
| `npm run build`  | client  | Production build      |
| `npm run dev`    | node    | Start with nodemon    |
| `npm start`      | node    | Start Node server     |

## Job Data

Flask uses job listings from:

- `flask/data.json` – primary job data
- `flask/naukridatas.json` – additional job data

Jobs are matched via TF-IDF and sentence embeddings.

## License

ISC
