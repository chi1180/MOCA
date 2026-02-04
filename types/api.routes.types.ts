// =============================================
// 運行データ型定義（OSRM対応版）
// =============================================

/**
 * 停留所の能力
 */
type StopAbility = "get_on" | "get_off" | "get_on_off";

/**
 * 停留所のタイプ
 */
type StopType = "departure" | "traveling";

/**
 * 停留所データ
 */
interface Stop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  ability: StopAbility;
  type: StopType;
  tags: string[];
  createdAt: string;
}

/**
 * ルート内の停車種別
 */
type RouteStopType = "pickup" | "dropoff";

/**
 * ルート内の停車地点
 */
interface RouteStop {
  order: number;
  stop_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  type: RouteStopType;
  reservation_id: string | null;
  scheduled_arrival: string; // ISO 8601形式
  scheduled_departure: string; // ISO 8601形式
}

/**
 * OSRM APIのレスポンスから抽出するルート形状データ
 * geometry: ルート全体の経路（GeoJSON LineString形式）
 * legs: 各区間の詳細情報
 */
interface OSRMRouteGeometry {
  type: "LineString";
  coordinates: [number, number][]; // [longitude, latitude]の配列
}

interface OSRMIntersection {
  out?: number;
  in?: number;
  entry: boolean[];
  bearings: number[];
  location: [number, number];
}

interface OSRMManeuver {
  bearing_after: number;
  bearing_before: number;
  location: [number, number];
  type: string;
  modifier?: string;
}

interface OSRMStep {
  distance: number;
  duration: number;
  weight?: number;
  geometry: OSRMRouteGeometry;
  name: string; // 道路名
  ref?: string;
  mode: string; // "driving"など
  maneuver?: OSRMManeuver;
  intersections?: OSRMIntersection[];
  driving_side?: string;
}

interface OSRMLeg {
  distance: number; // メートル
  duration: number; // 秒
  weight?: number;
  summary?: string;
  steps: OSRMStep[];
}

/**
 * ルートデータ（routesテーブルのroute_data JSONB）
 * OSRM APIから取得した詳細な経路情報を含む
 */
interface RouteData {
  stops: RouteStop[];
  total_distance_km: number;
  estimated_duration_minutes: number;

  // OSRM APIから取得したルート形状データ
  osrm_geometry?: OSRMRouteGeometry; // ルート全体の経路座標（オプション）
  osrm_legs?: OSRMLeg[]; // 各停留所間の詳細情報（オプション）
}

/**
 * ルートレコード全体
 */
interface Route {
  id: string;
  vehicle_id: string;
  route_date: string; // YYYY-MM-DD
  route_data: RouteData;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

// =============================================
// エクスポート
// =============================================

export type {
  Stop,
  StopAbility,
  StopType,
  RouteStopType,
  RouteStop,
  RouteData,
  Route,
  OSRMRouteGeometry,
  OSRMLeg,
  OSRMStep,
  OSRMIntersection,
  OSRMManeuver,
};
