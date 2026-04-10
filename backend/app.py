import os
from datetime import timedelta
from flask import Flask
from extensions import db, jwt, migrate
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()


def create_app():
    app = Flask(__name__)
    # Configuration
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        basedir = os.path.abspath(os.path.dirname(__file__))
        db_path = os.path.join(basedir, 'instance', 'dev.db')
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path.replace(chr(92), "/")}'

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    # Allow Authorization header for JWT in cross-origin requests
    CORS(app, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"]) 

    with app.app_context():
        import models
        db.create_all()
        _ensure_sqlite_song_metrics_columns()

    import routes
    app.register_blueprint(routes.api_bp)

    from mail import settings as mail_settings

    if mail_settings.MAIL_ENABLED and not mail_settings.mail_is_configured():
        app.logger.warning(
            "Gmail: MAIL_ENABLED está activo pero faltan credenciales (client id/secret, "
            "refresh token o remitente). Los correos no se enviarán hasta completar .env y "
            "ejecutar: python -m mail.oauth_setup"
        )

    return app


def _ensure_sqlite_song_metrics_columns():
    if not str(db.engine.url).startswith('sqlite'):
        return

    columns = db.session.execute(text("PRAGMA table_info(songs)")).fetchall()
    existing = {col[1] for col in columns}
    alter_statements = []

    if 'category' not in existing:
        alter_statements.append("ALTER TABLE songs ADD COLUMN category VARCHAR(80)")
    if 'likes' not in existing:
        alter_statements.append("ALTER TABLE songs ADD COLUMN likes INTEGER NOT NULL DEFAULT 0")
    if 'plays' not in existing:
        alter_statements.append("ALTER TABLE songs ADD COLUMN plays INTEGER NOT NULL DEFAULT 0")
    if 'total_listen_seconds' not in existing:
        alter_statements.append("ALTER TABLE songs ADD COLUMN total_listen_seconds FLOAT NOT NULL DEFAULT 0")
    if 'listen_events' not in existing:
        alter_statements.append("ALTER TABLE songs ADD COLUMN listen_events INTEGER NOT NULL DEFAULT 0")

    for stmt in alter_statements:
        db.session.execute(text(stmt))
    if alter_statements:
        db.session.commit()

    # Ensure listen events table exists (SQLite + existing db)
    db.create_all()

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)), debug=True)
