# react website

## Launching

1. Install `npm`.

2. Install website dependencies.

```
npm install
```

3. Run the website server.

```
npm run dev
```

## Running with Docker

1. Build the Docker image:
   ```
   docker build -t uaim-website .
   ```

2. Run the container:
   ```
    docker run --rm -p 5173:5173 \
        --env-file app/.env \
        --name uaim-website \
        uaim-website
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.
