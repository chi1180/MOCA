import type {
  RouteStop,
  RouteData,
  OSRMRouteGeometry,
  OSRMLeg,
  RouteStopType,
} from "@/types/api.routes.types";

/**
 * OSRM APIレスポンスの型定義
 */
interface OSRMResponse {
  code: string;
  routes: Array<{
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        distance: number;
        duration: number;
        geometry: {
          type: "LineString";
          coordinates: [number, number][];
        };
        name: string;
        mode: string;
      }>;
    }>;
    distance: number;
    duration: number;
  }>;
}

/**
 * OSRM APIを使用してルート情報を生成する
 *
 * @param stops - 停車予定の停留所リスト（順序付き）
 * @param startTime - ルートの開始時刻
 * @returns OSRMから取得したルート情報を含むRouteData
 *
 * 処理フロー:
 * 1. stops配列から座標リストを抽出
 * 2. OSRM APIに座標を送信してルート計算
 * 3. レスポンスから geometry と legs を抽出
 * 4. 各区間の距離・時間から到着・出発時刻を計算
 * 5. RouteData形式に整形して返却
 */
export async function generateRouteWithOSRM(
  stops: Array<{
    stop_id: string;
    stop_name: string;
    latitude: number;
    longitude: number;
    type: RouteStopType;
    reservation_id: string | null;
  }>,
  startTime: Date,
): Promise<RouteData> {
  try {
    // 1. 座標リストを作成 (OSRM APIは longitude,latitude の順序)
    const coordinates = stops
      .map((stop) => `${stop.longitude},${stop.latitude}`)
      .join(";");

    // 2. OSRM API呼び出し
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(osrmUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`);
    }

    const data: OSRMResponse = await response.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      throw new Error(`OSRM API returned error code: ${data.code}`);
    }

    // 3. OSRMレスポンスからルート情報を抽出
    const route = data.routes[0]; // 最適ルート
    const geometry: OSRMRouteGeometry = route.geometry;
    const legs: OSRMLeg[] = route.legs;

    // 4. 各停留所の到着・出発時刻を計算
    let currentTime = new Date(startTime);
    const routeStops: RouteStop[] = stops.map((stop, index) => {
      const arrivalTime = new Date(currentTime);

      // 停車時間（乗降に2分）
      const departureTime = new Date(currentTime.getTime() + 2 * 60 * 1000);

      // 次の区間がある場合、その所要時間を加算
      if (index < legs.length) {
        currentTime = new Date(
          departureTime.getTime() + legs[index].duration * 1000,
        );
      }

      return {
        order: index + 1,
        stop_id: stop.stop_id,
        stop_name: stop.stop_name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        type: stop.type,
        reservation_id: stop.reservation_id,
        scheduled_arrival: arrivalTime.toISOString(),
        scheduled_departure: departureTime.toISOString(),
      };
    });

    // 5. 総距離と所要時間を計算
    const totalDistanceMeters = legs.reduce((sum, leg) => sum + leg.distance, 0);
    const totalDurationSeconds = legs.reduce((sum, leg) => sum + leg.duration, 0);

    return {
      stops: routeStops,
      total_distance_km: totalDistanceMeters / 1000,
      estimated_duration_minutes: Math.ceil(totalDurationSeconds / 60),
      osrm_geometry: geometry,
      osrm_legs: legs,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generateRouteWithOSRM:", errorMessage);
    throw new Error(`Failed to generate route with OSRM: ${errorMessage}`);
  }
}

/**
 * ダミーのルートデータを生成する（OSRMが利用不可の場合）
 * 既存の停留所から簡易的に計算したデータを返す
 *
 * @param stops - 停車予定の停留所リスト
 * @param startTime - ルートの開始時刻
 * @returns 簡易計算されたRouteData
 */
export function generateDummyRouteData(
  stops: Array<{
    stop_id: string;
    stop_name: string;
    latitude: number;
    longitude: number;
    type: RouteStopType;
    reservation_id: string | null;
  }>,
  startTime: Date,
): RouteData {
  // 座標から簡易的に距離を計算（ハバーサイン公式の近似）
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // 地球の半径（km）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ダミーの幾何学情報を生成
  const coordinates: [number, number][] = stops.map((stop) => [
    stop.longitude,
    stop.latitude,
  ]);

  // 停留所間の距離を計算
  let totalDistance = 0;
  const routeStops: RouteStop[] = [];
  let currentTime = new Date(startTime);

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const arrivalTime = new Date(currentTime);

    // 停車時間（乗降に2分）
    const departureTime = new Date(currentTime.getTime() + 2 * 60 * 1000);

    // 次の停留所への距離と時間を計算
    if (i < stops.length - 1) {
      const nextStop = stops[i + 1];
      const distanceKm = calculateDistance(
        stop.latitude,
        stop.longitude,
        nextStop.latitude,
        nextStop.longitude,
      );
      totalDistance += distanceKm;

      // 平均速度30km/hで時間を計算
      const durationMinutes = (distanceKm / 30) * 60;
      currentTime = new Date(
        departureTime.getTime() + durationMinutes * 60 * 1000,
      );
    }

    routeStops.push({
      order: i + 1,
      stop_id: stop.stop_id,
      stop_name: stop.stop_name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      type: stop.type,
      reservation_id: stop.reservation_id,
      scheduled_arrival: arrivalTime.toISOString(),
      scheduled_departure: departureTime.toISOString(),
    });
  }

  const totalDurationMinutes =
    (currentTime.getTime() - startTime.getTime()) / (60 * 1000);

  return {
    stops: routeStops,
    total_distance_km: totalDistance,
    estimated_duration_minutes: Math.ceil(totalDurationMinutes),
    osrm_geometry: {
      type: "LineString",
      coordinates: coordinates,
    },
  };
}

/**
 * ルートデータを取得または生成する
 * OSRMが利用可能な場合はOSRM APIを使用し、失敗した場合はダミーデータを生成
 *
 * @param stops - 停車予定の停留所リスト
 * @param startTime - ルートの開始時刻
 * @param useFallback - フォールバック使用を強制するかどうか
 * @returns RouteData
 */
export async function getOrGenerateRouteData(
  stops: Array<{
    stop_id: string;
    stop_name: string;
    latitude: number;
    longitude: number;
    type: RouteStopType;
    reservation_id: string | null;
  }>,
  startTime: Date,
  useFallback: boolean = true,
): Promise<RouteData> {
  try {
    return await generateRouteWithOSRM(stops, startTime);
  } catch (error) {
    if (useFallback) {
      console.warn(
        "OSRM API failed, falling back to dummy route data:",
        error,
      );
      return generateDummyRouteData(stops, startTime);
    }
    throw error;
  }
}
