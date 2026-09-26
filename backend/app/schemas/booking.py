from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BookingCreate(BaseModel):
    user_id: str = Field(..., example="user_123")
    space_id: str = Field(..., example="parking_123")
    vehicle_plate: str = Field(..., example="KA 05 MN 1234")
    vehicle_type: Optional[str] = Field("SUV", example="SUV")
    start_time: datetime
    end_time: datetime

class BookingResponse(BaseModel):
    id: str
    user_id: str
    space_id: str
    space_name: Optional[str] = None
    space_address: Optional[str] = None
    vehicle_plate: str
    vehicle_type: Optional[str] = None
    start_time: datetime
    end_time: datetime
    total_hours: float
    total_price: float
    status: str
    qr_code_token: str
    payment_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class CheckInRequest(BaseModel):
    qr_code_token: str
