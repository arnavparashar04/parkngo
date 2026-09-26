import { Linking, Platform } from 'react-native';

export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCbsUFP40vYrdRmqnv2FL3Iw3UWKB9cRAY';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId?: string;
}

/**
 * Geocode a text query (address or place name) into latitude and longitude coordinates.
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  if (!query || !query.trim()) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      query.trim()
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const topResult = data.results[0];
      const { lat, lng } = topResult.geometry.location;
      return {
        latitude: lat,
        longitude: lng,
        formattedAddress: topResult.formatted_address,
        placeId: topResult.place_id,
      };
    } else {
      console.warn(`[GoogleMaps] Geocoding returned status: ${data.status}`, data.error_message || '');
      return null;
    }
  } catch (error) {
    console.error('[GoogleMaps] Error geocoding address:', error);
    return null;
  }
}

/**
 * Reverse geocode latitude and longitude into a readable address string.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('[GoogleMaps] Error in reverse geocoding:', error);
    return null;
  }
}

/**
 * Open external navigation to destination coordinates via Google Maps.
 */
export async function openGoogleMapsNavigation(
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  const destination = `${latitude},${longitude}`;
  const encodedLabel = label ? encodeURIComponent(label) : '';

  // Google Maps Universal URL works across Android, iOS and Web
  let mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  if (encodedLabel) {
    mapUrl += `&destination_place_id=${encodedLabel}`;
  }

  if (Platform.OS === 'android') {
    const geoUrl = `geo:${destination}?q=${destination}${encodedLabel ? `(${encodedLabel})` : ''}`;
    const canOpenGeo = await Linking.canOpenURL(geoUrl).catch(() => false);
    if (canOpenGeo) {
      await Linking.openURL(geoUrl);
      return;
    }
  }

  const supported = await Linking.canOpenURL(mapUrl).catch(() => false);
  if (supported) {
    await Linking.openURL(mapUrl);
  } else {
    // Fallback for browsers or devices without maps app
    await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${destination}`);
  }
}

/**
 * Fast local Haversine distance calculator in meters between two lat/lng points.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2.0) * Math.sin(deltaPhi / 2.0) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2.0) * Math.sin(deltaLambda / 2.0);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
