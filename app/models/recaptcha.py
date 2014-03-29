from flask import request, current_app
import requests
def validate(challenge, response):
    ip = request.remote_addr
    private_key = current_app.config['RECAPTCHA_PRIVATE_KEY']
    payload = {
            "privatekey": private_key,
            "remoteip": ip,
            "challenge": challenge,
            "response": response,
    }
    url = "http://www.google.com/recaptcha/api/verify"
    r = requests.post(url, data=payload)
    return r.text.split('\n')[0].strip() == 'true'
