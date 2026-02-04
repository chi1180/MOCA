// =============================================
// 運行データ型定義
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
 * ルートデータ（routesテーブルのroute_data JSONB）
 */
interface RouteData {
  stops: RouteStop[];
  total_distance_km: number;
  estimated_duration_minutes: number;
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
// ダミー運行データ（3件）
// =============================================

/**
 * ルート1: 朝の通勤・通院ルート
 * 福富支所前 → 下之谷（老人ホーム） → 道の駅前
 */
const route1: Route = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  vehicle_id: "町バス001",
  route_date: "2026-02-05",
  route_data: {
    stops: [
      {
        order: 1,
        stop_id: "40cbac8c-0208-4bba-bbba-afdf188cad9b",
        stop_name: "福富支所前",
        latitude: 34.53651413,
        longitude: 132.7775538,
        type: "pickup",
        reservation_id: "res-001",
        scheduled_arrival: "2026-02-05T08:00:00+09:00",
        scheduled_departure: "2026-02-05T08:02:00+09:00",
      },
      {
        order: 2,
        stop_id: "7ad877f4-db1b-4bb1-9990-663dbc2da013",
        stop_name: "下之谷",
        latitude: 34.53406595,
        longitude: 132.75321007,
        type: "pickup",
        reservation_id: "res-002",
        scheduled_arrival: "2026-02-05T08:12:00+09:00",
        scheduled_departure: "2026-02-05T08:14:00+09:00",
      },
      {
        order: 3,
        stop_id: "36834a25-5c63-42ba-97d9-ba43f9c6887c",
        stop_name: "道の駅前",
        latitude: 34.53301419,
        longitude: 132.77500033,
        type: "dropoff",
        reservation_id: "res-001",
        scheduled_arrival: "2026-02-05T08:22:00+09:00",
        scheduled_departure: "2026-02-05T08:23:00+09:00",
      },
      {
        order: 4,
        stop_id: "36834a25-5c63-42ba-97d9-ba43f9c6887c",
        stop_name: "道の駅前",
        latitude: 34.53301419,
        longitude: 132.77500033,
        type: "dropoff",
        reservation_id: "res-002",
        scheduled_arrival: "2026-02-05T08:23:00+09:00",
        scheduled_departure: "2026-02-05T08:23:00+09:00",
      },
    ],
    total_distance_km: 5.8,
    estimated_duration_minutes: 23,
  },
  status: "in_progress",
  created_at: "2026-02-05T07:30:00+09:00",
  updated_at: "2026-02-05T07:55:00+09:00",
};

/**
 * ルート2: 昼間の買い物ルート
 * 福富ダム北 → 三木矢橋 → 福富支所前（役所用事） → 道の駅前（買い物）
 */
const route2: Route = {
  id: "550e8400-e29b-41d4-a716-446655440002",
  vehicle_id: "町バス002",
  route_date: "2026-02-05",
  route_data: {
    stops: [
      {
        order: 1,
        stop_id: "34a99dac-1c52-45ff-99c0-b9a002741f48",
        stop_name: "福富ダム北",
        latitude: 34.5325104,
        longitude: 132.7628231,
        type: "pickup",
        reservation_id: "res-003",
        scheduled_arrival: "2026-02-05T10:30:00+09:00",
        scheduled_departure: "2026-02-05T10:32:00+09:00",
      },
      {
        order: 2,
        stop_id: "59ae4342-2b0f-4bb5-a7b3-79e5bcd9cd2a",
        stop_name: "三木矢橋",
        latitude: 34.52718947,
        longitude: 132.73928404,
        type: "pickup",
        reservation_id: "res-004",
        scheduled_arrival: "2026-02-05T10:42:00+09:00",
        scheduled_departure: "2026-02-05T10:44:00+09:00",
      },
      {
        order: 3,
        stop_id: "40cbac8c-0208-4bba-bbba-afdf188cad9b",
        stop_name: "福富支所前",
        latitude: 34.53651413,
        longitude: 132.7775538,
        type: "dropoff",
        reservation_id: "res-003",
        scheduled_arrival: "2026-02-05T10:58:00+09:00",
        scheduled_departure: "2026-02-05T10:59:00+09:00",
      },
      {
        order: 4,
        stop_id: "36834a25-5c63-42ba-97d9-ba43f9c6887c",
        stop_name: "道の駅前",
        latitude: 34.53301419,
        longitude: 132.77500033,
        type: "dropoff",
        reservation_id: "res-004",
        scheduled_arrival: "2026-02-05T11:05:00+09:00",
        scheduled_departure: "2026-02-05T11:05:00+09:00",
      },
    ],
    total_distance_km: 8.2,
    estimated_duration_minutes: 35,
  },
  status: "planned",
  created_at: "2026-02-05T09:15:00+09:00",
  updated_at: "2026-02-05T09:15:00+09:00",
};

/**
 * ルート3: 夕方の帰宅ルート
 * 道の駅前 → 久芳 → 最東北端 → 別府河内線
 */
const route3: Route = {
  id: "550e8400-e29b-41d4-a716-446655440003",
  vehicle_id: "町タクシー001",
  route_date: "2026-02-05",
  route_data: {
    stops: [
      {
        order: 1,
        stop_id: "36834a25-5c63-42ba-97d9-ba43f9c6887c",
        stop_name: "道の駅前",
        latitude: 34.53301419,
        longitude: 132.77500033,
        type: "pickup",
        reservation_id: "res-005",
        scheduled_arrival: "2026-02-05T16:00:00+09:00",
        scheduled_departure: "2026-02-05T16:02:00+09:00",
      },
      {
        order: 2,
        stop_id: "32ab1e62-8707-411c-9ee4-d477d307ab3f",
        stop_name: "久芳",
        latitude: 34.53661135,
        longitude: 132.78067589,
        type: "dropoff",
        reservation_id: "res-005",
        scheduled_arrival: "2026-02-05T16:08:00+09:00",
        scheduled_departure: "2026-02-05T16:09:00+09:00",
      },
      {
        order: 3,
        stop_id: "3e730251-da24-42b7-b083-598d70b73704",
        stop_name: "最東北端",
        latitude: 34.55584068,
        longitude: 132.79458046,
        type: "pickup",
        reservation_id: "res-006",
        scheduled_arrival: "2026-02-05T16:18:00+09:00",
        scheduled_departure: "2026-02-05T16:20:00+09:00",
      },
      {
        order: 4,
        stop_id: "41f9ac43-2a5f-4a17-92be-6cf3467a154f",
        stop_name: "別府河内線",
        latitude: 34.53669973,
        longitude: 132.80417204,
        type: "dropoff",
        reservation_id: "res-006",
        scheduled_arrival: "2026-02-05T16:32:00+09:00",
        scheduled_departure: "2026-02-05T16:32:00+09:00",
      },
    ],
    total_distance_km: 7.3,
    estimated_duration_minutes: 32,
  },
  status: "planned",
  created_at: "2026-02-05T14:20:00+09:00",
  updated_at: "2026-02-05T14:20:00+09:00",
};

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
};

export const dummyRoutes = [route1, route2, route3];
