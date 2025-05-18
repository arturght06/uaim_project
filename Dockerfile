FROM python:3.12-alpine

WORKDIR /project

RUN apk add screen

COPY app app/
COPY requirements.txt /project
COPY run.py /project

RUN pip3 install -r /project/requirements.txt

#RUN flask db init
#RUN flask db migrate
#RUN flask db upgrade

EXPOSE 9000

#ENTRYPOINT ["top"]