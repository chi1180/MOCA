"use client";

import { useMemo, useState } from "react";
import {
  LucideBus,
  LucideMapPin,
  LucideClock,
  LucideChevronDown,
  LucideJapaneseYen,
} from "lucide-react";
import type { Route } from "@/types/api.routes.types";
import dynamic from "next/dynamic";

interface ExpandableRouteCardProps {
  route: Route;
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

export default function ExpandableRouteCard({
  route,
}: ExpandableRouteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const firstStop = route.route_data.stops[0];
  const lastStop = route.route_data.stops[route.route_data.stops.length - 1];

  const FukutomiMap = useMemo(
    () =>
      dynamic(() => import("./FukutomiMap"), {
        loading: () => (
          <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
            Loading Map...
          </div>
        ),
        ssr: false,
      }),
    [],
  );

  return (
    <div
      className={`
        w-full text-left rounded-lg border overflow-hidden transition-all duration-500 ease-out
        ${
          isExpanded
            ? "border-primary shadow-lg ring-2 ring-primary/30"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        }
      `}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`
              shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-500
              ${isExpanded ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}
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

            {/* Collapsed route info */}
            <div className="space-y-2 text-sm">
              {/* Start and End points */}
              <div className="flex items-center gap-1 text-gray-600">
                <LucideMapPin size={14} className="shrink-0" />
                <span className="truncate">
                  {firstStop?.stop_name} → {lastStop?.stop_name}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1 text-gray-600">
                <LucideClock size={14} className="shrink-0" />
                <span>{route.route_data.estimated_duration_minutes}分</span>
              </div>

              {/* Price (placeholder - adjust if actual price data exists) */}
              <div className="flex items-center gap-1 text-gray-600">
                <LucideJapaneseYen size={14} className="shrink-0" />
                <span>¥0</span>
              </div>
            </div>
          </div>

          {/* Chevron */}
          <div
            className={`
              shrink-0 w-6 h-6 flex items-center justify-center
              transition-all duration-500 hover:bg-gray-100 rounded-md
              ${isExpanded ? "rotate-180" : ""}
            `}
          >
            <LucideChevronDown size={20} />
          </div>
        </div>
      </button>

      {/* Expanded View - Smooth Animation */}
      <div
        className={`
          border-t border-gray-200 overflow-hidden transition-all duration-500 ease-out
          ${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="w-full h-full p-2 flex">
          <div className="p-2 space-y-4 w-1/3 h-full">
            {/* Route Date */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">運行日</h4>
              <p className="text-sm text-gray-600">{route.route_date}</p>
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">距離</h4>
              <p className="text-sm text-gray-600">
                {route.route_data.total_distance_km} km
              </p>
            </div>

            {/* Stops */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">
                停車地点 ({route.route_data.stops.length}箇所)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {route.route_data.stops.map((stop, index) => (
                  <div
                    key={stop.stop_id}
                    className="text-sm p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-start gap-2">
                      <div className="text-xs font-semibold text-gray-500 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {stop.stop_name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          到着:{" "}
                          {new Date(stop.scheduled_arrival).toLocaleTimeString(
                            "ja-JP",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          出発:{" "}
                          {new Date(
                            stop.scheduled_departure,
                          ).toLocaleTimeString("ja-JP", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {stop.type === "pickup" ? "乗車" : "下車"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">
                ステータス
              </h4>
              <p className="text-sm text-gray-600">
                {getStatusLabel(route.status)}
              </p>
            </div>

            {/* Created/Updated */}
            <div className="space-y-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
              <p>
                作成日時: {new Date(route.created_at).toLocaleString("ja-JP")}
              </p>
              <p>
                更新日時: {new Date(route.updated_at).toLocaleString("ja-JP")}
              </p>
            </div>
          </div>

          <div className="w-2/3 h-full p-2">
            <FukutomiMap />
          </div>
        </div>
      </div>
    </div>
  );
}
