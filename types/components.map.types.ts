import type { PointWithId } from "./api.points.types";
import type { Route } from "./api.routes.types";

// Ref interface for FukutomiMap component
export interface FukutomiMapRef {
  flyToPoint: (lat: number, lng: number, zoom?: number) => void;
  openPopupForPoint: (pointId: string) => void;
  invalidateSize: () => void;
}

// Props interface for FukutomiMap component
export interface FukutomiMapProps {
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  markerPosition?: [number, number] | null;
  // Props for multiple markers
  points?: PointWithId[];
  selectedPointId?: string | null;
  onPointClick?: (point: PointWithId) => void;
  // Props for route rendering
  selectedRoute?: Route | null;
}
