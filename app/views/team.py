#! encoding=utf-8
from flask import Blueprint, render_template, redirect, url_for, flash, request, g, jsonify
from app.foundation import db
from .access import access_control
from flask.ext.login import login_required
import time
import uuid
import random
from app.foundation import redis

team = Blueprint('team', __name__)

@team.before_request
@login_required
@access_control(['NORMAL'])
def before_request():
    pass

@team.route('/')
def index():
    return render_template('team/index.html')

def team_lock():
    while True:
        lock = redis.db.hget('lock', 'team')
        if lock == None or int(lock) == 0:
            get_lock = redis.db.hincrby('lock', 'team', 1)
            if get_lock == 1:
                break
            else:
                redis.db.hincrby('lock', 'team', -1)
        time.sleep(random.random() / 100)
    return
def release_lock():
    redis.db.hset('lock', 'team', 0)
    return

def generate_enqueue_result(token):
    if token:
        result = {
            "status": "SUCCESS",
            "token": token
        }
    else:
        result = {
            "status": "FAILED",
            "reason": "timeout",
        }
    return result

def register_token(token, user_id):
    pass

waiting_key = "team:waiting"
user_key = "team:userslot:%s"


@team.route('/enqueue')
def enqueue():
    team_lock()
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
