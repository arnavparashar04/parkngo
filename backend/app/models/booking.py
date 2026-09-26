from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from ..database.connection import Base

def generate_uuid():
    return str(uuid.uuid4())

class BookingModel(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    space_id = Column(String, ForeignKey("parking_spaces.id"), nullable=False, index=True)
    
    vehicle_plate = Column(String, nullable=False)
    vehicle_type = Column(String, nullable=True)
    
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    total_hours = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    status = Column(String, default="upcoming", index=True)  # upcoming, active, completed, cancelled
    qr_code_token = Column(String, unique=True, default=generate_uuid)
    payment_status = Column(String, default="paid")           # paid, pending, refunded
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("UserModel", back_populates="bookings")
    space = relationship("ParkingSpaceModel", back_populates="bookings")
