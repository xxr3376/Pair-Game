import simplejson as json
from app.foundation import redis

DEFAULT = {
    "score_per_round": 40,
    "killing_time":  0,
    "total_time": 60,
    "timeout_penalty": 1,
    "diff_penalty": 1.0/3,
    "prepare_timeout": 3,
    "round_timeout": 70,
    "score_init": 0,
    "rounds_init": 2,
}

_CONFIG_KEY_= "CONFIG:PARA"
init = False

_current = {}
def load():
    global init
    global _current
    if not init:
        db_config = redis.db.get(_CONFIG_KEY_)
        if not db_config:
            _current = DEFAULT
            init = True
        else:
            _current = json.loads(db_config)
    return

def get(key):
    load()
    return _current[key]

def set(key, value):
    load()
    _current[key] = value

    config_str = json.dumps(_current)
    redis.db.set(_CONFIG_KEY_, config_str)
    return
