import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  successResponse,
  errorResponse,
  validateBody,
  handleSupabaseError,
  parseQueryParams,
} from "@/lib/api-helpers";
import {
  vehicleCreateSchema,
  type VehicleStatus,
  type VehicleType,
} from "@/types/api.types";

// GET /api/vehicles - Get all vehicles
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request);
    const status = params.get("status");
    const vehicleType = params.get("vehicle_type");

    let query = supabase
      .from("vehicles")
      .select("*")
      .order("vehicle_number", { ascending: true });

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status as VehicleStatus);
    }

    // Filter by vehicle type if provided
    if (vehicleType) {
      query = query.eq("vehicle_type", vehicleType as VehicleType);
    }

    const { data, error } = await query;

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(data ?? []);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/vehicles - Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, vehicleCreateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const { data, error } = await supabase
      .from("vehicles")
      .insert(validation.data)
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(data, "Vehicle created successfully", 201);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return errorResponse("Internal server error", 500);
  }
}
