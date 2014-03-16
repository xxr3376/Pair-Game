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

team = Blueprint('team', __name__)

@team.before_request
@login_required
@access_control(['NORMAL'])
def before_request():
    pass

@team.route('/')
def index():
    return render_template('team/index.html')

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

def register_token(token, user_id1, user_id2):
    pass

waiting_key = "team:waiting"
user_key = "team:userslot:%s"
lock_key = 'team_lock'

@team.route('/enqueue')
def enqueue():
    lock(lock_key)
    mate = redis.db.spop(waiting_key)
    result = {}
    if mate:
        #has mate
        release_lock(lock_key)
        token = uuid.uuid1().hex
        register_token(token, g.user.id, int(mate))

        mate_key = user_key % mate
        redis.db.rpush(mate_key, token)

        result = generate_enqueue_result(token)
    else:
        # start waiting
        self_key = user_key % g.user.id
        redis.db.delete(self_key)
        redis.db.sadd(waiting_key, g.user.id)
        release_lock(lock_key)
        message = redis.db.blpop(self_key, timeout=2)
        if message:
            _, token = message
        else:
            token = None
        result = generate_enqueue_result(token)

        if not token:
            redis.db.srem(waiting_key, g.user.id)

    return jsonify(result)