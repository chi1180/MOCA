import type { GeoJsonObject } from "geojson";
import type L from "leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import polygonData from "./polygon.json";

export const MAP_DATA = {
  center: [34.533557, 132.750555] as L.LatLngExpression,
  polygon: polygonData as GeoJsonObject,
  default_scale: 13.2,
  minimum_scale: 13, // It should regard to the device screen size. However, for simplicity, I set a fixed value here.
  max_bounds: [
    [34.49433362, 132.68411063],
    [34.57954186, 132.81575052],
  ] as LatLngBoundsExpression,
};

export const RECOMMENDED_TAGS = [
  "病院",
  "駅",
  "中央",
  "ショッピングモール",
  "図書館",
  "公園",
  "学校",
  "郵便局",
  "銀行",
  "スーパー",
  "市役所",
  "火車停",
];
