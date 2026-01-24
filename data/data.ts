import L from "leaflet";
import polygonData from "./polygon.json";

export const MAP_DATA = {
  center: [34.533557, 132.750555] as L.LatLngExpression,
  polygon: polygonData,
  scale: 13.2,
};
