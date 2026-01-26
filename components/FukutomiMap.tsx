"use client";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MAP_DATA } from "@/data/data";

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

export default function FukutomiMapInner() {
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
      style={{ height: "100%", width: "100%" }}
      minZoom={MAP_DATA.minimum_scale}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={MAP_DATA.center}>
        <Popup>
          Hiroshima AI Club <br /> Fukutomi Project.
        </Popup>
      </Marker>

      <GeoJSON data={MAP_DATA.polygon} />
    </MapContainer>
  );
}
