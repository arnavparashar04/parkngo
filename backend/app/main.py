from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import parking
from .database.connection import engine, Base
# Import models so Base metadata is aware of them
from .models import parking as parking_model

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ParkNGo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parking.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to ParkNGo API"}
