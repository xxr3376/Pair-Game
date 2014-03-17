score_per_round = 40
killing_time = 0
total_time = 60
timeout_penalty = 1
diff_penalty = 1.0/3
prepare_timeout = 3
round_timeout = 70

key = "CONFIG:PARA"
score_init = 0
rounds_init = 2
h_score_init = 'score_init'
h_rounds_init = 'rounds_init'


def loadConfig():
    score_init = float(redis.db.hget(key,h_score_init))
    rounds_init = float(redis.db.hget(key,h_rounds_init))
def writeConfig():
    redis.db.hset(key,h_score_init,score_init)
    redis.db.hset(key,h_rounds_init,rounds_init)


