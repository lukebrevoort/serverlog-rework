from typing import List

from pydantic import BaseModel, Field


class EncryptRequest(BaseModel):
    key: str = Field(..., description="Public key in PEM format")
    data: str = Field(..., description="Data to encrypt")


class DecryptRequest(BaseModel):
    key: str = Field(..., description="Private key in PEM format")
    data: str = Field(..., description="Encrypted data to decrypt")


class CryptoResponse(BaseModel):
    data: str


class LogResponse(BaseModel):
    id: str
    timestamp: int
    ip: str
    data: str
    operation: str

    class Config:
        from_attributes = True

class KeyPairResponse(BaseModel):
    public_key: str
    private_key: str

    class Config:
        json_schema_extra = {
            "example": {
                "public_key": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
                "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
            }
        }

class LogsResponse(BaseModel):
    logs: List[LogResponse]
    total: int
    size: int
    offset: int
