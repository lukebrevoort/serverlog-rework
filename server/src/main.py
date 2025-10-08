import time

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .crypto_utils import decrypt_data, encrypt_data
from .database import Base, engine, get_db
from .models import LogEntry as Log
from .schemas import (CryptoResponse, DecryptRequest, EncryptRequest,
                      LogResponse, LogsResponse)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SecureLog API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:80",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_log(db: Session, ip: str, data: str, operation: str):
    """Helper function to create log entry"""
    log = Log(
        timestamp=int(time.time()),
        ip=ip,
        data=data[:500],  # Truncate to avoid huge logs
        operation=operation,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@app.get("/")  # health check endpoint
def root():
    return {"message": "SecureLog API is running"}


@app.post("/api/v1/encrypt", response_model=CryptoResponse)  # encrypt endpoint
async def encrypt_endpoint(
    request: Request, payload: EncryptRequest, db: Session = Depends(get_db)
):
    """Encrypt data with public key"""
    try:
        # Perform encryption
        encrypted_data = encrypt_data(payload.key, payload.data)

        # Log the request
        client_ip = request.client.host
        create_log(
            db=db,
            ip=client_ip,
            data=f"Encrypted: {payload.data[:50]}... -> {encrypted_data[:50]}...",
            operation="encrypt",
        )

        return CryptoResponse(data=encrypted_data)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/api/v1/decrypt", response_model=CryptoResponse)  # decrypt endpoint
async def decrypt_endpoint(
    request: Request, payload: DecryptRequest, db: Session = Depends(get_db)
):
    """Decrypt data with private key"""
    try:
        # Perform decryption
        decrypted_data = decrypt_data(payload.key, payload.data)

        # Log the request
        client_ip = request.client.host
        create_log(
            db=db,
            ip=client_ip,
            data=f"Decrypted: {payload.data[:50]}... -> {decrypted_data[:50]}...",
            operation="decrypt",
        )

        return CryptoResponse(data=decrypted_data)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/v1/logs", response_model=LogsResponse)
def get_logs(
    size: int = Query(10, ge=1, le=100, description="Number of logs per page"),
    offset: int = Query(0, ge=0, description="Number of logs to skip"),
    db: Session = Depends(get_db),
):
    """Get paginated logs"""
    # Get total count
    total = db.query(Log).count()

    # Get paginated logs, ordered by timestamp descending
    logs = db.query(Log).order_by(Log.timestamp.desc()).offset(offset).limit(size).all()

    # Convert to response format
    log_responses = [
        LogResponse(
            id=str(log.id),
            timestamp=log.timestamp,
            ip=log.ip,
            data=log.data,
            operation=log.operation,
        )
        for log in logs
    ]

    return LogsResponse(logs=log_responses, total=total, size=size, offset=offset)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
