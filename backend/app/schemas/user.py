from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class VehicleCreate(BaseModel):
    make: str = Field(..., example="Tata")
    model: str = Field(..., example="Nexon EV")
    license_plate: str = Field(..., example="KA 05 MN 1234")
    vehicle_type: str = Field(..., example="SUV")
    is_default: bool = False

class VehicleResponse(VehicleCreate):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    full_name: str
    phone_number: Optional[str] = None
    role: str = "driver"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    vehicles: List[VehicleResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class OwnerDashboardResponse(BaseModel):
    owner_id: str
    total_spaces: int
    active_spaces: int
    total_bookings: int
    total_earnings: float
    recent_bookings: List[dict] = []
