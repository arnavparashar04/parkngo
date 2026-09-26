from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from ..database.connection import Base

def generate_uuid():
    return str(uuid.uuid4())

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    role = Column(String, default="driver")  # "driver", "owner", or "both"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    vehicles = relationship("VehicleModel", back_populates="owner", cascade="all, delete-orphan")
    bookings = relationship("BookingModel", back_populates="user", cascade="all, delete-orphan")
    spaces = relationship("ParkingSpaceModel", back_populates="owner", cascade="all, delete-orphan")

class VehicleModel(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    make = Column(String, nullable=False)           # e.g., "Tata", "Hyundai", "Honda"
    model = Column(String, nullable=False)          # e.g., "Nexon EV", "Creta", "Activa"
    license_plate = Column(String, nullable=False)  # e.g., "KA 05 MN 1234"
    vehicle_type = Column(String, nullable=False)   # "SUV", "Sedan", "Hatchback", "Bike", "Electric"
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("UserModel", back_populates="vehicles")
