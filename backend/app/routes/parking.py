from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List
from ..services.recommendation import get_recommended_parking

router = APIRouter(prefix="/parking", tags=["parking"])

class ParkingSpace(BaseModel):
    id: str
    latitude: float
    longitude: float
    price_per_hour: float
    distance: float
    rating: float
    name: str
    recommendation_score: float = 0.0
    compatible_vehicles: List[str]
    is_active: bool

mock_parking_spaces = [
    {
        "id": "parking_123",
        "latitude": 12.9353,
        "longitude": 77.5348,
        "price_per_hour": 30,
        "rating": 4.7,
        "name": "PES University Parking",
        "compatible_vehicles": ["Bike", "Scooter", "Hatchback", "Sedan", "SUV"],
        "is_active": True
    },
    {
        "id": "parking_124",
        "latitude": 12.9360,
        "longitude": 77.5355,
        "price_per_hour": 20,
        "rating": 5.0,
        "name": "Residential Parking",
        "compatible_vehicles": ["Bike", "Scooter", "Hatchback", "Sedan"],
        "is_active": True
    },
    {
        "id": "parking_125",
        "latitude": 12.9370,
        "longitude": 77.5360,
        "price_per_hour": 50,
        "rating": 4.2,
        "name": "Premium Covered Spot",
        "compatible_vehicles": ["Sedan", "SUV", "Pickup / Large Vehicle"],
        "is_active": True
    }
]

@router.get("/nearby", response_model=List[ParkingSpace])
def get_nearby_parking(
    lat: float = Query(..., description="User latitude"), 
    lng: float = Query(..., description="User longitude"),
    vehicle_type: str = Query("SUV", description="User vehicle type")
):
    # Pass our mock database through the smart recommendation engine!
    recommended = get_recommended_parking(lat, lng, vehicle_type, mock_parking_spaces.copy())
    return recommended

@router.get("/{parking_id}", response_model=ParkingSpace)
def get_parking_details(parking_id: str):
    for space in mock_parking_spaces:
        if space["id"] == parking_id:
            return space
    return None
