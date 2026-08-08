# InterviewAI — Frontend

> AI-powered interview preparation platform. Get a personalised interview strategy, practice with a mock interview mode, and download a tailored résumé — all in one place.

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React Router](https://img.shields.io/badge/React_Router-7.x-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![SCSS](https://img.shields.io/badge/SCSS-Sass-CC6699?logo=sass&logoColor=white)](https://sass-lang.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Application Flow](#application-flow)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Pages & Routes](#pages--routes)
- [Architecture Decisions](#architecture-decisions)
- [Error Handling](#error-handling)
- [Deployment](#deployment)
- [Related](#related)

---

## Overview

The InterviewAI frontend is a **React 19** single-page application built with **Vite**. It communicates with the InterviewAI REST API to generate AI-powered interview preparation reports. Users paste a job description, optionally upload their résumé (PDF), and receive a structured report containing interview questions, skill gap analysis, a preparation roadmap, and a downloadable tailored résumé.

**Live App:** `https://interview-scorer-ai-frontend.vercel.app`  
**Backend API:** `https://interview-scorer-ai-backend.vercel.app`  
**API Docs:** `https://interview-scorer-ai-backend.vercel.app/api/docs`

---

## Key Features

| Feature | Description |
|---|---|
| **AI Report Generation** | Paste a job description + upload your résumé to get a full interview prep report in ~30 seconds |
| **Match Score** | Visual score ring (0–100) showing how well your profile matches the role |
| **Technical Questions** | Accordion list of likely technical interview questions with model answers |
| **Behavioral Questions** | Situational questions with interviewer intent explained |
| **Skill Gap Analysis** | Colour-coded skill tags (high / medium / low severity) with severity legend |
| **7-Day Prep Roadmap** | Timeline view of a day-by-day preparation plan |
| **Mock Interview Mode** | Practice all questions one-by-one, self-rate confidence (Needs Work / Okay / Nailed It), see session summary |
| **AI PDF Résumé Download** | One-click download of a Gemini-generated, ATS-friendly résumé tailored to the job |
| **Recent Reports Dashboard** | Grid of all past interview plans with match scores and dates |
| **Cookie-based Auth** | Secure httpOnly cookie session — no tokens in localStorage |
| **Form Validation** | Inline field-level validation with accessible error messages |
| **Toast Notifications** | Context-aware toasts for success, error (network / server / validation), warnings (rate limit) |
| **Skeleton Loading** | Spinner + loading states on all async operations |
| **Responsive Dark UI** | Modern dark theme with consistent design tokens across all pages |
| **Accessible** | `aria-label`, `aria-describedby`, `focus-visible` rings, keyboard navigation |

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Routing | React Router 7 |
| HTTP Client | Axios (single shared instance with interceptors) |
| Styling | SCSS (Sass) with shared design token partial |
| Notifications | Sonner |
| Linting | ESLint with react-hooks and react-refresh plugins |
| Deployment | Vercel |

---

## Application Flow

```
User visits app
      │
      ▼
AuthProvider mounts
      │  calls GET /api/auth/get-me
      │  ├── 200 → set user → show Home
      │  └── 401 → user = null → redirect to /login
      ▼
/login  or  /register
      │  POST /api/auth/login  or  /api/auth/register
      │  ← server sets httpOnly 'token' cookie
      │  ← response includes { token, user }
      ▼
/ (Home — Protected)
      │  useEffect → GET /api/interview  → load past reports
      │
      │  User fills: job description + resume file / self description
      │  clicks "Generate My Interview Strategy"
      │
      │  POST /api/interview  (multipart/form-data)
      │  ← AI processes ~30 seconds
      │  ← returns full InterviewReport document
      ▼
/interview/:id  (Interview — Protected)
      │  GET /api/interview/report/:id
      │
      ├── Technical Questions tab   → accordion Q&A
      ├── Behavioral Questions tab  → accordion Q&A
      ├── Road Map tab              → timeline view
      └── Mock Interview tab        → one-by-one practice with confidence rating
      │
      │  Right sidebar:
      │  ├── Match Score ring
      │  ├── Skill Gap tags
      │  └── Quick Stats
      │
      │  "Download Resume" button
      │  POST /api/interview/resume/pdf/:id
      │  ← streams PDF → browser download
```

---

## Project Structure

```
frontend/
├── index.html                     # Vite HTML entry
├── vite.config.js                 # Vite config — SCSS loadPaths
├── eslint.config.js
├── .env                           # Environment variables (not committed)
├── .gitignore
├── package.json
└── src/
    ├── main.jsx                   # React root — mounts App with StrictMode
    ├── App.jsx                    # Providers (Auth, Interview, Router) + Toaster
    ├── app.routes.jsx             # Route definitions (login, register, /, /interview/:id)
    │
    ├── style.scss                 # Global reset, body styles, shared animations
    ├── index.css                  # (empty — Vite scaffold, intentionally unused)
    │
    ├── style/                     # Shared design system
    │   ├── _variables.scss        # Design tokens — single source of truth for all colours
    │   └── button.scss            # .button base + .primary-button / .ghost-button modifiers
    │
    └── features/
        ├── auth/                  # Authentication feature
        │   ├── auth.context.jsx   # AuthContext — provides { user, setUser, loading }
        │   ├── auth.form.scss     # Auth page styles (card, inputs, brand mark)
        │   ├── components/
        │   │   └── Protected.jsx  # Route guard — redirects unauthenticated users to /login
        │   ├── hooks/
        │   │   └── useAuth.js     # handleLogin, handleRegister, handleLogout, session init
        │   ├── pages/
        │   │   ├── Login.jsx      # Login form with validation and typed error toasts
        │   │   └── Register.jsx   # Register form with validation and typed error toasts
        │   └── services/
        │       └── auth.api.js    # register(), login(), logout(), getMe() — raw API calls
        │
        └── interview/             # Interview feature
            ├── interview.context.jsx  # InterviewContext — { loading, report, reports }
            ├── hooks/
            │   └── useInterview.js    # generateReport, getReportById, getReports, getResumePdf
            ├── pages/
            │   ├── Home.jsx           # Report generation form + past reports grid
            │   └── Interview.jsx      # 3-column report viewer + Mock Interview mode
            ├── services/
            │   └── interview.api.js   # Raw API calls for all interview endpoints
            └── style/
                ├── home.scss          # Home page styles (nav, card, panels, dropzone)
                └── interview.scss     # Interview page styles (layout, accordion, roadmap, mock)

    └── lib/
        └── api.js                 # Shared Axios instance + AppError class + response interceptor
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- The [InterviewAI backend](https://github.com/kaioumdev/Interview-Scorer-AI-Backend) running locally or deployed

### Installation

```bash
# Clone the repository
git clone https://github.com/kaioumdev/Interview-Scorer-AI-Frontend.git
cd Interview-Scorer-AI-Frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root of the frontend folder:

```env
# URL of the backend API
# For local development:
VITE_API_URL=http://localhost:3000

# For production (replace with your actual backend URL):
# VITE_API_URL=https://interview-scorer-ai-backend.vercel.app
```

> All Vite environment variables must be prefixed with `VITE_` to be exposed to the browser.

### Running Locally

```bash
# Start the Vite dev server with HMR
npm run dev
```

Open `http://localhost:5173` in your browser.

**Other scripts:**

```bash
npm run build      # Production build (output: dist/)
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
```

---

## Pages & Routes

| Path | Component | Auth | Description |
|---|---|---|---|
| `/login` | `Login` | Public | Sign in with email + password |
| `/register` | `Register` | Public | Create a new account |
| `/` | `Home` | Protected | Generate reports + view past plans |
| `/interview/:interviewId` | `Interview` | Protected | View full report + mock interview |

**Route protection:** The `Protected` component checks the `AuthContext`. If `user` is null after the session check completes, it redirects to `/login` using React Router's `<Navigate>`.

---

## Architecture Decisions

### Feature-based folder structure
Each feature (`auth`, `interview`) owns its pages, hooks, services, and styles. This keeps related code co-located and makes features independently maintainable.

### Single Axios instance (`src/lib/api.js`)
One shared instance ensures all requests use the same `baseURL`, `withCredentials: true`, and timeout settings. The response interceptor normalizes all errors into a typed `AppError` before they reach any component.

### `AppError` class
Every API error is classified into one of: `auth | network | validation | rateLimit | server | unknown`. Components use the `.type` field to show context-appropriate toasts (e.g. a rate-limit error shows a warning toast, a network error shows a different message than a 401).

### Context + hooks (no Redux)
The app uses two React contexts (`AuthContext`, `InterviewContext`) with custom hooks (`useAuth`, `useInterview`). This is sufficient for the app's state complexity without introducing a state management library.

### SCSS design tokens
All colours, font stacks, and severity palette values are defined once in `src/style/_variables.scss` and imported via Sass `@use` in every stylesheet. No values are duplicated.

---

## Error Handling

The frontend implements a professional, layered error handling strategy:

```
API response
    │
    ▼
Axios response interceptor (api.js)
    │  classifyAxiosError() → AppError { message, status, type }
    │  Dev: grouped console log (collapsed, colour-coded by severity)
    │  Prod: no console output
    │  Silent: GET /get-me 401 (expected — no session)
    ▼
Hook catch block (useAuth / useInterview)
    │  re-throws AppError to the calling component
    ▼
Page/component catch block
    │  reads err.type to choose the right toast style:
    │  ├── type === 'network'    → toast.error  "No connection…"
    │  ├── type === 'rateLimit'  → toast.warning "Hourly limit reached…"
    │  ├── type === 'server'     → toast.error  "Something went wrong on our end…"
    │  └── default               → toast.error  err.message (server's own message)
    ▼
Sonner toast notification (top-right, dark theme, rich colours)
```

No errors are silently swallowed. Every error either surfaces as a user-facing toast or is handled silently when the 401 is an expected "no session" check.

---

## Deployment

The frontend is deployed to **Vercel** as a static SPA.

### Vercel Environment Variables

Set in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://interview-scorer-ai-backend.vercel.app` |

### Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel. Every push to `main` triggers an automatic deployment.

> **Note:** Vercel serves SPAs correctly out of the box — client-side routes like `/interview/:id` are handled by the React Router without needing any rewrite rules.

---

## Related

- **[Backend Repository](https://github.com/kaioumdev/Interview-Scorer-AI-Backend)** — Express API, MongoDB models, Gemini integration
- **[API Documentation](https://interview-scorer-ai-backend.vercel.app/api/docs)** — Interactive Swagger UI

---

## License

ISC © [kaioumdev](https://github.com/kaioumdev)
