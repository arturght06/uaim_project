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

---

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

---

### With Docker

1. Make sure you have `app/.env` configured as above.

Set in `app/.env`:
```
SQLALCHEMY_DATABASE_URI=postgresql://user:pass@host.docker.internal:5432/user
```

2. Start a PostgreSQL container if you don't have one:

```
docker run -itd \
    -e POSTGRES_USER=user \
    -e POSTGRES_PASSWORD=pass \
    -p 5432:5432 \
    -v pgdata:/var/lib/postgresql/data \
    --name db postgres
```

3. Build the backend image:

```
docker build -t uaim_backend .
```

4. Run the backend container:

```
docker run --rm -p 8800:8800 \
    --env-file app/.env \
    --name uaim_backend \
    uaim_backend
```

The backend will be available at [http://localhost:8800](http://localhost:8800).
