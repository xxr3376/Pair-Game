#! encoding=utf-8
from flask import Blueprint, render_template, redirect, url_for, flash, request, g, jsonify
from app.foundation import db
from .access import access_control
from flask.ext.login import login_required
import time
import uuid
import random
from app.foundation import redis
from .lock import lock
from .lock import release_lock

game = Blueprint('game', __name__)

@game.before_request
@login_required
@access_control(['NORMAL'])
def before_request():
    pass

@game.route('/')
def index():
    return render_template('game/index.html')

RETRY = -1
EXIT = -2
DONE = 0
states = {
        EXIT:"EXIT",
        DONE:"DONE",
        RETRY:"RETRY"
        }

def result(next):
    if next:
        result = {}
        if next[0]>0:
            result["status"] = "SUCCESS"
            result["round"] = next
        else:
            result["status"] = states[next[0]]
    else:
        result = {
            "status": "FAIL",
        }
    return result

def register_token(token, user_id):
    pass

token_s = 'game:%s'
waiting_s = 'waiting:%s'
ack_s = 'ack:%s'
prepare_timeout = 3
round_timeout = 10
tokent = 'tt_token'

def next_round(token):
    # id = next round play
    token_key = token_s % token
    length = redis.db.llen(token_key)
    rtn = [length]
    if 0 != length:
        rounds = eval(redis.db.lpop(token_key))
        rtn.append(rounds)
    return rtn

import re
pat = re.compile('\[(\d+),\s*(.+)\]')
def parse_round(rtn):
    return eval(rtn)
def prepare_data(token):
    rounds = [[[11,'hello'],[12,'hello'],[13,'hello'],],
            [[103,'hello'],[102,'hello'],[101,'hello'],],
            [[120,'hello'],[110,'hello'],[1,'hello'],]]
    token_key = token_s % token
    for round in rounds:
        redis.db.lpush(token_key,round)
    return next_round(token)

@game.route('/prepare')
def prepare():
    token = tokent
    release_lock(token)
    lock(token)
    waiting_key = waiting_s % token
    ack_key = ack_s % token
    ack = redis.db.lpop(waiting_key)
    if ack:
        rtn = prepare_data(token)
        redis.db.rpush(ack_key,rtn)
        release_lock(token)
        return jsonify(result(rtn))
    else:
        redis.db.rpush(waiting_key,token)
        release_lock(token)
        ack = redis.db.blpop(ack_key,prepare_timeout)
        if ack:
            _,rtn = ack
            return jsonify(result(parse_round(rtn)))
        else:
            redis.db.lpop(waiting_key)
            return jsonify(result([EXIT]))


@game.route('/hand_in',methods = ['GET','POST'])
def hand_in():
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
    lock(token)
    print redis.db.llen(waiting_key)
    mate_handin = redis.db.lpop(waiting_key)
    print mate_handin,redis.db.llen(waiting_key)
    if mate_handin:
        mate_handin = eval(mate_handin)
        time = handin[0]
        if time<mate_handin[0]:
            time = mate_handin[0]
        ack = None
        if handin[1] == mate_handin[1]:
            ack = next_round(token)
        else:
            ack = [RETRY]
        print "ACK0 %s " % ack
        redis.db.rpush(ack_key,ack)
        release_lock(token)
        return jsonify(result(ack))
    else:
        redis.db.rpush(waiting_key,handin)
        release_lock(token)
        msg = redis.db.blpop(ack_key,round_timeout)
        if msg:
            _,ack = msg
            return jsonify(result(parse_round(ack)))
        else:
            redis.db.lpop(waiting_key)
            return jsonify(result([EXIT]))

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
