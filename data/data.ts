import type { GeoJsonObject } from "geojson";
import type L from "leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import polygonData from "./polygon.json";

export const MAP_DATA = {
  center: [34.533557, 132.750555] as L.LatLngExpression,
  polygon: polygonData as GeoJsonObject,
  default_scale: 13.2,
  minimum_scale: 13,
  max_bounds: [
    [34.49433362, 132.68411063],
    [34.57954186, 132.81575052],
  ] as LatLngBoundsExpression,
};
