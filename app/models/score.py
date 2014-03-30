#encoding = utf-8
from app.foundation import db, redis
from app.models.User import User
from sqlalchemy import func

class Score(db.Model):
    id = db.Column(db.Integer,primary_key = True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), index = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index = True)
    score = db.Column(db.Integer)
    state = db.Column(db.String(8), index=True)

    def __repr__(self):
        return "%s_%s:%s %s" % (self.game_id,self.user_id,self.score,self.state)

    @staticmethod
    def log_score(game_id,user_id,score,state):
        log = Score(game_id = game_id,user_id = user_id,score = score,state = state)
        db.session.add(log)
        db.session.commit()

    @staticmethod
    def average(userid):
        average = db.session.query(func.avg(Score.score).label('average'))\
                .filter(Score.user_id==userid)\
                .filter(Score.state == 'done')\
                .first()
        if not average[0]:
            return 0
        return average[0]

    # this is so dangerous... Run this carefully
    @staticmethod
    def ranking():
        scores = []
        for q in User.query:
            scores.append([q.username,Score.average(q.id)])
        return sorted(scores,key = lambda x:x[1],reverse = True)

