#! encoding=utf-8
from app.foundation import db
import random
import hashlib
import datetime

class Round(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    json = db.Column(db.Text)
    @staticmethod

