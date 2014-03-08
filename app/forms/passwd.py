#! encoding=utf-8
from flask_wtf import Form
from wtforms import PasswordField
from wtforms.validators import DataRequired, EqualTo

class PasswdForm(Form):
    oldpassword = PasswordField(u'Old Password', validators = [DataRequired()])
    newpassword = PasswordField(u'New Password', validators = [DataRequired()])
    confirm = PasswordField(u'Repeat New Password', validators = [
        DataRequired(),
        EqualTo('newpassword', message=u'Password do not match'),
        ])

