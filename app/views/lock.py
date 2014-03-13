import random
import time
from app.foundation import redis

hashkey = 'hash_key'
def lock(key):
    lock_key = "LOCK:%s" % key
    while True:
        lock = redis.db.hget(lock_key, hashkey)
        print lock
        if lock == None or int(lock) == 0:
            get_lock = redis.db.hincrby(lock_key, hashkey, 1)
            if get_lock == 1:
                break
            else:
                redis.db.hincrby(lock_key, hashkey, -1)
        time.sleep(random.random() / 100)
    return
def release_lock(key):
    lock_key = "LOCK:%s" % key
    redis.db.hset(lock_key, hashkey, 0)
    return
