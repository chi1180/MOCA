"use client";

import { useMemo, useRef, useState } from "react";
import {
  LucideBus,
  LucideMapPin,
  LucideClock,
  LucideChevronDown,
  LucideJapaneseYen,
} from "lucide-react";
import type { Route } from "@/types/api.routes.types";
import type { FukutomiMapRef } from "@/types/components.map.types";
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
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const mapRef = useRef<FukutomiMapRef>(null);

  const firstStop = route.route_data.stops[0];
  const lastStop = route.route_data.stops[route.route_data.stops.length - 1];

  const FukutomiMap = useMemo(
    () =>
      dynamic(() => import("./FukutomiMap"), {
        loading: () => (
          <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
            <span className="text-gray-600">地図を読み込み中...</span>
          </div>
        ),
        ssr: false,
      }),
    [],
  );

  const handleStopClick = (
    stopId: string,
    latitude: number,
    longitude: number,
  ) => {
    setSelectedStopId(stopId);
    // Fly to the selected stop with zoom level 17
    if (mapRef.current) {
      mapRef.current.flyToPoint(latitude, longitude, 17);
      // Open popup for the stop after a short delay to ensure map has moved
      setTimeout(() => {
        mapRef.current?.openPopupForStop(stopId);
      }, 600);
    }
  };

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
          ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="w-full flex lg:flex-row bg-white">
          {/* Left side - Details panel */}
          <div className="w-full lg:w-2/5 p-4 overflow-y-auto max-h-[500px] lg:max-h-[800px] border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-between">
            <div className="w-full space-y-4">
              {/* Route Date */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">運行日</h4>
                <p className="text-sm text-gray-600">{route.route_date}</p>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  走行距離
                </h4>
                <p className="text-sm text-gray-600">
                  {route.route_data.total_distance_km} km
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  予定時間
                </h4>
                <p className="text-sm text-gray-600">
                  {route.route_data.estimated_duration_minutes}分
                </p>
              </div>

              {/* Stops */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  停車地点 ({route.route_data.stops.length}箇所)
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto p-2 pl-1">
                  {route.route_data.stops.map((stop, index) => (
                    <button
                      type="button"
                      key={stop.stop_id}
                      onClick={() =>
                        handleStopClick(
                          stop.stop_id,
                          stop.latitude,
                          stop.longitude,
                        )
                      }
                      className={`
                      w-full text-left text-sm p-1 rounded border transition-all cursor-pointer
                      ${
                        selectedStopId === stop.stop_id
                          ? "bg-blue-50 border-primary ring-2 ring-primary/30 shadow-md"
                          : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:shadow-sm hover:border-gray-300"
                      }
                    `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-white bg-blue-500 rounded-md w-6 aspect-square flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="font-medium text-gray-900 truncate">
                            {stop.stop_name}
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                stop.type === "pickup"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {stop.type === "pickup" ? "乗車" : "下車"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-0.5 mr-2">
                            <p>
                              到着:{" "}
                              {new Date(
                                stop.scheduled_arrival,
                              ).toLocaleTimeString("ja-JP", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p>
                              出発:{" "}
                              {new Date(
                                stop.scheduled_departure,
                              ).toLocaleTimeString("ja-JP", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  ステータス
                </h4>
                <span
                  className={`
                  text-xs px-2 py-0.5 rounded-full font-medium shrink-0
                  ${getStatusColor(route.status)}
                `}
                >
                  {getStatusLabel(route.status)}
                </span>
              </div>
            </div>
            <div className="w-full">
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
          </div>

          {/* Right side - Map */}
          <div className="w-full lg:w-3/5 h-[400px] lg:h-[800px] border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-100">
            <FukutomiMap ref={mapRef} selectedRoute={route} />
          </div>
        </div>
      </div>
    </div>
  );
}
