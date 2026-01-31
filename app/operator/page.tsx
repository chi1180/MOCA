"use client";

import Button from "@/components/Button";
import Card from "@/components/Card";
import Dialog from "@/components/Dialog";
import Sidebar from "@/components/Sidebar";
import PointAdd from "@/components/PointAdd";
import PointList from "@/components/PointList";
import SubpageHeader from "@/components/SubpageHeader";
import type { PointWithId } from "@/types/api.points.types";
import {
  LucideAlertTriangle,
  LucideMapPin,
  LucidePlus,
  LucideRefreshCw,
  LucideRoute,
  LucideUsers,
  LucideZap,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function OperatorPage() {
  // State for points data
  const [points, setPoints] = useState<PointWithId[]>([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Sidebar state
  const [tab, setTab] = useState<"points" | "routes">("points");
  const [isAddSidebarOpen, setIsAddSidebarOpen] = useState(false);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PointWithId | null>(null);

  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPoint, setDeletingPoint] = useState<PointWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // ========== ADD SIDEBAR HANDLERS ==========
  const handleAddSidebarOpen = useCallback(() => {
    setIsAddSidebarOpen(true);
  }, []);

  const handleAddSidebarClose = useCallback(() => {
    setIsAddSidebarOpen(false);
  }, []);

  const handlePointAddSubmit = useCallback(() => {
    setIsAddSidebarOpen(false);
    fetchPoints();
  }, [fetchPoints]);

  const handlePointAddCancel = useCallback(() => {
    setIsAddSidebarOpen(false);
  }, []);

  // ========== EDIT SIDEBAR HANDLERS ==========
  const handleEditSidebarOpen = useCallback((point: PointWithId) => {
    setEditingPoint(point);
    setIsEditSidebarOpen(true);
  }, []);

  const handleEditSidebarClose = useCallback(() => {
    setIsEditSidebarOpen(false);
    setTimeout(() => {
      setEditingPoint(null);
    }, 300);
  }, []);

  const handlePointEditSubmit = useCallback(() => {
    setIsEditSidebarOpen(false);
    setTimeout(() => {
      setEditingPoint(null);
      fetchPoints();
    }, 300);
  }, [fetchPoints]);

  const handlePointEditCancel = useCallback(() => {
    setIsEditSidebarOpen(false);
    setTimeout(() => {
      setEditingPoint(null);
    }, 300);
  }, []);

  // ========== DELETE DIALOG HANDLERS ==========
  const handleDeleteDialogOpen = useCallback((point: PointWithId) => {
    setDeletingPoint(point);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setTimeout(() => {
      setDeletingPoint(null);
    }, 300);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingPoint) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("ポイントを削除中...");

    try {
      const response = await fetch(`/api/points/${deletingPoint.id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) {
        toast.error(result.error || "ポイントの削除に失敗しました");
        return;
      }

      toast.success(result.message || "ポイントが正常に削除されました");

      // Clear selection if the deleted point was selected
      if (selectedPointId === deletingPoint.id) {
        setSelectedPointId(null);
      }

      setIsDeleteDialogOpen(false);
      setTimeout(() => {
        setDeletingPoint(null);
        fetchPoints();
      }, 300);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error deleting point:", error);
      toast.error("ネットワークエラーが発生しました");
    } finally {
      setIsDeleting(false);
    }
  }, [deletingPoint, selectedPointId, fetchPoints]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setTimeout(() => {
      setDeletingPoint(null);
    }, 300);
  }, []);

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
        description: "今日の運行ルート",
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
      {/* ADD SIDEBAR */}
      <Sidebar
        isOpen={isAddSidebarOpen}
        onClose={handleAddSidebarClose}
        title="新規ポイント追加"
      >
        <PointAdd
          mode="create"
          onSubmit={handlePointAddSubmit}
          onCancel={handlePointAddCancel}
          isOpen={isAddSidebarOpen}
        />
      </Sidebar>

      {/* EDIT SIDEBAR */}
      <Sidebar
        isOpen={isEditSidebarOpen}
        onClose={handleEditSidebarClose}
        title="ポイント編集"
      >
        {editingPoint && (
          <PointAdd
            mode="edit"
            editPoint={editingPoint}
            onSubmit={handlePointEditSubmit}
            onCancel={handlePointEditCancel}
            isOpen={isEditSidebarOpen}
          />
        )}
      </Sidebar>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        title="ポイント削除の確認"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <LucideAlertTriangle
              size={24}
              className="text-red-500 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm text-gray-700">
                以下のポイントを削除しますか？この操作は取り消せません。
              </p>
              {deletingPoint && (
                <div className="mt-3 p-3 bg-white rounded border border-red-100">
                  <p className="font-semibold text-gray-900">
                    {deletingPoint.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {deletingPoint.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              label="キャンセル"
              onClick={handleCancelDelete}
              filled={true}
              disabled={isDeleting}
            />
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 border-red-600 border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "削除中..." : "削除する"}
            </button>
          </div>
        </div>
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
                        onClick={handleAddSidebarOpen}
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
                    onPointEdit={handleEditSidebarOpen}
                    onPointDelete={handleDeleteDialogOpen}
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
