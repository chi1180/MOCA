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
import type { Route } from "@/types/api.routes.types";
import { dummyRoutes } from "@/data/dummy_data";
import { getOrGenerateRouteData } from "@/lib/osrm";

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

    // productionでない場合はダミーデータから検索
    if (process.env.NODE_ENV === "development") {
      const route = dummyRoutes.find((r) => r.id === id);
      console.dir(route, { depth: null });

      if (!route) {
        return errorResponse("Route not found", 404);
      }

      // 指定されたIDのルートだけを拡張
      try {
        const enrichedRoute = await enrichRouteDataWithOSRM(route);
        return successResponse(enrichedRoute);
      } catch (error) {
        // OSRM処理に失敗してもルートデータ自体は返す
        console.warn("Failed to enrich route with OSRM:", error);
        return successResponse(route);
      }
    }

    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        vehicle:vehicles(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Route not found", 404);
      }
      return handleSupabaseError(error);
    }

    // 本番環境でも指定されたIDのルートだけを拡張
    try {
      const enrichedData = await enrichRouteDataWithOSRM(data);
      return successResponse(enrichedData);
    } catch (error) {
      console.warn("Failed to enrich route with OSRM:", error);
      return successResponse(data);
    }
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

    // productionでない場合はダミーデータを更新して返す
    if (process.env.NODE_ENV !== "production") {
      const routeIndex = dummyRoutes.findIndex((r) => r.id === id);

      if (routeIndex === -1) {
        return errorResponse("Route not found", 404);
      }

      const updatedRoute: Route = {
        ...dummyRoutes[routeIndex],
        ...validation.data,
        updated_at: new Date().toISOString(),
      };

      return successResponse(updatedRoute, "Route updated successfully");
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
      `,
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

    // productionでない場合はダミーデータを削除して成功を返す
    if (process.env.NODE_ENV !== "production") {
      const routeIndex = dummyRoutes.findIndex((r) => r.id === id);

      if (routeIndex === -1) {
        return errorResponse("Route not found", 404);
      }

      return successResponse(null, "Route deleted successfully");
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

/**
 * ルートデータにOSRM情報を追加する
 * 指定されたルートのみを拡張する
 *
 * @param route - ルートデータ
 * @returns OSRM情報が追加されたルート
 */
async function enrichRouteDataWithOSRM(route: Route): Promise<Route> {
  // 既にOSRM情報がある場合はそのまま返す
  if (route.route_data.osrm_geometry && route.route_data.osrm_legs) {
    return route;
  }

  const stops = route.route_data.stops.map((stop) => ({
    stop_id: stop.stop_id,
    stop_name: stop.stop_name,
    latitude: stop.latitude,
    longitude: stop.longitude,
    type: stop.type,
    reservation_id: stop.reservation_id,
  }));

  if (stops.length === 0) {
    return route;
  }

  // 最初の停留所の到着時刻をベースに計算
  const startTime = new Date(route.route_data.stops[0].scheduled_arrival);

  try {
    const enrichedRouteData = await getOrGenerateRouteData(stops, startTime);

    return {
      ...route,
      route_data: enrichedRouteData,
    };
  } catch (error) {
    console.warn("Failed to enrich route data with OSRM:", error);
    // 失敗してもルートは返す
    return route;
  }
}
