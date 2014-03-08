#! encoding=utf-8
from flask import Flask, g, render_template
from app.foundation import db, login_manager, redis
from app.models.User import User
from flask.ext.login import current_user
from datetime import datetime

from app import views
import math

DEFAULT_APP_NAME = __name__

def create_app():
    app = Flask(DEFAULT_APP_NAME)
    app.config.from_object('config')
    configure_foundations(app)
    configure_blueprint(app)
    configure_template_filter(app)
    configure_handlers(app)
    return app

def configure_foundations(app):
    redis.init_app(app)
    db.app = app
    db.init_app(app)
    @app.after_request
    def releaseDB(response):
        db.session.close()
        return response
    login_manager.init_app(app)
    login_manager.login_view = 'frontend.login'
    login_manager.login_message = u'Please Login First'
    @login_manager.user_loader
    def load_user(id):
        try:
            return User.query.get(int(id))
        except Exception:
            return None
    @app.before_request
    def before_request():
        g.user = current_user
        if g.user.is_authenticated():
            g.user.last_seen = datetime.utcnow()
            db.session.add(g.user)
            db.session.commit()

def configure_handlers(app):
    @app.errorhandler(403)
    def abandom(e):
        return render_template('403.html'), 403
def configure_blueprint(app):
    app.register_blueprint(views.frontend)
def configure_template_filter(app):
    from datetime import date
    @app.template_filter('dateint')
    def _jinja2_filter_dateint(dateint):
        return date.fromordinal(dateint).strftime('%Y-%m-%d')
    @app.template_filter('percent')
    def _jinja2_filter_percent(f, digits=0):
        tmp = f * (10 ** (2 + digits))
        tmp = math.floor(tmp)
        if digits > 0:
            return "%s%%" % (tmp / (10 ** digits))
        else:
            return "%d%%" % tmp
app = create_app()
