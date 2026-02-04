import { LucideBus, LucideMapPin, LucideClock } from "lucide-react";
import type { Route } from "@/types/api.routes.types";

interface RouteCardProps {
  route: Route;
  isSelected: boolean;
  onClick: () => void;
}

// Get status label
function getStatusLabel(status: string): string {
  switch (status) {
    case "planned":
      return "予定中";
    case "in_progress":
      return "運行中";
    case "completed":
      return "完了";
    case "cancelled":
      return "キャンセル";
    default:
      return status;
  }
}

// Get status color
function getStatusColor(status: string): string {
  switch (status) {
    case "planned":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function RouteCard({
  route,
  isSelected,
  onClick,
}: RouteCardProps) {
  const firstStop = route.route_data.stops[0];
  const lastStop = route.route_data.stops[route.route_data.stops.length - 1];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg border transition-all duration-200
        hover:shadow-md cursor-pointer
        ${
          isSelected
            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/30"
            : "border-gray-200 bg-white hover:border-gray-300"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}
          `}
        >
          <LucideBus size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">
              {route.vehicle_id}
            </h3>
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full font-medium shrink-0
                ${getStatusColor(route.status)}
              `}
            >
              {getStatusLabel(route.status)}
            </span>
          </div>

          {/* Route info */}
          <div className="space-y-2 text-sm">
            {/* Start and End points */}
            <div className="flex items-center gap-1 text-gray-600">
              <LucideMapPin size={14} className="shrink-0" />
              <span className="truncate">
                {firstStop?.stop_name} → {lastStop?.stop_name}
              </span>
            </div>

            {/* Duration and Distance */}
            <div className="flex items-center gap-2 text-gray-600">
              <div className="flex items-center gap-1">
                <LucideClock size={14} className="shrink-0" />
                <span>{route.route_data.estimated_duration_minutes}分</span>
              </div>
              <span className="text-gray-400">•</span>
              <span>{route.route_data.total_distance_km} km</span>
            </div>

            {/* Number of stops */}
            <div className="text-xs text-gray-500">
              停車地点: {route.route_data.stops.length}箇所
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
