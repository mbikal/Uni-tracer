# Global Masters in Robotics & AI Tracker

A full-stack web application that tracks Masters-level programs in Robotics and Artificial Intelligence from universities worldwide. The system uses a Python RAG (Retrieval-Augmented Generation) pipeline to scrape and index live data from university websites.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python 3.11 + Flask |
| RAG / Search | LangChain + ChromaDB + sentence-transformers |
| Scraping | BeautifulSoup4 + httpx |
| CI/CD | GitHub Actions |
| Storage | ChromaDB (vectors) + SQLite (structured data) |

## Monorepo Structure

```
masters-tracker/
├── frontend/           # React + Vite application
├── backend/            # Flask API
├── .github/workflows/  # CI/CD pipelines
├── rag_data/           # Scraped data storage
├── chroma_data/        # Vector database storage
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- pip
- (Optional) Virtual environment for Python

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/masters-tracker.git
cd masters-tracker

# Copy environment file
cp .env.example .env
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database with seed data
python -c "from db.init_db import init_db; init_db('backend/db/programs.db')"

# Run Flask server
python app.py
```

Backend runs at `http://localhost:5000`

Available endpoints:
- `GET http://localhost:5000/health` - Health check
- `GET http://localhost:5000/api/programs` - List programs
- `GET http://localhost:5000/api/stats` - Get statistics

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs at `http://localhost:5173`

The dev server is configured with a proxy to forward API requests to the backend.

### 4. (Optional) Initialize RAG Pipeline

For semantic search functionality, you need to build the vector index:

```bash
cd backend

# Scrape and embed programs
python -m rag.scraper
python -m rag.embedder
```

This creates the ChromaDB vector store for semantic search.

## API Endpoints

- `GET /api/programs` - Filter programs by country, field, tuition, etc.
- `POST /api/search` - RAG-powered semantic search
- `POST /api/compare` - Side-by-side program comparison
- `POST /api/refresh` - Trigger data refresh (protected)

## Features

- 🔍 **Semantic search** using RAG (Retrieval-Augmented Generation)
- 🌍 **Filter by** country, language, tuition, duration, field
- ⭐ **Favorites** - save programs to localStorage (no login needed)
- 📊 **Compare** up to 4 programs side-by-side
- 🔔 **Live feed** ticker showing recently updated programs
- 📱 **Mobile responsive** design
- 🤖 **Automated data refresh** via GitHub Actions

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm run lint
npm test  # If tests are configured
```

## Deployment

### GitHub Actions (Recommended)

1. Push to the `main` branch
2. GitHub Actions will:
   - Run tests
   - Build the frontend
   - Deploy to GitHub Pages (frontend)
   - Trigger backend deployment (configure in workflow)

### Manual Deployment

**Frontend:**
```bash
cd frontend
npm run build
# Deploy the `dist/` folder to your hosting provider
```

**Backend:**
```bash
cd backend
# Option 1: Deploy to Render/Railway/Fly.io
# Option 2: Use gunicorn for production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | `dev-secret-key` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |
| `CHROMA_PERSIST_DIR` | ChromaDB storage path | `chroma_data` |
| `REFRESH_SECRET` | Secret for refresh endpoint | `refresh-secret` |
| `VITE_API_URL` | API URL for frontend | `http://localhost:5000` |

## RAG Pipeline

The RAG (Retrieval-Augmented Generation) pipeline consists of:

1. **Scraper** (`backend/rag/scraper.py`) - Fetches program data from university websites
2. **Embedder** (`backend/rag/embedder.py`) - Creates vector embeddings using sentence-transformers
3. **Retriever** (`backend/rag/retriever.py`) - Performs semantic search on the vector index

### Scheduled Refresh

The GitHub Actions workflow (`.github/workflows/rag_refresh.yml`) runs daily at 02:00 UTC to:
1. Scrape updated program data
2. Re-embed all programs
3. Commit changes to the repository

## Project Roadmap

- [x] Initial release with core features
- [x] RAG-powered semantic search
- [x] Program comparison tool
- [ ] User-contributed program data
- [ ] Application deadline notifications
- [ ] Scholarship database integration

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [React](https://react.dev/), [Flask](https://flask.palletsprojects.com/), and [ChromaDB](https://www.trychroma.com/)
- Design inspired by Bloomberg Terminal aesthetics
- Data sourced from university websites (respecting robots.txt)
