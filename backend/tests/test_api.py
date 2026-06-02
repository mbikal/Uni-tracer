import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app

@pytest.fixture(scope='session', autouse=True)
def cleanup_test_db():
    """Cleanup test database after all tests."""
    yield
    # Cleanup after all tests
    test_db = '/tmp/masters_tracker_test.db'
    if os.path.exists(test_db):
        os.remove(test_db)

@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app('testing')
    return app

@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()

def test_health_check(client):
    """Test health endpoint."""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'

def test_index(client):
    """Test index endpoint."""
    response = client.get('/')
    assert response.status_code == 200
    data = response.get_json()
    assert 'Global Masters' in data['name']
    assert 'endpoints' in data

def test_get_programs(client):
    """Test programs endpoint."""
    response = client.get('/api/programs')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'programs' in data
    assert 'count' in data

def test_get_programs_with_filters(client):
    """Test programs endpoint with filters."""
    response = client.get('/api/programs?field=robotics&country=USA')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True

def test_get_countries(client):
    """Test countries endpoint."""
    response = client.get('/api/countries')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'countries' in data
    assert isinstance(data['countries'], list)

def test_get_stats(client):
    """Test stats endpoint."""
    response = client.get('/api/stats')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'stats' in data

def test_search_missing_query(client):
    """Test search endpoint with missing query."""
    response = client.post('/api/search', json={})
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False

def test_search_with_query(client):
    """Test search endpoint with valid query."""
    response = client.post('/api/search', json={'query': 'robotics'})
    # Should return 200 with keyword fallback even if ChromaDB unavailable
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'results' in data
    # Search type can be 'semantic' or 'keyword' depending on ChromaDB availability
    assert 'search_type' in data

def test_compare_missing_ids(client):
    """Test compare endpoint with missing IDs."""
    response = client.post('/api/compare', json={})
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False

def test_compare_insufficient_ids(client):
    """Test compare endpoint with only 1 ID."""
    response = client.post('/api/compare', json={'ids': ['prog_001']})
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False

def test_compare_invalid_ids(client):
    """Test compare endpoint with non-existent IDs."""
    response = client.post('/api/compare', json={'ids': ['nonexistent1', 'nonexistent2']})
    # Should return 404 because programs not found
    assert response.status_code == 404

def test_get_single_program(client):
    """Test getting a single program."""
    response = client.get('/api/programs/prog_001')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'program' in data

def test_get_nonexistent_program(client):
    """Test getting a non-existent program."""
    response = client.get('/api/programs/nonexistent')
    assert response.status_code == 404
    data = response.get_json()
    assert data['success'] is False

def test_refresh_without_secret(client):
    """Test refresh endpoint without secret."""
    response = client.post('/api/refresh')
    assert response.status_code == 401

def test_refresh_with_wrong_secret(client):
    """Test refresh endpoint with wrong secret."""
    response = client.post('/api/refresh', headers={'X-Refresh-Secret': 'wrong-secret'})
    assert response.status_code == 401

def test_cors_headers(client):
    """Test CORS headers are present."""
    response = client.get('/health')
    # CORS headers should be present
    assert 'Access-Control-Allow-Origin' in response.headers
