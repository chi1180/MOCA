# MOCA API Documentation

オンデマンドバス運行システムのAPIドキュメント

## Setup

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project settings:
https://supabase.com/dashboard/project/_/settings/api

## API Endpoints

### Stops (停留所)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stops` | Get all stops |
| GET | `/api/stops?is_base_point=true` | Get stops filtered by base point status |
| POST | `/api/stops` | Create a new stop |
| GET | `/api/stops/[id]` | Get a single stop by ID |
| PUT | `/api/stops/[id]` | Update a stop |
| DELETE | `/api/stops/[id]` | Delete a stop |

#### Create/Update Stop Body

```json
{
  "name": "役場前",
  "latitude": 35.123456,
  "longitude": 139.567890,
  "address": "○○町役場前",
  "is_base_point": true
}
```

### Vehicles (車両)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | Get all vehicles |
| GET | `/api/vehicles?status=active` | Filter by status (active/inactive/maintenance) |
| GET | `/api/vehicles?vehicle_type=minibus` | Filter by type (minibus/taxi/wagon) |
| POST | `/api/vehicles` | Create a new vehicle |
| GET | `/api/vehicles/[id]` | Get a single vehicle by ID |
| PUT | `/api/vehicles/[id]` | Update a vehicle |
| DELETE | `/api/vehicles/[id]` | Delete a vehicle |

#### Create/Update Vehicle Body

```json
{
  "vehicle_number": "町バス001",
  "vehicle_type": "minibus",
  "capacity": 9,
  "status": "active"
}
```

### Reservations (予約)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reservations` | Get all reservations (with stop info) |
| GET | `/api/reservations?status=pending` | Filter by status |
| GET | `/api/reservations?date=2026-01-27` | Filter by date |
| GET | `/api/reservations?pickup_stop_id=uuid` | Filter by pickup stop |
| POST | `/api/reservations` | Create a new reservation |
| GET | `/api/reservations/[id]` | Get a single reservation by ID |
| PUT | `/api/reservations/[id]` | Update a reservation |
| DELETE | `/api/reservations/[id]` | Delete a reservation |

#### Reservation Status Values

- `pending` - 保留中
- `confirmed` - 確認済み
- `assigned` - 割り当て済み
- `completed` - 完了
- `cancelled` - キャンセル

#### Create/Update Reservation Body

```json
{
  "passenger_name": "山田太郎",
  "passenger_phone": "090-1234-5678",
  "pickup_stop_id": "uuid",
  "dropoff_stop_id": "uuid",
  "requested_pickup_time": "2026-01-27T09:00:00+09:00",
  "passenger_count": 1,
  "status": "pending",
  "notes": "車椅子利用"
}
```

### Routes (運行ルート)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes` | Get all routes (with vehicle info) |
| GET | `/api/routes?status=planned` | Filter by status |
| GET | `/api/routes?date=2026-01-27` | Filter by route date |
| GET | `/api/routes?vehicle_id=uuid` | Filter by vehicle |
| POST | `/api/routes` | Create a new route |
| GET | `/api/routes/[id]` | Get a single route by ID |
| PUT | `/api/routes/[id]` | Update a route |
| DELETE | `/api/routes/[id]` | Delete a route |

#### Route Status Values

- `planned` - 計画中
- `in_progress` - 運行中
- `completed` - 完了
- `cancelled` - キャンセル

#### Create/Update Route Body

```json
{
  "vehicle_id": "uuid",
  "route_date": "2026-01-27",
  "status": "planned",
  "route_data": {
    "stops": [
      {
        "order": 1,
        "stop_id": "uuid",
        "stop_name": "役場前",
        "latitude": 35.1234,
        "longitude": 139.5678,
        "type": "pickup",
        "reservation_id": "uuid",
        "scheduled_arrival": "2026-01-27T09:00:00+09:00",
        "scheduled_departure": "2026-01-27T09:02:00+09:00"
      }
    ],
    "total_distance_km": 8.5,
    "estimated_duration_minutes": 45
  }
}
```

### Demand Predictions (需要予測)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/demand-predictions` | Get all predictions |
| GET | `/api/demand-predictions?date=2026-01-27` | Filter by specific date |
| GET | `/api/demand-predictions?start_date=2026-01-01&end_date=2026-01-31` | Filter by date range |
| POST | `/api/demand-predictions` | Create/upsert a prediction |
| GET | `/api/demand-predictions/[id]` | Get a single prediction by ID |
| PUT | `/api/demand-predictions/[id]` | Update a prediction |
| DELETE | `/api/demand-predictions/[id]` | Delete a prediction |

#### Create/Update Demand Prediction Body

```json
{
  "prediction_date": "2026-01-27",
  "prediction_data": {
    "hourly_demand": [
      {
        "hour": 9,
        "hot_spots": [
          {
            "stop_id": "uuid",
            "stop_name": "役場前",
            "pickup_demand": 3.2,
            "dropoff_demand": 1.5
          }
        ]
      }
    ],
    "weather": "sunny",
    "day_of_week": "Monday",
    "is_holiday": false
  }
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, invalid UUID) |
| 404 | Not Found |
| 409 | Conflict (duplicate record) |
| 500 | Internal Server Error |
