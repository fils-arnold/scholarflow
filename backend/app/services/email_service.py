import logging

# Simulation of an email service for ScholarFlow
logger = logging.getLogger("scholarflow_email")

def send_application_notification(teacher_email: str, student_name: str, project_title: str):
    """Simulates sending an email to a teacher when a student applies."""
    subject = f"ScholarFlow - Nouvelle candidature : {project_title}"
    body = f"Bonjour,\n\n{student_name} a postulé à votre projet '{project_title}'.\nConnectez-vous à votre tableau de bord pour examiner sa demande."
    
    print("\n" + "="*50)
    print(f"📧 EMAIL SIMULÉ ENVOYÉ À : {teacher_email}")
    print(f"Objet : {subject}")
    print(f"Message : \n{body}")
    print("="*50 + "\n")

def send_status_update_notification(student_email: str, project_title: str, status: str):
    """Simulates sending an email to a student when their application status changes."""
    status_fr = "acceptée" if status == "accepted" else "refusée"
    subject = f"ScholarFlow - Mise à jour de votre candidature : {project_title}"
    body = f"Bonjour,\n\nVotre candidature pour le projet '{project_title}' a été {status_fr}.\nConsultez votre tableau de bord pour plus de détails."
    
    print("\n" + "="*50)
    print(f"📧 EMAIL SIMULÉ ENVOYÉ À : {student_email}")
    print(f"Objet : {subject}")
    print(f"Message : \n{body}")
    print("="*50 + "\n")
