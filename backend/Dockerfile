FROM python:3.12-slim

WORKDIR /project

RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /project/
RUN pip install --no-cache-dir -r requirements.txt

COPY app /project/app
COPY run.py /project/

EXPOSE 8800

CMD ["gunicorn", "-b", "0.0.0.0:8800", "app:create_app()"]