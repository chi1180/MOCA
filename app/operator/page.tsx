"use client";

import Button from "@/components/Button";
import Card from "@/components/Card";
import Dialog from "@/components/Dialog";
import PointAdd from "@/components/PointAdd";
import PointList from "@/components/PointList";
import SubpageHeader from "@/components/SubpageHeader";
import type { PointWithId } from "@/types/api.points.types";
import {
  LucideMapPin,
  LucidePlus,
  LucideRefreshCw,
  LucideRoute,
  LucideUsers,
  LucideZap,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function OperatorPage() {
  // State for points data
  const [points, setPoints] = useState<PointWithId[]>([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Dialog state
  const [tab, setTab] = useState<"points" | "routes">("points");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch points from API
  const fetchPoints = useCallback(async () => {
    setIsLoadingPoints(true);
    setPointsError(null);

    try {
      const response = await fetch("/api/points");
      const data = await response.json();

      if (data.success && data.data) {
        setPoints(data.data);
      } else {
        setPointsError(data.error || "ポイントの取得に失敗しました");
      }
    } catch (error) {
      console.error("Error fetching points:", error);
      setPointsError("ネットワークエラーが発生しました");
    } finally {
      setIsLoadingPoints(false);
    }
  }, []);

  // Fetch points on mount
  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  // Handle point selection from list
  const handlePointSelect = useCallback((point: PointWithId) => {
    setSelectedPointId(point.id);
  }, []);

  // Handle point click on map
  const handleMapPointClick = useCallback((point: PointWithId) => {
    setSelectedPointId(point.id);
  }, []);

  // Dialog handlers
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handlePointAddSubmit = () => {
    setIsDialogOpen(false);
    // Refresh points list after adding new point
    fetchPoints();
  };

  const handlePointAddCancel = () => {
    setIsDialogOpen(false);
  };

  // Dynamic import of map component (no SSR)
  const FukutomiMap = useMemo(
    () =>
      dynamic(() => import("../../components/FukutomiMap"), {
        loading: () => (
          <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
            Loading Map...
          </div>
        ),
        ssr: false,
      }),
    [],
  );

  // Top cards component
  function TopCards() {
    const CardData = [
      {
        description: "登録ポイント",
        color: "#155dfc",
        icon: LucideMapPin,
        value: points.length.toString(),
      },
      {
        description: "運行ルート",
        color: "#9810fa",
        icon: LucideRoute,
        value: "5",
      },
      {
        description: "運行中ルート",
        color: "#f59e0b",
        icon: LucideZap,
        value: "3",
      },
      {
        description: "アクティブユーザ",
        color: "#10b981",
        icon: LucideUsers,
        value: "120+",
      },
    ];
    return (
      <section className="flex items-center justify-between gap-4">
        {CardData.map((card, index) => (
          <Card key={index.toString()} description={card.description}>
            <div className="flex items-center justify-between">
              <span
                className="text-3xl font-semibold"
                style={{ color: card.color }}
              >
                {card.value}
              </span>
              <card.icon color={card.color} size={48} opacity={0.6} />
            </div>
          </Card>
        ))}
      </section>
    );
  }

  return (
    <div className="w-full h-full bg-background">
      {/* DIALOG */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        title="新規ポイント追加"
      >
        <PointAdd
          onSubmit={handlePointAddSubmit}
          onCancel={handlePointAddCancel}
          isOpen={isDialogOpen}
        />
      </Dialog>

      {/* HEADER */}
      <SubpageHeader type="operator" />

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto space-y-8 pt-8 pb-16 px-4">
        {/* TOP Cards */}
        <TopCards />

        {/* Point management area */}
        <section className="flex justify-between gap-4">
          {/* Map Section */}
          <div className="w-1/2 aspect-square">
            <Card
              title="福富町マップ"
              description="ポイントをクリックすると詳細が表示されます"
              icon={<LucideMapPin />}
            >
              <FukutomiMap
                points={points}
                selectedPointId={selectedPointId}
                onPointClick={handleMapPointClick}
              />
            </Card>
          </div>

          {/* List Section */}
          <div className="w-1/2 flex flex-col gap-8">
            {/* TAB Buttons */}
            <div className="w-full flex gap-2">
              <Button
                label="ポイント管理"
                type="button"
                filled={tab !== "points"}
                onClick={() => setTab("points")}
                icon={<LucideMapPin size={18} />}
              />
              <Button
                label="ルート管理"
                type="button"
                filled={tab !== "routes"}
                onClick={() => setTab("routes")}
                icon={<LucideRoute size={18} />}
              />
            </div>

            {/* Card */}
            <div className="w-full h-full">
              <Card
                title={tab === "points" ? "ポイント一覧" : "ルート一覧"}
                description={
                  tab === "points"
                    ? "福富町内の乗降ポイント管理"
                    : "運行ルートの管理"
                }
                operation={
                  tab === "points" && (
                    <div className="flex gap-2">
                      <Button
                        label=""
                        type="button"
                        filled={true}
                        onClick={fetchPoints}
                        icon={
                          <LucideRefreshCw
                            size={18}
                            className={isLoadingPoints ? "animate-spin" : ""}
                          />
                        }
                      />
                      <Button
                        label="新規追加"
                        type="button"
                        filled={false}
                        onClick={() => setIsDialogOpen(true)}
                        icon={<LucidePlus />}
                      />
                    </div>
                  )
                }
              >
                {tab === "points" ? (
                  <PointList
                    points={points}
                    selectedPointId={selectedPointId}
                    onPointSelect={handlePointSelect}
                    isLoading={isLoadingPoints}
                    error={pointsError}
                  />
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <LucideRoute
                      size={32}
                      className="mx-auto mb-3 opacity-60"
                    />
                    <p className="text-sm">ルート管理機能は準備中です</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
