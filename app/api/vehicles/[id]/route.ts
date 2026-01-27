import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  successResponse,
  errorResponse,
  validateBody,
  handleSupabaseError,
  isValidUUID,
} from "@/lib/api-helpers";
import { vehicleUpdateSchema } from "@/types/api.types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/vehicles/[id] - Get a single vehicle by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid vehicle ID format", 400);
    }

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Vehicle not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/vehicles/[id] - Update a vehicle
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid vehicle ID format", 400);
    }

    const validation = await validateBody(request, vehicleUpdateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const { data, error } = await supabase
      .from("vehicles")
      .update(validation.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Vehicle not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data, "Vehicle updated successfully");
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/vehicles/[id] - Delete a vehicle
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid vehicle ID format", 400);
    }

    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(null, "Vehicle deleted successfully");
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return errorResponse("Internal server error", 500);
  }
}
