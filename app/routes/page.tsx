"use client";

import { useEffect, useState } from "react";
import SubpageHeader from "@/components/SubpageHeader";
import ExpandableRouteCard from "@/components/ExpandableRouteCard";
import type { Route } from "@/types/api.routes.types";

export default function Page() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/routes");

        if (!response.ok) {
          throw new Error(`Failed to fetch routes: ${response.statusText}`);
        }

        const data = await response.json();
        setRoutes(data.data || []);
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError(err instanceof Error ? err.message : "Failed to load routes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return (
    <div className="w-full h-full bg-background">
      <SubpageHeader type="routes" />

      <main className="max-w-7xl mx-auto space-y-8 pt-8 pb-16 px-4">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">運行ルート一覧</h1>
          <p className="text-gray-600">全ての運行ルートを確認・管理できます</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <strong>エラー:</strong> {error}
            </p>
          </div>
        )}

        {/* Routes List */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {routes.length > 0 ? (
              <>
                <p className="text-sm text-gray-600">
                  全{routes.length}件のルート
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {routes.map((route) => (
                    <ExpandableRouteCard key={route.id} route={route} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center space-y-2">
                  <p className="text-gray-600">運行ルートが見つかりません</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
