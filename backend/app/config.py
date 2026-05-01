import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    SECRET_KEY = os.getenv("SECRET_KEY", "qhere_secret_2024")
    JWT_SECRET_KEY = os.getenv("SECRET_KEY", "qhere_secret_2024")
    DEBUG = os.getenv("FLASK_DEBUG", "False") == "True"
    SUPER_ADMIN_EMAIL = os.getenv("SUPER_ADMIN_EMAIL", "duspolsyttt@gmail.com").strip().lower()
    DIRECTOR_APPROVAL_EMAIL = os.getenv("DIRECTOR_APPROVAL_EMAIL", SUPER_ADMIN_EMAIL).strip().lower()
