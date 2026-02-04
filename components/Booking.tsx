"use client";

import { useEffect, useState } from "react";
import Card from "./Card";
import RouteList from "./RouteList";
import dynamic from "next/dynamic";
import { LucideMap } from "lucide-react";
import { useMemo } from "react";
import type { Route } from "@/types/api.routes.types";

export default function Booking() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // ルートデータを取得
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 今日の日付を取得 (YYYY-MM-DD形式)
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0];

        const response = await fetch(`/api/routes?date=${dateStr}`);

        if (!response.ok) {
          throw new Error("ルートデータの取得に失敗しました");
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setRoutes(data.data);
          // 最初のルートを自動選択
          if (data.data.length > 0) {
            setSelectedRouteId(data.data[0].id);
          }
        } else {
          setRoutes([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "不明なエラーが発生しました";
        setError(errorMessage);
        console.error("Error fetching routes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleRouteSelect = (route: Route) => {
    setSelectedRouteId(route.id);
  };

  return (
    <>
      <div className="w-2/3 aspect-square">
        <Card
          title="福富町マップ"
          description="ボタンを押して、地図上でポイントを選択できます"
          icon={<LucideMap />}
        >
          <FukutomiMap />
        </Card>
      </div>

      <div className="w-1/3 flex flex-col gap-8">
        <div className="w-full">
          <Card title="今日の運行ルート" description="利用するルートを選択">
            <RouteList
              routes={routes}
              selectedRouteId={selectedRouteId}
              onRouteSelect={handleRouteSelect}
              isLoading={isLoading}
              error={error}
            />
          </Card>
        </div>
        <div className="w-full">
          <Card title="乗車予約" description="乗降ポイントと希望時刻を入力">
            <div>Card Content</div>
          </Card>
        </div>
      </div>
    </>
  );
}
