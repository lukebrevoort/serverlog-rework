from sqlalchemy import Column, String, BigInteger, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .database import Base

class LogEntry(Base):
    __tablename__ = "logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(BigInteger, nullable=False, index=True)
    ip = Column(String(45), nullable=False)
    data = Column(Text, nullable=False)
    operation = Column(String(10), nullable=False)  # 'encrypt' or 'decrypt'