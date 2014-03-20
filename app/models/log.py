#! encoding=utf-8
from app.foundation import db, redis
from app.models.lock import _lock_, _unlock_
from app.models.config import get as conf
import simplejson as json

token_format = "tokenmap:%s"
class Log(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    game_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True)
    round_id = db.Column(db.Integer, db.ForeignKey('rounds.id'), index=True)
    submit_count = db.Column(db.Integer)
    data = db.Column(db.Text)

    createtime = db.Column(db.DateTime, index=True)

    @classmethod
    def create(cls, game_id, round_id, submit_count, status, score, actions):
        data = {
            "status": status,
            "score": score,
            "actions": actions,
        }
        Log(game_id=game_id,\
            round_id=round_id,\
            submit_count=submit_count,\
            data=json.dumps(data))
        pass

    @staticmethod
    def create_action(user_id, user_select, timeuse):
        return {
            "user_id": user_id,
            "unselect": user_select,
            "timeuse": timeuse,
        }
