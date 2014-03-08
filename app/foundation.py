#coding=utf-8
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
import redis as redis_connection

class Redis(object):
    def __init__(self):
        self._db = None
    def init_app(self, app):
        self._db = redis_connection.Redis(host=app.config['REDIS_HOST'], port=app.config['REDIS_PORT'], db=app.config['REDIS_DB'])
    @property
    def db(self):
        return self._db

db = SQLAlchemy()
login_manager = LoginManager()
redis = Redis()
