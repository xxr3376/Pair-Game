#! encoding=utf-8
from flask_wtf import Form
from wtforms import TextField, BooleanField, PasswordField
from wtforms.validators import DataRequired

class LoginForm(Form):
    username = TextField(u'Username', validators = [DataRequired()])
    password = PasswordField(u'Password', validators = [DataRequired()])
    remember_me = BooleanField(u'Remember me', default = False)

