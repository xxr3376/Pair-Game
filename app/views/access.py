#! encoding=utf-8
from flask import g, abort, make_response
from app.models.User import ROLE
from flask.ext.login import login_required
from functools import update_wrapper

def access_control(roles):
    def decorator(func):
        @login_required
        def wrapped_function(*args, **kwargs):
            allow = False
            for role in roles:
                if ROLE[role] == g.user.role:
                    allow = True
            if not allow:
                abort(403)
            return func(*args, **kwargs)
        return update_wrapper(wrapped_function, func)
    return decorator
