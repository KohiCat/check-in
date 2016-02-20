FROM python:3
MAINTAINER Mark Ignacio <mignacio@hackucf.org>
ENV PYTHONUNBUFFERED 1
RUN mkdir -p /opt/check-in/code
VOLUME /opt/check-in/public
WORKDIR /opt/check-in/code
COPY ./requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip install psycopg2
RUN pip install gunicorn

COPY . .
RUN python manage.py makemigrations

# generate the JS bundle
WORKDIR /opt/check-in/code/attendance/react_app
RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN apt-get install -y nodejs
RUN npm install
RUN npm run-script bundle

WORKDIR /opt/check-in/code
RUN useradd django
RUN chown -R django:django /opt/check-in
CMD sh docker-run.sh

