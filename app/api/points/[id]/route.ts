import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  isValidUUID,
} from "@/lib/api-helpers";
import { pointSchema } from "@/types/api.points.types";
import type {
  CreatePointResponse,
  PointWithId,
} from "@/types/api.points.types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
    type: "get_on_off",
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

// GET /api/points/[id] - Get a single point by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid point ID format", 400);
    }

    const { data, error } = await supabase
      .from("stops")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Point not found", 404);
      }
      return handleSupabaseError(error);
    }

    const point = dbRowToPoint(data);

    const response: CreatePointResponse = {
      success: true,
      data: point,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching point:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/points/[id] - Update a point
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid point ID format", 400);
    }

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

    const { data, error } = await supabase
      .from("stops")
      .update({
        name,
        address,
        latitude,
        longitude,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Point not found", 404);
      }
      return handleSupabaseError(error);
    }

    const point = dbRowToPoint(data);

    const response: CreatePointResponse = {
      success: true,
      data: point,
      message: "ポイントが正常に更新されました",
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Error updating point:", error);

    if (error instanceof SyntaxError) {
      const response: CreatePointResponse = {
        success: false,
        error: "Invalid JSON format",
      };
      return Response.json(response, { status: 400 });
    }

    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/points/[id] - Delete a point
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid point ID format", 400);
    }

    const { error } = await supabase.from("stops").delete().eq("id", id);

    if (error) {
      return handleSupabaseError(error);
    }

    const response = {
      success: true,
      message: "ポイントが正常に削除されました",
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Error deleting point:", error);
    return errorResponse("Internal server error", 500);
  }
}
