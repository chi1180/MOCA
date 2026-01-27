import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  successResponse,
  errorResponse,
  validateBody,
  handleSupabaseError,
  isValidUUID,
} from "@/lib/api-helpers";
import { demandPredictionUpdateSchema } from "@/types/api.types";
import type { TablesUpdate } from "@/types/supabase.types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/demand-predictions/[id] - Get a single demand prediction by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid demand prediction ID format", 400);
    }

    const { data, error } = await supabase
      .from("demand_predictions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Demand prediction not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Error fetching demand prediction:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/demand-predictions/[id] - Update a demand prediction
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid demand prediction ID format", 400);
    }

    const validation = await validateBody(
      request,
      demandPredictionUpdateSchema,
    );

    if (!validation.success) {
      return validation.error;
    }

    const { data, error } = await supabase
      .from("demand_predictions")
      .update(validation.data as TablesUpdate<"demand_predictions">)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Demand prediction not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data, "Demand prediction updated successfully");
  } catch (error) {
    console.error("Error updating demand prediction:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/demand-predictions/[id] - Delete a demand prediction
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid demand prediction ID format", 400);
    }

    const { error } = await supabase
      .from("demand_predictions")
      .delete()
      .eq("id", id);

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(null, "Demand prediction deleted successfully");
  } catch (error) {
    console.error("Error deleting demand prediction:", error);
    return errorResponse("Internal server error", 500);
  }
}
