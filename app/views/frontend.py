#! encoding=utf-8
from flask import Blueprint, render_template, redirect, url_for, flash, request, g
from app.forms import LoginForm, PasswdForm, RegisterForm
from app.models.User import User, ROLE
from flask.ext.login import login_user, logout_user, login_required
from app.foundation import db

frontend = Blueprint('frontend', __name__, template_folder='templates')

waiting = 'waiting_users'
games = 'playing_users'

@frontend.route('/')
@login_required
def index():
    if g.user.role == ROLE['ADMIN']:
        return redirect(url_for('admin.index'))
    return render_template("frontend/index.html")
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
