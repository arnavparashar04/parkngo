from fastapi import APIRouter, Query, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from ..services.recommendation import get_recommended_parking
from ..database.connection import get_db
from ..models.parking import ParkingSpaceModel
import uuid

router = APIRouter(prefix="/parking", tags=["parking"])

class ParkingSpace(BaseModel):
    id: str
    latitude: float
    longitude: float
    price_per_hour: float
    distance: float = 0.0
    rating: float
    name: str
    recommendation_score: float = 0.0
    compatible_vehicles: List[str]
    is_active: bool

    class Config:
        from_attributes = True

mock_parking_spaces = [
    {
        "id": "parking_123",
        "latitude": 12.9353,
        "longitude": 77.5348,
        "price_per_hour": 30.0,
        "rating": 4.7,
        "name": "PES University Parking",
        "compatible_vehicles": ["Bike", "Scooter", "Hatchback", "Sedan", "SUV"],
        "is_active": True
    },
    {
        "id": "parking_124",
        "latitude": 12.9360,
        "longitude": 77.5355,
        "price_per_hour": 20.0,
        "rating": 5.0,
        "name": "Residential Parking",
        "compatible_vehicles": ["Bike", "Scooter", "Hatchback", "Sedan"],
        "is_active": True
    },
    {
        "id": "parking_125",
        "latitude": 12.9370,
        "longitude": 77.5360,
        "price_per_hour": 50.0,
        "rating": 4.2,
        "name": "Premium Covered Spot",
        "compatible_vehicles": ["Sedan", "SUV", "Pickup / Large Vehicle"],
        "is_active": True
    }
]

@router.post("/seed")
def seed_database(db: Session = Depends(get_db)):
    """Seeds the DB with mock parking spaces if empty."""
    existing = db.query(ParkingSpaceModel).first()
    if existing:
        return {"message": "Database already seeded."}
        
    for data in mock_parking_spaces:
        new_space = ParkingSpaceModel(
            id=data["id"],
            name=data["name"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            price_per_hour=data["price_per_hour"],
            rating=data["rating"],
            compatible_vehicles=data["compatible_vehicles"],
            is_active=data["is_active"]
        )
        db.add(new_space)
    db.commit()
    return {"message": "Database seeded successfully!"}

@router.get("/nearby", response_model=List[ParkingSpace])
def get_nearby_parking(
    lat: float = Query(..., description="User latitude"), 
    lng: float = Query(..., description="User longitude"),
    vehicle_type: str = Query("SUV", description="User vehicle type"),
    db: Session = Depends(get_db)
):
    # Fetch active parking spaces from DB
    spaces_db = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.is_active == True).all()
    
    # Convert ORM objects to dicts for the recommendation engine
    spaces_dict = [
        {
            "id": s.id,
            "name": s.name,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "price_per_hour": s.price_per_hour,
            "rating": s.rating,
            "compatible_vehicles": s.compatible_vehicles,
            "is_active": s.is_active
        }
        for s in spaces_db
    ]

    # Pass through smart recommendation engine
    recommended = get_recommended_parking(lat, lng, vehicle_type, spaces_dict)
    return recommended

@router.get("/{parking_id}", response_model=ParkingSpace)
def get_parking_details(parking_id: str, db: Session = Depends(get_db)):
    space = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.id == parking_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Parking space not found")
    
    # We must construct the response to include required 'distance' which might not be stored in DB natively
    return ParkingSpace(
        id=space.id,
        name=space.name,
        latitude=space.latitude,
        longitude=space.longitude,
        price_per_hour=space.price_per_hour,
        rating=space.rating,
        distance=0.0,
        compatible_vehicles=space.compatible_vehicles,
        is_active=space.is_active
    )
