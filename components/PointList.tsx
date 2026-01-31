"use client";

import { useEffect, useRef } from "react";
import { LucideLoader2, LucideMapPinOff } from "lucide-react";
import type { PointWithId } from "@/types/api.points.types";
import PointCard from "./PointCard";

interface PointListProps {
  points: PointWithId[];
  selectedPointId: string | null;
  onPointSelect: (point: PointWithId) => void;
  onPointEdit: (point: PointWithId) => void;
  onPointDelete: (point: PointWithId) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function PointList({
  points,
  selectedPointId,
  onPointSelect,
  onPointEdit,
  onPointDelete,
  isLoading = false,
  error = null,
}: PointListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedCardRef = useRef<HTMLDivElement>(null);

  // selectedPointIdが変わった際にスクロール
  useEffect(() => {
    if (selectedPointId && selectedCardRef.current && containerRef.current) {
      selectedCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedPointId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <LucideLoader2 size={32} className="animate-spin mb-3" />
        <p className="text-sm">ポイントを読み込み中...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500">
        <LucideMapPinOff size={32} className="mb-3 opacity-60" />
        <p className="text-sm font-medium">エラーが発生しました</p>
        <p className="text-xs mt-1 text-gray-500">{error}</p>
      </div>
    );
  }

  // Empty state
  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <LucideMapPinOff size={32} className="mb-3 opacity-60" />
        <p className="text-sm font-medium">ポイントがありません</p>
        <p className="text-xs mt-1">
          「新規追加」ボタンからポイントを追加してください
        </p>
      </div>
    );
  }

  // Points list
  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2"
    >
      {points.map((point) => (
        <div
          key={point.id}
          className="p-0.5"
          ref={selectedPointId === point.id ? selectedCardRef : null}
        >
          <PointCard
            point={point}
            isSelected={selectedPointId === point.id}
            onClick={() => onPointSelect(point)}
            onEdit={onPointEdit}
            onDelete={onPointDelete}
          />
        </div>
      ))}
    </div>
  );
}
