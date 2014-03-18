#! encoding=utf-8
from app.foundation import db, redis
from app.models.lock import _lock_, _unlock_
from app.models.config import get as conf
import simplejson as json

class TimeoutError(Exception):
    pass

token_format = "tokenmap:%s"
class Game(db.Model):
    NEW, PLAYING, FINISH, FAIL = range(1, 5)
    #TODO need a after clean state
    id = db.Column(db.Integer, primary_key = True)
    p1 = db.Column(db.Integer, db.ForeignKey('user.id'))
    p2 = db.Column(db.Integer, db.ForeignKey('user.id'))
    state = db.Column(db.Integer, index=True)
    score = db.Column(db.Integer)
    createtime = db.Column(db.DateTime, index=True)

    def save_map(self, token):
        key = token_format % token
        # let map expire in 480 second
        redis.db.setex(key, self.id, 480)
    def participate(self, user):
        if user.id == self.p1 or user.id == self.p2:
            return True
        return False

    def init(self, score, rounds):
        self.set_attr("score", score)
        self.set_attr("submit_count", 0)
        self.create_round_queue(rounds)
        pass

    @classmethod
    def get_by_token(cls, token):
        key = token_format % token
        id_ = redis.db.get(key)
        if id_:
            return Game.query.get(id_)
        return None

    @property
    def round_queue_key(self):
        return 'round_queue:%s' % self.id
    # push rounds to queue
    def create_round_queue(self, rounds):
        key = self.round_queue_key
        redis.db.delete(key)
        redis.db.lpush(key, *rounds)

    # get a new round from queue
    def new_round(self):
        self.set_attr("submit_count", 0)
        key = self.round_queue_key
        result = redis.db.lpop(key)
        if result:
            return int(result)
        else:
            return None

    def round_queue_length(self):
        return redis.db.llen(self.round_queue_key)

    # lock this game
    def lock(self):
        _lock_(self.status_key, 'gamelock')
    # unlock this game
    def unlock(self):
        _unlock_(self.status_key, 'gamelock')

    @property
    def status_key(self):
        return 'game_status:%s' % self.id

    def set_attr(self, prop, value):
        key = self.status_key
        redis.db.hset(key, prop, json.dumps(value))

    def get_attr(self, prop):
        key = self.status_key
        return json.loads(redis.db.hget(key, prop))

    @property
    def wait_key(self):
        return 'waiting:%s' % self.id
    @property
    def ack_key(self):
        return 'ack:%s' % self.id

    def pop_waiting(self):
        data = redis.db.lpop(self.wait_key)
        if data:
            return json.loads(data)
        else:
            return None
    def declare_and_wait(self, message, timeout):
        data = json.dumps(message)
        redis.db.rpush(self.wait_key, data)
        self.unlock()
        recv = redis.db.blpop(self.ack_key, timeout)
        if recv:
            return json.loads(recv[1])
        else:
            self.pop_waiting()
            raise TimeoutError()
    def notice(self, message):
        data = json.dumps(message)
        redis.db.rpush(self.ack_key, data)

    # state = 'unmatch', 'match', 'timeout'
    def update_score(self, state, time=-1):
        current = self.get_attr('score')
        if state != 'match':
            return current
        submit_count = self.get_attr('submit_count')
        delta = conf('score_per_round')
        for i in range(submit_count):
            delta = delta * (1 - conf('diff_penalty'))
        if time > conf('killing_time'):
            delta += (conf('killing_time') - time) * conf('timeout_penalty')
        current += delta
        self.set_attr('score', current)
        return current
