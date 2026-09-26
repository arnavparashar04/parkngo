from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from ..database.connection import get_db
from ..models.booking import BookingModel
from ..models.parking import ParkingSpaceModel
from ..schemas.booking import BookingCreate, BookingResponse

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    """
    Creates a new parking reservation:
    - Verifies space exists and has available spots
    - Calculates duration and price
    - Reserves the spot
    - Generates unique digital QR pass token
    """
    space = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.id == payload.space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Parking space not found")
        
    if not space.is_active:
        raise HTTPException(status_code=400, detail="This parking space is currently inactive")

    if space.available_spots <= 0:
        raise HTTPException(status_code=400, detail="No spots currently available in this parking space")

    # Calculate hours
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")
        
    duration = payload.end_time - payload.start_time
    total_hours = max(1.0, round(duration.total_seconds() / 3600.0, 1))
    total_price = round(total_hours * space.price_per_hour, 2)

    # Apply daily cap if configured
    if space.daily_max_price and total_price > space.daily_max_price:
        total_price = space.daily_max_price

    booking_id = str(uuid.uuid4())
    qr_token = f"PASS-{uuid.uuid4().hex[:10].upper()}"

    booking = BookingModel(
        id=booking_id,
        user_id=payload.user_id,
        space_id=payload.space_id,
        vehicle_plate=payload.vehicle_plate,
        vehicle_type=payload.vehicle_type,
        start_time=payload.start_time,
        end_time=payload.end_time,
        total_hours=total_hours,
        total_price=total_price,
        status="upcoming",
        qr_code_token=qr_token,
        payment_status="paid"
    )

    # Decrement available spots
    space.available_spots = max(0, space.available_spots - 1)

    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Return with space name and address
    return BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        space_id=booking.space_id,
        space_name=space.name,
        space_address=space.address,
        vehicle_plate=booking.vehicle_plate,
        vehicle_type=booking.vehicle_type,
        start_time=booking.start_time,
        end_time=booking.end_time,
        total_hours=booking.total_hours,
        total_price=booking.total_price,
        status=booking.status,
        qr_code_token=booking.qr_code_token,
        payment_status=booking.payment_status,
        created_at=booking.created_at
    )

@router.get("/user/{user_id}", response_model=List[BookingResponse])
def get_user_bookings(
    user_id: str,
    status_filter: Optional[str] = Query(None, description="upcoming, active, completed, cancelled"),
    db: Session = Depends(get_db)
):
    """Fetches all bookings for a user, with optional status filter."""
    query = db.query(BookingModel).filter(BookingModel.user_id == user_id)
    if status_filter:
        query = query.filter(BookingModel.status == status_filter)

    bookings = query.order_by(BookingModel.created_at.desc()).all()
    results = []
    for b in bookings:
        space = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.id == b.space_id).first()
        results.append(BookingResponse(
            id=b.id,
            user_id=b.user_id,
            space_id=b.space_id,
            space_name=space.name if space else "Unknown Space",
            space_address=space.address if space else "",
            vehicle_plate=b.vehicle_plate,
            vehicle_type=b.vehicle_type,
            start_time=b.start_time,
            end_time=b.end_time,
            total_hours=b.total_hours,
            total_price=b.total_price,
            status=b.status,
            qr_code_token=b.qr_code_token,
            payment_status=b.payment_status,
            created_at=b.created_at
        ))
    return results

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_details(booking_id: str, db: Session = Depends(get_db)):
    """Fetch booking and digital pass info."""
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    space = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.id == booking.space_id).first()
    return BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        space_id=booking.space_id,
        space_name=space.name if space else "Unknown Space",
        space_address=space.address if space else "",
        vehicle_plate=booking.vehicle_plate,
        vehicle_type=booking.vehicle_type,
        start_time=booking.start_time,
        end_time=booking.end_time,
        total_hours=booking.total_hours,
        total_price=booking.total_price,
        status=booking.status,
        qr_code_token=booking.qr_code_token,
        payment_status=booking.payment_status,
        created_at=booking.created_at
    )

@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: str, db: Session = Depends(get_db)):
    """Cancels a booking and frees the parking slot."""
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status in ["cancelled", "completed"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel a booking that is already {booking.status}")

    booking.status = "cancelled"
    booking.payment_status = "refunded"

    # Restore parking space slot
    space = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.id == booking.space_id).first()
    if space:
        space.available_spots = min(space.total_spots, space.available_spots + 1)

    db.commit()
    return {"message": "Booking cancelled successfully", "status": "cancelled"}

@router.post("/{booking_id}/check-in")
def check_in_booking(booking_id: str, db: Session = Depends(get_db)):
    """Scans QR pass at gate and activates parking session."""
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = "active"
    db.commit()
    return {"message": "Checked in successfully. Gate open!", "status": "active"}

@router.post("/{booking_id}/check-out")
def check_out_booking(booking_id: str, db: Session = Depends(get_db)):
    """Vehicle leaves parking spot and finishes session."""
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = "completed"

    # Restore spot
    space = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.id == booking.space_id).first()
    if space:
        space.available_spots = min(space.total_spots, space.available_spots + 1)

    db.commit()
    return {"message": "Checked out successfully. Have a safe drive!", "status": "completed"}
