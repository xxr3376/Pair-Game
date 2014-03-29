#! encoding=utf-8
from flask_wtf import Form
from flask_wtf.file import FileRequired, FileAllowed, FileField

class AvatarForm(Form):
    avatar = FileField(u'avatar', validators=[
        FileRequired('You need upload a image'),
        FileAllowed(['jpg', 'png'], 'You can only upload jpg or png image file')
    ])
