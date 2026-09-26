from sqlalchemy import Column, String, Float, Boolean, JSON
from ..database.connection import Base

class ParkingSpaceModel(Base):
    __tablename__ = "parking_spaces"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    price_per_hour = Column(Float, nullable=False)
    rating = Column(Float, default=0.0)
    # Storing the list of compatible vehicles as a JSON array
    compatible_vehicles = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
