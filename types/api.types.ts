import { z } from "zod";
import type { Tables, TablesInsert, TablesUpdate } from "./supabase.types";

// =============================================
// Re-export table types from Supabase types
// =============================================

export type Stop = Tables<"stops">;
export type Vehicle = Tables<"vehicles">;
export type Reservation = Tables<"reservations">;
export type Route = Tables<"routes">;
export type DemandPrediction = Tables<"demand_predictions">;

export type StopInsert = TablesInsert<"stops">;
export type VehicleInsert = TablesInsert<"vehicles">;
export type ReservationInsert = TablesInsert<"reservations">;
export type RouteInsert = TablesInsert<"routes">;
export type DemandPredictionInsert = TablesInsert<"demand_predictions">;

export type StopUpdate = TablesUpdate<"stops">;
export type VehicleUpdate = TablesUpdate<"vehicles">;
export type ReservationUpdate = TablesUpdate<"reservations">;
export type RouteUpdate = TablesUpdate<"routes">;
export type DemandPredictionUpdate = TablesUpdate<"demand_predictions">;

// =============================================
// Enum Types (for type safety on filters)
// =============================================

export type VehicleType = "minibus" | "taxi" | "wagon";
export type VehicleStatus = "active" | "inactive" | "maintenance";
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "completed"
  | "cancelled";
export type RouteStatus = "planned" | "in_progress" | "completed" | "cancelled";

// =============================================
// JSONB Types for Route and Prediction data
// =============================================

export interface RouteStop {
  order: number;
  stop_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  type: "pickup" | "dropoff";
  reservation_id: string | null;
  scheduled_arrival: string;
  scheduled_departure: string;
}

export interface RouteData {
  stops: RouteStop[];
  total_distance_km: number;
  estimated_duration_minutes: number;
}

export interface HotSpot {
  stop_id: string;
  stop_name: string;
  pickup_demand: number;
  dropoff_demand: number;
}

export interface HourlyDemand {
  hour: number;
  hot_spots: HotSpot[];
}

export interface PredictionData {
  hourly_demand: HourlyDemand[];
  weather: string;
  day_of_week: string;
  is_holiday: boolean;
}

// =============================================
// Common API Response Types
// =============================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// =============================================
// Zod Schemas for Validation
// =============================================

// Stop schemas
export const stopCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional().nullable(),
  is_base_point: z.boolean().optional().default(true),
});

export const stopUpdateSchema = stopCreateSchema.partial();

// Vehicle schemas
export const vehicleCreateSchema = z.object({
  vehicle_number: z.string().min(1, "Vehicle number is required").max(50),
  vehicle_type: z.string().min(1, "Vehicle type is required"),
  capacity: z.number().int().positive("Capacity must be positive"),
  status: z.string().optional().default("active"),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();

// Reservation schemas
export const reservationCreateSchema = z.object({
  passenger_name: z.string().min(1, "Passenger name is required").max(100),
  passenger_phone: z.string().min(1, "Phone number is required").max(20),
  pickup_stop_id: z.string().uuid().optional().nullable(),
  dropoff_stop_id: z.string().uuid().optional().nullable(),
  requested_pickup_time: z.string().datetime({ offset: true }),
  passenger_count: z.number().int().positive().optional().default(1),
  status: z.string().optional().default("pending"),
  assigned_route_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const reservationUpdateSchema = reservationCreateSchema.partial();

// Route stop schema (for JSONB)
export const routeStopSchema = z.object({
  order: z.number().int().positive(),
  stop_id: z.string().uuid(),
  stop_name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  type: z.enum(["pickup", "dropoff"]),
  reservation_id: z.string().uuid().nullable(),
  scheduled_arrival: z.string().datetime({ offset: true }),
  scheduled_departure: z.string().datetime({ offset: true }),
});

// Route data schema (for JSONB)
export const routeDataSchema = z.object({
  stops: z.array(routeStopSchema),
  total_distance_km: z.number().nonnegative(),
  estimated_duration_minutes: z.number().int().nonnegative(),
});

// Route schemas
export const routeCreateSchema = z.object({
  vehicle_id: z.string().uuid().optional().nullable(),
  route_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  route_data: routeDataSchema,
  status: z.string().optional().default("planned"),
});

export const routeUpdateSchema = routeCreateSchema.partial();

// Demand prediction schemas
export const hotSpotSchema = z.object({
  stop_id: z.string().uuid(),
  stop_name: z.string(),
  pickup_demand: z.number().nonnegative(),
  dropoff_demand: z.number().nonnegative(),
});

export const hourlyDemandSchema = z.object({
  hour: z.number().int().min(0).max(23),
  hot_spots: z.array(hotSpotSchema),
});

export const predictionDataSchema = z.object({
  hourly_demand: z.array(hourlyDemandSchema),
  weather: z.string(),
  day_of_week: z.string(),
  is_holiday: z.boolean(),
});

export const demandPredictionCreateSchema = z.object({
  prediction_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  prediction_data: predictionDataSchema,
});

export const demandPredictionUpdateSchema =
  demandPredictionCreateSchema.partial();

// =============================================
// Inferred Types from Zod Schemas
// =============================================

export type StopCreateInput = z.infer<typeof stopCreateSchema>;
export type StopUpdateInput = z.infer<typeof stopUpdateSchema>;
export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>;
export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>;
export type RouteCreateInput = z.infer<typeof routeCreateSchema>;
export type RouteUpdateInput = z.infer<typeof routeUpdateSchema>;
export type DemandPredictionCreateInput = z.infer<
  typeof demandPredictionCreateSchema
>;
export type DemandPredictionUpdateInput = z.infer<
  typeof demandPredictionUpdateSchema
>;

// =============================================
// Specific API Response Types
// =============================================

// Stops
export type StopResponse = ApiResponse<Stop>;
export type StopsListResponse = ApiResponse<Stop[]>;

// Vehicles
export type VehicleResponse = ApiResponse<Vehicle>;
export type VehiclesListResponse = ApiResponse<Vehicle[]>;

// Reservations
export type ReservationResponse = ApiResponse<Reservation>;
export type ReservationsListResponse = ApiResponse<Reservation[]>;

// Reservation with related stop info
export interface ReservationWithStops extends Reservation {
  pickup_stop?: Stop | null;
  dropoff_stop?: Stop | null;
}
export type ReservationWithStopsResponse = ApiResponse<ReservationWithStops>;
export type ReservationsWithStopsListResponse = ApiResponse<
  ReservationWithStops[]
>;

// Routes
export type RouteResponse = ApiResponse<Route>;
export type RoutesListResponse = ApiResponse<Route[]>;

// Route with vehicle info
export interface RouteWithVehicle extends Route {
  vehicle?: Vehicle | null;
}
export type RouteWithVehicleResponse = ApiResponse<RouteWithVehicle>;
export type RoutesWithVehicleListResponse = ApiResponse<RouteWithVehicle[]>;

// Demand Predictions
export type DemandPredictionResponse = ApiResponse<DemandPrediction>;
export type DemandPredictionsListResponse = ApiResponse<DemandPrediction[]>;
