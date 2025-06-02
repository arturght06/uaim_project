#!/bin/bash
set -e

# --- PostgreSQL Database ---
DB_CONTAINER_NAME="db"
DB_USER="user"
DB_PASS="pass"
DB_VOLUME="pgdata"

echo "Checking PostgreSQL container '$DB_CONTAINER_NAME'..."
if ! docker ps -q -f name=^${DB_CONTAINER_NAME}$ -f status=running | grep -q .; then
    echo "PostgreSQL container '$DB_CONTAINER_NAME' is not running."
    if docker ps -aq -f name=^${DB_CONTAINER_NAME}$ | grep -q .; then
        echo "Container '$DB_CONTAINER_NAME' exists but is stopped. Starting it..."
        docker start ${DB_CONTAINER_NAME}
    else
        echo "Container '$DB_CONTAINER_NAME' does not exist. Creating and starting it..."
        docker run -d \
            -e POSTGRES_USER=${DB_USER} \
            -e POSTGRES_PASSWORD=${DB_PASS} \
            -p 5432:5432 \
            --restart unless-stopped \
            -v ${DB_VOLUME}:/var/lib/postgresql/data \
            --name ${DB_CONTAINER_NAME} postgres
    fi
    echo "Waiting for PostgreSQL to initialize (10 seconds)..."
    sleep 10
else
    echo "PostgreSQL container '$DB_CONTAINER_NAME' is already running."
fi
echo "--- PostgreSQL setup complete ---"
echo ""

# --- Backend Deployment ---
BACKEND_DIR="backend"
BACKEND_IMAGE_NAME="uaim_backend"
BACKEND_CONTAINER_NAME="uaim_backend"

echo "Deploying backend..."
# Stop and remove existing backend container if it exists
if docker ps -aq -f name="^/${BACKEND_CONTAINER_NAME}$" | grep -q .; then
    echo "Stopping and removing existing backend container '${BACKEND_CONTAINER_NAME}'..."
    docker stop "${BACKEND_CONTAINER_NAME}" || echo "Backend container '${BACKEND_CONTAINER_NAME}' was not running or already stopped."
    docker rm "${BACKEND_CONTAINER_NAME}" || echo "Backend container '${BACKEND_CONTAINER_NAME}' could not be removed (it might have been already removed)."
else
    echo "No existing backend container named '${BACKEND_CONTAINER_NAME}' found."
fi

echo "Navigating to backend directory: $BACKEND_DIR"
cd "$BACKEND_DIR" || { echo "Failed to navigate to $BACKEND_DIR"; exit 1; }

echo "Building backend Docker image '$BACKEND_IMAGE_NAME'..."
docker build -t "$BACKEND_IMAGE_NAME" .

echo "Running backend Docker container '$BACKEND_CONTAINER_NAME'..."
# Ensure app/.env exists before trying to use it
if [ ! -f "app/.env" ]; then
    echo "Error: backend/app/.env file not found!"
    echo "Please create it as per backend/README.md instructions."
    cd ..
    exit 1
fi

docker run -d -p 8800:8800 \
    --env-file app/.env \
    --name "$BACKEND_CONTAINER_NAME" \
    --restart unless-stopped \
    "$BACKEND_IMAGE_NAME"

echo "Backend deployment complete. Container '$BACKEND_CONTAINER_NAME' is running."
cd .. 
echo "--- Backend deployment complete ---"
echo ""

# --- Website Deployment ---
WEBSITE_DIR="website"
WEBSITE_IMAGE_NAME="uaim_website"
WEBSITE_CONTAINER_NAME="uaim_website"

echo "Deploying website..."
# Stop and remove existing website container if it exists
if docker ps -aq -f name="^/${WEBSITE_CONTAINER_NAME}$" | grep -q .; then
    echo "Stopping and removing existing website container '${WEBSITE_CONTAINER_NAME}'..."
    docker stop "${WEBSITE_CONTAINER_NAME}" || echo "Website container '${WEBSITE_CONTAINER_NAME}' was not running or already stopped."
    docker rm "${WEBSITE_CONTAINER_NAME}" || echo "Website container '${WEBSITE_CONTAINER_NAME}' could not be removed (it might have been already removed)."
else
    echo "No existing website container named '${WEBSITE_CONTAINER_NAME}' found."
fi

echo "Navigating to website directory: $WEBSITE_DIR"
cd "$WEBSITE_DIR" || { echo "Failed to navigate to $WEBSITE_DIR"; exit 1; }

echo "Building website Docker image '$WEBSITE_IMAGE_NAME'..."
docker build -t "$WEBSITE_IMAGE_NAME" .

echo "Running website Docker container '$WEBSITE_CONTAINER_NAME'..."
docker run -d -p 5173:5173 \
    --name "$WEBSITE_CONTAINER_NAME" \
    --restart unless-stopped \
    "$WEBSITE_IMAGE_NAME"

echo "Website deployment complete. Container '$WEBSITE_CONTAINER_NAME' is running."
cd ..
echo "--- Website deployment complete ---"
echo ""

echo "Deployment finished successfully!"
echo "Backend should be available at http://localhost:8800"
echo "Website should be available at http://localhost:5173"

