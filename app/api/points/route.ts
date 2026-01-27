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
  pointSchema,
  type CreatePointResponse,
  type GetPointsResponse,
  type PointWithId,
} from "@/types/api.points.types";

// Helper to convert DB row to API response format
function dbRowToPoint(row: {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  is_base_point: boolean | null;
  created_at: string | null;
}): PointWithId {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? "",
    latitude: row.latitude,
    longitude: row.longitude,
    type: "get_on_off", // Default type since DB doesn't have this field
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

// GET /api/points - Get all stops/points
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request);
    const isBasePoint = params.getBoolean("is_base_point");

    let query = supabase
      .from("stops")
      .select("*")
      .order("name", { ascending: true });

    // Filter by is_base_point if provided
    if (isBasePoint !== undefined) {
      query = query.eq("is_base_point", isBasePoint);
    }

    const { data, error } = await query;

    if (error) {
      return handleSupabaseError(error);
    }

    const points: PointWithId[] = (data ?? []).map(dbRowToPoint);

    const response: GetPointsResponse = {
      success: true,
      data: points,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching points:", error);

    const response: GetPointsResponse = {
      success: false,
      error: "Internal server error",
    };

    return Response.json(response, { status: 500 });
  }
}

// POST /api/points - Create a new stop/point
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod schema
    const validationResult = pointSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      const response: CreatePointResponse = {
        success: false,
        error: "バリデーションエラー",
        details: errors,
      };

      return Response.json(response, { status: 400 });
    }

    const { name, address, latitude, longitude } = validationResult.data;

    // Insert into Supabase stops table
    const { data, error } = await supabase
      .from("stops")
      .insert({
        name,
        address,
        latitude,
        longitude,
        is_base_point: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return handleSupabaseError(error);
    }

    const newPoint = dbRowToPoint(data);

    const response: CreatePointResponse = {
      success: true,
      data: newPoint,
      message: "ポイントが正常に追加されました",
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating point:", error);

    if (error instanceof SyntaxError) {
      const response: CreatePointResponse = {
        success: false,
        error: "Invalid JSON format",
      };
      return Response.json(response, { status: 400 });
    }

    const response: CreatePointResponse = {
      success: false,
      error: "Internal server error",
    };
    return Response.json(response, { status: 500 });
  }
}
