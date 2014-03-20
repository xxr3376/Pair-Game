#! encoding=utf-8
from app.foundation import db
import random
import hashlib
import datetime

ROLE = {
    "ADMIN" : 0,
    "NORMAL" : 1,
}

class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(64), index = True, unique = True)
    password = db.Column(db.String(64))
    email = db.Column(db.String(128))
    role = db.Column(db.Integer)
    last_seen = db.Column(db.DateTime)

    def __init__(self, **kwargs):
        self.accept_num = 0
        self.reject_num = 0
        self.token = self.create_token(16)
        if 'password' in kwargs:
            raw = kwargs.pop('password')
            self.password = self.create_password(raw)
        if 'username' in kwargs:
            username = kwargs.pop('username')
            self.username = username.lower()
        for k, v in kwargs.items():
            setattr(self, k, v)
    def __repr__(self):
        return '<User %r>' % (self.username)
    def is_authenticated(self):
        return True
    def is_active(self):
        return True
    def is_anonymous(self):
        return False
    def get_id(self):
        return unicode(self.id)
    def permission(self, role):
        return self.role == ROLE[role]
    def check_password(self, raw):
        if not self.password:
            return False
        if '$' not in self.password:
            return False
        salt, hsh = self.password.split('$')
        passwd = '%s%s%s' % (salt, raw, db.app.config['PASSWORD_SECRET'])
        verify = hashlib.sha1(passwd).hexdigest()
        return verify == hsh
    @staticmethod
    def online_users():
        min_ago = datetime.datetime.utcnow()-datetime.timedelta(minutes=1)
        query = User.query\
                .filter_by(role=ROLE['NORMAL'])\
                .filter(User.last_seen>min_ago)
        return query.count()
    @staticmethod
    def create_password(raw):
        salt = User.create_token(8)
        passwd = '%s%s%s' % (salt, raw,
                db.app.config['PASSWORD_SECRET'])
        hsh = hashlib.sha1(passwd).hexdigest()
        return "%s$%s" % (salt, hsh)
    @staticmethod
    def create_token(length=16):
        chars = ('0123456789'
                    'abcdefghijklmnopqrstuvwxyz'
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        salt = ''.join([random.choice(chars) for i in range(length)])
        return salt
    @staticmethod
    def roleMember(roleName):
        return User.query.filter_by(role=ROLE[roleName]).all()
