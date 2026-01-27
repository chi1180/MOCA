import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  successResponse,
  errorResponse,
  validateBody,
  handleSupabaseError,
  parseQueryParams,
} from "@/lib/api-helpers";
import { stopCreateSchema } from "@/types/api.types";

// GET /api/stops - Get all stops
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request);
    const isBasePoint = params.getBoolean("is_base_point");

    let query = supabase.from("stops").select("*").order("name", { ascending: true });

    // Filter by is_base_point if provided
    if (isBasePoint !== undefined) {
      query = query.eq("is_base_point", isBasePoint);
    }

    const { data, error } = await query;

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(data ?? []);
  } catch (error) {
    console.error("Error fetching stops:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/stops - Create a new stop
export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, stopCreateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const { data, error } = await supabase
      .from("stops")
      .insert(validation.data)
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(data, "Stop created successfully", 201);
  } catch (error) {
    console.error("Error creating stop:", error);
    return errorResponse("Internal server error", 500);
  }
}
