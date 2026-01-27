import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  successResponse,
  errorResponse,
  validateBody,
  handleSupabaseError,
  parseQueryParams,
} from "@/lib/api-helpers";
import { demandPredictionCreateSchema } from "@/types/api.types";

// GET /api/demand-predictions - Get all demand predictions
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request);
    const date = params.get("date"); // Filter by prediction_date (YYYY-MM-DD)
    const startDate = params.get("start_date"); // Range start (YYYY-MM-DD)
    const endDate = params.get("end_date"); // Range end (YYYY-MM-DD)

    let query = supabase
      .from("demand_predictions")
      .select("*")
      .order("prediction_date", { ascending: false });

    // Filter by specific date if provided
    if (date) {
      query = query.eq("prediction_date", date);
    }

    // Filter by date range if provided
    if (startDate) {
      query = query.gte("prediction_date", startDate);
    }
    if (endDate) {
      query = query.lte("prediction_date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(data ?? []);
  } catch (error) {
    console.error("Error fetching demand predictions:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/demand-predictions - Create a new demand prediction
export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, demandPredictionCreateSchema);

    if (!validation.success) {
      return validation.error;
    }

    // Use upsert to handle the UNIQUE constraint on prediction_date
    const { data, error } = await supabase
      .from("demand_predictions")
      .upsert(validation.data, {
        onConflict: "prediction_date",
      })
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(data, "Demand prediction created successfully", 201);
  } catch (error) {
    console.error("Error creating demand prediction:", error);
    return errorResponse("Internal server error", 500);
  }
}
