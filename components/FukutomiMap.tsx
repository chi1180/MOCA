"use client";

import { MAP_DATA } from "@/data/data";
import type { PointWithId } from "@/types/api.points.types";
import type {
  FukutomiMapProps,
  FukutomiMapRef,
} from "@/types/components.map.types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
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
}: {
  mapInstanceRef: React.MutableRefObject<L.Map | null>;
  selectedPointId?: string | null;
  points?: PointWithId[];
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

  return null;
}

// Get type label for popup
function getTypeLabel(type: string): string {
  switch (type) {
    case "get_on_off":
      return "乗降可";
    case "get_on":
      return "乗車のみ";
    case "get_off":
      return "降車のみ";
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
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                      {getTypeLabel(point.type)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <div>緯度: {point.latitude.toFixed(6)}</div>
                    <div>経度: {point.longitude.toFixed(6)}</div>
                  </div>
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
        />
      </MapContainer>
    );
  },
);

export default FukutomiMap;
