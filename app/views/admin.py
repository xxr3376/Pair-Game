#! encoding=utf-8
from flask import Blueprint, render_template, redirect, url_for, flash, request, g, jsonify
from app.foundation import db
from .access import access_control
from flask.ext.login import login_required
import time
import uuid
import random
from app.foundation import redis
from app.models.User import User

admin = Blueprint('admin', __name__)

@admin.before_request
@login_required
@access_control(['NORMAL'])
def before_request():
    pass

@admin.route('/')
def index():
    online = User.online_users()
    return "% d users online" % online


def register_token(token, user_id1, user_id2):
    pass

