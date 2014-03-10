#! encoding=utf-8
from flask import Blueprint, render_template, redirect, url_for, flash, request, g, jsonify
from app.foundation import db
from .access import access_control
from flask.ext.login import login_required
import json

team = Blueprint('team', __name__)

@team.before_request
@login_required
@access_control(['NORMAL'])
def before_request():
    pass

@team.route('/')
def index():
    return render_template('team/index.html')

@team.route('/enqueue')
def enqueue():
    import time
    import uuid
    time.sleep(5)
    result = {
        "status": "SUCCESS",
        "token": uuid.uuid1(),
    }
    return jsonify(result)
