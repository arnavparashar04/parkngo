from .parking import router as parking_router
from .bookings import router as bookings_router
from .upload import router as upload_router
from .user import router as user_router

__all__ = [
    "parking_router",
    "bookings_router",
    "upload_router",
    "user_router"
]
