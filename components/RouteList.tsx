"use client";

import { useEffect, useRef } from "react";
import { LucideLoader2, LucideBus } from "lucide-react";
import type { Route } from "@/types/api.routes.types";
import RouteCard from "./RouteCard";

interface RouteListProps {
  routes: Route[];
  selectedRouteId: string | null;
  onRouteSelect: (route: Route) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function RouteList({
  routes,
  selectedRouteId,
  onRouteSelect,
  isLoading = false,
  error = null,
}: RouteListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedCardRef = useRef<HTMLDivElement>(null);

  // selectedRouteIdが変わった際にスクロール
  useEffect(() => {
    if (selectedRouteId && selectedCardRef.current && containerRef.current) {
      selectedCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedRouteId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <LucideLoader2 size={32} className="animate-spin mb-3" />
        <p className="text-sm">ルートを読み込み中...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500">
        <LucideBus size={32} className="mb-3 opacity-60" />
        <p className="text-sm font-medium">エラーが発生しました</p>
        <p className="text-xs mt-1 text-gray-500">{error}</p>
      </div>
    );
  }

  // Empty state
  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <LucideBus size={32} className="mb-3 opacity-60" />
        <p className="text-sm font-medium">運行ルートがありません</p>
        <p className="text-xs mt-1">本日の運行ルートはまだ登録されていません</p>
      </div>
    );
  }

  // Routes list
  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2"
    >
      {routes.map((route) => (
        <div
          key={route.id}
          className="p-0.5"
          ref={selectedRouteId === route.id ? selectedCardRef : null}
        >
          <RouteCard
            route={route}
            isSelected={selectedRouteId === route.id}
            onClick={() => onRouteSelect(route)}
          />
        </div>
      ))}
    </div>
  );
}
