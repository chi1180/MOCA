import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  successResponse,
  errorResponse,
  validateBody,
  handleSupabaseError,
  isValidUUID,
} from "@/lib/api-helpers";
import { reservationUpdateSchema } from "@/types/api.types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reservations/[id] - Get a single reservation by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid reservation ID format", 400);
    }

    const { data, error } = await supabase
      .from("reservations")
      .select(
        `
        *,
        pickup_stop:stops!reservations_pickup_stop_id_fkey(*),
        dropoff_stop:stops!reservations_dropoff_stop_id_fkey(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Reservation not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/reservations/[id] - Update a reservation
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid reservation ID format", 400);
    }

    const validation = await validateBody(request, reservationUpdateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("reservations")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        pickup_stop:stops!reservations_pickup_stop_id_fkey(*),
        dropoff_stop:stops!reservations_dropoff_stop_id_fkey(*)
      `
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Reservation not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data, "Reservation updated successfully");
  } catch (error) {
    console.error("Error updating reservation:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/reservations/[id] - Delete a reservation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid reservation ID format", 400);
    }

    const { error } = await supabase.from("reservations").delete().eq("id", id);

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(null, "Reservation deleted successfully");
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return errorResponse("Internal server error", 500);
  }
}
