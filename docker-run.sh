#!/bin/bash

./manage.py migrate
gunicorn --workers 3 checkin.wsgi --bind :8000

