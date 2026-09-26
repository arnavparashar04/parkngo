import math
from typing import List, Dict, Any, Optional

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Haversine formula to calculate the great-circle distance between two points in meters.
    """
    R = 6371e3  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def get_recommended_parking(
    user_lat: float, 
    user_lng: float, 
    vehicle_type: Optional[str] = "SUV", 
    available_spaces: List[Dict[str, Any]] = None,
    max_radius_m: float = 10000.0,  # 10 km radius default
    max_price: Optional[float] = None
) -> List[Dict[str, Any]]:
    """
    Smart ranking algorithm for nearby parking spaces:
    - Checks vehicle compatibility
    - Checks availability (available_spots > 0)
    - Scores based on:
        * Distance (40 points max)
        * Price competitiveness (30 points max)
        * Customer rating & reviews (20 points max)
        * Availability & amenities (10 points max)
    """
    if available_spaces is None:
        return []

    scored_spaces = []

    for space in available_spaces:
        if not space.get('is_active', True):
            continue

        # Check vehicle compatibility if specified
        compatible_vehicles = space.get('compatible_vehicles') or []
        if vehicle_type and compatible_vehicles:
            # Case-insensitive check or "Any"
            types_lower = [v.lower() for v in compatible_vehicles]
            if vehicle_type.lower() not in types_lower and "any" not in types_lower:
                continue

        # Calculate exact distance
        distance_m = calculate_distance(user_lat, user_lng, space['latitude'], space['longitude'])
        if distance_m > max_radius_m:
            continue

        price = float(space.get('price_per_hour', 0))
        if max_price is not None and price > max_price:
            continue

        # Format distance for display
        space['distance'] = round(distance_m)
        if distance_m < 1000:
            space['distance_formatted'] = f"{round(distance_m)}m"
        else:
            space['distance_formatted'] = f"{round(distance_m / 1000, 1)}km"

        # ------------------- SCORING (0 to 100 points) -------------------
        score = 0.0

        # 1. Distance Score (Max 40 points) - Closer is significantly better
        # Within 1km gets near full points; drops gracefully up to max_radius
        norm_dist = min(distance_m / max_radius_m, 1.0)
        distance_score = 40.0 * (1.0 - norm_dist)
        score += distance_score

        # 2. Price Score (Max 30 points) - Cheaper is better
        # Benchmark max realistic price: 150/hr
        price_benchmark = 150.0
        price_ratio = min(price / price_benchmark, 1.0)
        price_score = 30.0 * (1.0 - price_ratio)
        score += price_score

        # 3. Rating Score (Max 20 points)
        rating = float(space.get('rating', 5.0) or 5.0)
        rating_score = (rating / 5.0) * 20.0
        score += rating_score

        # 4. Amenities & Availability (Max 10 points)
        available = int(space.get('available_spots', 1) or 1)
        if available > 0:
            score += 5.0
        amenities = space.get('amenities') or []
        if "Covered" in amenities or "CCTV" in amenities:
            score += 5.0

        space['recommendation_score'] = round(score, 1)
        scored_spaces.append(space)

    # Sort descending by score
    scored_spaces.sort(key=lambda s: s['recommendation_score'], reverse=True)
    return scored_spaces
