#encoding = utf-8
from app.foundation import db, redis
from app.models.User import User

class Score(db.Model):
    id = db.Column(db.Integer,primary_key = True)
    game_id = db.Column(db.Integer,index = True)
    user_id = db.Column(db.Integer,index = True)
    score = db.Column(db.Integer)
    state = db.Column(db.String(16))
    
    def __repr__(self):
        return "%s_%s:%s %s" % (self.game_id,self.user_id,self.score,self.state)

    @staticmethod
    def log_score(game_id,user_id,score,state):
        log = Score(game_id = game_id,user_id = user_id,score = score,state = state)
        db.session.add(log)
        db.session.commit()

    @staticmethod
    def average(userid):
        query = Score.query.filter(Score.user_id == userid)
        query = query.filter(Score.state == 'done')
        count = query.count()
        total = 0
        for q in query:
            total += q.score
        return float(total)/count if count>0 else 0

    @staticmethod
    def ranking():
        scores = []
        for q in User.query:
            scores.append([q.username,Score.average(q.id)])
        return sorted(scores,key = lambda x:x[1],reverse = True)

