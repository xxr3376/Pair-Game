#! encoding=utf-8
from flask_wtf import Form
from wtforms import PasswordField, TextField
from wtforms.validators import DataRequired, EqualTo, Email

class RegisterForm(Form):
    username = TextField(u'Username', validators = [DataRequired()])
    email = TextField(u'Email', validators = [DataRequired(), Email()])
    password = PasswordField(u'Password', validators = [DataRequired()])
    repeat = PasswordField(u'Repeat', validators = [
        DataRequired(),
        EqualTo('password', message=u'Password do not match'),
    ])
