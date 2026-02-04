import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  successResponse,
  errorResponse,
  validateBody,
  handleSupabaseError,
  parseQueryParams,
} from "@/lib/api-helpers";
import { routeCreateSchema, type RouteStatus } from "@/types/api.types";
import { dummyRoutes } from "@/data/dummy_data";

// GET /api/routes - Get all routes
export async function GET(request: NextRequest) {
  try {
    // production環境でない場合はダミーデータを返す
    if (process.env.NODE_ENV !== "production") {
      const params = parseQueryParams(request);
      const status = params.get("status");
      const vehicleId = params.get("vehicle_id");
      const date = params.get("date");

      let filteredRoutes = [...dummyRoutes];

      // Filter by status if provided
      if (status) {
        filteredRoutes = filteredRoutes.filter(
          (route) => route.status === status,
        );
      }

      // Filter by vehicle if provided
      if (vehicleId) {
        filteredRoutes = filteredRoutes.filter(
          (route) => route.vehicle_id === vehicleId,
        );
      }

      // Filter by date if provided
      if (date) {
        filteredRoutes = filteredRoutes.filter(
          (route) => route.route_date === date,
        );
      }

      return successResponse(filteredRoutes);
    }

    const params = parseQueryParams(request);
    const status = params.get("status");
    const vehicleId = params.get("vehicle_id");
    const date = params.get("date"); // Filter by route_date (YYYY-MM-DD)

    // Join with vehicles to get vehicle info
    let query = supabase
      .from("routes")
      .select(
        `
        *,
        vehicle:vehicles(*)
      `,
      )
      .order("route_date", { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status as RouteStatus);
    }

    // Filter by vehicle if provided
    if (vehicleId) {
      query = query.eq("vehicle_id", vehicleId);
    }

    // Filter by date if provided
    if (date) {
      query = query.eq("route_date", date);
    }

    const { data, error } = await query;

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(data ?? []);
  } catch (error) {
    console.error("Error fetching routes:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/routes - Create a new route
export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, routeCreateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const insertData = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("routes")
      .insert(insertData)
      .select(
        `
        *,
        vehicle:vehicles(*)
      `,
      )
      .single();

    if (error) {
      return handleSupabaseError(error);
    }

    return successResponse(data, "Route created successfully", 201);
  } catch (error) {
    console.error("Error creating route:", error);
    return errorResponse("Internal server error", 500);
  }
}
