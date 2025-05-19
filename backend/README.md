# flask backend

## Launching

1. Install and run a postgresql database

2. Create the `app/.env` file with this structure

```
SECRET_KEY=secret-key
REFRESH_SECRET_KEY=refresh-secret-key
REFRESH_TOKEN_AGE=1440
ACCESS_TOKEN_AGE=30
SQLALCHEMY_DATABASE_URI=postgresql://[username]:[password]@[host address]:5432/[database]
DEBUG=True
```

If you're using docker for launching the backend and running postgresql on localhost, use `host.docker.internal` as the host address.

3. Build docker image

```
docker build --tag uaim_projekt .
```

4. Run docker image

```
docker run -p 5000:5000 uaim_projekt
```
