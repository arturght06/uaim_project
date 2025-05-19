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

EXPOSE 5000

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0" ]
#ENTRYPOINT ["top"]