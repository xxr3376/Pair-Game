#! encoding=utf-8
from flask import Blueprint, render_template, redirect, url_for, flash, request, g, jsonify
from app.foundation import db
from .access import access_control
from flask.ext.login import login_required
import time
import uuid
import random
from app.foundation import redis

game = Blueprint('game', __name__)

@game.before_request
@login_required
@access_control(['NORMAL'])
def before_request():
    pass

@game.route('/')
def index():
    return render_template('game/index.html')

def game_lock():
    while True:
        lock = redis.db.hget('lock', 'game')
        if lock == None or int(lock) == 0:
            get_lock = redis.db.hincrby('lock', 'game', 1)
            if get_lock == 1:
                break
            else:
                redis.db.hincrby('lock', 'game', -1)
        time.sleep(random.random() / 100)
    return
def release_lock():
    redis.db.hset('lock', 'game', 0)
    return
NO_ACK = -1
TIMEOUT = -2
OK = 1
NO_MORE = -3
MATE_OFFLINE = {
     "status":"ERROR",
     "msg":"MATE_OFFLINE",
     }
results = {
        NO_ACK:MATE_OFFLINE,
        TIMEOUT:MATE_OFFLINE,
        OK:{"status":"OK",},
        NO_MORE:{"status":"ERROR","msg":"NO_MORE_ROUND"}
        }

def state_result(state):
    print state
    if state:
        result = results[state]
    else:
        result = {
            "status": "ERROR",
            "msg": "unknown error",
        }
    return result

def round_result(rid):
    result = {
            'status' : "ROUND",
            'rid': str(rid),
            }
    return result

def handin_result(msg):
    print 'MSG %s' % msg
    time,state = msg
    return {'status':state,'rest_time':str(time)}

def register_token(token, user_id):
    pass

token_s = 'game:%s'
waiting_s = 'waiting:%s'
ack_s = 'ack:%s'
prepare_timeout = 3
round_timeout = 10
tokent = 't_token'

def prepare_data(token):
    rounds = [1,2,3]
    token_key = token_s % token
    for round in rounds:
        redis.db.lpush(token_key,round)

@game.route('/prepare')
def prepare():
    game_lock()
    token = tokent
    waiting_key = waiting_s % token
    ack_key = ack_s % token
    ack = redis.db.lpop(waiting_key)
    if ack:
        redis.db.rpush(ack_key,token)
        release_lock()
        prepare_data(token)
        return jsonify(state_result(OK))
    else:
        redis.db.rpush(waiting_key,token)
        release_lock()
        ack = redis.db.blpop(ack_key,prepare_timeout)
        if ack:
            return jsonify(state_result(OK))
        else:
            redis.db.lpop(waiting_key)
            return jsonify(state_result(NO_ACK))

@game.route('/next_round')
def next_round():
    # id = next round play
    token = tokent
    token_key = token_s % token
    length = redis.db.llen(token_key)
    if 0 == length:
        return jsonify(state_result(NO_MORE))
    game_lock()
    ack_key = ack_s % token
    ack = redis.db.lpop(ack_key)
    if ack:
        rid = redis.db.lpop(token_key)
        release_lock()
        return jsonify(round_result(rid))
    else:
        rid = redis.db.lindex(token_key,0)
        redis.db.rpush(ack_key,token)
        release_lock()
        return jsonify(round_result(rid))

@game.route('/hand_in',methods = ['GET','POST'])
def hand_in():
    result = None
    token = tokent
    waiting_key = waiting_s % token
    ack_key = ack_s % token
    handin = [12,3]
    if request.method == 'GET':
        handin = [13,5]
    else:
        json = request.json
        handin = [json['time'],json['choice']]
    print request.method,handin
    game_lock()
    print redis.db.llen(waiting_key)
    mate_handin = redis.db.lpop(waiting_key)
    print mate_handin,redis.db.llen(waiting_key)
    if mate_handin:
        mate_handin = eval(mate_handin)
        time = handin[0]
        if time<mate_handin[0]:
            time = mate_handin[0]
        ack = [time]
        if handin[1] == mate_handin[1]:
            ack.append('OK')
        else:
            ack.append('DIFF')
        redis.db.rpush(ack_key,ack)
        release_lock()
        return jsonify(handin_result(ack))
    else:
        redis.db.rpush(waiting_key,handin)
        release_lock()
        msg = redis.db.blpop(ack_key,round_timeout)
        if msg:
            _,ack = msg
            return jsonify(handin_result(eval(ack)))
        else:
            redis.db.lpop(waiting_key)
            return jsonify(state_result(TIMEOUT))

def original():
    game_lock()
    mate = redis.db.spop(waiting_key)
    result = {}
    if mate:
        #has mate
        release_lock()
        mate_key = user_key % mate
        token = uuid.uuid1()
        redis.db.rpush(mate_key, token)
        result = generate_enqueue_result(token)
        register_token(token, g.user.id)
    else:
        # start waiting
        self_key = user_key % g.user.id
        redis.db.delete(self_key)
        redis.db.sadd(waiting_key, g.user.id)
        release_lock()
        message = redis.db.blpop(self_key, timeout=20)
        if message:
            _, token = message
        else:
            token = None
        result = generate_enqueue_result(token)

        if token:
            register_token(token, g.user.id)
        else:
            redis.db.srem(waiting_key, g.user.id)

    return jsonify(result)
