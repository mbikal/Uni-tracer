import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
    
    # Database
    DB_PATH = os.environ.get('DB_PATH', os.path.join(os.path.dirname(__file__), 'db', 'programs.db'))
    
    # ChromaDB
    CHROMA_PERSIST_DIR = os.environ.get('CHROMA_PERSIST_DIR', os.path.join(os.path.dirname(__file__), '..', 'chroma_data'))
    COLLECTION_NAME = os.environ.get('COLLECTION_NAME', 'programs_v1')
    
    # Embedding Model
    EMBEDDING_MODEL = os.environ.get('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
    
    # Refresh endpoint secret
    REFRESH_SECRET = os.environ.get('REFRESH_SECRET', 'refresh-secret-change-in-production')
    
    # API Keys (if needed for external services)
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    
    # Scraping
    REQUEST_TIMEOUT = int(os.environ.get('REQUEST_TIMEOUT', '30'))
    USER_AGENT = os.environ.get('USER_AGENT', 'MastersTrackerBot/1.0 (Academic Research Project)')
    
    # Rate limiting
    MAX_PROGRAMS_PER_PAGE = int(os.environ.get('MAX_PROGRAMS_PER_PAGE', '50'))
    
    @staticmethod
    def init_app(app):
        pass

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    DEBUG = True
    TESTING = True
    # Use temp file instead of :memory: so connections persist across requests
    DB_PATH = '/tmp/masters_tracker_test.db'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
