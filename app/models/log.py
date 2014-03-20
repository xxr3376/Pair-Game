#! encoding=utf-8
from app.foundation import db, redis
from app.models.lock import _lock_, _unlock_
from app.models.config import get as conf
from datetime import datetime
import simplejson as json

token_format = "tokenmap:%s"
class Log(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    game_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True)
    round_id = db.Column(db.Integer, db.ForeignKey('rounds.id'), index=True)
    submit_count = db.Column(db.Integer)
    data = db.Column(db.Text)

    createtime = db.Column(db.DateTime, index=True)
    
    def __repr__(self):
        return "game:%d round:%d count:%d data:%s" % (
                self.game_id, 
                self.round_id,
                self.submit_count,
                self.data)

    @classmethod
    def create(cls, game_id, round_id, submit_count, score, actions):
        data = {
            "score": score,
            "actions": actions,
        }
        item = Log(game_id=game_id,\
            round_id=round_id,\
            submit_count=submit_count,\
            data=json.dumps(data),\
            createtime = datetime.utcnow())
        db.session.add(item)
        db.session.commit()
        return item

    @staticmethod
    def create_action(user_id, user_status, user_select=-1, timeuse=-1):
        result = {"user_id": user_id, "status": user_status}
        if user_status == 'NORMAL':
            result['unselect'] = user_select
            result['timeuse'] = timeuse
        return result
