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

### Important Note for Developers

The Docker images (`alamesa-backend` and `alamesa-frontend`) contain the *built* versions of the applications, not the raw source code. When another developer clones this repository, they get the source code, `Dockerfile`s, and `docker-compose.yml`. The `docker compose up --build -d` command will then build the application within the Docker containers, ensuring a consistent development environment.