"use client";

import { MAP_DATA } from "@/data/data";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

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
});
L.Marker.prototype.options.icon = DefaultIcon;

interface FukutomiMapProps {
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  markerPosition?: [number, number] | null;
}

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

function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    // 初期レンダリング時にサイズを再計算
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // windowのresizeイベントを監視
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  return null;
}

export default function FukutomiMapInner({
  className,
  onMapClick,
  markerPosition,
}: FukutomiMapProps) {
  // =============================================================================
  // Methods
  // =============================================================================

  // =============================================================================
  // Component
  // =============================================================================

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

      {markerPosition && (
        <Marker position={markerPosition}>
          <Popup>選択された位置</Popup>
        </Marker>
      )}

      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

      <MapInvalidator />
    </MapContainer>
  );
}
