"use client";

import { MAP_DATA } from "@/data/data";
import type { PointWithId } from "@/types/api.points.types";
import type { Route } from "@/types/api.routes.types";
import type {
  FukutomiMapProps,
  FukutomiMapRef,
} from "@/types/components.map.types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LucideTags } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

// Default marker icon
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Highlighted marker icon (orange/primary color)
const HighlightedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Re-export types for convenience
export type { FukutomiMapRef, FukutomiMapProps };

// Handle map click events
function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Handle map resize and expose map instance
function MapController({
  mapInstanceRef,
  selectedPointId,
  points,
  selectedRoute,
}: {
  mapInstanceRef: React.MutableRefObject<L.Map | null>;
  selectedPointId?: string | null;
  points?: PointWithId[];
  selectedRoute?: Route | null;
}) {
  const map = useMap();

  // Store map instance
  useEffect(() => {
    mapInstanceRef.current = map;
  }, [map, mapInstanceRef]);

  // Handle resize
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  // Fly to selected point when it changes
  useEffect(() => {
    if (selectedPointId && points) {
      const selectedPoint = points.find((p) => p.id === selectedPointId);
      if (selectedPoint) {
        map.flyTo([selectedPoint.latitude, selectedPoint.longitude], 15, {
          duration: 0.5,
        });
      }
    }
  }, [selectedPointId, points, map]);

  // Fit bounds to route when it's selected
  useEffect(() => {
    if (selectedRoute && selectedRoute.route_data.osrm_geometry) {
      const coordinates = selectedRoute.route_data.osrm_geometry.coordinates;
      if (coordinates.length > 0) {
        const bounds = L.latLngBounds(
          coordinates.map((coord) => [coord[1], coord[0]]), // OSRM returns [lon, lat], convert to [lat, lon]
        );
        map.fitBounds(bounds, { padding: [50, 50], duration: 0.5 });
      }
    }
  }, [selectedRoute, map]);

  return null;
}

// Route rendering component
function RoutePolyline({ selectedRoute }: { selectedRoute?: Route | null }) {
  if (!selectedRoute || !selectedRoute.route_data.osrm_geometry) {
    return null;
  }

  const coordinates = selectedRoute.route_data.osrm_geometry.coordinates.map(
    (coord) => [coord[1], coord[0]], // Convert [lon, lat] to [lat, lon]
  );

  if (coordinates.length === 0) {
    return null;
  }

  return (
    <Polyline
      positions={coordinates as [number, number][]}
      pathOptions={{
        color: "#FF6B35",
        weight: 4,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}

// Route stops rendering component
function RouteStops({ selectedRoute }: { selectedRoute?: Route | null }) {
  if (!selectedRoute || !selectedRoute.route_data.stops) {
    return null;
  }

  const stops = selectedRoute.route_data.stops;

  if (stops.length === 0) {
    return null;
  }

  // Create color icons for different stop types
  const getStopIcon = (stopType: string) => {
    const shadowUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

    // Different colors for pickup and dropoff
    if (stopType === "pickup") {
      return L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    } else {
      // dropoff
      return L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    }
  };

  return (
    <>
      {stops.map((stop, index) => (
        <Marker
          key={`${stop.stop_id}-${index}`}
          position={[stop.latitude, stop.longitude]}
          icon={getStopIcon(stop.type)}
        >
          <Popup>
            <div className="min-w-[250px]">
              <h3 className="font-bold text-base mb-1">{stop.stop_name}</h3>
              <div className="flex items-center gap-2 text-xs mb-2">
                <span
                  className={`
                    px-2 py-0.5 rounded-full font-medium
                    ${
                      stop.type === "pickup"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  `}
                >
                  {stop.type === "pickup" ? "乗車" : "下車"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                  停車順: {stop.order}
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <span className="font-semibold">到着予定:</span>{" "}
                  {new Date(stop.scheduled_arrival).toLocaleTimeString(
                    "ja-JP",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
                <p>
                  <span className="font-semibold">出発予定:</span>{" "}
                  {new Date(stop.scheduled_departure).toLocaleTimeString(
                    "ja-JP",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// Get ability label for popup
function getAbilityLabel(ability: string): string {
  switch (ability) {
    case "get_on_off":
      return "乗下車可";
    case "get_on":
      return "乗車のみ";
    case "get_off":
      return "下車のみ";
    default:
      return ability;
  }
}

// Get type label for popup
function getTypeLabel(type: string): string {
  switch (type) {
    case "departure":
      return "出発地";
    case "arrival":
      return "到着地";
    case "traveling":
      return "経由地";
    default:
      return type;
  }
}

const FukutomiMap = forwardRef<FukutomiMapRef, FukutomiMapProps>(
  function FukutomiMap(
    {
      className,
      onMapClick,
      markerPosition,
      points = [],
      selectedPointId,
      onPointClick,
      selectedRoute,
    },
    ref,
  ) {
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRefs = useRef<Map<string, L.Marker>>(new Map());

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      flyToPoint: (lat: number, lng: number, zoom = 15) => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 0.5 });
        }
      },
      openPopupForPoint: (pointId: string) => {
        const marker = markerRefs.current.get(pointId);
        if (marker) {
          marker.openPopup();
        }
      },
      invalidateSize: () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      },
    }));

    // Open popup when point is selected
    useEffect(() => {
      if (selectedPointId) {
        const marker = markerRefs.current.get(selectedPointId);
        if (marker) {
          // Small delay to ensure map has flown to location
          setTimeout(() => {
            marker.openPopup();
          }, 600);
        }
      }
    }, [selectedPointId]);

    return (
      <MapContainer
        center={MAP_DATA.center}
        zoom={MAP_DATA.default_scale}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        minZoom={MAP_DATA.minimum_scale}
        maxBounds={MAP_DATA.max_bounds}
        maxBoundsViscosity={1.0}
        className={className}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <GeoJSON data={MAP_DATA.polygon} />

        {/* Single marker position (for point creation) */}
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>選択された位置</Popup>
          </Marker>
        )}

        {/* Route polyline */}
        <RoutePolyline selectedRoute={selectedRoute} />

        {/* Route stops markers */}
        <RouteStops selectedRoute={selectedRoute} />

        {/* Multiple point markers */}
        {points.map((point) => {
          const isSelected = selectedPointId === point.id;
          return (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={isSelected ? HighlightedIcon : DefaultIcon}
              eventHandlers={{
                click: () => {
                  if (onPointClick) {
                    onPointClick(point);
                  }
                },
              }}
              ref={(markerRef) => {
                if (markerRef) {
                  markerRefs.current.set(point.id, markerRef);
                }
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-base mb-1">{point.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{point.address}</p>
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                      {getAbilityLabel(point.ability)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                      {getTypeLabel(point.type)}
                    </span>
                  </div>
                  {point.tags.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="inline bg-purple-100 p-1 rounded-md text-purple-800">
                          <LucideTags size={16} />
                        </span>
                        {point.tags.join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

        <MapController
          mapInstanceRef={mapInstanceRef}
          selectedPointId={selectedPointId}
          points={points}
          selectedRoute={selectedRoute}
        />
      </MapContainer>
    );
  },
);

export default FukutomiMap;
