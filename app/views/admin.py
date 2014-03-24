#! encoding=utf-8
from flask import Blueprint, render_template, redirect, url_for, flash, request, g, jsonify
from .access import access_control
from flask.ext.login import login_required
from app.models.User import User
from app.forms.setting import SettingForm
import app.models.config as config

admin = Blueprint('admin', __name__)

@admin.before_request
@login_required
@access_control(['ADMIN'])
def before_request():
    pass

@admin.route('/')
def index():
    online = User.online_users()
    total =  User.query.count()
    return render_template('admin/index.html', online_num=online,total_num = total)

avaliable = [
    'score_init',
    'rounds_init',
    'score_per_round',
    'total_time',
    'timeout_penalty',
]

@admin.route('/setting', methods=['GET', 'POST'])
def setting():
    form = SettingForm()
    if form.validate_on_submit():
        for key in avaliable:
            config.set_(key, getattr(form, key).data)
        config.dump()
        return redirect(url_for('.index'))
    for key in avaliable:
        getattr(form, key).data = config.get(key)
    return render_template('admin/setting.html', form=form)
