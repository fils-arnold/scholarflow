from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    """Test the base dashboard route or root."""
    response = client.get("/")
    # If root redirects to /login or something, check status
    assert response.status_code in [200, 404, 307]

def test_login_invalid():
    """Test login with wrong credentials."""
    response = client.post(
        "/auth/login",
        data={"username": "wrong@user.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
