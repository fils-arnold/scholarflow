# ScholarFlow 🎓
> La plateforme de gestion de projets académiques moderne, fluide et sécurisée.

**Dépôt GitHub :** [https://github.com/fils-arnold/scholarflow](https://github.com/fils-arnold/scholarflow)

ScholarFlow est une application web conçue pour faciliter la collaboration entre étudiants, enseignants et administrations universitaires. Elle permet de gérer tout le cycle de vie d'un projet, de la candidature à la certification finale.

## ✨ Fonctionnalités Clés

### 👩‍🎓 Pour les Étudiants
- **Catalogue de Projets** : Recherche filtrable par domaine et mots-clés.
- **Tableau de Bord Personnel** : Statistiques en temps réel sur les candidatures.
- **Suivi Agile** : Tableau de bord des tâches pour les projets acceptés.
- **Certification** : Téléchargement de certificats de réussite après clôture du projet.

### 👨‍🏫 Pour les Enseignants
- **Gestion de Projets** : Création et édition de projets avec gestion des places.
- **Recrutement** : Revue des candidatures avec notifications (simulées).
- **Pilotage** : Assignation de tâches et suivi de l'avancement.
- **Clôture** : Validation finale et émission de certificats.

### 🏛️ Pour les Administrations
- **Super Admin** : Gestion unifiée des utilisateurs et des établissements.
- **Établissements** : Supervision des statistiques et des membres de leur institution.

---

## 🛠️ Architecture Technique

- **Frontend** : React 18, Tailwind CSS, Lucide Icons, Glassmorphism UI.
- **Backend** : FastAPI (Python), SQLAlchemy (ORM), JWT Auth.
- **Base de données** : SQLite (par défaut pour le développement).

---

## 🚀 Installation Locale

### 1. Prérequis
- Python 3.9+
- Node.js 16+
- npm ou yarn

### 2. Configuration du Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Sur Windows
pip install -r requirements.txt
python run.py
```
Le serveur sera accessible sur `http://localhost:8000`.

### 3. Configuration du Frontend
```bash
cd frontend
npm install
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.

---

## 👥 Comptes de Test

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Super Admin** | `admin@scholarflow.com` | `admin123` |
| **Établissement** | `univ@univ.fr` | `password123` |
| **Enseignant** | `teacher@univ.fr` | `password123` |
| **Étudiant** | `student@univ.fr` | `password123` |

---

## 🔒 Sécurité & Permissions
ScholarFlow implémente un système de **Contrôle d'Accès Basé sur les Rôles (RBAC)** :
- **Utilisateur (Enseignant/Étudiant)** : Accès pédagogique.
- **Établissement** : Accès administratif local.
- **Créateur (Super Admin)** : Accès administratif global.

---

## 🧪 Tests
Les tests unitaires peuvent être lancés via :
```bash
cd backend
pytest
```

---

## 📄 Licence
Projet développé dans le cadre de ScholarFlow v1.0.
