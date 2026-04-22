from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password

db = SessionLocal()
email = "contact@universitedeparis.com"
user = db.query(User).filter(User.email == email).first()
if user:
    print(f"User found: {user.email}")
    is_correct = verify_password("password123", user.password_hash)
    print(f"Password 'password123' correct? {is_correct}")
else:
    print(f"User {email} not found")
db.close()
