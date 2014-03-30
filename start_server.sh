#!/bin/bash
. env/bin/activate
exec gunicorn app:app -b 127.0.0.1:9876 -p .pid -w 6 -t 90 
