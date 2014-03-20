#! encoding=utf-8
from app.foundation import db
import random

class Rounds(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    data = db.Column(db.Text)
    @staticmethod
    def get_rounds(size):
        count = Rounds.query.count()
        if count<size:
            size = count
        return random.sample(range(0,count),size)
