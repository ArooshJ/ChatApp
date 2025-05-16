# ChatApp - Real-time Chat Application

This is a real-time chat application built using a modern Python/Django stack, featuring asynchronous task processing with Celery and real-time communication via Django Channels, all orchestrated with Docker Compose. The frontend is built with React JS.

## Features

* **Real-time Messaging:** Instant message sending and receiving in chat rooms.
* **User Authentication:** Secure user login and registration.
* **Chat Room Management:** Ability to join and participate in different chat rooms.
* **Message Persistence:** Chat messages are saved to a database.
* **Asynchronous Task Processing:** Offloads background tasks (like saving messages and broadcasting) using Celery.
* **Containerized Architecture:** Each component runs in its own Docker container for isolation and portability.
* **Load Balancing:** Nginx distributes traffic across multiple backend instances.

## Technologies Used

* **Frontend:** React JS
* **Backend:** Django (Python Web Framework)
* **ASGI Server:** Uvicorn / Daphne
* **Real-time:** Django Channels
* **Channel Layer & Message Broker:** Redis
* **Asynchronous Task Queue:** Celery
* **Database:** MySQL
* **Web Server / Reverse Proxy:** Nginx
* **Container Orchestration:** Docker Compose

## Architecture Overview

The application follows a distributed architecture composed of several interacting services:

1.  **React Frontend:** The client-side application running in the user's browser.
2.  **Nginx:** Acts as the entry point, routing HTTP requests to the Django backend and proxying WebSocket connections to the appropriate backend instance.
3.  **Django Backend:** Handles API requests, user authentication, and manages WebSocket connections via Django Channels. It dispatches background tasks to Celery.
4.  **Redis:** Serves as both the Channel Layer backend for real-time message passing between backend instances and the Message Broker/Result Backend for Celery tasks.
5.  **Celery Worker:** Consumes tasks from the Redis broker and executes background jobs like saving messages to the database and broadcasting them via the Channel Layer.
6.  **MySQL Database:** Stores all persistent application data.

Docker Compose is used to define, build, and run this multi-container application stack, ensuring consistency and ease of deployment.

## Setup Instructions

### Prerequisites

* Docker Desktop (includes Docker Engine and Docker Compose) installed and running on your system.
* Git installed.

### Steps

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```
    (Replace `<repository_url>` and `<repository_directory>` with your actual repository details)

2.  **Create Environment File:**
    Create a `.env` file in the root directory of the project (where `docker-compose.yml` is located). This file will store sensitive information and configuration variables.
    ```env
    # .env file

    # Django Secret Key (replace with a strong, unique key)
    SECRET_KEY='your_django_secret_key'

    # MySQL Database Configuration
    MYSQL_DATABASE=chatdb
    MYSQL_USER=chatuser
    MYSQL_PASSWORD=chatpass
    MYSQL_HOST=db # Service name of the database container
    MYSQL_PORT=3306

    # Celery Broker and Result Backend URLs
    # Use the service name 'redis_cache' for the Redis container
    CELERY_BROKER_URL=redis://redis_cache:6379/0
    CELERY_RESULT_BACKEND=redis://redis_cache:6379/1

    # Add any other necessary environment variables here
    ```
    **Note:** Replace `'your_django_secret_key'` with a unique, randomly generated key.

3.  **Build and Run the Docker Containers:**
    Open your terminal in the project's root directory and run the following command. This will build the necessary Docker images and start all the services defined in `docker-compose.yml`.
    ```bash
    docker compose up -d --build --force-recreate --scale backend=3
    ```
    * `-d`: Runs the containers in detached mode (in the background).
    * `--build`: Builds the Docker images before starting containers.
    * `--force-recreate`: Recreates containers even if their configuration hasn't changed.
    * `--scale backend=3`: Starts 3 instances of the backend service for basic load balancing demonstration.

4.  **Apply Django Migrations:**
    Once the containers are running, you need to apply the database migrations to set up the database schema. You can do this by executing the `migrate` command inside one of the backend containers.
    ```bash
    docker compose exec backend-1 python manage.py migrate
    ```
    (If you scaled the backend, you can pick any instance, e.g., `backend-1`).

5.  **Create a Django Superuser (Optional but Recommended):**
    To access the Django admin panel, you can create a superuser:
    ```bash
    docker compose exec backend-1 python manage.py createsuperuser
    ```
    Follow the prompts to create a username, email, and password.

## How to Use

1.  **Access the Application:**
    Once all containers are up and migrations are applied, the application should be accessible via Nginx on your host machine.
    * The backend API and WebSocket endpoints are proxied through Nginx, typically on `http://localhost`.
    * The React frontend should be served separately (you would need to run the frontend development server or serve its build files). Assuming your frontend is configured to communicate with the backend at `http://localhost`, you can access the chat application through your frontend's entry point.

2.  **Interact with the Chat:**
    Use the React frontend to register/login users, join rooms, and send messages. Messages sent should appear in real-time for all users in the same room.

## Distributed Computing Concepts Used

This project effectively demonstrates several key concepts in building distributed systems:

* **Channel Layer (using Redis):** The Channel Layer is a core component of Django Channels that enables communication between different instances of your application and between different parts of your application (like consumers and tasks). By using Redis as the backend, messages sent to a specific "group" (representing a chat room) are efficiently published to Redis, and all connected consumers subscribed to that group receive the message. This allows real-time updates to be distributed across multiple backend servers and connected clients without direct peer-to-peer connections between consumers.

* **Message-Oriented Middleware (MoM) / Redis Broker:** Message-Oriented Middleware is a software architectural pattern that facilitates communication between distributed applications through the exchange of messages. A broker acts as an intermediary, receiving messages from sending applications (producers) and making them available to receiving applications (consumers). In this project, Redis serves as the MoM broker for Celery. When the backend dispatches a task, it sends a message to a queue in Redis. The Celery worker retrieves and processes messages from this queue. This pattern decouples the backend (producer) from the worker (consumer), allowing them to operate independently and asynchronously, improving system resilience and scalability.

* **Docker and Containerization:** Containerization involves bundling an application and all its dependencies into a standardized, isolated unit called a container. Docker is a platform for building, sharing, and running these containers. Using Docker ensures that each service (backend, database, Redis, etc.) runs in a consistent environment, regardless of the underlying infrastructure. This simplifies development setup, eliminates "it works on my machine" problems, and makes deployment more reliable.

* **Three-Tier Architecture:** While modern architectures often evolve beyond strict tiers, this project broadly aligns with the three-tier pattern: the React Frontend acts as the presentation tier, the Django Backend serves as the application tier (handling business logic and APIs), and the MySQL database is the data tier. The inclusion of Redis and Celery adds layers for messaging and background processing, enhancing the application tier's capabilities and introducing distributed aspects.

* **Load Balancing (with Nginx):** Load balancing is the process of distributing incoming network traffic across multiple servers to ensure no single server is overwhelmed. Nginx is configured as a reverse proxy to receive all incoming requests and then forward them to one of the available backend container instances. This improves the application's responsiveness by distributing the workload and increases its availability by ensuring that if one backend instance fails, traffic can be redirected to others. Our setup uses Nginx's ability to dynamically discover backend instances via Docker's internal DNS.

## Advantages of This Architecture

This chosen architecture provides several significant advantages for building a real-time chat application:

* **Enhanced Scalability:** Each service can be scaled independently based on its specific performance needs. This allows the application to handle increased user load, message volume, or background processing tasks by simply adding more container instances for the relevant services.

* **Improved Responsiveness:** By offloading time-consuming tasks to Celery workers, the main backend process remains free to handle real-time WebSocket connections quickly, providing a smooth and immediate user experience.

* **Increased Reliability and Resilience:** The use of a robust message broker (Redis) ensures tasks are not lost if workers or backend instances fail. Containerization provides isolation, preventing cascading failures.

* **Simplified Development and Deployment:** Docker Compose streamlines the setup of the complex multi-service environment, making it easier for developers to get started and for the application to be deployed consistently across different environments.

* **Clear Separation of Concerns:** Breaking the application into distinct services with well-defined roles makes the codebase more modular, easier to understand, maintain, and allows teams to work on different parts of the system independently.

This architecture provides a robust, scalable, and maintainable foundation for a real-time application, demonstrating best practices in modern distributed system design.

