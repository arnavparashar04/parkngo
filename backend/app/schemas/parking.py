from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ParkingSpaceBase(BaseModel):
    name: str = Field(..., example="Brigade Gateway Safe Spot")
    description: Optional[str] = Field(None, example="Covered basement spot with 24/7 security guard")
    address: str = Field(..., example="Malleshwaram, Bangalore")
    latitude: float = Field(..., example=12.9353)
    longitude: float = Field(..., example=77.5348)
    price_per_hour: float = Field(..., example=30.0)
    daily_max_price: Optional[float] = Field(None, example=250.0)
    total_spots: int = Field(1, example=2)
    compatible_vehicles: List[str] = Field(default=["SUV", "Sedan", "Hatchback", "Bike"])
    amenities: List[str] = Field(default=["Covered", "CCTV", "24/7 Access"])

class ParkingSpaceCreate(ParkingSpaceBase):
    owner_id: Optional[str] = None
    images: Optional[List[str]] = Field(default_factory=list)

class ParkingSpaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_hour: Optional[float] = None
    daily_max_price: Optional[float] = None
    total_spots: Optional[int] = None
    available_spots: Optional[int] = None
    compatible_vehicles: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None

class ParkingSpaceResponse(ParkingSpaceBase):
    id: str
    owner_id: Optional[str] = None
    available_spots: int
    rating: float
    total_reviews: int
    images: List[str] = []
    is_active: bool
    distance: Optional[float] = 0.0
    distance_formatted: Optional[str] = None
    recommendation_score: Optional[float] = 0.0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
