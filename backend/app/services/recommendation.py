import math
from typing import List, Dict, Any

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Haversine formula for distance in meters
    R = 6371e3
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi/2.0) * math.sin(delta_phi/2.0) + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda/2.0) * math.sin(delta_lambda/2.0)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return R * c

def get_recommended_parking(
    user_lat: float, 
    user_lng: float, 
    vehicle_type: str, 
    available_spaces: List[Dict[Any, Any]]
) -> List[Dict[Any, Any]]:
    
    scored_spaces = []
    
    for space in available_spaces:
        # 1. HARD CONSTRAINTS
        if vehicle_type not in space.get('compatible_vehicles', []):
            continue
            
        if not space.get('is_active', True):
            continue
            
        # Calculate real distance
        distance_m = calculate_distance(user_lat, user_lng, space['latitude'], space['longitude'])
        
        # Max acceptable distance (e.g. 1000m)
        if distance_m > 1000:
            continue
            
        space['distance'] = round(distance_m)

        # 2. SCORING (Max 100 points)
        score = 0
        
        # Distance (40%) - Closer is better
        # 0m = 40 pts, 1000m = 0 pts
        distance_score = max(0, 40 * (1 - (distance_m / 1000)))
        score += distance_score
        
        # Price (25%) - Cheaper is better
        # Assuming max price is around 100/hr for scaling
        price = space['price_per_hour']
        price_score = max(0, 25 * (1 - (price / 100)))
        score += price_score
        
        # Rating (5%)
        rating = space.get('rating', 0)
        rating_score = (rating / 5.0) * 5
        score += rating_score
        
        # We can add availability & preferences logic later
        
        space['recommendation_score'] = round(score, 2)
        scored_spaces.append(space)
        
    # Sort by highest score first
    scored_spaces.sort(key=lambda x: x['recommendation_score'], reverse=True)
    
    return scored_spaces
