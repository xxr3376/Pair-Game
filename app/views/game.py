#! encoding=utf-8
from flask import Blueprint, render_template, request, g, jsonify, abort
import json
from .access import access_control
from app.foundation import redis

from flask.ext.login import login_required
from app.models.config import get as conf
from app.models.config import load as conf_load
from app.models.Rounds import Rounds
from app.models.game import Game, TimeoutError
from app.models.log import Log
from app.models.lock import lock, release_lock

game = Blueprint('game', __name__)

@game.before_request
@login_required
@access_control(['NORMAL'])
def before_request():
    pass

@game.route('/')
def index():
    return render_template('game/index.html', conf=conf)

states_map = {
    "new": "SUCCESS",
    "match": "SUCCESS",
    "unmatch": "RETRY",
    "timeout": "TIMEOUT",
    "exit": "EXIT",
    "done": "DONE",
}
def create_response(cur_game, ack,actions = None):
    #print '-------------'
    #print ack
    score = 0
    if cur_game:
        #cur_game.state = cur_game.PLAYING
        print cur_game.state
        score = cur_game.get_attr('score')
    if actions and (len(actions)==2 or ack['type'] == 'exit'):
        item = Log.create(
                cur_game.id,
                cur_game.get_attr('current_round'),
                cur_game.get_attr('submit_count'),
                score,
                actions)
        if ack['type'] in ['exit','done']:
            cur_game.finish()
    ret = {
        "status": states_map[ack['type']],
        "score": score,
    }
    if ack['type'] in ['match', 'timeout', 'new']:
        ret["round_length"]= cur_game.round_queue_length(),
        #print ack['next']
        cur_round = Rounds.query.get(ack['next'])
        ret['round'] = json.loads(cur_round.data)
        cur_game.set_attr('current_round',ack['next'])
    return jsonify(ret)

@game.route('/prepare/<token>')
def prepare(token):
    output = None
    conf_load(True)
    cur_game = Game.get_by_token(token)
    if cur_game and cur_game.participate(g.user) \
            and cur_game.get_attr('state') == cur_game.NEW:
            #and cur_game.state == cur_game.NEW:
        cur_game.state = cur_game.PLAYING
        cur_game.lock()
        waiting = cur_game.pop_waiting()
        if waiting:
            rounds = Rounds.get_rounds(conf('rounds_init'))
            cur_game.prepare(conf('score_init'), rounds)
            output = cur_game.new_round()
            if output.get("type") != 'done':
                output["type"] = 'new'
            cur_game.notice(output)
            cur_game.unlock()
        else:
            try:
                output = cur_game.declare_and_wait(g.user.id, conf('prepare_timeout'))
            except TimeoutError:
                output = cur_game.timeout()
    else:
        output = {"type": "exit"}
    return create_response(cur_game, output)

@game.route('/submit/<token>',methods = ['POST'])
def hand_in(token):
    cur_game = Game.get_by_token(token)
    if not cur_game or not cur_game.participate(g.user)\
            or cur_game.get_attr('state') != cur_game.PLAYING:
            #or cur_game.state != cur_game.PLAYING:
        if cur_game:
                    print cur_game.state
        abort(400)

    data = request.get_json()
    if not data:
        abort(400)

    if data['type'] == 'timeout':
        handin = { 
                "timeout": True,
                'time':conf('total_time'),
                'action':Log.create_action(g.user.id,'TIMEOUT')}
    else:
        handin = {
            "timeout": False,
            "time": data['time'],
            "choice": data['choice'],
            'action':Log.create_action(
                g.user.id,
                'NORMAL',
                data['choice'],
                data['time'])
        }
    cur_game.lock()
    actions = [handin['action']]
    mate = cur_game.pop_waiting()
    ack = None
    if mate:
        actions = [handin['action'],mate['action']]
        if handin['timeout'] or mate['timeout']:
            cur_game.update_score("timeout")
            ack = cur_game.new_round()
            if ack.get("type") != 'done':
                ack['type'] = 'timeout'
        else:
            time = max(handin['time'], mate['time'])
            if mate['choice'] == handin['choice']:
                cur_game.update_score('match', time)
                ack = cur_game.new_round()
                if ack.get("type") != 'done':
                    ack['type'] = 'match'
            else:
                ack = { "type": "unmatch" }
                count = cur_game.get_attr('submit_count')
                count += 1
                cur_game.set_attr('submit_count', count)
        cur_game.notice(ack)
        cur_game.unlock()
    else:
        try:
            wait_time = conf('timeout_time')
            wait_time += conf('total_time')-handin['time']
            ack = cur_game.declare_and_wait(handin,wait_time)
        except TimeoutError:
            ack = cur_game.timeout()
    return create_response(cur_game, ack,actions)
