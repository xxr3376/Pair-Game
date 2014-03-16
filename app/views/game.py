#! encoding=utf-8
from flask import Blueprint, render_template, redirect, url_for, flash, request, g, jsonify
import json
from app.foundation import db
from .access import access_control
from flask.ext.login import login_required
import time
import uuid
import random
import app.models.config as conf
from app.models.Rounds import Rounds
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

TIMEOUT = -4
RETRY = -2
EXIT = -3
DONE = -1
SUCCESS = 0
states = {
        EXIT:"EXIT",
        DONE:"DONE",
        RETRY:"RETRY",
        SUCCESS:"SUCCESS",
        TIMEOUT:"TIMEOUT"
        }

#data = [status, score, rest_time/round_id]
def result(data):
    dict_result = dict()
    print data
    if data:
        dict_result["status"] = states[data[0]]
        dict_result['score'] = data[1]
        if data[0] == SUCCESS or data[0] == TIMEOUT:
            jdata = Rounds.get_data(data[3])
            dict_result["round"] = json.loads(jdata)
            dict_result["round_length"] = data[2]
        if (data[0] == RETRY):
            dict_result["time"] = data[2]
    else:
        dict_result = {
            "status": "FAIL",
        }
    return dict_result

def register_token(token, user_id):
    pass

token_s = 'game:%s'
waiting_s = 'waiting:%s'
ack_s = 'ack:%s'
stats_s = 'stats:%s'
h_score = 'score' #score hash
h_submit_count = 'submit_count'

def calc_score(token,status=RETRY,time=conf.killing_time):
    key = stats_s % token
    cur = float(redis.db.hget(key,h_score))
    if SUCCESS != status:
        return cur
    submits = int(redis.db.hget(key,h_submit_count))
    print submits,time,conf.killing_time
    delta = conf.score_per_round
    for i in range(submits):
        delta = delta * (1 - conf.diff_penalty)
    if time>conf.killing_time:
        delta += (conf.killing_time - time) * conf.timeout_penalty
    cur += delta
    redis.db.hset(key,h_score,cur)
    return cur

def next_round(token):
    token_key = token_s % token
    stats_key = stats_s % token
    redis.db.hset(stats_key,h_submit_count,0)
    length = redis.db.llen(token_key)
    rtn = [length-1]
    if 0 != length:
        rid = int(redis.db.lpop(token_key))
        rtn.append(rid)
    return rtn

def parse_ack(data):
    return map(float,data.split("#"))
def build_ack(data):
    return "#".join(map(str,data))

def prepare_data(token):
    stats_key = stats_s % token
    token_key = token_s % token
    stats_key = stats_s % token
    score_init = conf.score_init
    redis.db.hset(stats_key,h_score,score_init)
    rounds = Rounds.get_rounds(conf.rounds_init)
    for round in rounds:
        redis.db.lpush(token_key,round)
    data = next_round(token)
    return [SUCCESS,score_init,data[0],data[1]]

#@game.route('/prepare')
@game.route('/fake_prepare/<token>')
def prepare(token):
    release_lock(token)
    lock(token)
    waiting_key = waiting_s % token
    ack_key = ack_s % token
    ack = redis.db.lpop(waiting_key)
    if ack:
        data = prepare_data(token)
        redis.db.rpush(ack_key,build_ack(data))
        release_lock(token)
        return jsonify(result(data))
    else:
        redis.db.rpush(waiting_key,token)
        release_lock(token)
        ack = redis.db.blpop(ack_key,conf.prepare_timeout)
        if ack:
            _,rtn = ack
            return jsonify(result(parse_ack(rtn)))
        else:
            redis.db.lpop(waiting_key)
            return jsonify(result([EXIT,calc_score(token)]))

@game.route('/fake_submit/<token>',methods = ['POST'])
def hand_in(token):
    waiting_key = waiting_s % token
    ack_key = ack_s % token
    data = json.loads(request.data)
    handin = []
    if (data['type'] == 'timeout'):
        handin = [TIMEOUT]
    else:
        handin = [data['time'],data['choice']]
    lock(token)
    mate_handin = redis.db.lpop(waiting_key)
    if mate_handin:
        mate = parse_ack(mate_handin)
        time = handin[0]
        ack = None
        if time==TIMEOUT or mate[0] == TIMEOUT:
            data = next_round(token)
            ack = [TIMEOUT,calc_score(token),data[0],data[1]]    
        else:
            if time<mate[0]:
                time = mate[0]
            if mate[1] == handin[1]:
                score = calc_score(token,SUCCESS,time)
                data = next_round(token)
                ack = [SUCCESS,score,data[0],data[1]]
            else:
                ack = [RETRY,calc_score(token),time]
                key = stats_s % token
                redis.db.hincrby(key,h_submit_count,1)
        redis.db.rpush(ack_key,build_ack(ack))
        release_lock(token)
        return jsonify(result(ack))
    else:
        redis.db.rpush(waiting_key,build_ack(handin))
        release_lock(token)
        msg = redis.db.blpop(ack_key,conf.round_timeout)
        if msg:
            _,ack = msg
            return jsonify(result(parse_ack(ack)))
        else:
            redis.db.lpop(waiting_key)
            return jsonify(result([EXIT,calc_score(token)]))

