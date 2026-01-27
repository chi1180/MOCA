import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  successResponse,
  errorResponse,
  validateBody,
  handleSupabaseError,
  isValidUUID,
} from "@/lib/api-helpers";
import { stopUpdateSchema } from "@/types/api.types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/stops/[id] - Get a single stop by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid stop ID format", 400);
    }

    const { data, error } = await supabase
      .from("stops")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Stop not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Error fetching stop:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/stops/[id] - Update a stop
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid stop ID format", 400);
    }

    const validation = await validateBody(request, stopUpdateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const { data, error } = await supabase
      .from("stops")
      .update(validation.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Stop not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data, "Stop updated successfully");
  } catch (error) {
    console.error("Error updating stop:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/stops/[id] - Delete a stop
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid stop ID format", 400);
    }

    const { error } = await supabase.from("stops").delete().eq("id", id);

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(null, "Stop deleted successfully");
  } catch (error) {
    console.error("Error deleting stop:", error);
    return errorResponse("Internal server error", 500);
  }
}
