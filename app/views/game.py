#! encoding=utf-7
from flask import Blueprint, render_template, request, g, jsonify, abort
import json
from .access import access_control
from app.foundation import redis

from flask.ext.login import login_required
from app.models.config import get as conf
from app.models.Rounds import Rounds
from app.models.game import Game, TimeoutError

from .lock import lock, release_lock

game = Blueprint('game', __name__)

@game.before_request
@login_required
@access_control(['NORMAL'])
def before_request():
    pass

@game.route('/')
def index():
    return render_template('game/index.html')

states_map = {
    "new": "SUCCESS",
    "match": "SUCCESS",
    "unmatch": "RETRY",
    "timeout": "TIMEOUT",
    "exit": "EXIT",
    "done": "DONE",
}
def create_response(cur_game, ack):
    print '-------------'
    print ack
    ret = {
        "status": states_map[ack['type']],
        "score": cur_game.get_attr('score') if cur_game else 0,
    }
    if ack['type'] in ['match', 'timeout', 'new']:
        ret["round_length"]= cur_game.round_queue_length(),
        print ack['next']
        cur_round = Rounds.query.get(ack['next'])
        ret['round'] = json.loads(cur_round.data)
    return jsonify(ret)

@game.route('/prepare/<token>')
def prepare(token):
    output = None
    cur_game = Game.get_by_token(token)
    if cur_game and cur_game.participate(g.user):
        cur_game.lock()
        waiting = cur_game.pop_waiting()
        if waiting:
            rounds = Rounds.get_rounds(conf('rounds_init'))
            cur_game.init(conf('score_init'), rounds)

            output = {"type": "new", "next": cur_game.new_round()}
            cur_game.notice(output)
            cur_game.unlock()
        else:
            try:
                output = cur_game.declare_and_wait(g.user.id, conf('prepare_timeout'))
            except TimeoutError:
                output = {"type": "exit"}
    else:
        output = {"type": "exit"}
    return create_response(cur_game, output)

@game.route('/submit/<token>',methods = ['POST'])
def hand_in(token):
    cur_game = Game.get_by_token(token)
    if not cur_game or not cur_game.participate(g.user):
        abort(400)

    data = request.get_json()
    if not data:
        abort(400)

    if data['type'] == 'timeout':
        handin = { "timeout": True }
    else:
        handin = {
            "timeout": False,
            "time": data['time'],
            "choice": data['choice']
        }
    cur_game.lock()
    mate = cur_game.pop_waiting()
    ack = None
    if mate:
        if handin['timeout'] or mate['timeout']:
            cur_game.update_score("timeout")

            next_id = cur_game.new_round()
            ack = {"type": "timeout"}
            if next_id:
                ack["next"] = next_id
            else:
                ack["type"] = "done"
        else:
            time = max(handin['time'], mate['time'])
            if mate['choice'] == handin['choice']:
                cur_game.update_score('match', time)

                next_id = cur_game.new_round()
                ack = {"type": "match"}
                if next_id:
                    ack["next"] = next_id
                else:
                    ack["type"] = "done"
            else:
                ack = { "type": "unmatch" }
                count = cur_game.get_attr('submit_count')
                count += 1
                cur_game.set_attr('submit_count', count)
        cur_game.notice(ack)
        cur_game.unlock()
    else:
        try:
            ack = cur_game.declare_and_wait(handin, conf('round_timeout') - handin['time'])
        except TimeoutError:
            ack = {"type": "exit"}
    return create_response(cur_game, ack)
