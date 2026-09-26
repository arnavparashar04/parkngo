from app.database.connection import SessionLocal
from app.models.parking import ParkingSpaceModel
import uuid
import random

def seed_more():
    db = SessionLocal()
    
    names = ["Amaatra Academy Area Parking", "Sarjapur Mall Parking", "Harlur Safe Spot", "Wipro Gate Parking", "Bellandur Outer Ring Road Spot"]
    amenities_list = ["CCTV", "Security Guard", "24/7 Access", "Covered", "EV Charging", "Boom Barrier"]
    
    new_spots = []
    for i in range(20):
        # Specific bounding box near Amaatra Academy / Sarjapur Road
        # Lat: ~12.87 to 12.93
        # Lng: ~77.65 to 77.72
        lat = random.uniform(12.8700, 12.9300)
        lng = random.uniform(77.6500, 77.7200)
        price = random.choice([30, 40, 50])
        name = random.choice(names) + f" {i}"
        
        new_space = ParkingSpaceModel(
            id=f"parking_sarjapur_{i}",
            name=name,
            description="Generated parking space near Sarjapur/Bellandur.",
            address="Sarjapur Road Area",
            latitude=lat,
            longitude=lng,
            price_per_hour=price,
            daily_max_price=price * 8,
            total_spots=random.randint(5, 50),
            available_spots=random.randint(1, 5),
            rating=round(random.uniform(4.0, 5.0), 1),
            total_reviews=random.randint(10, 100),
            compatible_vehicles=["Bike", "Scooter", "Sedan", "Hatchback", "SUV"],
            amenities=random.sample(amenities_list, k=random.randint(2, 4)),
            images=["https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80"],
            is_active=True
        )
        new_spots.append(new_space)
    
    db.bulk_save_objects(new_spots)
    db.commit()
    db.close()
    print("Added 20 Sarjapur spots")

if __name__ == "__main__":
    seed_more()
