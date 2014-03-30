#! encoding=utf-8
from flask import Blueprint, render_template, redirect, url_for, flash, request, g, current_app
from app.forms import LoginForm, PasswdForm, RegisterForm
from app.forms.avatar import AvatarForm
from app.models.User import User, ROLE
from app.models.score import Score
from flask.ext.login import login_user, logout_user, login_required
from app.foundation import db
import time

frontend = Blueprint('frontend', __name__, template_folder='templates')

waiting = 'waiting_users'
games = 'playing_users'

@frontend.route('/')
@login_required
def index():
    if g.user.role == ROLE['ADMIN']:
        return redirect(url_for('admin.index'))
    history = Score.query\
        .filter_by(user_id=g.user.id)\
        .order_by(Score.id.desc())\
        .limit(20)
    data = {
        "online_num": User.online_users(),
        "total_num": User.total_users(),
        "average": Score.average(g.user.id),
        "history" : history,
    }
    return render_template("frontend/index.html", **data)
@frontend.route('/login', methods = ['GET', 'POST'])
def login():
    if g.user is not None and g.user.is_authenticated():
        return redirect(url_for('.index'))
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        user = auth_user(username, password)
        if user is not None:
            login_user(user, remember = form.remember_me.data)
            flash(u'Welcome ' + form.username.data, 'info');
            return redirect(request.args.get("next") or url_for(".index"))
        flash(u'Username or Password is wrong', 'danger')
    return render_template("frontend/login.html", form = form)

def auth_user(username, password):
    user = User.query.filter_by(username=username).first()
    if user is None:
        return None
    else:
        return user if user.check_password(password) else None
@frontend.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for(".index"))
@frontend.route("/passwd", methods=['GET', 'POST'])
@login_required
def passwd():
    form = PasswdForm()
    if form.validate_on_submit():
        oldpassword = form.oldpassword.data
        newpassword = form.newpassword.data
        if g.user.check_password(oldpassword):
            g.user.password = User.create_password(newpassword)
            db.session.commit()
            flash(u'Password change succeed', 'success')
            return redirect(url_for(".index"))
        else:
            flash(u'Old Password is wrong', 'danger')
            form.password.data = ''
    return render_template("frontend/passwd.html", form = form)
@frontend.route("/register", methods=['GET', 'POST'])
def register():
    if g.user is not None and g.user.is_authenticated():
        return redirect(url_for('.index'))
    form = RegisterForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        email = form.email.data
        if User.query.filter_by(username=username.lower()).count():
            flash(u'Username already exists', 'danger')
        else:
            user = User(username=username, password=password, email=email, role=ROLE['NORMAL'])
            db.session.add(user)
            db.session.commit()
            login_user(user)
            flash(u'Welcome ' + form.username.data, 'info');
            return redirect(url_for(".index"))
    return render_template("frontend/register.html", form = form)

import os
from PIL import Image, ImageOps
import random
import StringIO
import shutil

@frontend.route("/avatar", methods=['GET', 'POST'])
@login_required
def avatar():
    form = AvatarForm()
    if form.validate_on_submit():
        ext = form.avatar.data.filename.split('.')[-1]
        filename = "%s_%s.%s" % (g.user.id, int(time.time()), ext)
        base = os.path.join(current_app.config['ASSET_DIR'], 'upload')
        if not os.path.isdir(base):
            os.makedirs(base)

        stream = form.avatar.data.stream
        img = StringIO.StringIO()
        shutil.copyfileobj(stream, img)
        img.seek(0)

        with open(os.path.join(base, filename), "wb") as f:
            f.write(img.read())
        img.seek(0)

        im = Image.open(img)
        size = 64,64
        avatar = ImageOps.fit(im, size, Image.ANTIALIAS)
        filename = str(g.user.id) + '.jpg'
        base = os.path.join(current_app.config['ASSET_DIR'], 'avatar')
        if not os.path.isdir(base):
            os.makedirs(base)
        avatar.save(os.path.join(base, filename))
        g.user.avatar = "/asset/avatar/%s?v=%s" % (filename, random.randint(1, 100))
        db.session.commit()
        flash(u'Avatar Change Succeed!', 'success')
        return redirect(url_for('.index'))
    return render_template("frontend/avatar.html", form=form)
