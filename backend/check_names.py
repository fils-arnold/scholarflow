from app.db.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()
for u in users:
    if not u.prenom or not u.nom:
        print(f"User ID {u.id} has missing name: prenom='{u.prenom}', nom='{u.nom}'")
db.close()
