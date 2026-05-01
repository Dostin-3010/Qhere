from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={r"/*": {"origins": [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5177",
            "http://127.0.0.1:5177",
        ]}},
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )
    JWTManager(app)

    from .routes.auth_routes import auth_bp
    from .routes.management_routes import management_bp
    from .routes.excuse_routes import excuse_bp
    from .routes.student_routes import student_bp
    from .routes.teacher_routes import teacher_bp
    from .routes.attendance_routes import attendance_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(management_bp, url_prefix="/api/management")
    app.register_blueprint(excuse_bp, url_prefix="/api/excuses")
    app.register_blueprint(student_bp, url_prefix="/api/students")
    app.register_blueprint(teacher_bp, url_prefix="/api/teachers")
    app.register_blueprint(attendance_bp, url_prefix="/api/attendance")

    return app
