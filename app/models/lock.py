import random
import time
from app.foundation import redis


def _lock_(key, hkey):
    count = 0
    while True:
        count += 1
        if count == 100:
            raise 'lock timeout error'
        lock = redis.db.hget(key, hkey)
        print lock
        if lock == None or int(lock) == 0:
            get_lock = redis.db.hincrby(key, hkey, 1)
            if get_lock == 1:
                break
            else:
                redis.db.hincrby(key, hkey, -1)
        time.sleep(random.random() / 100)
    return

def _unlock_(key, hkey):
    redis.db.hset(key, hkey, 0)
    return

hashkey = 'hash_key'
def lock(key):
    lock_key = "LOCK:%s" % key
    _lock_(lock_key, hashkey)
    return

def release_lock(key):
    lock_key = "LOCK:%s" % key
    _unlock_(lock_key, hashkey)
    return
