#! encoding=utf-8
from flask_wtf import Form
from wtforms import IntegerField
from wtforms.validators import InputRequired

class SettingForm(Form):
    score_init = IntegerField(u'Init Score', validators = [InputRequired()])
    rounds_init = IntegerField(u'Game Round Length', validators = [InputRequired()])
    score_per_round = IntegerField(u'Score of each Question', validators = [InputRequired()])
    killing_time = IntegerField(u'Time before penalty',  validators = [InputRequired()])
    # TODO start_killing_score_time
    total_time = IntegerField(u'Total Time for one Question', validators = [InputRequired()])
    timeout_penalty = IntegerField(u'Timeout Penalty', validators = [InputRequired()])
