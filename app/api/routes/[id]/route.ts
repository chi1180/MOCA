import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  successResponse,
  errorResponse,
  validateBody,
  handleSupabaseError,
  isValidUUID,
} from "@/lib/api-helpers";
import { routeUpdateSchema } from "@/types/api.types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/routes/[id] - Get a single route by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid route ID format", 400);
    }

    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        vehicle:vehicles(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Route not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Error fetching route:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/routes/[id] - Update a route
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid route ID format", 400);
    }

    const validation = await validateBody(request, routeUpdateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("routes")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        vehicle:vehicles(*)
      `
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Route not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data, "Route updated successfully");
  } catch (error) {
    console.error("Error updating route:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/routes/[id] - Delete a route
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid route ID format", 400);
    }

    const { error } = await supabase.from("routes").delete().eq("id", id);

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(null, "Route deleted successfully");
  } catch (error) {
    console.error("Error deleting route:", error);
    return errorResponse("Internal server error", 500);
  }
}
