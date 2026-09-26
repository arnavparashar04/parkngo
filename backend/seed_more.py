from app.database.connection import SessionLocal
from app.models.parking import ParkingSpaceModel
import uuid
import random

def seed_more():
    db = SessionLocal()
    
    # Approx bounding box for Bangalore: 
    # Lat: 12.8000 to 13.1000
    # Lng: 77.4500 to 77.7500
    names = ["Tech Park Parking", "Mall Basement", "Street Side Safe Park", "Residential Driveway", "Metro Station Parking", "Hospital Visitor Parking", "Stadium Parking", "Office Complex Parking", "Supermarket Parking"]
    amenities_list = ["CCTV", "Security Guard", "24/7 Access", "Covered", "EV Charging", "Boom Barrier"]
    
    new_spots = []
    for i in range(50):
        lat = random.uniform(12.8000, 13.1000)
        lng = random.uniform(77.4500, 77.7500)
        price = random.choice([20, 30, 40, 50, 60, 80])
        name = random.choice(names) + f" {i}"
        
        new_space = ParkingSpaceModel(
            id=f"parking_rnd_{i}",
            name=name,
            description="A random generated parking space for testing.",
            address="Somewhere in Bangalore",
            latitude=lat,
            longitude=lng,
            price_per_hour=price,
            daily_max_price=price * 8,
            total_spots=random.randint(5, 50),
            available_spots=random.randint(1, 5),
            rating=round(random.uniform(3.5, 5.0), 1),
            total_reviews=random.randint(0, 200),
            compatible_vehicles=["Bike", "Scooter", "Sedan", "Hatchback", "SUV"],
            amenities=random.sample(amenities_list, k=random.randint(1, 4)),
            images=["https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80"],
            is_active=True
        )
        new_spots.append(new_space)
    
    db.bulk_save_objects(new_spots)
    db.commit()
    db.close()
    print("Added 50 new spots")

if __name__ == "__main__":
    seed_more()
