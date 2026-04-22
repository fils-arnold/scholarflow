import os
import sys
import random
from datetime import datetime, timedelta
import unicodedata

def clean_domain(text):
    return unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode('utf-8').lower().replace(' ', '')

# Ajouter le répertoire courant au path pour importer app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, Base, engine
from app.models.user import User, RoleEnum
from app.models.etablissement import Etablissement
from app.models.project import Project, ProjectStatus
from app.models.task import Task, TaskStatus
from app.models.application import Application, ApplicationStatus
from app.models.activity import ActivityLog
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_db():
    print("Réinitialisation de la base de données...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Création du Super Admin
    print("Création du Super Admin...")
    admin = User(
        email="admin@scholarflow.com",
        password_hash=get_password_hash("admin123"),
        nom="Admin",
        prenom="Super",
        role=RoleEnum.creator
    )
    db.add(admin)
    db.commit()
    
    ecoles = [
        {
            "nom": "Université de Paris", 
            "adresse": "Paris, France", 
            "tou": "Règlement Intérieur de l'Université de Paris :\n1. ÉTHIQUE DE RECHERCHE : Tout projet doit respecter les normes bioéthiques et de propriété intellectuelle.\n2. ASSIDUITÉ : La présence aux Travaux Dirigés (TD) et en Laboratoire est obligatoire (seuil de tolérance : 10% d'absences injustifiées).\n3. SOUTENANCES : Chaque projet de fin de cycle doit faire l'objet d'une soutenance publique devant un jury de trois experts.\n4. RESSOURCES : L'accès aux bases de données universitaires est strictement réservé à un usage académique."
        },
        {
            "nom": "Polytechnique Montreal", 
            "adresse": "Montréal, Canada", 
            "tou": "Code de Déontologie de Polytechnique Montréal :\n1. GÉNIE ET SOCIÉTÉ : L'étudiant s'engage à concevoir des solutions respectueuses de l'environnement et de la sécurité publique.\n2. COLLABORATION : Les projets de groupe doivent refléter une contribution équitable de chaque membre.\n3. STAGES PROFESSIONNELS : La validation de l'année nécessite la réussite d'un stage technique de 3 mois minimum.\n4. INTÉGRITÉ : Toute forme de plagiat dans les calculs ou les rapports techniques entraîne une exclusion immédiate."
        },
        {
            "nom": "EPFL", 
            "adresse": "Lausanne, Suisse", 
            "tou": "Directives de l'EPFL :\n1. EXCELLENCE : Un standard de qualité rigoureux est exigé pour tous les rendus de projets.\n2. TRANSFERT DE TECHNOLOGIE : Les brevets issus des recherches étudiantes sont gérés par le TTO de l'EPFL.\n3. PARTENARIATS : Les étudiants en lien avec des partenaires industriels doivent signer un accord de confidentialité (NDA).\n4. INNOVATION : La participation aux pôles d'innovation de Lausanne est encouragée pour tous les étudiants de Master."
        },
        {
            "nom": "MIT", 
            "adresse": "Cambridge, USA", 
            "tou": "MIT Academic Policy :\n1. MENS ET MANUS : Priority is given to practical application and hands-on experimentation.\n2. OPEN SOURCE : Students are encouraged to publish their research code under MIT or GPL licenses.\n3. HACKING CULTURE : Ethical hacking and system exploration are tolerated only within the bounds of the 'MIT Hacks' code of conduct.\n4. GLOBAL IMPACT : Projects should aim to solve grand challenges in energy, health, or computing."
        }
    ]
    
    prenoms = ["Jean", "Marie", "Luc", "Sophie", "Pierre", "Julie", "Thomas", "Emma", "Nicolas", "Alice", "Paul", "Laura", "Antoine", "Sarah", "Maxime"]
    noms = ["Dupont", "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy"]
    domaines = ["Informatique", "Biologie", "Mathématiques", "Physique", "Chimie", "Ingénierie", "IA", "Robotique", "Gestion", "Économie"]
    
    print("Génération des établissements...")
    for ecole in ecoles:
        etab = Etablissement(
            nom=ecole["nom"],
            adresse=ecole["adresse"],
            num_arrete_creation=f"ARR-{random.randint(1000, 9999)}",
            type_etablissement="Université Publique",
            statut_juridique="Public",
            telephone=f"+331000{random.randint(10000, 99999)}",
            email_contact=f"contact@{clean_domain(ecole['nom'])}.com",
            terms_of_use=ecole["tou"]
        )
        db.add(etab)
        db.commit()
        db.refresh(etab)
        
        # User associé à l'établissement
        user_etab = User(
            email=f"contact@{clean_domain(ecole['nom'])}.com",
            password_hash=get_password_hash("password123"),
            nom=ecole["nom"],
            prenom="Admin",
            role=RoleEnum.etablissement,
            etablissement_id=etab.id
        )
        db.add(user_etab)
        db.commit()
        
        print(f"Génération de {ecole['nom']} terminée. Création des utilisateurs...")
        
        etudiants_obj = []
        
        # 15 Etudiants
        for i in range(15):
            if i == 0 and ecole["nom"] == "Université de Paris":
                prenom, nom = "Jean", "Dupont"
            else:
                prenom = random.choice(prenoms)
                nom = random.choice(noms)
                
            is_blocked = random.random() < 0.1 # 10% de chances d'être bloqué
            etu = User(
                email=f"etu{i}.{prenom.lower()}.{nom.lower()}@{clean_domain(ecole['nom'])}.com",
                password_hash=get_password_hash("password123"),
                nom=nom,
                prenom=prenom,
                role=RoleEnum.etudiant,
                etablissement_id=etab.id,
                matricule=f"ETU-{etab.id}-{i}",
                qualification="Licence/Master",
                is_blocked=is_blocked
            )
            db.add(etu)
            db.commit()
            db.refresh(etu)
            etudiants_obj.append(etu)

        # 10 Enseignants
        for i in range(10):
            if i == 0 and ecole["nom"] == "Université de Paris":
                prenom, nom = "Luc", "Martin"
            else:
                prenom = random.choice(prenoms)
                nom = random.choice(noms)
                
            ens = User(
                email=f"ens{i}.{prenom.lower()}.{nom.lower()}@{clean_domain(ecole['nom'])}.com",
                password_hash=get_password_hash("password123"),
                nom=nom,
                prenom=prenom,
                role=RoleEnum.enseignant,
                etablissement_id=etab.id,
                matricule=f"ENS-{etab.id}-{i}",
                qualification="Doctorat",
                grade="Professeur"
            )
            db.add(ens)
            db.commit()
            db.refresh(ens)
            
            # 3 Projets par enseignant
            for j in range(3):
                domaine = random.choice(domaines)
                total_spots = random.randint(3, 6)
                proj = Project(
                    title=f"Projet de recherche en {domaine} ({prenom} {nom} - {j+1})",
                    description=f"Ce projet vise à explorer les avancées récentes dans le domaine de {domaine}. Les étudiants seront amenés à faire de la recherche, de la modélisation et du développement.",
                    domain=domaine,
                    spots=total_spots,
                    spots_remaining=total_spots,
                    deadline=datetime.now() + timedelta(days=random.randint(30, 180)),
                    status=ProjectStatus.open,
                    creator_id=ens.id,
                    etablissement_id=etab.id,
                    is_student_project=False,
                    is_special=False
                )
                db.add(proj)
                db.commit()
                db.refresh(proj)

                # Assigner des étudiants (Candidatures)
                applicants = random.sample(etudiants_obj, k=random.randint(2, total_spots + 2))
                accepted_students = []
                for applicant in applicants:
                    # Random status
                    status = random.choice([ApplicationStatus.pending, ApplicationStatus.accepted, ApplicationStatus.rejected])
                    
                    app = Application(
                        student_id=applicant.id,
                        project_id=proj.id,
                        motivation_letter=f"Je suis très intéressé par le projet en {domaine}.",
                        status=status
                    )
                    if status == ApplicationStatus.accepted:
                        app.reviewed_at = datetime.now()
                        proj.spots_remaining -= 1
                        accepted_students.append(applicant)

                    db.add(app)
                
                db.commit()

                # Si on a des étudiants acceptés, désigner un chef de projet
                if accepted_students:
                    leader = random.choice(accepted_students)
                    proj.leader_id = leader.id
                    db.commit()

                # Tâches par projet
                taches = ["Revue de littérature", "Mise en place de l'environnement", "Collecte de données", "Analyse des résultats", "Rédaction du rapport"]
                selected_taches = random.sample(taches, k=random.randint(2, 4))
                for t in selected_taches:
                    assignee_id = None
                    # Assigner à un étudiant accepté s'il y en a (70% de chance d'assignation)
                    if accepted_students and random.random() < 0.7:
                        assignee_id = random.choice(accepted_students).id

                    task = Task(
                        project_id=proj.id,
                        titre=t,
                        description=f"Tâche : {t} pour le projet {proj.title}",
                        statut=random.choice([TaskStatus.todo, TaskStatus.in_progress, TaskStatus.done]),
                        echeance=datetime.now() + timedelta(days=random.randint(5, 45)),
                        assigne_a=assignee_id
                    )
                    db.add(task)
                db.commit()

            
    # Création de cas spécifiques pour la modération
    print("Génération des cas de modération...")
    # 1. Un utilisateur avec une violation signalée (Université de Paris ID 1)
    v_user = User(
        email="fraud.student@universite-paris.com",
        password_hash=get_password_hash("password123"),
        nom="Fraudeur",
        prenom="Marc",
        role=RoleEnum.etudiant,
        etablissement_id=1,
        violation_reason="Plagiat avéré sur le projet de recherche IA.",
        notified_etablissement=True
    )
    db.add(v_user)

    # 2. Un utilisateur avec accord de l'établissement pour suppression (EPFL ID 3)
    c_user = User(
        email="inactive.teacher@epfl.com",
        password_hash=get_password_hash("password123"),
        nom="Inactif",
        prenom="Paul",
        role=RoleEnum.enseignant,
        etablissement_id=3,
        establishment_consent=True
    )
    db.add(c_user)

    # 3. Un utilisateur déjà bloqué (Archive - MIT ID 4)
    b_user = User(
        email="blocked.user@mit.com",
        password_hash=get_password_hash("password123"),
        nom="Bloqué",
        prenom="Jean",
        role=RoleEnum.etudiant,
        etablissement_id=4,
        is_blocked=True,
        violation_reason="Comportement inapproprié sur le forum."
    )
    db.add(b_user)
    db.commit()

    # 4. Un utilisateur avec une fraude GLOBALE en attente (non bloqué)
    p_user = User(
        email="pending.fraud@scholarflow.com",
        password_hash=get_password_hash("password123"),
        nom="Suspect",
        prenom="Global",
        role=RoleEnum.etudiant,
        etablissement_id=2, # Polytechnique Montreal
        violation_reason="Tentative d'accès non autorisé aux serveurs centraux.",
        violation_type="global"
    )
    db.add(p_user)

    db.commit()

    # 5. Génération massive de logs d'activité (30 derniers jours)
    print("Génération des logs d'activité (Tendances)...")
    all_users = db.query(User).all()
    for _ in range(500):
        target_u = random.choice(all_users)
        days_ago = random.randint(0, 30)
        log_date = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
        
        log = ActivityLog(
            user_id=target_u.id,
            etablissement_id=target_u.etablissement_id,
            action="login",
            created_at=log_date
        )
        db.add(log)
    
    db.commit()

    print("Remplissage de la base de données terminé avec succès !")
    db.close()

if __name__ == "__main__":
    seed_db()
