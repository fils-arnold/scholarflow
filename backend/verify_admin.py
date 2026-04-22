from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password

db = SessionLocal()
user = db.query(User).filter(User.email == "admin@scholarflow.com").first()
if user:
    print(f"User found: {user.email}")
    is_correct = verify_password("admin123", user.password_hash)
    print(f"Password 'admin123' correct? {is_correct}")
else:
    print("User not found")
db.close()
