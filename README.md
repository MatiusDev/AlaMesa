# AlaMesa

This project consists of a Python FastAPI backend, a JavaScript (Vite/React) frontend, and uses MongoDB and PostgreSQL as databases. The entire application stack can be easily set up and run using Docker Compose.

## Getting Started with Docker Compose

Follow these steps to get the AlaMesa project up and running on your local machine using Docker.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Git**: For cloning the repository.
*   **Docker Desktop** (or Docker Engine and Docker Compose): Docker Desktop includes Docker Engine, Docker CLI client, Docker Compose, Kubernetes, and Credential Helper.

### 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone https://github.com/MatiusDev/AlaMesa.git # Replace with your actual repository URL
cd AlaMesa
```

### 2. Configure Environment Variables (Optional, for local development)

If your backend requires specific environment variables not handled by Docker Compose (e.g., API keys for external services), you might need to create a `.env` file in the `backend/` directory. However, for database connections, these are already configured within `docker-compose.yml`.

### 3. Build and Run the Application Stack

Navigate to the root directory of the project (where `docker-compose.yml` is located) and run the following command:

```bash
docker compose up --build -d
```

*   `docker compose up`: This command reads the `docker-compose.yml` file and starts all the services defined within it (backend, frontend, MongoDB, PostgreSQL).
*   `--build`: This flag forces Docker Compose to rebuild the images for the `backend` and `frontend` services. This is useful when you've made changes to their respective `Dockerfile`s or source code.
*   `-d`: This runs the containers in detached mode, meaning they will run in the background, and your terminal will be free.

The first time you run this, Docker will download the necessary base images, build your backend and frontend applications, and set up the database containers. This process might take a few minutes.

### 4. Access the Application

Once all services are up and running:

*   **Frontend**: Open your web browser and navigate to `http://localhost:3000`.
*   **Backend API**: The backend API will be accessible at `http://localhost:8000`. Your frontend will communicate with this.

### 5. Managing the Application

*   **Check Service Status**: To see the status of your running containers:
    ```bash
docker compose ps
    ```
*   **View Logs**: To view the logs from all services (useful for debugging):
    ```bash
docker compose logs -f
    ```
    (Press `Ctrl+C` to exit the logs stream).
*   **Stop the Application**: To stop all running services:
    ```bash
docker compose down
    ```
*   **Stop and Remove All Data**: To stop all services and remove the containers, networks, and volumes (this will delete your database data!):
    ```bash
docker compose down -v
    ```

### Updating Code Changes

When you make changes to the project's code, you'll need to update the running Docker containers to reflect these changes. The process varies slightly depending on what you've changed:

*   **Backend Code Changes (Python files in `backend/`)**:
    *   Simply save your Python files. The backend is configured with hot-reloading (Uvicorn watches for file changes due to volume mounts and `reload=True` in `main.py`), so the application will automatically restart inside the container. No `docker compose` commands are typically needed.

*   **Frontend Code Changes (JavaScript/CSS/HTML in `frontend/`)**:
    *   Your current frontend setup serves static files built into the Docker image. To see changes, you need to rebuild the frontend image and restart its container:
        ```bash
        docker compose build frontend # Rebuilds only the frontend image
        docker compose up -d frontend # Restarts only the frontend service
        ```
    *   *(Note: For a development workflow with instant hot-module-replacement (HMR) for the frontend, you would need to modify the `frontend` service in `docker-compose.yml` to run Vite's development server with volume mounts, instead of Nginx. This is a more advanced setup for dedicated frontend development environments.)*

*   **Dependency Changes (`backend/requirements.txt` or `frontend/package.json`/`package-lock.json`)**:
    *   If you add, remove, or update dependencies, you must rebuild the respective service's image to install the new dependencies:
        ```bash
        docker compose build <service_name> # e.g., backend or frontend
        docker compose up -d <service_name> # Restart the service
        ```

*   **Dockerfile Changes (in `backend/Dockerfile` or `frontend/Dockerfile`)**:
    *   Any changes to a `Dockerfile` require a rebuild of that service's image:
        ```bash
        docker compose build <service_name>
        docker compose up -d <service_name>
        ```

*   **`docker-compose.yml` Changes**:
    *   If you modify the `docker-compose.yml` file itself (e.g., adding a new service, changing port mappings, updating environment variables), you should run:
        ```bash
        docker compose up -d
        ```
        This command will re-read the configuration and recreate/update services as needed.

### Important Note for Developers

The Docker images (`alamesa-backend` and `alamesa-frontend`) contain the *built* versions of the applications, not the raw source code. When another developer clones this repository, they get the source code, `Dockerfile`s, and `docker-compose.yml`. The `docker compose up --build -d` command will then build the application within the Docker containers, ensuring a consistent development environment.