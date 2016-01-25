#!/bin/bash

mkdir -p /opt/check-in/public/static
./manage.py collectstatic --noinput
su django
./manage.py migrate
gunicorn --workers 3 checkin.wsgi --bind :8000

