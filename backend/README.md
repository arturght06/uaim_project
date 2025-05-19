# flask backend

## Launching

1. Create the `app/.env` file with this structure:

```
SECRET_KEY=secret-key
REFRESH_SECRET_KEY=refresh-secret-key
REFRESH_TOKEN_AGE=1440
ACCESS_TOKEN_AGE=30
SQLALCHEMY_DATABASE_URI=postgresql://[username]:[password]@[host address]:5432/[database]
DEBUG=True
```

If you're using docker for launching the backend and running postgresql on localhost, use `host.docker.internal` as the host address.


### With WSL (or linux)

2. Install and run a postgresql database, for example:

```
docker pull postgres
docker run -itd \
    -e POSTGRES_USER=user \
    -e POSTGRES_PASSWORD=pass \
    -p 5432:5432 \
    -v pgdata:/var/lib/postgresql/data \
    --name db postgres
```

Update `app/.env` accordingly.
```
SQLALCHEMY_DATABASE_URI=postgresql://user:pass@localhost:5432/user
```

3. Install requirements.

```
pip install -r requirements.txt
```

4. Running should work.

```
python run.py
```

### With docker (wip)

2. Build docker image.

```
docker build --tag uaim_projekt .
```

3. Run docker image.

```
docker run -p 5000:5000 uaim_projekt
```
