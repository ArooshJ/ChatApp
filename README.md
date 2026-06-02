# ChatApp — Distributed Real-time Chat with AI Assist

A distributed chat application built for the SPIT TE Distributed Computing course. Supports real-time DMs and group chats over WebSocket, with async message persistence via Celery and an AI message-assist feature powered by a local Ollama server.

---

## Architecture Overview

```
                        ┌─────────────────────────────────────┐
  Browser ──── HTTP/WS ─►           nginx (port 80)           │
                        │  /          → React static files    │
                        │  /api/      → Django REST (JWT)     │
                        │  /chat/     → Django REST (chat)    │
                        │  /ws/       → WebSocket upgrade     │
                        └────────────┬────────────────────────┘
                                     │
                             ┌───────▼────────┐
                             │  Django/Daphne │  (ASGI)
                             │  + Channels    │
                             └───┬───────┬────┘
                                 │       │ .delay()
                          WS pub/sub  ┌──▼──────────┐
                                 │   │ Celery Worker│
                        ┌────────▼───┴──────────────┤
                        │         Redis              │
                        │  DB 0: broker + pub/sub    │
                        │  DB 1: result backend      │
                        └────────────────────────────┘
                                     │ ORM
                               ┌─────▼──────┐
                               │  MySQL 8.0 │
                               └────────────┘

  Separately (GPU laptop on LAN):
  Browser ──── POST /generate ──► Flask + Ollama (Llama 3.2)  :5000
```

---

## Stack

| Component | Tech |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, React Router v7 |
| Backend | Django 5.1, Django REST Framework, Daphne (ASGI) |
| Real-time | Django Channels, WebSocket |
| Auth | JWT via `djangorestframework-simplejwt` |
| Async tasks | Celery |
| Message broker / Channels layer | Redis (Alpine) |
| Database | MySQL 8.0 |
| Gateway | nginx |
| AI server | Flask + Ollama (Llama 3.2), runs on GPU laptop |
| Infra | Docker Compose |

---

## Services (docker-compose)

| Service | Role |
|---|---|
| `nginx` | Reverse proxy, serves built React SPA, upgrades WebSocket |
| `backend` | Django + Daphne ASGI — handles HTTP REST and WebSocket connections |
| `celery_worker` | Processes `process_chat_message` tasks: saves message to MySQL, broadcasts to room group |
| `redis` | Dual role: Celery broker (db 0) + Django Channels pub/sub layer |
| `db` | MySQL 8.0, persistent via Docker volume `mysql_data` |

The LLM server (`LLMserver/`) is **not** in the compose file — it runs standalone on a separate GPU machine on the same LAN.

---

## Message Flow

```
Client sends WS message
        │
        ▼
ChatConsumer.receive()
        │
        ▼ process_chat_message.delay(room_id, username, content)
        │
  [Redis broker queue]
        │
        ▼
Celery Worker:
  1. Message.objects.create(...)   → MySQL
  2. channel_layer.group_send(...)  → Redis pub/sub
        │
        ▼
ChatConsumer.chat_message()  (all clients in room group)
        │
        ▼
WebSocket send to each browser
```

The consumer offloads persistence entirely to Celery — it never writes to the DB directly. This keeps the async WebSocket consumer non-blocking.

---

## AI Assist (Meta AI replication)

Inspired by Meta AI in WhatsApp. Instead of an AI that *replies to you*, it writes messages *as you* — given a rough prompt, it drafts the message in first person.

**Server:** `LLMserver/llm_server.py` — Flask app, port 5000, runs on a GPU laptop at `10.10.114.9`.

```
POST http://10.10.114.9:5000/generate
Body: { "prompt": "apologise to mom for coming home late", "tone": "casual" }
Response: { "response": "Hey mom, I'm really sorry I got home so late today..." }
```

- Model: `llama3.2` via `ollama run`
- System prompt explicitly instructs the model to write from the user's POV, not reply to them
- Tone parameter accepted (neutral, formal, casual, etc.)

The frontend hits this server directly (`ChatFrontend/src/api/llm.js`) — it bypasses nginx and the Django backend entirely.

---

## Data Models

```
UserProfile     — extends Django User (is_admin, bio)
Room            — name, members (M2M → User), admin (FK → User), is_dm flag
Message         — room (FK), sender (FK → User), content, timestamp
```

DM rooms and group rooms share the same `Room` model, distinguished by `is_dm=True`. Members can join/leave group rooms freely; DM rooms lock membership.

---

## Auth

JWT via `simplejwt`. Login returns `access` + `refresh` tokens and user info in one response. Tokens are stored in cookies on the frontend. WebSocket connections fall back to a `?user=<username>` query param when the WS handshake can't carry the JWT header.

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/token/` | Login — returns access, refresh, user |
| POST | `/api/token/refresh/` | Refresh access token |
| POST | `/chat/signup/` | Register new user |
| GET | `/chat/rooms/` | All rooms |
| POST | `/chat/rooms/` | Create room |
| GET | `/chat/rooms/my_rooms/` | Rooms current user belongs to |
| GET | `/chat/rooms/available_rooms/` | Non-DM rooms user hasn't joined |
| POST | `/chat/rooms/{id}/join/` | Join a group room |
| POST | `/chat/rooms/{id}/leave/` | Leave a group room |
| POST | `/chat/rooms/{id}/add_member/` | Add a user to a group room |
| GET | `/chat/rooms/{id}/members/` | List room members |
| GET | `/chat/history/{room_id}/` | Paginated message history |
| GET | `/chat/users/` | All registered users |

---

## Running Locally

### Prerequisites
- Docker + Docker Compose
- Node.js (for building the frontend)
- A separate machine with Ollama installed for the LLM server (optional)

### 1. Configure environment

Create a `.env` file in the project root:

```env
MYSQL_DATABASE=chatdb
MYSQL_USER=chatuser
MYSQL_PASSWORD=yourpassword
MYSQL_HOST=db
MYSQL_PORT=3306
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/1
```

### 2. Build and start the Docker stack

```bash
docker compose up --build
```

This starts nginx (`:80`), Django backend, Celery worker, Redis, and MySQL.

### 3. Run database migrations

```bash
docker compose exec backend python manage.py migrate
```

### 4. Build the frontend and inject into nginx

```bash
cd ChatFrontend
npm install
npm run build
```

The nginx Dockerfile does **not** copy the frontend build automatically. You need to either:
- Volume-mount the `dist/` folder into `/usr/share/nginx/html` in `docker-compose.yml`, or
- Add a `COPY` step to `nginx/Dockerfile` (multi-stage build recommended):
  ```dockerfile
  COPY --from=frontend-build /app/dist /usr/share/nginx/html
  ```

### 5. (Optional) Scale the backend

The nginx config uses Docker's internal DNS resolver with an upstream block, so horizontal scaling works out of the box:

```bash
docker compose up --scale backend=3
```

nginx will round-robin across all backend instances.

### 5. (Optional) Start the LLM server

On the GPU machine:

```bash
cd LLMserver
pip install flask flask-cors
ollama pull llama3.2
python llm_server.py
```

Then update `ChatFrontend/src/routes/llmRoute.js` with the GPU machine's LAN IP:

```js
const API_BASE_URL = "http://<GPU_MACHINE_IP>:5000";
```

---

## Demo Notes

Demoed on a local LAN with the main laptop as server and a few client PCs. Tested DMs and group chats with up to 4 simultaneous users. LLM assist ran on a separate GPU laptop running Ollama with Llama 3.2.