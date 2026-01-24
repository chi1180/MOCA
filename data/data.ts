import L from "leaflet";
import polygonData from "./polygon.json";
import type { GeoJsonObject } from "geojson";

export const MAP_DATA = {
  center: [34.533557, 132.750555] as L.LatLngExpression,
  polygon: polygonData as GeoJsonObject,
  scale: 13.2,
};
