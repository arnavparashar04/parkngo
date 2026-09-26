from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/parking", tags=["parking"])

class ParkingSpace(BaseModel):
    id: str
    latitude: float
    longitude: float
    price_per_hour: float
    distance: float
    rating: float
    vehicle_compatible: bool
    covered: bool
    name: str

mock_parking_spaces = [
    {
        "id": "parking_123",
        "latitude": 12.9353,
        "longitude": 77.5348,
        "price_per_hour": 30,
        "distance": 180,
        "rating": 4.7,
        "vehicle_compatible": True,
        "covered": True,
        "name": "PES University Parking"
    },
    {
        "id": "parking_124",
        "latitude": 12.9360,
        "longitude": 77.5355,
        "price_per_hour": 20,
        "distance": 350,
        "rating": 5.0,
        "vehicle_compatible": True,
        "covered": False,
        "name": "Residential Parking"
    }
]

@router.get("/nearby", response_model=List[ParkingSpace])
def get_nearby_parking(lat: float, lng: float):
    # Mocking nearby parking
    return mock_parking_spaces

@router.get("/{parking_id}", response_model=ParkingSpace)
def get_parking_details(parking_id: str):
    for space in mock_parking_spaces:
        if space["id"] == parking_id:
            return space
    return None
