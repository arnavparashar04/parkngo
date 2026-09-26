from sqlalchemy import Column, String, Float, Boolean, JSON, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from ..database.connection import Base

def generate_uuid():
    return str(uuid.uuid4())

class ParkingSpaceModel(Base):
    __tablename__ = "parking_spaces"

    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    
    price_per_hour = Column(Float, nullable=False)
    daily_max_price = Column(Float, nullable=True)
    
    total_spots = Column(Integer, default=1)
    available_spots = Column(Integer, default=1)
    
    rating = Column(Float, default=5.0)
    total_reviews = Column(Integer, default=0)
    
    # JSON arrays for flexibility
    compatible_vehicles = Column(JSON, default=lambda: ["SUV", "Sedan", "Hatchback", "Bike"])
    amenities = Column(JSON, default=lambda: ["Covered", "CCTV", "24/7 Access"])
    images = Column(JSON, default=list)  # URLs of uploaded images
    
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("UserModel", back_populates="spaces")
    bookings = relationship("BookingModel", back_populates="space", cascade="all, delete-orphan")
    reviews = relationship("ReviewModel", back_populates="space", cascade="all, delete-orphan")
