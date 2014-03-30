#! encoding=utf-8
from app.foundation import db, redis
from app.models.lock import _lock_, _unlock_
from app.models.game import Game
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

    def to_dict(self):
        return {
                "game":self.game_id,
                "round":self.round_id,
                "submits":self.submit_count,
                "data":json.loads(self.data)
                }

    def __repr__(self):
        return str(self.to_dict())

    @staticmethod
    def user_log(id):
        gameids = []
        for game in Game.query.filter(Game.p1 == id):
            gameids.append(game.id)
        for game in Game.query.filter(Game.p2 == id):
            gameids.append(game.id)
        print gameids
        logs = []
        for game in sorted(gameids):
            commits = []
            for log in Log.query.filter(Log.game_id.in_([game])):
                commits.append(log.to_dict())
            logs.append(commits)
        return logs

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
