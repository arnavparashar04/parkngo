import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database.connection import engine, Base
# Import all models to register them on Base metadata
from .models import UserModel, VehicleModel, ParkingSpaceModel, BookingModel, ReviewModel
from .routes import parking_router, bookings_router, upload_router, user_router

# Automatically create/sync tables in database (Supabase PostgreSQL or SQLite)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ParkNGo API",
    description="Smart Parking Discovery, Reservation, and Space Listing Platform",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for image uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include all modular routers
app.include_router(parking_router, prefix="/api")
app.include_router(bookings_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(user_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "ParkNGo Backend API",
        "version": "2.0.0",
        "endpoints": {
            "parking_nearby": "/api/parking/nearby?lat=12.9353&lng=77.5348&vehicle_type=SUV",
            "seed_data": "POST /api/parking/seed",
            "upload_image": "POST /api/upload/image",
            "create_booking": "POST /api/bookings",
            "docs": "/docs"
        }
    }
