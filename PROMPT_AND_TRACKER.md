# Global Masters in Robotics & AI Tracker
## BLAST Prompt + Project Tracker

**Word limit:** 1500 | **Stack:** React + Flask + RAG | **CI/CD:** GitHub Actions

---

## ✅ DONE
- [x] Project concept defined
- [x] Tech stack decided (React, Flask, RAG, GitHub Actions)
- [x] Features scoped (search, filter, favorites, comparison table)
- [x] Deployment target confirmed (GitHub Actions)
- [x] Auth strategy decided (none — fully public)
- [x] BLAST prompt written
- [x] Tracking file created

---

## 🔲 TO DO

### Phase 1 — Repo & Scaffolding
- [x] Create GitHub monorepo: masters-tracker/
- [x] Add /frontend (React + Vite)
- [x] Add /backend (Flask app)
- [x] Add /rag (scraper + vector store pipeline)
- [x] Add README.md, .gitignore, requirements.txt, package.json

### Phase 2 — Backend (Flask) ✅
- [x] Set up Flask app with CORS
- [x] Create /api/programs GET endpoint
- [x] Create /api/search POST endpoint (RAG-powered)
- [x] Create /api/compare POST endpoint
- [x] Set up SQLite as local DB
- [x] Add /api/refresh endpoint

### Phase 3 — RAG Pipeline ✅
- [x] Build university URL seed list
- [x] Write BeautifulSoup scraper
- [x] Chunk and embed text using sentence-transformers
- [x] Store vectors in ChromaDB
- [x] Wire RAG retriever to Flask /api/search
- [x] Schedule nightly re-scrape via GitHub Actions

### Phase 4 — Frontend (React) ✅
- [x] Bootstrap with Vite + Tailwind
- [x] Build ProgramCard component
- [x] Build SearchBar + FilterPanel
- [x] Build FavoritesDrawer
- [x] Build CompareTable component
- [x] Build LiveFeedTicker
- [x] Connect frontend to Flask API

### Phase 5 — GitHub Actions CI/CD ✅
- [x] Write deploy.yml
- [x] Add lint + test step
- [x] Add build step
- [x] Add RAG_REFRESH scheduled cron workflow
- [x] Store secrets in GitHub Secrets (template provided)

### Phase 6 — Polish & Launch ✅
- [x] Add SEO meta tags + Open Graph
- [x] Mobile responsive pass
- [x] Write full README.md with setup guide
- [ ] Tag v1.0.0 release on GitHub (manual step)

---

## 🚀 BLAST PROMPT

Copy the full section below and paste it into your AI coding assistant:

### PROJECT: Global Masters in Robotics & AI Program Tracker

**Overview:** Build a full-stack web application that tracks Masters-level programs in Robotics and Artificial Intelligence from universities worldwide. The system uses a Python RAG pipeline to scrape and index live data from university websites.

**Tech Stack:**
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Python 3.11 + Flask
- RAG: LangChain + ChromaDB + sentence-transformers
- Scraping: BeautifulSoup4 + httpx
- CI/CD: GitHub Actions

**Design Direction:**
- Aesthetic: Editorial / Data-forward
- Dark navy base (#0B1120), electric cyan accents (#00E5FF)
- Monospace font for data fields (JetBrains Mono)
- Clean sans-serif for UI (DM Sans)
- Feels like a Bloomberg terminal crossed with a research directory

**Constraints:**
- No user authentication
- Favorites persist in localStorage only
- Backend must return data within 1500ms for filter queries
- All scraping must respect robots.txt
