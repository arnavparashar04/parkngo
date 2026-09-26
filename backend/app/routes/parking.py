from fastapi import APIRouter, Query, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
import uuid

from ..database.connection import get_db
from ..models.parking import ParkingSpaceModel
from ..schemas.parking import ParkingSpaceCreate, ParkingSpaceUpdate, ParkingSpaceResponse
from ..services.recommendation import get_recommended_parking

router = APIRouter(prefix="/parking", tags=["parking"])

# High quality realistic seeds around Bangalore for testing
MOCK_SEED_SPACES = [
    {
        "id": "parking_101",
        "name": "PES University Campus Parking",
        "description": "Secure basement parking with 24/7 security guard and CCTV monitoring right outside PES Ring Road Campus.",
        "address": "100 Feet Ring Road, Banashankari 3rd Stage, Bengaluru",
        "latitude": 12.9353,
        "longitude": 77.5348,
        "price_per_hour": 30.0,
        "daily_max_price": 200.0,
        "total_spots": 15,
        "available_spots": 8,
        "rating": 4.8,
        "total_reviews": 42,
        "compatible_vehicles": ["Bike", "Scooter", "Hatchback", "Sedan", "SUV"],
        "amenities": ["Covered", "CCTV", "24/7 Security", "EV Charging", "Well Lit"],
        "images": [
            "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80"
        ],
        "is_active": True
    },
    {
        "id": "parking_102",
        "name": "Green Glen Residential Driveway",
        "description": "Private residential covered driveway. Gated community with security. Ideal for compact cars and sedans.",
        "address": "Green Glen Layout, Bellandur, Bengaluru",
        "latitude": 12.9360,
        "longitude": 77.5355,
        "price_per_hour": 25.0,
        "daily_max_price": 180.0,
        "total_spots": 3,
        "available_spots": 2,
        "rating": 5.0,
        "total_reviews": 19,
        "compatible_vehicles": ["Bike", "Scooter", "Hatchback", "Sedan"],
        "amenities": ["Gated", "Covered", "CCTV"],
        "images": [
            "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80"
        ],
        "is_active": True
    },
    {
        "id": "parking_103",
        "name": "Koramangala 5th Block Premium Spot",
        "description": "Prime location next to top cafes and restaurants in Koramangala. Wide bays for SUVs and EV charging station.",
        "address": "80 Feet Road, 5th Block, Koramangala, Bengaluru",
        "latitude": 12.9340,
        "longitude": 77.6220,
        "price_per_hour": 50.0,
        "daily_max_price": 350.0,
        "total_spots": 20,
        "available_spots": 5,
        "rating": 4.6,
        "total_reviews": 88,
        "compatible_vehicles": ["SUV", "Sedan", "Hatchback", "Electric"],
        "amenities": ["EV Fast Charging", "Valet Assistance", "CCTV", "Covered"],
        "images": [
            "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80"
        ],
        "is_active": True
    },
    {
        "id": "parking_104",
        "name": "Indiranagar 100ft Metro Parking",
        "description": "Just 2 minutes walk from Indiranagar Metro Station. Ideal for daily commuters.",
        "address": "100 Feet Rd, Defence Colony, Indiranagar, Bengaluru",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "price_per_hour": 40.0,
        "daily_max_price": 280.0,
        "total_spots": 10,
        "available_spots": 3,
        "rating": 4.7,
        "total_reviews": 56,
        "compatible_vehicles": ["Bike", "Scooter", "Sedan", "Hatchback", "SUV"],
        "amenities": ["24/7 Access", "CCTV", "Near Metro"],
        "images": [
            "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80"
        ],
        "is_active": True
    },
    {
        "id": "parking_105",
        "name": "MG Road Corporate Tower Basement",
        "description": "Underground multi-level secure parking with automated boom barrier entry.",
        "address": "MG Road, Ashok Nagar, Bengaluru",
        "latitude": 12.9756,
        "longitude": 77.6066,
        "price_per_hour": 60.0,
        "daily_max_price": 450.0,
        "total_spots": 30,
        "available_spots": 12,
        "rating": 4.9,
        "total_reviews": 112,
        "compatible_vehicles": ["SUV", "Sedan", "Hatchback"],
        "amenities": ["Boom Barrier", "Underground", "Security Guard", "EV Charging"],
        "images": [
            "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80"
        ],
        "is_active": True
    },
    {
        "id": "parking_106",
        "name": "Jayanagar 4th Block Shopping Hub Spot",
        "description": "Centrally located near Jayanagar 4th Block complex. Great rates for shoppers.",
        "address": "11th Main Rd, 4th Block, Jayanagar, Bengaluru",
        "latitude": 12.9299,
        "longitude": 77.5833,
        "price_per_hour": 35.0,
        "daily_max_price": 240.0,
        "total_spots": 8,
        "available_spots": 4,
        "rating": 4.5,
        "total_reviews": 31,
        "compatible_vehicles": ["Bike", "Hatchback", "Sedan", "SUV"],
        "amenities": ["Well Lit", "CCTV"],
        "images": [
            "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80"
        ],
        "is_active": True
    }
]

@router.post("/seed")
def seed_database(db: Session = Depends(get_db)):
    """Populates the database with rich parking spots if empty."""
    count = db.query(ParkingSpaceModel).count()
    if count > 0:
        return {"message": f"Database already seeded with {count} spaces."}
        
    for data in MOCK_SEED_SPACES:
        new_space = ParkingSpaceModel(
            id=data["id"],
            name=data["name"],
            description=data["description"],
            address=data["address"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            price_per_hour=data["price_per_hour"],
            daily_max_price=data.get("daily_max_price"),
            total_spots=data["total_spots"],
            available_spots=data["available_spots"],
            rating=data["rating"],
            total_reviews=data["total_reviews"],
            compatible_vehicles=data["compatible_vehicles"],
            amenities=data["amenities"],
            images=data["images"],
            is_active=data["is_active"]
        )
        db.add(new_space)
    db.commit()
    return {"message": f"Database seeded with {len(MOCK_SEED_SPACES)} spots successfully!"}

@router.get("/nearby", response_model=List[ParkingSpaceResponse])
def get_nearby_parking(
    lat: float = Query(..., description="User latitude"), 
    lng: float = Query(..., description="User longitude"),
    vehicle_type: Optional[str] = Query("SUV", description="User vehicle type (SUV, Sedan, Bike, etc.)"),
    radius_km: Optional[float] = Query(15.0, description="Search radius in kilometers"),
    max_price: Optional[float] = Query(None, description="Max hourly price filter"),
    db: Session = Depends(get_db)
):
    """
    Finds and ranks all nearby parking spots using the recommendation engine:
    - Filters by distance (within radius_km)
    - Filters by vehicle compatibility
    - Ranks by distance, price, rating, and availability
    """
    spaces = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.is_active == True).all()

    # Convert SQLAlchemy instances to dictionaries for scoring algorithm
    spaces_dict = []
    for s in spaces:
        spaces_dict.append({
            "id": s.id,
            "owner_id": s.owner_id,
            "name": s.name,
            "description": s.description,
            "address": s.address,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "price_per_hour": s.price_per_hour,
            "daily_max_price": s.daily_max_price,
            "total_spots": s.total_spots,
            "available_spots": s.available_spots,
            "rating": s.rating,
            "total_reviews": s.total_reviews,
            "compatible_vehicles": s.compatible_vehicles or [],
            "amenities": s.amenities or [],
            "images": s.images or [],
            "is_active": s.is_active,
            "created_at": s.created_at
        })

    max_radius_m = (radius_km or 15.0) * 1000.0
    recommended = get_recommended_parking(
        user_lat=lat,
        user_lng=lng,
        vehicle_type=vehicle_type,
        available_spaces=spaces_dict,
        max_radius_m=max_radius_m,
        max_price=max_price
    )

    return recommended

@router.get("/{parking_id}", response_model=ParkingSpaceResponse)
def get_parking_details(parking_id: str, db: Session = Depends(get_db)):
    """Fetch complete details of a specific parking space."""
    space = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.id == parking_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Parking space not found")
    
    return space

@router.post("/", response_model=ParkingSpaceResponse, status_code=status.HTTP_201_CREATED)
def create_parking_space(payload: ParkingSpaceCreate, db: Session = Depends(get_db)):
    """Allows a space owner to list a new parking spot."""
    space_id = str(uuid.uuid4())
    new_space = ParkingSpaceModel(
        id=space_id,
        owner_id=payload.owner_id,
        name=payload.name,
        description=payload.description,
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price_per_hour=payload.price_per_hour,
        daily_max_price=payload.daily_max_price,
        total_spots=payload.total_spots,
        available_spots=payload.total_spots,
        rating=5.0,
        total_reviews=0,
        compatible_vehicles=payload.compatible_vehicles,
        amenities=payload.amenities,
        images=payload.images or [],
        is_active=True
    )
    db.add(new_space)
    db.commit()
    db.refresh(new_space)
    return new_space

@router.put("/{parking_id}", response_model=ParkingSpaceResponse)
def update_parking_space(parking_id: str, payload: ParkingSpaceUpdate, db: Session = Depends(get_db)):
    """Updates an existing parking space listing."""
    space = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.id == parking_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Parking space not found")
        
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(space, key, value)
        
    db.commit()
    db.refresh(space)
    return space

@router.patch("/{parking_id}/status", response_model=ParkingSpaceResponse)
def toggle_parking_status(parking_id: str, is_active: bool = Query(...), db: Session = Depends(get_db)):
    """Pause or activate a listing."""
    space = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.id == parking_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Parking space not found")
        
    space.is_active = is_active
    db.commit()
    db.refresh(space)
    return space

@router.get("/owner/{owner_id}", response_model=List[ParkingSpaceResponse])
def get_owner_spaces(owner_id: str, db: Session = Depends(get_db)):
    """Retrieve all spaces managed by a specific owner/lister."""
    spaces = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.owner_id == owner_id).all()
    return spaces
