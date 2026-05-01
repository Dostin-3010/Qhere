from flask import Flask
from app.config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── Blueprints ──
    from app.routes.auth_routes import auth_bp
    from app.routes.student_routes import student_bp
    from app.routes.excuse_routes import excuse_bp
    from app.routes.teacher_routes import teacher_bp
    from app.routes.attendance_routes import attendance_bp

    app.register_blueprint(auth_bp,        url_prefix='/api/auth')
    app.register_blueprint(student_bp,     url_prefix='/api/students')
    app.register_blueprint(excuse_bp,      url_prefix='/api/excuses')
    app.register_blueprint(teacher_bp,     url_prefix='/api/teachers')
    app.register_blueprint(attendance_bp,  url_prefix='/api/attendance')

    return app