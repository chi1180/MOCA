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
  reservationCreateSchema,
  type ReservationStatus,
} from "@/types/api.types";

// GET /api/reservations - Get all reservations
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request);
    const status = params.get("status");
    const pickupStopId = params.get("pickup_stop_id");
    const dropoffStopId = params.get("dropoff_stop_id");
    const date = params.get("date"); // Filter by date (YYYY-MM-DD)

    // Join with stops to get pickup and dropoff stop info
    let query = supabase
      .from("reservations")
      .select(
        `
        *,
        pickup_stop:stops!reservations_pickup_stop_id_fkey(*),
        dropoff_stop:stops!reservations_dropoff_stop_id_fkey(*)
      `,
      )
      .order("requested_pickup_time", { ascending: true });

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status as ReservationStatus);
    }

    // Filter by pickup stop if provided
    if (pickupStopId) {
      query = query.eq("pickup_stop_id", pickupStopId);
    }

    // Filter by dropoff stop if provided
    if (dropoffStopId) {
      query = query.eq("dropoff_stop_id", dropoffStopId);
    }

    // Filter by date if provided
    if (date) {
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query
        .gte("requested_pickup_time", startOfDay)
        .lte("requested_pickup_time", endOfDay);
    }

    const { data, error } = await query;

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(data ?? []);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/reservations - Create a new reservation
export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, reservationCreateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const insertData = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("reservations")
      .insert(insertData)
      .select(
        `
        *,
        pickup_stop:stops!reservations_pickup_stop_id_fkey(*),
        dropoff_stop:stops!reservations_dropoff_stop_id_fkey(*)
      `,
      )
      .single();

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(data, "Reservation created successfully", 201);
  } catch (error) {
    console.error("Error creating reservation:", error);
    return errorResponse("Internal server error", 500);
  }
}
