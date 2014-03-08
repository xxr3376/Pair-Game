#! encoding=utf-8
from app.foundation import db, redis
from app.models.Image import Image
from datetime import datetime, timedelta
from flask import current_app as app

class Lock(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    task_id = db.Column(db.Integer, index=True)
    img_id = db.Column(db.Integer, index=True) #normally is img_id
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True)
    timestamp = db.Column(db.DateTime, index=True)

def init_task(task):
    key = ("queue:%s:initset" % task.id)
    pipeline = redis.db.pipeline()
    for image in task.images.with_entities(Image.id):
        pipeline.sadd(key, image.id)
    pipeline.execute()
    return
def init4user(task, user_id):
    init_key = ("queue:%s:initset" % task.id)
    user_key = "queue:%s:%s" % (task.id, user_id)
    redis.db.sunionstore(user_key, init_key)
    return
def get_new_lock(task, user):
    user_key = "queue:%s:%s" % (task.id, user.id)
    lock_key = ("lock:%s" % task.id)
    for i in range(0, 3):
        #  try no more than 3 times;
        image_id = redis.db.srandmember(user_key)
        if not image_id:
            return None
        lock = redis.db.hincrby(lock_key, image_id, 1)
        if lock != 1:
            #fail to get lock
            redis.db.hincrby(lock_key, image_id, -1)
        else:
            #success
            try:
                lock = Lock(task_id=task.id, user_id=user.id,\
                        img_id=image_id, timestamp=datetime.utcnow())
                db.session.add(lock)
                db.session.commit()
                redis.db.srem(user_key, image_id)
                return image_id
            except:
                db.session.rollback()
def get_enough_lock(task, user, number):
    exist = Lock.query\
            .filter_by(task_id=task.id)\
            .filter_by(user_id=user.id)\
            .all()
    exist = map(lambda x: x.img_id, exist)
    need = number - len(exist)
    for i in range(0, need):
        new_lock = get_new_lock(task, user)
        if not new_lock:
            break
        exist.append(new_lock)
    return exist
def is_hold_lock(task, user, img):
    has_lock = Lock.query\
            .filter_by(task_id=task.id)\
            .filter_by(user_id=user.id)\
            .filter_by(img_id=img.id)\
            .count()
    return has_lock == 1
def release_lock(task, user, img):
    lock = Lock.query\
            .filter_by(task_id=task.id)\
            .filter_by(user_id=user.id)\
            .filter_by(img_id=img.id)\
            .first()
    if lock:
        lock_key = ("lock:%s" % task.id)
        db.session.delete(lock)
        redis.db.hincrby(lock_key, img.id, -1)
        db.session.commit()
def put_back(lock):
    user_key = "queue:%s:%s" % (lock.task_id, lock.user_id)
    redis.db.sadd(user_key, lock.img_id)
    lock_key = ("lock:%s" % lock.task_id)
    redis.db.hset(lock_key, lock.img_id, 0)
    db.session.delete(lock)
    db.session.commit()
    return
def clear_from_all(task, img):
    init_key = ("queue:%s:initset" % task.id)
    redis.db.srem(init_key, img.id)
    for du in task.users:
        uid = du.user_id
        user_key = "queue:%s:%s" % (task.id, uid)
        redis.db.srem(user_key, img.id)
    return
def release_timeout_lock():
    limit = datetime.utcnow() - timedelta(seconds=1800)
    for lock in Lock.query.filter(Lock.timestamp < limit):
        put_back(lock)
    return
