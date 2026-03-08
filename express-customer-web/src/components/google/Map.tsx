import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { useState, useEffect } from "react";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px", // Ensure the map has a height
};

const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018,
};

import type { AddressInfo } from "../../types";

interface MapProps {
  pickup?: AddressInfo;
  deliveries?: AddressInfo[];
  vehicleType?: string;
}

const mapLibraries: "places"[] = ["places"];

export default function Map({
  pickup,
  deliveries = [],
  vehicleType = "motorcycle",
}: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
  });

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const [center, setCenter] = useState(defaultCenter);

  // Use stringified deliveries to safely depend on the array elements
  const deliveriesKey = JSON.stringify(deliveries);

  useEffect(() => {
    if (!isLoaded) return;

    // Filter out invalid items (must have address, lat, lng)
    const allLocations = [pickup, ...deliveries].filter(
      (loc): loc is AddressInfo =>
        !!loc &&
        !!loc.address &&
        typeof loc.lat === "number" &&
        typeof loc.lng === "number",
    );

    if (allLocations.length === 0) {
      setMarkers([]);
      setDirections(null);
      setCenter(defaultCenter);
      return;
    }

    // Only one location found, render a single marker
    if (allLocations.length === 1) {
      const loc = allLocations[0];
      setMarkers([{ lat: loc.lat, lng: loc.lng }]);
      setCenter({ lat: loc.lat, lng: loc.lng });
      setDirections(null);
      return;
    }

    // Multiple locations: calculate a route
    const directionsService = new window.google.maps.DirectionsService();
    const origin = { lat: allLocations[0].lat, lng: allLocations[0].lng };
    const destination = {
      lat: allLocations[allLocations.length - 1].lat,
      lng: allLocations[allLocations.length - 1].lng,
    };
    const waypoints = allLocations.slice(1, -1).map((loc) => ({
      location: { lat: loc.lat, lng: loc.lng },
      stopover: true,
    }));

    let travelMode = window.google.maps.TravelMode.DRIVING;
    if (vehicleType === "motorcycle") {
      travelMode =
        (window.google.maps.TravelMode as any).TWO_WHEELER ||
        window.google.maps.TravelMode.DRIVING;
    }

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: travelMode,
        avoidTolls: true,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
          setMarkers([]);
        } else {
          // Fallback to raw markers if route fails (e.g. no driving path found)
          const validCoords = allLocations.map((loc) => ({
            lat: loc.lat,
            lng: loc.lng,
          }));
          setMarkers(validCoords);
          if (validCoords.length > 0) setCenter(validCoords[0]);
          setDirections(null);
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, pickup, deliveriesKey, vehicleType]);

  if (!isLoaded) return <div style={containerStyle}>Loading Map...</div>;

  let overviewPath: google.maps.LatLng[] = [];
  let durationText = "";
  let distanceText = "";
  let midpoint: google.maps.LatLng | null = null;

  if (directions && directions.routes && directions.routes[0]) {
    const route = directions.routes[0];
    overviewPath = route.overview_path || [];

    // Middle of the route for the infowindow
    if (overviewPath.length > 0) {
      midpoint = overviewPath[Math.floor(overviewPath.length / 2)];
    }

    if (route.legs) {
      if (route.legs.length === 1) {
        durationText = route.legs[0].duration?.text || "";
        distanceText = route.legs[0].distance?.text || "";
      } else {
        let totalD = 0;
        let totalM = 0;
        route.legs.forEach((leg) => {
          totalD += leg.distance?.value || 0;
          totalM += leg.duration?.value || 0;
        });
        distanceText =
          totalD > 1000 ? `${(totalD / 1000).toFixed(1)} km` : `${totalD} m`;
        const mins = Math.round(totalM / 60);
        durationText =
          mins >= 60
            ? `${Math.floor(mins / 60)} hr ${mins % 60} min`
            : `${mins} min`;
      }
    }
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {directions && (
        <>
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressPolylines: true, // we will draw our own custom polylines below
            }}
          />

          {overviewPath.length > 0 && (
            <>
              {/* Outer stroke (border) */}
              <Polyline
                path={overviewPath}
                options={{
                  strokeColor: "#111827", // Very dark navy / blackish border
                  strokeWeight: 9,
                  strokeOpacity: 1,
                  zIndex: 1,
                }}
              />
              {/* Inner stroke (color) */}
              <Polyline
                path={overviewPath}
                options={{
                  strokeColor: "#3B82F6", // Blue
                  strokeWeight: 5,
                  strokeOpacity: 1,
                  zIndex: 2,
                }}
              />
            </>
          )}

          {midpoint && (
            <InfoWindow position={midpoint} options={{ disableAutoPan: true }}>
              <div
                style={{
                  padding: "2px 8px",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    color: "#0f172a",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  {vehicleType === "motorcycle" ? "🏍️" : "🚗"} {durationText}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748B",
                    marginTop: "2px",
                  }}
                >
                  {distanceText}
                </div>
              </div>
            </InfoWindow>
          )}
        </>
      )}

      {!directions &&
        markers.map((m, idx) => (
          <Marker
            key={idx}
            position={m}
            label={
              markers.length > 1 ? String.fromCharCode(65 + idx) : undefined
            }
          />
        ))}

      {!directions && markers.length === 0 && (
        <Marker position={defaultCenter} />
      )}
    </GoogleMap>
  );
}
