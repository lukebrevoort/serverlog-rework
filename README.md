# SecureLog - End-to-End Encryption Service

A full-stack encryption service built with React, FastAPI, and PostgreSQL that provides RSA encryption/decryption capabilities with comprehensive request logging built for the Blueprint Developer Challenge!

**Live Demo**: [https://securelog-web.fly.dev/](https://securelog-web.fly.dev/)

## Architecture Overview

```mermaid
graph TB
    subgraph Client["Client Browser"]
        UI["React + Vite + TailwindCSS"]
    end
    
    subgraph FlyIO["Fly.io Cloud Platform"]
        subgraph WebApp["Web App (securelog-web)"]
            NGINX["Nginx Server<br/>Static File Server<br/>Reverse Proxy"]
        end
        
        subgraph APIApp["API App (securelog-api)"]
            API["FastAPI Endpoints"]
            ENCRYPT["POST /api/v1/encrypt"]
            DECRYPT["POST /api/v1/decrypt"]
            LOGS["GET /api/v1/logs"]
            CRYPTO["RSA-OAEP Encryption<br/>(cryptography library)"]
            
            API --> ENCRYPT
            API --> DECRYPT
            API --> LOGS
            ENCRYPT --> CRYPTO
            DECRYPT --> CRYPTO
        end
        
        subgraph DBApp["Database (securelog-db)"]
            DB[(PostgreSQL)]
            SCHEMA["• id: UUID<br/>• timestamp: UNIX<br/>• ip: String<br/>• data: Text<br/>• operation: String"]
            DB -.schema.- SCHEMA
        end
    end
    
    UI -->|HTTPS| NGINX
    NGINX -->|Internal Network| API
    CRYPTO -->|SQLAlchemy ORM| DB
    LOGS -->|Query| DB

    style Client fill:#e1f5ff
    style FlyIO fill:#f0f0f0
    style WebApp fill:#fff4e1
    style APIApp fill:#ffe1f5
    style DBApp fill:#e1ffe1
    style CRYPTO fill:#ffd1d1
    style DB fill:#c8e6c9
```

## Features

- **RSA-2048 Encryption/Decryption**: Secure RSA-OAEP encryption with SHA-256
- **Key Generation**: Built-in RSA key pair generator (**DEVELOPMENT/TESTING ONLY**)
- **Request Logging**: All encryption/decryption operations logged to PostgreSQL
- **Paginated Logs**: Browse historical requests with pagination
- **Comprehensive Error Handling**: Detailed, user-friendly error messages
- **Dark/Light Theme**: Toggle between themes with system preference support
- **Responsive Design**: Mobile-first responsive UI
- **Cloud Deployment**: Hosted on Fly.io with separate web, API, and database services
- **Docker Compose**: Full-stack containerized local development
- **CI/CD**: GitHub Actions workflows for linting

## Live Demo

🌐 **Production URL**: [https://securelog-web.fly.dev/](https://securelog-web.fly.dev/)

The application is deployed on Fly.io with:
- **Web App**: Static frontend served via Nginx
- **API Service**: FastAPI backend
- **Database**: PostgreSQL database
- All services communicate over Fly.io's private network

## Quick Start

### Prerequisites

- Docker Desktop (recommended) or Docker Engine + Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Running with Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/securelog.git
   cd securelog
   ```

2. **Start all services**
   ```bash
   docker compose up --build
   ```

3. **Access the application**
   - Web UI: http://localhost
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Stop services**
   ```bash
   docker compose down
   ```

### Local Development Setup

#### Backend (FastAPI)

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or use .env file)
export DATABASE_URL="postgresql://secureloguser:securelogpass@localhost:5432/securelogdb"

# Run development server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (React + Vite)

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend dev server will run on http://localhost:5173 and proxy API requests to http://localhost:8000.

#### Database (PostgreSQL)

```bash
# Run PostgreSQL with Docker
docker run -d \
  --name securelog-postgres \
  -e POSTGRES_USER=secureloguser \
  -e POSTGRES_PASSWORD=securelogpass \
  -e POSTGRES_DB=securelogdb \
  -p 5432:5432 \
  postgres:15-alpine
```

## API Documentation

### Base URLs
- **Production**: `https://securelog-web.fly.dev`
- **Local Development**: `http://localhost:8000`

### Endpoints

#### 1. Encrypt Data
**POST** `/api/v1/encrypt`

Encrypts plaintext data using an RSA public key.

**Request Body:**
```json
{
  "key": "-----BEGIN PUBLIC KEY-----\nMIIBIjAN...\n-----END PUBLIC KEY-----",
  "data": "Hello, SecureLog!"
}
```

**Response:**
```json
{
  "data": "base64_encoded_encrypted_data"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/v1/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "key": "-----BEGIN PUBLIC KEY-----\nYOUR_PUBLIC_KEY\n-----END PUBLIC KEY-----",
    "data": "Secret message"
  }'
```

#### 2. Decrypt Data
**POST** `/api/v1/decrypt`

Decrypts encrypted data using an RSA private key.

**Request Body:**
```json
{
  "key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIB...\n-----END PRIVATE KEY-----",
  "data": "base64_encoded_encrypted_data"
}
```

**Response:**
```json
{
  "data": "Hello, SecureLog!"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/v1/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----",
    "data": "encrypted_data_here"
  }'
```

#### 3. Get Logs
**GET** `/api/v1/logs?size=10&offset=0`

Retrieves paginated request logs.

**Query Parameters:**
- `size` (optional, default: 10, max: 100): Number of logs per page
- `offset` (optional, default: 0): Number of logs to skip

**Response:**
```json
{
  "logs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": 1704067200,
      "ip": "172.18.0.1",
      "data": "Encrypted: Hello, SecureLog!... -> base64data...",
      "operation": "encrypt"
    }
  ],
  "total": 42,
  "size": 10,
  "offset": 0
}
```

**Example cURL:**
```bash
curl http://localhost:8000/api/v1/logs?size=10&offset=0
```

#### 4. Generate RSA Key Pair
**POST** `/api/v1/generate-keys`

**IMPORTANT: FOR DEVELOPMENT/TESTING ONLY** 

This endpoint generates RSA key pairs for **internal testing and development purposes only**. In production environments, users should generate their own keys using secure, offline methods. This feature is included to facilitate easier testing and error checking during development.

**Response:**
```json
{
  "public_key": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/v1/generate-keys
```

**Security Note:** Never use server-generated private keys in production. Always generate keys locally using tools like:
```bash
# Generate private key
openssl genrsa -out private_key.pem 2048

# Extract public key
openssl rsa -in private_key.pem -pubout -out public_key.pem
```

## Security Considerations

### Encryption Details
- **Algorithm**: RSA-OAEP (Optimal Asymmetric Encryption Padding)
- **Key Size**: 2048-bit RSA keys
- **Hashing**: SHA-256 for OAEP padding and MGF1
- **Maximum Payload**: ~190 bytes per encryption (for 2048-bit keys)

### Key Management Best Practices
1. **Never share private keys** - Keep them secure and offline
2. **Generate keys offline** - Use OpenSSL or similar tools locally
3. **Rotate keys periodically** - Especially if they may be compromised
4. **Use environment variables** - Never hardcode keys in your application
5. **Client-side generation** - Consider generating keys in the browser for maximum security

### Error Handling
The API provides detailed, user-friendly error messages for:
- Invalid key formats (missing headers, invalid base64, wrong key type)
- Password-protected keys (not supported)
- Data too large for encryption
- Decryption failures (wrong key, corrupted data)
- Network and server errors

## Testing

### Generate Test Keys

Use the built-in key generator (development only):
```bash
curl -X POST http://localhost:8000/api/v1/generate-keys
```

Or use the Python script:
```bash
cd server
python src/generate_keys.py
```

Or use OpenSSL:
```bash
# Generate 2048-bit private key
openssl genrsa -out private_key.pem 2048

# Extract public key
openssl rsa -in private_key.pem -pubout -out public_key.pem
```

Or use the Python script included in the repository:
```bash
cd server
python src/generate_keys.py
```

### Test Encryption Flow

1. Generate a key pair (use any method above)
2. Copy the public key
3. Navigate to the Encrypt tab in the UI
4. Paste the public key and enter some data
5. Click "Encrypt Data"
6. Copy the encrypted result
7. Navigate to the Decrypt tab
8. Paste the private key and encrypted data
9. Click "Decrypt Data"
10. Verify the original data is returned

### Run Backend Tests

```bash
cd server
python src/test_crypto.py
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Sonner** - Toast notifications

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Relational database
- **cryptography** - RSA encryption/decryption
- **pydantic** - Data validation
- **uvicorn** - ASGI server

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server and reverse proxy
- **Fly.io** - Cloud hosting platform
- **GitHub Actions** - CI/CD for linting

## Project Structure

```
securelog/
├── .github/
│   └── workflows/
│       ├── server-lint.yml      # Backend linting
│       └── web-lint.yml         # Frontend linting
├── server/
│   ├── src/
│   │   ├── crypto_utils.py      # Encryption/decryption logic
│   │   ├── database.py          # Database configuration
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # SQLAlchemy models
│   │   └── schemas.py           # Pydantic schemas
│   ├── Dockerfile               # Backend container
│   └── requirements.txt         # Python dependencies
├── web/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API client
│   │   └── App.jsx              # Main app component
│   ├── Dockerfile               # Frontend container
│   ├── nginx.conf               # Nginx configuration
│   └── package.json             # Node dependencies
├── docker-compose.yml           # Multi-container setup
└── README.md                    # This file
```

## Deployment

### Fly.io Production Deployment

The application is deployed on Fly.io with three separate services:

1. **Web App** (`securelog-web`)
   - Nginx serving static React build
   - Reverse proxies API requests to backend
   - HTTPS enabled by default

2. **API Service** (`securelog-api`)
   - FastAPI application
   - Communicates with database over private network
   - Auto-scaling enabled

3. **Database** (`securelog-db`)
   - PostgreSQL database
   - Persistent storage with volumes
   - Private network access only

Visit the live application at: [https://securelog-web.fly.dev/](https://securelog-web.fly.dev/)

### Local Development with Docker

For local development, use Docker Compose to run all services:

```bash
docker compose up --build
```

This starts:
- Web UI on `http://localhost`
- API on `http://localhost:8000`
- PostgreSQL on `localhost:5432`

## CI/CD

### GitHub Actions Workflows

#### Frontend Linting (`web-lint.yml`)
- **Trigger**: Push to any branch
- **Steps**:
  1. Checkout code
  2. Setup Node.js 18
  3. Install dependencies
  4. Run ESLint

#### Backend Linting (`server-lint.yml`)
- **Trigger**: Push to any branch
- **Steps**:
  1. Checkout code
  2. Setup Python 3.11
  3. Install dependencies
  4. Run flake8

## Troubleshooting

### Docker Issues

**Problem**: Services won't start
```bash
# Check if ports are already in use
lsof -i :80    # Web
lsof -i :8000  # API
lsof -i :5432  # Database

# Stop and remove all containers
docker compose down -v

# Rebuild and start
docker compose up --build
```

**Problem**: Database connection errors
```bash
# Check database health
docker compose ps

# View database logs
docker compose logs db

# Recreate database
docker compose down -v
docker compose up --build
```

### Frontend Issues

**Problem**: API requests fail (CORS errors)
- Ensure the backend is running on port 8000
- Check `web/src/services/api.js` for correct API base URL
- Verify CORS middleware in `server/src/main.py`

**Problem**: Build errors
```bash
# Clear node_modules and reinstall
cd web
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

**Problem**: Encryption/decryption fails
- Verify you're using a valid RSA key in PEM format
- Check that public key starts with `-----BEGIN PUBLIC KEY-----`
- Check that private key starts with `-----BEGIN PRIVATE KEY-----`
- Ensure keys aren't password-protected
- Verify the keys are from the same keypair

**Problem**: Database migrations
```bash
# Access database shell
docker compose exec db psql -U secureloguser -d securelogdb

# List tables
\dt

# View table structure
\d logs
```

# Testing 

## Web Testing 
![alt text](image.png)

## Server Testing
![alt text](image-1.png)
## License

This project is open source and available under the MIT License.

## Acknowledgments

- **SecureLog Organization** - For providing the developer challenge
- **shadcn/ui** - Beautiful component library
- **FastAPI** - Excellent Python web framework
- **cryptography library** - Secure encryption implementation

## Contact

For questions or feedback about this project, please open an issue on GitHub.

---

**Built with ❤️ for the Blueprint Developer Challenge**
